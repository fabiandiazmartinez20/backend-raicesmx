// src/common/common.module.ts
import { Module } from '@nestjs/common';
import { CommonController } from './common.controller';
import { GeocodingService } from './services/geocoding.service';
import { CloudinaryService } from './services/cloudinary.service';

@Module({
  controllers: [CommonController],
  providers: [GeocodingService, CloudinaryService],
  exports: [GeocodingService, CloudinaryService],
})
export class CommonModule {}
