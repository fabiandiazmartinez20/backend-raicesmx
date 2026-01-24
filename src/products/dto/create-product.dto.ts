// src/products/dto/create-product.dto.ts
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsOptional,
  MinLength,
  MaxLength,
  Min,
  Matches,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  // ===== INFORMACIÓN BÁSICA =====
  @IsString()
  @IsNotEmpty()
  @MinLength(10, { message: 'El título debe tener al menos 10 caracteres' })
  @MaxLength(255, { message: 'El título no puede tener más de 255 caracteres' })
  titulo: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(50, {
    message: 'La descripción debe tener al menos 50 caracteres',
  })
  @MaxLength(2000, {
    message: 'La descripción no puede tener más de 2000 caracteres',
  })
  descripcion: string;

  // ===== CATEGORÍA =====
  @IsNumber()
  @Type(() => Number)
  categoryId: number;

  // ===== PRECIO Y STOCK =====
  @IsNumber()
  @Min(1, { message: 'El precio mínimo es $1 MXN' })
  @Type(() => Number)
  precio: number;

  @IsNumber()
  @Min(1, { message: 'El stock mínimo es 1 unidad' })
  @Type(() => Number)
  stock: number;

  @IsEnum(['pieza', 'kg', 'litro', 'paquete', 'docena'], {
    message: 'Unidad no válida',
  })
  unidad: string;

  // ===== UBICACIÓN =====
  @IsString()
  @IsNotEmpty()
  estado: string;

  @IsString()
  @IsNotEmpty()
  municipio: string;

  @IsString()
  @IsNotEmpty()
  colonia: string;

  @IsString()
  @Matches(/^[0-9]{5}$/, { message: 'Código postal debe tener 5 dígitos' })
  codigoPostal: string;

  @IsString()
  @IsNotEmpty()
  calle: string;

  @IsString()
  @IsNotEmpty()
  numeroExterior: string;

  @IsString()
  @IsOptional()
  numeroInterior?: string;

  @IsString()
  @IsOptional()
  referencia?: string;

  // ===== COORDENADAS =====
  @IsNumber()
  @Type(() => Number)
  latitud: number;

  @IsNumber()
  @Type(() => Number)
  longitud: number;

  // Nota: Las imágenes se manejan con multer/FormData
}
