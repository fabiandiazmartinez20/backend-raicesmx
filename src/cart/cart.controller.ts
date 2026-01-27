// src/cart/cart.controller.ts - VERSIÓN CON EXTRACCIÓN MANUAL DE userId
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { ApplyCouponDto } from './dto/apply-coupon.dto';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  // ==================== OBTENER CARRITO ====================
  @Get()
  async getCart(@Request() req) {
    const userId = req.user.id; // ✅ Extracción manual
    console.log(`📦 GET /cart - Usuario ${userId} (tipo: ${typeof userId})`);

    const cart = await this.cartService.getCart(userId);

    return {
      success: true,
      message: 'Carrito obtenido correctamente',
      cart,
    };
  }

  // ==================== AGREGAR PRODUCTO AL CARRITO ====================
  @Post('add')
  async addToCart(@Request() req, @Body() addToCartDto: AddToCartDto) {
    const userId = req.user.id; // ✅ Extracción manual
    console.log(
      `➕ POST /cart/add - Usuario ${userId} (tipo: ${typeof userId})`,
      addToCartDto,
    );

    const cart = await this.cartService.addToCart(userId, addToCartDto);

    return {
      success: true,
      message: 'Producto agregado al carrito',
      cart,
    };
  }

  // ==================== ACTUALIZAR CANTIDAD DE ITEM ====================
  @Patch('items/:itemId')
  async updateCartItem(
    @Request() req,
    @Param('itemId') itemId: number,
    @Body() updateDto: UpdateCartItemDto,
  ) {
    const userId = req.user.id; // ✅ Extracción manual
    console.log(
      `🔄 PATCH /cart/items/${itemId} - Usuario ${userId}`,
      updateDto,
    );

    const cart = await this.cartService.updateCartItem(
      userId,
      itemId,
      updateDto,
    );

    return {
      success: true,
      message: 'Cantidad actualizada correctamente',
      cart,
    };
  }

  // ==================== ELIMINAR ITEM DEL CARRITO ====================
  @Delete('items/:itemId')
  @HttpCode(HttpStatus.OK)
  async removeCartItem(@Request() req, @Param('itemId') itemId: number) {
    const userId = req.user.id; // ✅ Extracción manual
    console.log(`🗑️ DELETE /cart/items/${itemId} - Usuario ${userId}`);

    const cart = await this.cartService.removeCartItem(userId, itemId);

    return {
      success: true,
      message: 'Producto eliminado del carrito',
      cart,
    };
  }

  // ==================== VACIAR CARRITO ====================
  @Delete('clear')
  @HttpCode(HttpStatus.OK)
  async clearCart(@Request() req) {
    const userId = req.user.id; // ✅ Extracción manual
    console.log(`🧹 DELETE /cart/clear - Usuario ${userId}`);

    await this.cartService.clearCart(userId);

    return {
      success: true,
      message: 'Carrito vaciado correctamente',
    };
  }

  // ==================== APLICAR CUPÓN ====================
  @Post('coupon')
  async applyCoupon(@Request() req, @Body() applyCouponDto: ApplyCouponDto) {
    const userId = req.user.id; // ✅ Extracción manual
    console.log(`🎟️ POST /cart/coupon - Usuario ${userId}`, applyCouponDto);

    const cart = await this.cartService.applyCoupon(userId, applyCouponDto);

    return {
      success: true,
      message: 'Cupón aplicado correctamente',
      cart,
    };
  }

  // ==================== REMOVER CUPÓN ====================
  @Delete('coupon')
  @HttpCode(HttpStatus.OK)
  async removeCoupon(@Request() req) {
    const userId = req.user.id; // ✅ Extracción manual
    console.log(`🗑️ DELETE /cart/coupon - Usuario ${userId}`);

    const cart = await this.cartService.removeCoupon(userId);

    return {
      success: true,
      message: 'Cupón removido correctamente',
      cart,
    };
  }

  // ==================== OBTENER CANTIDAD DE ITEMS ====================
  @Get('count')
  async getCartItemsCount(@Request() req) {
    const userId = req.user.id; // ✅ Extracción manual
    console.log(
      `🔢 GET /cart/count - Usuario ${userId} (tipo: ${typeof userId})`,
    );

    const count = await this.cartService.getCartItemsCount(userId);

    return {
      success: true,
      count,
    };
  }
}
