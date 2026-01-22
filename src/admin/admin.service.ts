// src/admin/admin.service.ts
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { Admin } from './entities/admin.entity';
import { User } from '../users/entities/user.entity';
import { SellerRequest } from '../seller-request/entities/seller-request.entity';
import { AdminLoginDto } from './dto/admin-login.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import * as bcrypt from 'bcrypt';
import type { Response } from 'express';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(SellerRequest)
    private sellerRequestRepository: Repository<SellerRequest>,
    private jwtService: JwtService,
  ) {}

  /**
   * Login de administrador
   */
  async login(loginDto: AdminLoginDto, response: Response) {
    const admin = await this.adminRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!admin) {
      throw new UnauthorizedException('Email o contraseña incorrectos');
    }

    if (!admin.isActive) {
      throw new UnauthorizedException('Cuenta de administrador desactivada');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      admin.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Email o contraseña incorrectos');
    }

    // Payload JWT con flag isAdmin
    const payload = {
      sub: admin.id,
      email: admin.email,
      role: admin.role,
      isAdmin: true,
      isActive: admin.isActive, // ✅ AQUÍ

      // ← Flag para diferenciar de usuarios normales
    };

    const access_token = this.jwtService.sign(payload);

    // Cookie separada: admin_token
    response.cookie('admin_token', access_token, {
      httpOnly: true,
      secure: true, // 🔥 Forzado en producción
      sameSite: 'none', // 🔥 Cross-domain
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    return {
      success: true,
      message: `¡Bienvenido, ${admin.fullName}!`,
      admin: {
        id: admin.id,
        email: admin.email,
        fullName: admin.fullName,
        role: admin.role,
        isActive: admin.isActive, // ✅ AQUÍ
      },
    };
  }

  /**
   * Crear nuevo administrador (solo super_admin)
   */
  async create(createDto: CreateAdminDto) {
    const existingAdmin = await this.adminRepository.findOne({
      where: { email: createDto.email },
    });

    if (existingAdmin) {
      throw new ConflictException('El email ya está registrado');
    }

    const passwordHash = await bcrypt.hash(createDto.password, 10);

    const admin = this.adminRepository.create({
      email: createDto.email,
      fullName: createDto.fullName,
      passwordHash,
      role: createDto.role || 'admin',
      isActive: true,
    });

    await this.adminRepository.save(admin);

    return {
      success: true,
      message: 'Administrador creado exitosamente',
      admin: {
        id: admin.id,
        email: admin.email,
        fullName: admin.fullName,
        role: admin.role,
      },
    };
  }

  /**
   * Listar todos los administradores
   */
  async findAll() {
    const admins = await this.adminRepository.find({
      select: ['id', 'email', 'fullName', 'role', 'isActive', 'createdAt'],
      order: { createdAt: 'DESC' },
    });

    return {
      success: true,
      count: admins.length,
      admins,
    };
  }

  /**
   * Actualizar administrador
   */
  async update(id: number, updateDto: UpdateAdminDto) {
    const admin = await this.adminRepository.findOne({ where: { id } });

    if (!admin) {
      throw new NotFoundException('Administrador no encontrado');
    }

    if (updateDto.fullName) {
      admin.fullName = updateDto.fullName;
    }

    if (updateDto.isActive !== undefined) {
      admin.isActive = updateDto.isActive;
    }

    await this.adminRepository.save(admin);

    return {
      success: true,
      message: 'Administrador actualizado correctamente',
      admin: {
        id: admin.id,
        email: admin.email,
        fullName: admin.fullName,
        role: admin.role,
        isActive: admin.isActive,
      },
    };
  }

  /**
   * Logout de administrador
   */
  async logout(response: Response) {
    response.clearCookie('admin_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
    });

    return {
      success: true,
      message: 'Sesión de administrador cerrada',
    };
  }

  /**
   * Validar administrador (usado por AdminJwtStrategy)
   */
  async validateAdmin(adminId: number) {
    const admin = await this.adminRepository.findOne({
      where: { id: adminId, isActive: true },
    });

    return admin;
  }

  /**
   * Dashboard: Estadísticas generales
   */
  async getDashboardStats() {
    const [totalUsers, totalSellers, pendingRequests, totalRequests] =
      await Promise.all([
        this.userRepository.count(),
        this.userRepository.count({ where: { isSeller: true } }),
        this.sellerRequestRepository.count({ where: { status: 'pending' } }),
        this.sellerRequestRepository.count(),
      ]);

    return {
      success: true,
      stats: {
        totalUsers,
        totalSellers,
        totalBuyers: totalUsers - totalSellers,
        pendingRequests,
        approvedRequests: await this.sellerRequestRepository.count({
          where: { status: 'approved' },
        }),
        rejectedRequests: await this.sellerRequestRepository.count({
          where: { status: 'rejected' },
        }),
        totalRequests,
      },
    };
  }

  /**
   * Obtener todos los usuarios (para panel admin)
   */
  async getAllUsers() {
    const users = await this.userRepository.find({
      select: ['id', 'email', 'fullName', 'isSeller', 'createdAt'],
      order: { createdAt: 'DESC' },
    });

    return {
      success: true,
      count: users.length,
      users,
    };
  }
}
