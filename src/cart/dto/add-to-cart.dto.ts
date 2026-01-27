// src/cart/dto/add-to-cart.dto.ts
import { IsInt, IsPositive, Min } from 'class-validator';

export class AddToCartDto {
  @IsInt({ message: 'El ID del producto debe ser un número entero' })
  @IsPositive({ message: 'El ID del producto debe ser positivo' })
  productId: number;

  @IsInt({ message: 'La cantidad debe ser un número entero' })
  @Min(1, { message: 'La cantidad mínima es 1' })
  cantidad: number;
}
