import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * GetUser Decorator
 * -------------------------------------------------------
 * Decorador personalizado para obtener el usuario
 * autenticado desde la request HTTP.
 *
 * - Extrae `request.user`
 * - Requiere que JwtAuthGuard haya sido ejecutado previamente
 *
 * Se utiliza en:
 * - Controllers protegidos por JwtAuthGuard
 *
 * Ejemplo:
 * @Get('profile')
 * getProfile(@GetUser() user) {
 *   return user;
 * }
 */
export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
