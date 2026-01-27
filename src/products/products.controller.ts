// src/products/products.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { GetProductsDto } from './dto/get-products.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SellerGuard } from '../auth/guards/seller.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  /**
   * POST /products
   * Crear nuevo producto (solo vendedores)
   * Requiere: autenticación + ser vendedor
   */
  @Post()
  @UseGuards(JwtAuthGuard, SellerGuard)
  @UseInterceptors(
    FilesInterceptor('imagenes', 5, {
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB por imagen
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/image\/(jpg|jpeg|png|webp)/)) {
          return cb(
            new BadRequestException(
              'Solo se permiten imágenes (JPG, PNG, WebP)',
            ),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async create(
    @GetUser() user: any,
    @Body() createProductDto: CreateProductDto,
    @UploadedFiles() images: Express.Multer.File[],
  ) {
    const product = await this.productsService.create(
      user.id,
      createProductDto,
      images,
    );

    return {
      success: true,
      message: '¡Producto publicado exitosamente!',
      product,
    };
  }

  /**
   * GET /products
   * Obtener todos los productos con filtros (público)
   */
  @Get()
  async findAll(@Query() filters: GetProductsDto) {
    const { products, total } = await this.productsService.findAll(filters);

    //  Convertir a números
    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 12;

    return {
      success: true,
      count: products.length,
      total,
      page, // ← ahora es número
      limit, // ← ahora es número
      products,
    };
  }

  /**
   * GET /products/categories
   * Obtener todas las categorías (público)
   */
  @Get('categories')
  async getCategories() {
    const categories = await this.productsService.findAllCategories();

    return {
      success: true,
      count: categories.length,
      categories,
    };
  }

  // Agregar este endpoint a products.controller.ts (DESPUÉS de @Get('categories'))

  /**
   * GET /products/nearby?lat=19.432&lng=-99.133&radius=5
   * Buscar productos cercanos a una ubicación (público)
   */
  @Get('nearby')
  async findNearby(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radius') radius?: string,
  ) {
    // Validar que lat y lng sean números válidos
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const radiusKm = radius ? parseFloat(radius) : 5;

    if (isNaN(latitude) || isNaN(longitude)) {
      throw new BadRequestException(
        'Coordenadas inválidas. Proporciona lat y lng válidos.',
      );
    }

    if (latitude < -90 || latitude > 90) {
      throw new BadRequestException('Latitud debe estar entre -90 y 90');
    }

    if (longitude < -180 || longitude > 180) {
      throw new BadRequestException('Longitud debe estar entre -180 y 180');
    }

    if (radiusKm <= 0 || radiusKm > 50) {
      throw new BadRequestException('Radio debe estar entre 1 y 50 km');
    }

    const products = await this.productsService.findNearbyProducts(
      latitude,
      longitude,
      radiusKm,
    );

    return {
      success: true,
      message: `Productos encontrados en ${radiusKm}km`,
      count: products.length,
      userLocation: { lat: latitude, lng: longitude },
      radius: radiusKm,
      products,
    };
  }

  /**
   * GET /products/my-products
   * Obtener productos del vendedor actual
   */
  @Get('my-products')
  @UseGuards(JwtAuthGuard, SellerGuard)
  async getMyProducts(@GetUser() user: any) {
    const products = await this.productsService.findBySeller(user.id);

    return {
      success: true,
      count: products.length,
      products,
    };
  }

  /**
   * GET /products/:id
   * Obtener detalle de un producto (público)
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const product = await this.productsService.findOne(+id);

    return {
      success: true,
      product,
    };
  }

  /**
   * PATCH /products/:id
   * Actualizar producto (solo el dueño)
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, SellerGuard)
  async update(
    @Param('id') id: string,
    @GetUser() user: any,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    const product = await this.productsService.update(
      +id,
      user.id,
      updateProductDto,
    );

    return {
      success: true,
      message: 'Producto actualizado correctamente',
      product,
    };
  }

  /**
   * DELETE /products/:id
   * Eliminar producto (solo el dueño)
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, SellerGuard)
  async remove(@Param('id') id: string, @GetUser() user: any) {
    await this.productsService.remove(+id, user.id);

    return {
      success: true,
      message: 'Producto eliminado correctamente',
    };
  }
}
