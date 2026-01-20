// src/seller-requests/dto/create-seller-request.dto.ts
import { IsString, Length, IsNotEmpty } from 'class-validator';
import { Sanitize } from '../../auth/decorators/sanitize.decorator';

/**
 * DTO para crear solicitud de vendedor
 */
export class CreateSellerRequestDto {
  @Sanitize()
  @IsString()
  @Length(18, 18, { message: 'El CURP debe tener exactamente 18 caracteres' })
  @IsNotEmpty({ message: 'El CURP es requerido' })
  curp: string;
}
