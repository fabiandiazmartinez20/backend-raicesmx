// src/orders/orders.service.ts
import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { Cart } from '../cart/entities/cart.entity';
import { Product } from '../products/entities/product.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { PaypalService } from './services/paypal.service';
import { OrderEmailService } from './services/order-email.service';
@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,

    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,

    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,

    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,

    @InjectRepository(Product)
    private productRepository: Repository<Product>,

    private paypalService: PaypalService,
    private orderEmailService: OrderEmailService, // 👈 NUEVO
  ) {}

  /**
   * Crear orden desde carrito
   */
  async createOrder(userId: number, createOrderDto: CreateOrderDto) {
    const { shippingDetails, codigoCupon } = createOrderDto;

    // 1. Obtener carrito activo del usuario
    const cart = await this.cartRepository.findOne({
      where: { userId, activo: true },
      relations: [
        'items',
        'items.product',
        'items.product.images',
        'items.product.seller',
      ],
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('No tienes productos en tu carrito');
    }

    // 2. Validar stock de productos
    for (const item of cart.items) {
      const product = await this.productRepository.findOne({
        where: { id: item.productId },
      });

      if (!product) {
        throw new NotFoundException(`Producto ${item.productId} no encontrado`);
      }

      if (product.stock < item.cantidad) {
        throw new BadRequestException(
          `Stock insuficiente para "${product.titulo}". Disponible: ${product.stock}`,
        );
      }
    }

    // 3. Generar número de orden único
    const orderNumber = this.generateOrderNumber();

    // 4. Crear orden
    const order = this.orderRepository.create({
      orderNumber,
      buyerId: userId,
      subtotal: Number(cart.subtotal),
      shippingCost: Number(cart.envio),
      discount: Number(cart.descuento),
      total: Number(cart.total),
      status: OrderStatus.PENDING,
      shippingName: shippingDetails.nombre,
      shippingEmail: shippingDetails.email,
      shippingPhone: shippingDetails.telefono,
      shippingAddress: shippingDetails.direccion,
      shippingCity: shippingDetails.ciudad,
      shippingState: shippingDetails.estado,
      shippingPostalCode: shippingDetails.codigoPostal,
      shippingCountry: shippingDetails.pais || 'México',
    });

    await this.orderRepository.save(order);
    this.logger.log(`✅ Orden creada: ${orderNumber}`);

    // 5. Crear items de la orden
    const orderItems = cart.items.map((cartItem) => {
      const images = cartItem.product.images || [];

      const mainImage = [...images].sort((a, b) => a.orden - b.orden)[0];

      return this.orderItemRepository.create({
        orderId: order.id,
        productId: cartItem.productId,
        productTitle: cartItem.product.titulo,
        productDescription: cartItem.product.descripcion,
        productPrice: Number(cartItem.precioUnitario),
        quantity: cartItem.cantidad,
        total: Number(cartItem.subtotal),

        // 👇 AQUÍ
        productImageUrl: mainImage?.imageUrl ?? null,

        sellerId: cartItem.product.sellerId,
        sellerName: cartItem.product.seller?.fullName || 'Vendedor',
      });
    });

    await this.orderItemRepository.save(orderItems);
    this.logger.log(`✅ ${orderItems.length} items agregados a la orden`);

    // 6. Crear orden de PayPal
    try {
      const paypalOrder = await this.paypalService.createOrder(
        Number(order.total),
        'MXN',
        orderNumber,
      );

      // 7. Crear registro de pago
      const payment = this.paymentRepository.create({
        orderId: order.id,
        paypalOrderId: paypalOrder.id,
        amount: Number(order.total),
        currency: 'MXN',
        status: PaymentStatus.PENDING,
        paypalResponse: paypalOrder,
      });

      await this.paymentRepository.save(payment);
      this.logger.log(`✅ Registro de pago creado: ${paypalOrder.id}`);

      // 8. Desactivar carrito (no eliminar para historial)
      cart.activo = false;
      await this.cartRepository.save(cart);

      return {
        success: true,
        message: 'Orden creada exitosamente',
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          total: order.total,
        },
        paypal: {
          orderId: paypalOrder.id,
          approveUrl: paypalOrder.links.find((link) => link.rel === 'approve')
            ?.href,
        },
      };
    } catch (error) {
      // Rollback: eliminar orden si falla PayPal
      await this.orderRepository.delete(order.id);
      this.logger.error('❌ Error al crear orden PayPal, orden eliminada');
      throw error;
    }
  }

  /**
   * Capturar pago de PayPal y actualizar orden
   */
  async capturePayment(paypalOrderId: string, userId: number) {
    // 1. Buscar pago
    const payment = await this.paymentRepository.findOne({
      where: { paypalOrderId },
      relations: ['order', 'order.items'],
    });

    if (!payment) {
      throw new NotFoundException('Pago no encontrado');
    }

    if (payment.order.buyerId !== userId) {
      throw new BadRequestException(
        'No tienes permiso para capturar este pago',
      );
    }

    if (payment.status === PaymentStatus.COMPLETED) {
      throw new BadRequestException('Este pago ya fue procesado');
    }

    try {
      // 2. Capturar pago en PayPal
      const captureData = await this.paypalService.captureOrder(paypalOrderId);

      // 3. Actualizar pago
      payment.status = PaymentStatus.COMPLETED;
      payment.paypalResponse = captureData;
      payment.paypalPayerId = captureData.payer?.payer_id;
      payment.paypalEmail = captureData.payer?.email_address;
      await this.paymentRepository.save(payment);

      // 4. Actualizar estado de orden
      payment.order.status = OrderStatus.PAID;
      await this.orderRepository.save(payment.order);

      // 5. Reducir stock de productos y actualizar ventas
      for (const item of payment.order.items) {
        // Obtener producto actual
        const producto = await this.productRepository.findOne({
          where: { id: item.productId },
        });

        if (producto) {
          // Actualizar stock y ventas
          producto.stock = Math.max(0, producto.stock - item.quantity);
          producto.ventas = (producto.ventas || 0) + item.quantity;
          await this.productRepository.save(producto);
        }
      }

      this.logger.log(`✅ Pago capturado exitosamente: ${paypalOrderId}`);

      // 6. 📧 Enviar emails (no bloquear si fallan)
      try {
        // Email al comprador
        await this.orderEmailService.sendOrderConfirmationToBuyer(
          payment.order,
        );

        // Emails a vendedores
        await this.orderEmailService.sendSaleNotificationToSellers(
          payment.order,
        );
      } catch (emailError) {
        this.logger.error(
          '⚠️ Error al enviar emails (no crítico):',
          emailError,
        );
        // No lanzar error, el pago ya se procesó
      }

      return {
        success: true,
        message: '¡Pago procesado exitosamente!',
        order: payment.order,
      };
    } catch (error) {
      this.logger.error('❌ Error al capturar pago:', error);
      this.logger.error('Stack trace:', error.stack);

      payment.status = PaymentStatus.FAILED;
      await this.paymentRepository.save(payment);

      // Devolver el mensaje de error específico si está disponible
      const errorMessage = error?.message || 'Error al procesar el pago';
      throw new InternalServerErrorException(errorMessage);
    }
  }

  /**
   * Obtener órdenes del usuario
   */
  async getUserOrders(userId: number) {
    const orders = await this.orderRepository.find({
      where: { buyerId: userId },
      relations: ['items', 'payments'],
      order: { createdAt: 'DESC' },
    });

    return {
      success: true,
      count: orders.length,
      orders,
    };
  }

  /**
   * Obtener detalle de orden
   */
  async getOrderById(orderId: number, userId: number) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['items', 'payments', 'buyer'],
    });

    if (!order) {
      throw new NotFoundException('Orden no encontrada');
    }

    if (order.buyerId !== userId) {
      throw new BadRequestException('No tienes permiso para ver esta orden');
    }

    return {
      success: true,
      order,
    };
  }

  /**
   * Cancelar orden (solo si está pendiente)
   */
  async cancelOrder(orderId: number, userId: number) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Orden no encontrada');
    }

    if (order.buyerId !== userId) {
      throw new BadRequestException(
        'No tienes permiso para cancelar esta orden',
      );
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Solo puedes cancelar órdenes pendientes');
    }

    order.status = OrderStatus.CANCELLED;
    await this.orderRepository.save(order);

    return {
      success: true,
      message: 'Orden cancelada correctamente',
    };
  }

  /**
   * Generar número de orden único
   */
  private generateOrderNumber(): string {
    const prefix = 'RMX';
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');
    return `${prefix}-${timestamp}-${random}`;
  }
}
