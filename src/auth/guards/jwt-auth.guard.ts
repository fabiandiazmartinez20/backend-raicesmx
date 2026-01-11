import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JwtAuthGuard
 * -------------------------------------------------------
 * Guard encargado de proteger rutas privadas mediante JWT.
 *
 * - Extiende el AuthGuard de Passport con la estrategia 'jwt'
 * - Extrae el token desde el header:
 *   Authorization: Bearer <token>
 * - Valida el token usando JwtStrategy
 * - Inyecta el usuario validado en `req.user`
 *
 * Se utiliza principalmente para:
 * - Proteger endpoints privados (profile, logout, etc.)
 * - Garantizar que solo usuarios autenticados accedan a la ruta
 *
 * Flujo de ejecución:
 * Controller → JwtAuthGuard → JwtStrategy → AuthService.validateUser
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
