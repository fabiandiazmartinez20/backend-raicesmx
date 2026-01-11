import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

/**
 * Estrategia JWT
 *
 * Valida el token JWT enviado en el header Authorization
 * y permite el acceso a rutas protegidas.
 *
 * Esta estrategia es utilizada automáticamente
 * por el JwtAuthGuard.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    /**
     * Servicio de configuración
     * Obtiene variables de entorno como JWT_SECRET
     */
    private configService: ConfigService,

    /**
     * Servicio de autenticación
     * Utilizado para validar la existencia del usuario
     */
    private authService: AuthService,
  ) {
    super({
      /**
       * Extrae el token desde el header:
       * Authorization: Bearer <token>
       */
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      /**
       * Rechaza tokens expirados
       */
      ignoreExpiration: false,

      /**
       * Secreto usado para validar la firma del token
       */
      secretOrKey:
        configService.get<string>('JWT_SECRET') || 'default-secret-key',
    });
  }

  /**
   * Validación del payload JWT
   *
   * Este método se ejecuta automáticamente
   * cuando el token es válido.
   *
   * @param payload Información contenida en el JWT
   */
  async validate(payload: any) {
    const user = await this.authService.validateUser(payload.sub);

    if (!user) {
      throw new UnauthorizedException();
    }

    /**
     * Este objeto se adjunta a req.user
     */
    return {
      id: payload.sub,
      email: payload.email,
      isSeller: payload.isSeller,
    };
  }
}
