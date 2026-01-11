import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersModule } from '../users/users.module';

/**
 * Módulo de Autenticación
 *
 * Responsabilidades:
 * - Gestionar el registro y login de usuarios
 * - Configurar JWT para autenticación
 * - Integrar Passport con estrategia JWT
 *
 * Dependencias:
 * - UsersModule (gestión de usuarios)
 * - ConfigModule (variables de entorno)
 */
@Module({
  imports: [
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
     * - Define el tiempo de expiración del token
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
   */
  providers: [
    AuthService,
    JwtStrategy, // Estrategia JWT para Passport
  ],

  /**
   * Servicios exportados para otros módulos
   */
  exports: [AuthService],
})
export class AuthModule {}
