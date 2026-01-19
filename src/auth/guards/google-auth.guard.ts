// src/auth/guards/google-auth.guard.ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard de autenticación de Google
 *
 * Redirige automáticamente a la página de login de Google
 */
@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {}
