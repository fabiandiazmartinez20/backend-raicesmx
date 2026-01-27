// src/orders/orders.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { PaypalService } from './services/paypal.service';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Payment } from './entities/payment.entity';
import { Cart } from '../cart/entities/cart.entity';
import { Product } from '../products/entities/product.entity';
import { OrderEmailService } from './services/order-email.service';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Order, OrderItem, Payment, Cart, Product]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService, PaypalService, OrderEmailService],
  exports: [OrdersService, PaypalService, OrderEmailService],
})
export class OrdersModule {}
