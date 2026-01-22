// src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

async function bootstrap() {
  // ✅ PRIMERO definir allowedOrigins
  const allowedOrigins = [
    'http://localhost:4200', // Angular local
    'https://adminfront-1kr.pages.dev', // TU FRONT REAL
  ];

  const app = await NestFactory.create(AppModule);

  // ✅ CORS BIEN CONFIGURADO
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true); // Postman / Server
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log('❌ Bloqueado por CORS:', origin);
      return callback(new Error('Origen no permitido por CORS'));
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  });

  // ✅ HELMET
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: [
            "'self'",
            'http://localhost:3000',
            'http://localhost:4200',
            'https://backend-raicesmx.onrender.com',
            'https://adminfront-1kr.pages.dev',
          ],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: false,
    }),
  );

  // ✅ Cookies
  app.use(cookieParser());

  // ✅ Validación
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const port = process.env.PORT || 3000;

  await app.listen(port);

  console.log(`🚀 Servidor corriendo en puerto ${port}`);
  console.log('✅ CORS activo');
}

bootstrap();
