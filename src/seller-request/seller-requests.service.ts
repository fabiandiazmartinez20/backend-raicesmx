// src/seller-requests/seller-requests.service.ts
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SellerRequest } from './entities/seller-request.entity';
import { User } from '../users/entities/user.entity';
import { CloudinaryService } from '../common/services/cloudinary.service';
import { CreateSellerRequestDto } from './dto/create-seller-request.dto';
import { ReviewSellerRequestDto } from './dto/review-seller-requests.dto';
import { EmailService } from 'src/auth/services/email.service';

@Injectable()
export class SellerRequestsService {
  constructor(
    @InjectRepository(SellerRequest)
    private sellerRequestRepository: Repository<SellerRequest>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private cloudinaryService: CloudinaryService,
    private emailService: EmailService, // ✨ INYECTAR
  ) {}

  /**
   * Crear solicitud de vendedor con imágenes
   */
  async create(
    userId: number,
    dto: CreateSellerRequestDto,
    ineFront: Express.Multer.File,
    ineBack?: Express.Multer.File,
  ) {
    // Verificar que el usuario existe
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Verificar que no sea ya vendedor
    if (user.isSeller) {
      throw new ConflictException('Ya eres vendedor verificado');
    }

    // Verificar que no tenga una solicitud pendiente
    const existingRequest = await this.sellerRequestRepository.findOne({
      where: { userId, status: 'pending' },
    });

    if (existingRequest) {
      throw new ConflictException(
        'Ya tienes una solicitud pendiente. Espera a que sea revisada.',
      );
    }

    // Subir imagen frontal del INE
    const frontUpload = await this.cloudinaryService.uploadImage(
      ineFront,
      'ine_documents',
      `ine_front_${userId}_${Date.now()}`,
    );

    // Subir imagen trasera del INE (opcional)
    let backUpload: { url: string; publicId: string } | null = null;
    if (ineBack) {
      backUpload = await this.cloudinaryService.uploadImage(
        ineBack,
        'ine_documents',
        `ine_back_${userId}_${Date.now()}`,
      );
    }

    // Crear la solicitud
    const request = this.sellerRequestRepository.create({
      userId,
      curp: dto.curp.toUpperCase(),
      ineFrontUrl: frontUpload.url,
      ineFrontPublicId: frontUpload.publicId,
      ineBackUrl: backUpload ? backUpload.url : undefined,
      ineBackPublicId: backUpload ? backUpload.publicId : undefined,
      status: 'pending' as const,
    });

    await this.sellerRequestRepository.save(request);

    return {
      success: true,
      message:
        'Solicitud enviada exitosamente. Recibirás una respuesta pronto.',
      request: {
        id: request.id,
        status: request.status,
        createdAt: request.createdAt,
      },
    };
  }

  /**
   * Obtener todas las solicitudes (para admin)
   */
  async findAll(status?: string) {
    const query = this.sellerRequestRepository
      .createQueryBuilder('request')
      .leftJoinAndSelect('request.user', 'user')
      .leftJoinAndSelect('request.reviewer', 'reviewer')
      .select([
        'request',
        'user.id',
        'user.email',
        'user.fullName',
        'reviewer.id',
        'reviewer.fullName',
      ]);

    if (status && status !== 'all') {
      query.where('request.status = :status', { status });
    }

    query.orderBy('request.createdAt', 'DESC');

    const requests = await query.getMany();

    return {
      success: true,
      count: requests.length,
      requests,
    };
  }

  /**
   * Obtener solicitud del usuario actual
   */
  async findByUser(userId: number) {
    const request = await this.sellerRequestRepository.findOne({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    if (!request) {
      return {
        success: true,
        hasRequest: false,
        request: null,
      };
    }

    return {
      success: true,
      hasRequest: true,
      request: {
        id: request.id,
        status: request.status,
        curp: request.curp,
        createdAt: request.createdAt,
        reviewedAt: request.reviewedAt,
        rejectionReason: request.rejectionReason,
      },
    };
  }

  /**
   * Aprobar o rechazar solicitud (solo admin)
   */
  /**
   * Aprobar o rechazar solicitud (solo admin)
   */
  async review(
    requestId: number,
    adminId: number,
    dto: ReviewSellerRequestDto,
  ) {
    const request = await this.sellerRequestRepository.findOne({
      where: { id: requestId },
      relations: ['user'], // 👈 IMPORTANTE
    });

    if (!request) {
      throw new NotFoundException('Solicitud no encontrada');
    }

    if (request.status !== 'pending') {
      throw new BadRequestException('Esta solicitud ya fue revisada');
    }

    // Actualizar estado
    request.status = dto.status;
    request.reviewedBy = adminId;
    request.reviewedAt = new Date();

    if (dto.status === 'rejected' && dto.rejectionReason) {
      request.rejectionReason = dto.rejectionReason;
    }

    await this.sellerRequestRepository.save(request);

    // ===============================
    // ✅ SI ES APROBADO
    // ===============================
    if (dto.status === 'approved') {
      await this.userRepository.update(
        { id: request.userId },
        { isSeller: true },
      );

      // 📧 ENVIAR EMAIL DE APROBACIÓN
      await this.emailService.sendSellerApprovalEmail(
        request.user.email,
        request.user.fullName,
      );

      console.log(
        `✅ Solicitud aprobada. Email enviado a: ${request.user.email}`,
      );
    }

    // ===============================
    // ❌ SI ES RECHAZADO
    // ===============================
    if (dto.status === 'rejected') {
      await this.emailService.sendSellerRejectionEmail(
        request.user.email,
        request.user.fullName,
        dto.rejectionReason || 'No especificado',
      );

      console.log(
        `❌ Solicitud rechazada. Email enviado a: ${request.user.email}`,
      );
    }

    return {
      success: true,
      message:
        dto.status === 'approved'
          ? 'Solicitud aprobada. Usuario ahora es vendedor.'
          : 'Solicitud rechazada.',
      request,
    };
  }

  /**
   * Eliminar solicitud y sus imágenes
   */
  async delete(requestId: number) {
    const request = await this.sellerRequestRepository.findOne({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException('Solicitud no encontrada');
    }

    // Eliminar imágenes de Cloudinary
    const publicIds = [request.ineFrontPublicId];
    if (request.ineBackPublicId) {
      publicIds.push(request.ineBackPublicId);
    }

    await this.cloudinaryService.deleteImages(publicIds);

    // Eliminar solicitud de la BD
    await this.sellerRequestRepository.delete(requestId);

    return {
      success: true,
      message: 'Solicitud eliminada correctamente',
    };
  }
}
