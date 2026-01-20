// src/admin/dto/update-admin.dto.ts
import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { Sanitize } from '../../auth/decorators/sanitize.decorator';

export class UpdateAdminDto {
  @IsOptional()
  @Sanitize()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
