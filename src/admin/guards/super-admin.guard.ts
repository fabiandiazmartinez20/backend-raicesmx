import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

/**
 * Guard para permitir solo a super_admins
 * Debe usarse DESPUÉS de AdminJwtGuard
 */
@Injectable()
export class SuperAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const admin = request.user;

    if (!admin || admin.role !== 'super_admin') {
      throw new ForbiddenException(
        'Solo super administradores pueden realizar esta acción',
      );
    }

    return true;
  }
}
