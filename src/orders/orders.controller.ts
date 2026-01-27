// src/orders/orders.controller.ts
import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { CreateOrderDto } from './dto/create-order.dto';
import { CapturePaymentDto } from './dto/capture-payment.dto';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /**
   * POST /orders
   * Crear orden desde carrito
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createOrder(
    @GetUser('id') userId: number,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    return this.ordersService.createOrder(userId, createOrderDto);
  }

  /**
   * POST /orders/capture
   * Capturar pago de PayPal
   */
  @Post('capture')
  @HttpCode(HttpStatus.OK)
  async capturePayment(
    @GetUser('id') userId: number,
    @Body() capturePaymentDto: CapturePaymentDto,
  ) {
    return this.ordersService.capturePayment(
      capturePaymentDto.paypalOrderId,
      userId,
    );
  }

  /**
   * GET /orders
   * Obtener todas las órdenes del usuario
   */
  @Get()
  async getUserOrders(@GetUser('id') userId: number) {
    return this.ordersService.getUserOrders(userId);
  }

  /**
   * GET /orders/:id
   * Obtener detalle de una orden
   */
  @Get(':id')
  async getOrderById(
    @Param('id') orderId: number,
    @GetUser('id') userId: number,
  ) {
    return this.ordersService.getOrderById(orderId, userId);
  }

  /**
   * PATCH /orders/:id/cancel
   * Cancelar orden
   */
  @Patch(':id/cancel')
  async cancelOrder(
    @Param('id') orderId: number,
    @GetUser('id') userId: number,
  ) {
    return this.ordersService.cancelOrder(orderId, userId);
  }
}
