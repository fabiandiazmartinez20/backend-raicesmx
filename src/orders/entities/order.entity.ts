// src/orders/entities/order.entity.ts
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
import { OrderItem } from './order-item.entity';
import { Payment } from './payment.entity';

export enum OrderStatus {
  PENDING = 'pending',
  PAID = 'paid',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'order_number', unique: true, length: 50 })
  orderNumber: string;

  @Column({ name: 'buyer_id' })
  buyerId: number;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'buyer_id' })
  buyer: User;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @Column({
    name: 'shipping_cost',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  shippingCost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  // Shipping Information
  @Column({ name: 'shipping_name', length: 255 })
  shippingName: string;

  @Column({ name: 'shipping_email', length: 255 })
  shippingEmail: string;

  @Column({ name: 'shipping_phone', length: 20, nullable: true })
  shippingPhone: string;

  @Column({ name: 'shipping_address', type: 'text' })
  shippingAddress: string;

  @Column({ name: 'shipping_city', length: 100 })
  shippingCity: string;

  @Column({ name: 'shipping_state', length: 100 })
  shippingState: string;

  @Column({ name: 'shipping_postal_code', length: 10 })
  shippingPostalCode: string;

  @Column({ name: 'shipping_country', length: 100, default: 'México' })
  shippingCountry: string;

  @OneToMany(() => OrderItem, (item) => item.order, { eager: true })
  items: OrderItem[];

  @OneToMany(() => Payment, (payment) => payment.order)
  payments: Payment[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
