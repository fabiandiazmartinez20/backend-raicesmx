// src/products/entities/product.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Category } from './category.entity';
import { ProductImage } from './product-image.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  // ===== RELACIONES =====
  @Column({ name: 'seller_id' })
  sellerId: number;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'seller_id' })
  seller: User;

  @Column({ name: 'category_id' })
  categoryId: number;

  @ManyToOne(() => Category, (category) => category.products, { eager: true })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  // ===== INFORMACIÓN BÁSICA =====
  @Column({ length: 255 })
  titulo: string;

  @Column({ type: 'text' })
  descripcion: string;

  // ===== PRECIO Y STOCK =====
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precio: number;

  @Column({ default: 0 })
  stock: number;

  @Column({
    type: 'enum',
    enum: ['pieza', 'kg', 'litro', 'paquete', 'docena'],
    default: 'pieza',
  })
  unidad: string;

  // ===== UBICACIÓN =====
  @Column({ length: 100 })
  estado: string;

  @Column({ length: 255 })
  municipio: string;

  @Column({ length: 255 })
  colonia: string;

  @Column({ name: 'codigo_postal', length: 5 })
  codigoPostal: string;

  @Column({ length: 255 })
  calle: string;

  @Column({ name: 'numero_exterior', length: 20 })
  numeroExterior: string;

  @Column({ name: 'numero_interior', length: 20, nullable: true })
  numeroInterior: string;

  @Column({ type: 'text', nullable: true })
  referencia: string;

  // ===== COORDENADAS =====
  @Column({ type: 'decimal', precision: 10, scale: 8 })
  latitud: number;

  @Column({ type: 'decimal', precision: 11, scale: 8 })
  longitud: number;

  // ===== ESTADO =====
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'is_featured', default: false })
  isFeatured: boolean;

  // ===== MÉTRICAS =====
  @Column({ default: 0 })
  vistas: number;

  @Column({ default: 0 })
  ventas: number;

  // ===== AUDITORÍA =====
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // ===== RELACIÓN CON IMÁGENES =====
  @OneToMany(() => ProductImage, (image) => image.product, { cascade: true })
  images: ProductImage[];
}
