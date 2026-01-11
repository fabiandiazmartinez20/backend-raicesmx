import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

@Injectable()
export class SellerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.isSeller) {
      throw new ForbiddenException(
        'Solo los vendedores pueden acceder a esta ruta',
      );
    }

    return true;
  }
}
