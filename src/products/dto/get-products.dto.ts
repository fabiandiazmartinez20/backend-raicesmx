// src/products/dto/get-products.dto.ts
import { IsOptional, IsEnum, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class GetProductsDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  categoryId?: number;

  @IsOptional()
  @IsString()
  estado?: string;

  @IsOptional()
  @IsEnum(['pieza', 'kg', 'litro', 'paquete', 'docena'])
  unidad?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  minPrecio?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxPrecio?: number;

  @IsOptional()
  @IsString()
  search?: string; // Búsqueda por título

  @IsOptional()
  @IsEnum(['recientes', 'precio_asc', 'precio_desc', 'mas_vendidos'])
  ordenar?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number;
}
