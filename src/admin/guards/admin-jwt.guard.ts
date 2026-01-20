// src/admin/guards/admin-jwt.guard.ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard para proteger rutas de administradores
 * Usa la estrategia 'admin-jwt'
 */
@Injectable()
export class AdminJwtGuard extends AuthGuard('admin-jwt') {}
