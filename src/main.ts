// src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

/**
 * Función de arranque principal de la aplicación
 *
 * Este bootstrap está preparado tanto para:
 * - Entorno de desarrollo (localhost)
 * - Entorno de producción (Render)
 *
 * Incluye múltiples capas de seguridad a nivel backend.
 */
async function bootstrap() {
  /**
   * Creación de la aplicación NestJS
   */
  const app = await NestFactory.create(AppModule);

  /**
   * =========================
   * HELMET - Seguridad HTTP
   * =========================
   *
   * Helmet establece headers HTTP de seguridad que ayudan a proteger
   * la aplicación contra ataques comunes del navegador.
   *
   * Protecciones incluidas:
   * - Clickjacking → X-Frame-Options
   * - MIME sniffing → X-Content-Type-Options
   * - XSS básico → X-XSS-Protection
   * - Oculta información del servidor → elimina X-Powered-By
   *
   * Content Security Policy (CSP):
   * Define desde qué orígenes se pueden cargar recursos.
   */
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"], // Permite estilos inline (Angular)
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: [
            "'self'",
            // Desarrollo
            'http://localhost:3000',
            'http://localhost:4200',
            // Producción
            'https://*.onrender.com',
            'https://tu-frontend.pages.dev',
          ],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      /**
       * Deshabilitado para evitar problemas con algunos
       * recursos en desarrollo y frontends externos.
       */
      crossOriginEmbedderPolicy: false,
    }),
  );

  /**
   * =========================
   * COOKIE PARSER
   * =========================
   *
   * Permite leer cookies desde las peticiones HTTP.
   * Es necesario para trabajar con:
   * - Cookies HTTP-Only
   * - Tokens JWT almacenados en cookies
   */
  app.use(cookieParser());

  /**
   * =========================
   * CORS (Cross-Origin Resource Sharing)
   * =========================
   *
   * Configuración estricta de CORS:
   * - Solo permite orígenes explícitamente definidos
   * - credentials: true → permite envío de cookies HTTP-Only
   * - exposedHeaders → permite leer "Set-Cookie" desde el frontend
   *
   * Se utiliza una función para validar dinámicamente los orígenes.
   */
  const allowedOrigins = [
    'http://localhost:4200', // Angular en desarrollo
    'https://tu-frontend.pages.dev', // Frontend en producción
  ];

  app.enableCors({
    origin: (origin, callback) => {
      /**
       * Si no hay origin (por ejemplo Postman)
       * o el origin está en la whitelist, se permite.
       */
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Origen no permitido por CORS'));
      }
    },
    credentials: true, // Necesario para cookies HTTP-Only
    exposedHeaders: ['set-cookie'],
  });

  /**
   * =========================
   * VALIDATION PIPE GLOBAL
   * =========================
   *
   * Pipe global para validación y sanitización de datos.
   *
   * Seguridad aplicada:
   * - whitelist → elimina propiedades no definidas en el DTO
   * - forbidNonWhitelisted → rechaza propiedades extra
   * - transform → convierte y sanitiza automáticamente
   * - enableImplicitConversion → convierte tipos automáticamente
   *
   * Ideal para prevenir:
   * - XSS
   * - Mass Assignment
   * - Payloads maliciosos
   */
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      /**
       * En producción se pueden ocultar mensajes detallados:
       * disableErrorMessages: process.env.NODE_ENV === 'production',
       */
    }),
  );

  /**
   * =========================
   * PUERTO DINÁMICO (RENDER)
   * =========================
   *
   * Render asigna automáticamente el puerto a través
   * de la variable de entorno PORT.
   *
   * En desarrollo se usa el puerto 3000.
   */
  const port = process.env.PORT || 3000;
  await app.listen(port);

  /**
   * Logs informativos (solo backend)
   */
  console.log(`Servidor corriendo en el puerto ${port}`);
  console.log('Helmet activado');
  console.log('Cookies HTTP-Only habilitadas');
  console.log('CORS configurado con whitelist');
  console.log('Validación y sanitización global activas');
}

bootstrap();
