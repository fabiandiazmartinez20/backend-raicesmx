// src/products/products.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';
import { Category } from './entities/category.entity';
import { CloudinaryService } from '../common/services/cloudinary.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { GetProductsDto } from './dto/get-products.dto';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private imageRepository: Repository<ProductImage>,

    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,

    private cloudinaryService: CloudinaryService,
  ) {}

  /**
   * Crear un nuevo producto con imágenes
   */
  async create(
    sellerId: number,
    dto: CreateProductDto,
    images: Express.Multer.File[],
  ): Promise<Product> {
    // Validar que haya al menos una imagen
    if (!images || images.length === 0) {
      throw new BadRequestException(
        'Debes subir al menos una imagen del producto',
      );
    }

    if (images.length > 5) {
      throw new BadRequestException('Máximo 5 imágenes permitidas');
    }

    // Validar que la categoría exista
    const category = await this.categoryRepository.findOne({
      where: { id: dto.categoryId, isActive: true },
    });

    if (!category) {
      throw new NotFoundException('Categoría no encontrada o inactiva');
    }

    // Crear el producto (sin imágenes todavía)
    const product = this.productRepository.create({
      ...dto,
      sellerId,
      isActive: true,
      vistas: 0,
      ventas: 0,
    });

    // Guardar producto primero
    const savedProduct = await this.productRepository.save(product);
    this.logger.log(`✅ Producto creado con ID: ${savedProduct.id}`);

    // Subir imágenes a Cloudinary
    try {
      const uploadedImages = await this.uploadProductImages(
        savedProduct.id,
        images,
      );
      savedProduct.images = uploadedImages;

      this.logger.log(
        `✅ ${uploadedImages.length} imágenes subidas a Cloudinary`,
      );

      return savedProduct;
    } catch (error) {
      // Si falla la subida de imágenes, eliminar el producto
      await this.productRepository.remove(savedProduct);
      this.logger.error('❌ Error subiendo imágenes, producto eliminado');
      throw new BadRequestException('Error al subir las imágenes del producto');
    }
  }

  /**
   * Subir imágenes del producto a Cloudinary
   */
  private async uploadProductImages(
    productId: number,
    files: Express.Multer.File[],
  ): Promise<ProductImage[]> {
    const uploadedImages: ProductImage[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Subir a Cloudinary (automáticamente en WebP, 80% calidad)
      const uploadResult = await this.cloudinaryService.uploadImage(
        file,
        `products/product_${productId}`,
      );

      // Crear registro en base de datos
      const productImage = this.imageRepository.create({
        productId,
        imageUrl: uploadResult.url,
        publicId: uploadResult.publicId,
        orden: i, // 0 = principal, 1+ = secundarias
      });

      const savedImage = await this.imageRepository.save(productImage);
      uploadedImages.push(savedImage);
    }

    return uploadedImages;
  }

  /**
   * Obtener todos los productos con filtros
   */
  async findAll(
    filters: GetProductsDto,
  ): Promise<{ products: Product[]; total: number }> {
    const {
      categoryId,
      estado,
      unidad,
      minPrecio,
      maxPrecio,
      search,
      ordenar = 'recientes',
      page = 1,
      limit = 12,
    } = filters;

    const query = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.seller', 'seller')
      .leftJoinAndSelect('product.images', 'images')
      .where('product.isActive = :isActive', { isActive: true });

    // Filtros
    if (categoryId) {
      query.andWhere('product.categoryId = :categoryId', { categoryId });
    }

    if (estado) {
      query.andWhere('product.estado = :estado', { estado });
    }

    if (unidad) {
      query.andWhere('product.unidad = :unidad', { unidad });
    }

    if (minPrecio) {
      query.andWhere('product.precio >= :minPrecio', { minPrecio });
    }

    if (maxPrecio) {
      query.andWhere('product.precio <= :maxPrecio', { maxPrecio });
    }

    if (search) {
      query.andWhere(
        'product.titulo LIKE :search OR product.descripcion LIKE :search',
        {
          search: `%${search}%`,
        },
      );
    }

    // Ordenamiento
    switch (ordenar) {
      case 'precio_asc':
        query.orderBy('product.precio', 'ASC');
        break;
      case 'precio_desc':
        query.orderBy('product.precio', 'DESC');
        break;
      case 'mas_vendidos':
        query.orderBy('product.ventas', 'DESC');
        break;
      default:
        query.orderBy('product.createdAt', 'DESC');
    }

    // Paginación
    const skip = (page - 1) * limit;
    query.skip(skip).take(limit);

    const [products, total] = await query.getManyAndCount();

    return { products, total };
  }

  /**
   * Obtener un producto por ID
   */
  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id, isActive: true },
      relations: ['category', 'seller', 'images'],
    });

    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    // Incrementar vistas
    await this.productRepository.update(id, { vistas: product.vistas + 1 });

    return product;
  }

  /**
   * Actualizar producto
   */
  async update(
    productId: number,
    sellerId: number,
    dto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    // Verificar que el vendedor sea el dueño del producto
    if (product.sellerId !== sellerId) {
      throw new ForbiddenException(
        'No tienes permiso para editar este producto',
      );
    }

    // Actualizar
    Object.assign(product, dto);
    return await this.productRepository.save(product);
  }

  /**
   * Eliminar producto (soft delete)
   */
  async remove(productId: number, sellerId: number): Promise<void> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
      relations: ['images'],
    });

    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    if (product.sellerId !== sellerId) {
      throw new ForbiddenException(
        'No tienes permiso para eliminar este producto',
      );
    }

    // Eliminar imágenes de Cloudinary
    for (const image of product.images) {
      await this.cloudinaryService.deleteImage(image.publicId);
    }

    // Eliminar producto (cascade eliminará imágenes en BD)
    await this.productRepository.remove(product);
    this.logger.log(`🗑️ Producto ${productId} eliminado`);
  }

  /**
   * Obtener productos del vendedor actual
   */
  async findBySeller(sellerId: number): Promise<Product[]> {
    return await this.productRepository.find({
      where: { sellerId },
      relations: ['category', 'images'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Obtener todas las categorías activas
   */
  async findAllCategories(): Promise<Category[]> {
    return await this.categoryRepository.find({
      where: { isActive: true },
      order: { nombre: 'ASC' },
    });
  }
}
