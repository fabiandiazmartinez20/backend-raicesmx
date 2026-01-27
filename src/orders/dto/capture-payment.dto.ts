// src/orders/dto/capture-payment.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';

export class CapturePaymentDto {
  @IsString()
  @IsNotEmpty()
  paypalOrderId: string;
}
