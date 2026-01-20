// src/seller-requests/dto/get-seller-requests.dto.ts
import { IsEnum, IsOptional } from 'class-validator';

/**
 * DTO para filtrar solicitudes
 */
export class GetSellerRequestsDto {
  @IsOptional()
  @IsEnum(['pending', 'approved', 'rejected', 'all'])
  status?: 'pending' | 'approved' | 'rejected' | 'all';
}
