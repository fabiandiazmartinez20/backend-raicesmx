import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

/**
 * Punto de entrada de la aplicación NestJS
 *
 * Responsabilidades:
 * - Inicializar la aplicación
 * - Configurar pipes globales de validación
 * - Habilitar CORS
 * - Levantar el servidor HTTP
 * - Cookies parser para HTTP-Only cookies

 *
 * Este archivo define el comportamiento global
 * antes de que los módulos de la aplicación entren en acción.
 */
async function bootstrap() {
  /**
   * Crea la instancia principal de la aplicación
   * usando el módulo raíz (AppModule)
   */
  const app = await NestFactory.create(AppModule);

  /**
   * Middleware para parsear cookies
   * Necesario para leer cookies HTTP-Only desde las peticiones
   */
  app.use(cookieParser());

  /**
   * Pipe de validación global
   *
   * Configuración:
   * - whitelist: elimina propiedades no definidas en los DTOs
   * - forbidNonWhitelisted: lanza error si llegan propiedades extra
   * - transform: transforma payloads a instancias de clases DTO
   */
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  /**
   * Configuración global de CORS
   *
   * Permite que el frontend Angular (localhost:4200)
   * consuma la API con credenciales (cookies / auth headers)
   *  credentials: true → Permite envío de cookies cross-origin

   */
  app.enableCors({
    origin: ['http://localhost:4200'],
    methods: 'GET,POST,PUT,DELETE,PATCH',
    credentials: true,
    exposedHeaders: ['set-cookie'],
  });

  /**
   * Inicia el servidor en el puerto definido
   * por variable de entorno o puerto 3000 por defecto
   */
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
