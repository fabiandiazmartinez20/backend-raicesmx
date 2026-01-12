// src/auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { Request } from 'express';

/**
 * Estrategia JWT para Passport
 *
 * Valida el token JWT enviado en cookies HTTP-Only (o header Authorization como fallback)
 * y permite el acceso a rutas protegidas con @UseGuards(JwtAuthGuard).
 *
 * Flujo de validación:
 * 1. Extrae el token desde cookies o Authorization header
 * 2. Verifica la firma del token con JWT_SECRET
 * 3. Valida que el usuario del payload aún existe
 * 4. Inyecta el usuario en req.user
 *
 * Esta estrategia es utilizada automáticamente por JwtAuthGuard.
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
     * Utilizado para validar la existencia del usuario en la base de datos
     */
    private authService: AuthService,
  ) {
    super({
      /**
       * Extracción del token JWT con múltiples métodos (en orden de prioridad):
       *
       * 1. Desde cookies HTTP-Only (método principal y más seguro)
       * 2. Desde Authorization header (fallback para compatibilidad)
       *
       * ExtractJwt.fromExtractors acepta un array de funciones extractoras
       * que se ejecutan en orden hasta que una devuelve un token válido
       */
      jwtFromRequest: ExtractJwt.fromExtractors([
        /**
         * Extractor personalizado para cookies
         *
         * Lee la cookie 'access_token' desde request.cookies
         * (disponible gracias a cookie-parser middleware)
         *
         * @param request Objeto Request de Express
         * @returns Token JWT o undefined
         */
        (request: Request) => {
          return request?.cookies?.access_token;
        },

        /**
         * Extractor de Authorization header (fallback)
         *
         * Lee el token desde:
         * Authorization: Bearer <token>
         *
         * Útil para testing con Postman o integraciones API
         */
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),

      /**
       * Rechaza tokens expirados
       *
       * Si un token está expirado, lanza UnauthorizedException
       * automáticamente antes de llamar a validate()
       */
      ignoreExpiration: false,

      /**
       * Secreto usado para validar la firma del token
       *
       * Debe coincidir con el secreto usado en JwtModule.register()
       * Proviene de la variable de entorno JWT_SECRET
       */
      secretOrKey:
        configService.get<string>('JWT_SECRET') || 'default-secret-key',
    });
  }

  /**
   * Validación del payload JWT
   *
   * Este método se ejecuta automáticamente después de que
   * el token sea verificado y decodificado correctamente.
   *
   * Responsabilidades:
   * 1. Verifica que el usuario del token aún existe en la BD
   * 2. Construye el objeto que se inyectará en req.user
   *
   * @param payload Información decodificada del JWT (sub, email, isSeller, iat, exp)
   *
   * @returns Objeto con información del usuario que se adjuntará a req.user
   * @throws UnauthorizedException si el usuario no existe
   *
   * Estructura del payload:
   * {
   *   sub: 1,                    // ID del usuario
   *   email: "user@example.com", // Email
   *   isSeller: false,           // Rol
   *   iat: 1234567890,           // Issued at (timestamp)
   *   exp: 1234654290            // Expiration (timestamp)
   * }
   */
  async validate(payload: any) {
    /**
     * Verifica que el usuario aún existe en la base de datos
     *
     * Esto previene que tokens válidos pero de usuarios eliminados
     * puedan acceder a rutas protegidas
     */
    const user = await this.authService.validateUser(payload.sub);

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado o inválido');
    }

    /**
     * Este objeto se adjunta automáticamente a req.user
     *
     * Puedes accederlo en cualquier controlador protegido:
     * @Get('profile')
     * getProfile(@Request() req) {
     *   console.log(req.user); // { id: 1, email: "...", isSeller: false }
     * }
     */
    return {
      id: payload.sub,
      email: payload.email,
      isSeller: payload.isSeller,
    };
  }
}
