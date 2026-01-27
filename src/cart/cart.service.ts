// src/cart/cart.service.ts - ACTUALIZADO CON SELLER
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { Product } from '../products/entities/product.entity';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { ApplyCouponDto } from './dto/apply-coupon.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,

    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  // ==================== OBTENER O CREAR CARRITO ====================
  async getOrCreateCart(userId: number): Promise<Cart> {
    console.log(`🛒 Buscando carrito activo para usuario ${userId}`);

    // Buscar carrito activo del usuario
    let cart = await this.cartRepository.findOne({
      where: { userId, activo: true },
      relations: [
        'items',
        'items.product',
        'items.product.images',
        'items.product.category',
        'items.product.seller', // ⭐ AGREGADO: Incluir seller
      ],
    });

    // Si no existe, crear uno nuevo
    if (!cart) {
      console.log('✨ Creando nuevo carrito');
      cart = this.cartRepository.create({
        userId,
        subtotal: 0,
        envio: 0,
        descuento: 0,
        total: 0,
        activo: true,
        items: [], // ✅ INICIALIZAR items como array vacío
      });
      cart = await this.cartRepository.save(cart);
      console.log(`✅ Carrito creado con ID: ${cart.id}`);
    } else {
      console.log(`✅ Carrito encontrado con ID: ${cart.id}`);
      // ✅ Asegurarse de que items siempre sea un array
      if (!cart.items) {
        cart.items = [];
      }
    }

    return cart;
  }

  // ==================== AGREGAR PRODUCTO AL CARRITO ====================
  async addToCart(userId: number, addToCartDto: AddToCartDto): Promise<Cart> {
    const { productId, cantidad } = addToCartDto;

    console.log(
      `➕ Agregando producto ${productId} al carrito (cantidad: ${cantidad})`,
    );

    // Verificar que el producto existe
    const product = await this.productRepository.findOne({
      where: { id: productId },
      relations: ['images', 'category', 'seller'], // ⭐ Incluir seller
    });

    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    // Verificar stock disponible
    if (product.stock < cantidad) {
      throw new BadRequestException(
        `Stock insuficiente. Solo hay ${product.stock} unidades disponibles`,
      );
    }

    // Obtener o crear carrito
    const cart = await this.getOrCreateCart(userId);

    // ✅ Verificar que items existe antes de usar find
    if (!cart.items) {
      cart.items = [];
    }

    // Verificar si el producto ya está en el carrito
    const existingItem = cart.items.find(
      (item) => item.productId === productId,
    );

    if (existingItem) {
      // Actualizar cantidad si ya existe
      const nuevaCantidad = existingItem.cantidad + cantidad;

      if (product.stock < nuevaCantidad) {
        throw new BadRequestException(
          `Stock insuficiente. Solo puedes agregar ${product.stock - existingItem.cantidad} unidades más`,
        );
      }

      existingItem.cantidad = nuevaCantidad;
      existingItem.subtotal = existingItem.precioUnitario * nuevaCantidad;
      await this.cartItemRepository.save(existingItem);

      console.log(`🔄 Cantidad actualizada a ${nuevaCantidad}`);
    } else {
      // Crear nuevo item en el carrito
      const cartItem = this.cartItemRepository.create({
        cartId: cart.id,
        productId,
        cantidad,
        precioUnitario: product.precio,
        subtotal: product.precio * cantidad,
      });
      await this.cartItemRepository.save(cartItem);
      console.log(`✅ Nuevo item agregado al carrito`);
    }

    // Recalcular totales y devolver carrito actualizado
    return this.recalcularTotales(cart.id);
  }

  // ==================== ACTUALIZAR CANTIDAD ====================
  async updateCartItem(
    userId: number,
    itemId: number,
    updateDto: UpdateCartItemDto,
  ): Promise<Cart> {
    console.log(
      `🔄 Actualizando item ${itemId} a cantidad ${updateDto.cantidad}`,
    );

    // Buscar el item
    const cartItem = await this.cartItemRepository.findOne({
      where: { id: itemId },
      relations: ['cart', 'product'],
    });

    if (!cartItem) {
      throw new NotFoundException('Item no encontrado en el carrito');
    }

    // Verificar que el carrito pertenece al usuario
    if (cartItem.cart.userId !== userId) {
      throw new BadRequestException(
        'No tienes permiso para modificar este carrito',
      );
    }

    // Verificar stock disponible
    if (cartItem.product.stock < updateDto.cantidad) {
      throw new BadRequestException(
        `Stock insuficiente. Solo hay ${cartItem.product.stock} unidades disponibles`,
      );
    }

    // Actualizar cantidad y subtotal
    cartItem.cantidad = updateDto.cantidad;
    cartItem.subtotal = cartItem.precioUnitario * updateDto.cantidad;
    await this.cartItemRepository.save(cartItem);

    console.log(`✅ Cantidad actualizada a ${updateDto.cantidad}`);

    // Recalcular totales
    return this.recalcularTotales(cartItem.cartId);
  }

  // ==================== ELIMINAR ITEM DEL CARRITO ====================
  async removeCartItem(userId: number, itemId: number): Promise<Cart> {
    console.log(`🗑️ Eliminando item ${itemId} del carrito`);

    // Buscar el item
    const cartItem = await this.cartItemRepository.findOne({
      where: { id: itemId },
      relations: ['cart'],
    });

    if (!cartItem) {
      throw new NotFoundException('Item no encontrado en el carrito');
    }

    // Verificar que el carrito pertenece al usuario
    if (cartItem.cart.userId !== userId) {
      throw new BadRequestException(
        'No tienes permiso para modificar este carrito',
      );
    }

    const cartId = cartItem.cartId;

    // Eliminar el item
    await this.cartItemRepository.remove(cartItem);
    console.log(`✅ Item eliminado del carrito`);

    // Recalcular totales
    return this.recalcularTotales(cartId);
  }

  // ==================== VACIAR CARRITO ====================
  async clearCart(userId: number): Promise<void> {
    console.log(`🧹 Vaciando carrito del usuario ${userId}`);

    const cart = await this.getOrCreateCart(userId);

    // Eliminar todos los items
    await this.cartItemRepository.delete({ cartId: cart.id });

    // Resetear totales
    cart.subtotal = 0;
    cart.envio = 0;
    cart.descuento = 0;
    cart.total = 0;
    cart.codigoCupon = null;

    await this.cartRepository.save(cart);
    console.log(`✅ Carrito vaciado`);
  }

  // ==================== APLICAR CUPÓN ====================
  async applyCoupon(
    userId: number,
    applyCouponDto: ApplyCouponDto,
  ): Promise<Cart> {
    const { codigoCupon } = applyCouponDto;

    console.log(`🎟️ Aplicando cupón: ${codigoCupon}`);

    const cart = await this.getOrCreateCart(userId);

    // ✅ Verificar que items existe
    if (!cart.items || cart.items.length === 0) {
      throw new BadRequestException('El carrito está vacío');
    }

    // Validar cupón (aquí puedes agregar lógica más compleja con una tabla de cupones)
    const cuponesValidos: { [key: string]: number } = {
      RAICES10: 0.1, // 10% descuento
      ARTESANIA15: 0.15, // 15% descuento
      MEXICO20: 0.2, // 20% descuento
    };

    const porcentajeDescuento = cuponesValidos[codigoCupon.toUpperCase()];

    if (!porcentajeDescuento) {
      throw new BadRequestException('Cupón no válido');
    }

    // Calcular descuento
    const descuento = cart.subtotal * porcentajeDescuento;
    cart.descuento = Number(descuento.toFixed(2));
    cart.codigoCupon = codigoCupon.toUpperCase();

    // Recalcular total
    cart.total = cart.subtotal + cart.envio - cart.descuento;

    await this.cartRepository.save(cart);

    console.log(
      `✅ Cupón aplicado: ${porcentajeDescuento * 100}% de descuento`,
    );

    return this.getOrCreateCart(userId);
  }

  // ==================== REMOVER CUPÓN ====================
  async removeCoupon(userId: number): Promise<Cart> {
    console.log(`🗑️ Removiendo cupón del carrito`);

    const cart = await this.getOrCreateCart(userId);

    cart.descuento = 0;
    cart.codigoCupon = null;
    cart.total = cart.subtotal + cart.envio;

    await this.cartRepository.save(cart);

    console.log(`✅ Cupón removido`);

    return this.getOrCreateCart(userId);
  }

  // ==================== RECALCULAR TOTALES ====================
  private async recalcularTotales(cartId: number): Promise<Cart> {
    console.log(`🧮 Recalculando totales del carrito ${cartId}`);

    const cart = await this.cartRepository.findOne({
      where: { id: cartId },
      relations: [
        'items',
        'items.product',
        'items.product.images',
        'items.product.category',
        'items.product.seller', // ⭐ AGREGADO: Incluir seller
      ],
    });

    if (!cart) {
      throw new NotFoundException('Carrito no encontrado');
    }

    // ✅ Verificar que items existe
    if (!cart.items) {
      cart.items = [];
    }

    // Calcular subtotal
    const subtotal = cart.items.reduce(
      (sum, item) => sum + Number(item.subtotal),
      0,
    );
    cart.subtotal = Number(subtotal.toFixed(2));

    // Calcular envío (gratis si subtotal >= 500)
    cart.envio = subtotal >= 500 ? 0 : 80;

    // Recalcular descuento si hay cupón aplicado
    if (cart.codigoCupon) {
      const cuponesValidos: { [key: string]: number } = {
        RAICES10: 0.1,
        ARTESANIA15: 0.15,
        MEXICO20: 0.2,
      };
      const porcentaje = cuponesValidos[cart.codigoCupon] || 0;
      cart.descuento = Number((cart.subtotal * porcentaje).toFixed(2));
    }

    // Calcular total
    cart.total = Number(
      (cart.subtotal + cart.envio - cart.descuento).toFixed(2),
    );

    await this.cartRepository.save(cart);

    console.log(
      `✅ Totales recalculados: Subtotal=${cart.subtotal}, Envío=${cart.envio}, Total=${cart.total}`,
    );

    return cart;
  }

  // ==================== OBTENER CARRITO DEL USUARIO ====================
  async getCart(userId: number): Promise<Cart> {
    return this.getOrCreateCart(userId);
  }

  // ==================== OBTENER CANTIDAD DE ITEMS ====================
  async getCartItemsCount(userId: number): Promise<number> {
    const cart = await this.getOrCreateCart(userId);

    // ✅ Verificar que items existe antes de usar reduce
    if (!cart.items || cart.items.length === 0) {
      return 0;
    }

    return cart.items.reduce((sum, item) => sum + item.cantidad, 0);
  }
}
