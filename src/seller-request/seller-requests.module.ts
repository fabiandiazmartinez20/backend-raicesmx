// src/seller-requests/seller-requests.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SellerRequestsController } from './seller-requests.controller';

import { SellerRequestsService } from './seller-requests.service';
import { SellerRequest } from './entities/seller-request.entity';
import { User } from '../users/entities/user.entity';
import { CloudinaryService } from '../common/services/cloudinary.service';
import { AdminModule } from '../admin/admin.module'; // ✨ IMPORTAR
import { AuthModule } from '../auth/auth.module'; // ✨ IMPORTAR

@Module({
  imports: [
    TypeOrmModule.forFeature([SellerRequest, User]),
    AdminModule,
    AuthModule,
  ], // ✨ AGREGAR
  controllers: [SellerRequestsController],
  providers: [SellerRequestsService, CloudinaryService],
  exports: [SellerRequestsService],
})
export class SellerRequestsModule {}
