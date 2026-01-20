// src/admin/dto/create-admin.dto.ts
import {
  IsEmail,
  IsString,
  MinLength,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { Sanitize } from '../../auth/decorators/sanitize.decorator';

export class CreateAdminDto {
  @Sanitize()
  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @Sanitize()
  @IsString()
  fullName: string;

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @IsOptional()
  @IsEnum(['super_admin', 'admin'])
  role?: 'super_admin' | 'admin';
}
