// src/auth/strategies/google.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

/**
 * Estrategia de Google OAuth 2.0
 *
 * Maneja el flujo de autenticación con Google:
 * 1. Usuario hace click en "Continuar con Google"
 * 2. Redirige a Google para autenticación
 * 3. Usuario autoriza la app
 * 4. Google redirige a callback con código
 * 5. Esta estrategia valida el código y extrae datos del usuario
 */
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.getOrThrow<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.getOrThrow<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  /**
   * Método que se ejecuta después de la autenticación exitosa con Google
   *
   * @param accessToken Token de acceso de Google (no lo usamos directamente)
   * @param refreshToken Token de refresco (opcional)
   * @param profile Información del perfil del usuario de Google
   * @param done Callback de Passport
   *
   * @returns Datos del usuario que se pasarán a AuthService
   */
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    /**
     * Extraemos la información relevante del perfil de Google
     *
     * profile contiene:
     * - id: ID único de Google
     * - displayName: Nombre completo
     * - emails: Array de emails
     * - photos: Array de fotos de perfil
     * - provider: 'google'
     */
    const { id, displayName, emails, photos } = profile;

    /**
     * Construimos el objeto de usuario con los datos de Google
     */
    const user = {
      googleId: id,
      email: emails[0].value,
      fullName: displayName,
      picture: photos[0]?.value,
      provider: 'google',
    };

    /**
     * Passport inyecta este usuario en req.user
     */
    done(null, user);
  }
}
