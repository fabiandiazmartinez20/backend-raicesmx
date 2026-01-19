// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // ← IMPORTANTE: Importar TypeOrmModule
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { EmailService } from './services/email.service';
import { User } from '../users/entities/user.entity';
import { PasswordResetCode } from './entities/password-reset-code.entity';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { UsersModule } from '../users/users.module';

/**
 * Módulo de Autenticación
 *
 * Responsabilidades:
 * - Gestionar el registro y login de usuarios
 * - Configurar JWT para autenticación
 * - Integrar Passport con estrategia JWT
 * - Manejar recuperación de contraseñas con códigos de verificación
 *
 * Dependencias:
 * - UsersModule (gestión de usuarios)
 * - ConfigModule (variables de entorno)
 * - TypeORM (acceso a base de datos)
 */
@Module({
  imports: [
    /**
     * TypeORM - Registro de entidades
     *
     * IMPORTANTE: Aquí registramos las entidades que este módulo usará
     * - User: para acceso directo a usuarios (además del UsersService)
     * - PasswordResetCode: para gestionar códigos de recuperación
     */
    TypeOrmModule.forFeature([
      User, // ← Entidad de usuarios
      PasswordResetCode, // ← Entidad de códigos de reset
    ]),

    /**
     * Módulo de usuarios
     * Necesario para crear y validar usuarios
     */
    UsersModule,

    /**
     * Módulo Passport
     * Proporciona la infraestructura de autenticación
     */
    PassportModule,

    /**
     * Configuración dinámica del módulo JWT
     *
     * - Obtiene el secreto desde variables de entorno
     * - Define el tiempo de expiración del token (7 días)
     */
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        return {
          secret:
            configService.get<string>('JWT_SECRET') || 'default-secret-key',
          signOptions: {
            expiresIn: '7d',
          },
        };
      },
      inject: [ConfigService],
    }),
  ],

  /**
   * Controladores expuestos por el módulo
   */
  controllers: [AuthController],

  /**
   * Providers internos del módulo
   *
   * - AuthService: Lógica de autenticación y recuperación de contraseñas
   * - EmailService: Envío de emails con Resend
   * - JwtStrategy: Estrategia de autenticación JWT
   * - GoogleStrategy: Estrategia de autenticación con Google OAuth
   */
  providers: [
    AuthService,
    EmailService, // ← Servicio de emails
    JwtStrategy, // ← Estrategia JWT para Passport
    GoogleStrategy, // ← Estrategia Google OAuth
  ],

  /**
   * Servicios exportados para otros módulos
   */
  exports: [AuthService],
})
export class AuthModule {}
