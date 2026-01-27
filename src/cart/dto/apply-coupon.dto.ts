// src/cart/dto/apply-coupon.dto.ts
import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class ApplyCouponDto {
  @IsString({ message: 'El código del cupón debe ser texto' })
  @IsNotEmpty({ message: 'El código del cupón no puede estar vacío' })
  @MinLength(3, { message: 'El código debe tener al menos 3 caracteres' })
  @MaxLength(50, { message: 'El código no puede exceder 50 caracteres' })
  codigoCupon: string;
}
