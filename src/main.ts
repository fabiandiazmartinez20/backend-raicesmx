// src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

/**
 * Función de arranque con protecciones de seguridad
 *
 * Protecciones implementadas:
 * - Helmet: Headers de seguridad HTTP
 * - Cookie Parser: Manejo de cookies HTTP-Only
 * - CORS: Credenciales habilitadas para cookies
 * - Validation Pipe: Sanitización y validación de DTOs
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  /**
   * Helmet: Establece headers de seguridad HTTP
   *
   * Protege contra:
   * - Clickjacking (X-Frame-Options)
   * - MIME type sniffing (X-Content-Type-Options)
   * - XSS básico (X-XSS-Protection)
   * - Información del servidor (elimina X-Powered-By)
   *
   * Documentación: https://helmetjs.github.io/
   */
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"], // Permite estilos inline
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: [
            "'self'",
            'http://localhost:3000',
            'http://localhost:4200',
          ],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: false, // Necesario para desarrollo
    }),
  );

  /**
   * Cookie Parser: Middleware para parsear cookies
   * Necesario para leer cookies HTTP-Only desde las peticiones
   */
  app.use(cookieParser());

  /**
   * CORS: Configuración de Cross-Origin Resource Sharing
   *
   * - origin: URL del frontend Angular
   * - credentials: true → Permite envío de cookies cross-origin
   * - exposedHeaders: Permite que el frontend lea el header Set-Cookie
   */
  app.enableCors({
    origin: 'http://localhost:4200',
    credentials: true, // MUY IMPORTANTE para HTTP-Only cookies
    exposedHeaders: ['set-cookie'],
  });

  /**
   * Validation Pipe Global
   *
   * Configuración de seguridad:
   * - whitelist: Remueve propiedades no definidas en el DTO
   * - forbidNonWhitelisted: Rechaza peticiones con propiedades extras
   * - transform: Convierte y sanitiza automáticamente
   * - disableErrorMessages: false en dev, true en producción
   *
   * Esto trabaja junto con los decoradores @Sanitize() en los DTOs
   * para proporcionar múltiples capas de protección XSS
   */
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remueve propiedades no definidas
      forbidNonWhitelisted: true, // Lanza error si hay propiedades extras
      transform: true, // Transforma y sanitiza automáticamente
      transformOptions: {
        enableImplicitConversion: true,
      },
      // En producción, puedes ocultar detalles de validación:
      // disableErrorMessages: process.env.NODE_ENV === 'production',
    }),
  );

  await app.listen(3000);
  console.log(
    'Servidor corriendo con protecciones de seguridad en http://localhost:3000',
  );
  console.log(' Helmet activado');
  console.log('Cookies HTTP-Only habilitadas');
  console.log('CORS configurado para http://localhost:4200');
  console.log('Validación y sanitización global activas');
}
bootstrap();
