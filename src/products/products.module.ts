// src/products/products.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';
import { Category } from './entities/category.entity';
import { CloudinaryService } from '../common/services/cloudinary.service';

@Module({
  imports: [
    // 👇 IMPORTANTE: Registrar las entidades para obtener sus repositorios
    TypeOrmModule.forFeature([Product, ProductImage, Category]),
  ],
  controllers: [ProductsController],
  providers: [ProductsService, CloudinaryService],
  exports: [ProductsService],
})
export class ProductsModule {}
