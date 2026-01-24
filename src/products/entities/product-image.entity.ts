// src/products/entities/product-image.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from './product.entity';

@Entity('product_images')
export class ProductImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'product_id' })
  productId: number;

  @ManyToOne(() => Product, (product) => product.images, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ name: 'image_url', length: 500 })
  imageUrl: string;

  @Column({ name: 'public_id', length: 255 })
  publicId: string;

  @Column({ default: 0 })
  orden: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
