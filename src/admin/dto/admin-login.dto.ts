// src/admin/dto/admin-login.dto.ts
import { IsEmail, IsString, MinLength } from 'class-validator';
import { Sanitize } from '../../auth/decorators/sanitize.decorator';

export class AdminLoginDto {
  @Sanitize()
  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;
}
