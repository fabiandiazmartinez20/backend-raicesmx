// src/auth/dto/password-reset.dto.ts
import { IsEmail, IsString, Length, MinLength } from 'class-validator';
import { Sanitize } from '../decorators/sanitize.decorator';

/**
 * DTO para solicitar código de recuperación
 */
export class RequestResetDto {
  @Sanitize()
  @IsEmail({}, { message: 'El email no es válido' })
  email: string;
}

/**
 * DTO para verificar código
 */
export class VerifyCodeDto {
  @Sanitize()
  @IsEmail({}, { message: 'El email no es válido' })
  email: string;

  @IsString()
  @Length(6, 6, { message: 'El código debe tener 6 caracteres' })
  code: string;
}

/**
 * DTO para restablecer contraseña
 */
export class ResetPasswordDto {
  @Sanitize()
  @IsEmail({}, { message: 'El email no es válido' })
  email: string;

  @IsString()
  @Length(6, 6, { message: 'El código debe tener 6 caracteres' })
  code: string;

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  newPassword: string;
}
