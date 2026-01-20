// src/seller-requests/dto/review-seller-request.dto.ts
import { IsEnum, IsOptional, IsString } from 'class-validator';

/**
 * DTO para aprobar/rechazar solicitud
 */
export class ReviewSellerRequestDto {
  @IsEnum(['approved', 'rejected'])
  status: 'approved' | 'rejected';

  @IsOptional()
  @IsString()
  rejectionReason?: string;
}
