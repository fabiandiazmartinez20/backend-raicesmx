// src/auth/decorators/get-user.decorator.ts - CORREGIDO
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // Si se especifica una propiedad (ej: 'id'), devolver solo esa propiedad
    if (data) {
      return user?.[data];
    }

    // Si no se especifica propiedad, devolver el usuario completo
    return user;
  },
);
