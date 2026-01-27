// src/orders/dto/create-order.dto.ts
import {
  IsString,
  IsEmail,
  IsNotEmpty,
  Length,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class ShippingDetailsDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 255)
  nombre: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Length(10, 20)
  telefono: string;

  @IsString()
  @IsNotEmpty()
  @Length(5, 500)
  direccion: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  ciudad: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  estado: string;

  @IsString()
  @IsNotEmpty()
  @Length(5, 10)
  codigoPostal: string;

  @IsString()
  @IsOptional()
  pais?: string;
}

export class CreateOrderDto {
  @ValidateNested()
  @Type(() => ShippingDetailsDto)
  shippingDetails: ShippingDetailsDto;

  @IsString()
  @IsOptional()
  codigoCupon?: string;
}
