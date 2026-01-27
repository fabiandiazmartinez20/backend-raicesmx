// src/orders/entities/order-item.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from './order.entity';
@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'order_id' })
  orderId: number;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ name: 'product_id' })
  productId: number;

  @Column({ name: 'product_title', length: 255 })
  productTitle: string;

  @Column({ name: 'product_description', type: 'text', nullable: true })
  productDescription: string;

  @Column({ name: 'product_price', type: 'decimal', precision: 10, scale: 2 })
  productPrice: number;

  @Column()
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @Column({ name: 'product_image_url', length: 500, nullable: true })
  productImageUrl: string;

  @Column({ name: 'seller_id' })
  sellerId: number;

  @Column({ name: 'seller_name', length: 255 })
  sellerName: string;
}
