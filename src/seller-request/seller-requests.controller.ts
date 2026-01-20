// src/seller-requests/seller-requests.controller.ts
import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { SellerRequestsService } from './seller-requests.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { CreateSellerRequestDto } from './dto/create-seller-request.dto';
import { ReviewSellerRequestDto } from './dto/review-seller-requests.dto';
import { GetSellerRequestsDto } from './dto/get-seller-requests.dto';
@Controller('seller-requests')
export class SellerRequestsController {
  constructor(private readonly sellerRequestsService: SellerRequestsService) {}

  /**
   * POST /seller-requests
   * Crear solicitud de vendedor (usuario autenticado)
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'ineFront', maxCount: 1 },
      { name: 'ineBack', maxCount: 1 },
    ]),
  )
  async create(
    @GetUser() user: any,
    @Body() dto: CreateSellerRequestDto,
    @UploadedFiles()
    files: {
      ineFront?: Express.Multer.File[];
      ineBack?: Express.Multer.File[];
    },
  ) {
    // Validar que se subió la imagen frontal
    if (!files.ineFront || files.ineFront.length === 0) {
      throw new BadRequestException('La imagen frontal del INE es requerida');
    }

    // Validar tipos de archivo (solo imágenes)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    const ineFront = files.ineFront[0];
    if (!allowedTypes.includes(ineFront.mimetype)) {
      throw new BadRequestException(
        'Solo se permiten imágenes (JPEG, PNG, WebP)',
      );
    }

    const ineBack = files.ineBack?.[0];
    if (ineBack && !allowedTypes.includes(ineBack.mimetype)) {
      throw new BadRequestException(
        'Solo se permiten imágenes (JPEG, PNG, WebP)',
      );
    }

    // Validar tamaño (máximo 5MB por imagen)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (ineFront.size > maxSize) {
      throw new BadRequestException('La imagen frontal no debe superar 5MB');
    }

    if (ineBack && ineBack.size > maxSize) {
      throw new BadRequestException('La imagen trasera no debe superar 5MB');
    }

    return this.sellerRequestsService.create(user.id, dto, ineFront, ineBack);
  }

  /**
   * GET /seller-requests/me
   * Obtener solicitud del usuario actual
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMyRequest(@GetUser() user: any) {
    return this.sellerRequestsService.findByUser(user.id);
  }

  /**
   * GET /seller-requests
   * Listar todas las solicitudes (solo admin)
   * TODO: Agregar AdminGuard
   */
  @Get()
  @UseGuards(JwtAuthGuard) // TODO: Cambiar por AdminGuard
  async findAll(@Query() query: GetSellerRequestsDto) {
    return this.sellerRequestsService.findAll(query.status);
  }

  /**
   * PATCH /seller-requests/:id/review
   * Aprobar o rechazar solicitud (solo admin)
   * TODO: Agregar AdminGuard
   */
  @Patch(':id/review')
  @UseGuards(JwtAuthGuard) // TODO: Cambiar por AdminGuard
  async review(
    @Param('id') id: string,
    @GetUser() admin: any,
    @Body() dto: ReviewSellerRequestDto,
  ) {
    return this.sellerRequestsService.review(+id, admin.id, dto);
  }

  /**
   * DELETE /seller-requests/:id
   * Eliminar solicitud (solo admin)
   * TODO: Agregar AdminGuard
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard) // TODO: Cambiar por AdminGuard
  async delete(@Param('id') id: string) {
    return this.sellerRequestsService.delete(+id);
  }
}
