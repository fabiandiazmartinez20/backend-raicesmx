// src/admin/strategies/admin-jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AdminService } from '../admin.service';
import { Request } from 'express';

/**
 * Estrategia JWT para Administradores
 *
 * Similar a JwtStrategy pero valida que el usuario sea admin
 * y usa una cookie diferente: admin_token
 */
@Injectable()
export class AdminJwtStrategy extends PassportStrategy(Strategy, 'admin-jwt') {
  constructor(
    private configService: ConfigService,
    private adminService: AdminService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // Extractor personalizado para cookie admin_token
        (request: Request) => {
          return request?.cookies?.admin_token;
        },
        // Fallback: Authorization header
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_SECRET') || 'default-secret-key',
    });
  }

  /**
   * Validación del payload JWT
   *
   * Verifica que:
   * 1. El admin existe en la BD
   * 2. El admin está activo
   * 3. El payload tiene el flag isAdmin = true
   */
  async validate(payload: any) {
    // Verificar que es un token de admin
    if (!payload.isAdmin) {
      throw new UnauthorizedException('Token no válido para administradores');
    }

    // Verificar que el admin existe y está activo
    const admin = await this.adminService.validateAdmin(payload.sub);

    if (!admin) {
      throw new UnauthorizedException('Administrador no encontrado o inactivo');
    }

    return {
      id: payload.sub,
      email: payload.email,
      fullName: admin.fullName,
      role: payload.role,
      isAdmin: true,
    };
  }
}
