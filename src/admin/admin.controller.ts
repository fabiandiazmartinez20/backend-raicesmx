// src/admin/admin.controller.ts
import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Res,
  UseGuards,
  Req,
  Request,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { AdminJwtGuard } from './guards/admin-jwt.guard';
import { SuperAdminGuard } from './guards/super-admin.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import type { Response } from 'express';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * POST /admin/login
   * Login de administradores
   */
  @Post('login')
  async login(
    @Body() loginDto: AdminLoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.adminService.login(loginDto, response);
  }

  /**
   * POST /admin/logout
   * Logout de administrador
   */
  @Post('logout')
  @UseGuards(AdminJwtGuard)
  async logout(@Res({ passthrough: true }) response: Response) {
    return this.adminService.logout(response);
  }

  /**
   * GET /admin/profile
   * Obtener perfil del admin autenticado
   */
  @Get('profile')
  @UseGuards(AdminJwtGuard)
  getProfile(@GetUser() admin: any) {
    return {
      success: true,
      admin,
    };
  }

  /**
   * GET /admin/dashboard/stats
   * Estadísticas del dashboard
   */
  @Get('dashboard/stats')
  @UseGuards(AdminJwtGuard)
  getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  /**
   * GET /admin/users
   * Listar todos los usuarios
   */
  @Get('users')
  @UseGuards(AdminJwtGuard)
  getAllUsers() {
    return this.adminService.getAllUsers();
  }

  /**
   * GET /admin/admins
   * Listar todos los administradores (solo super_admin)
   */
  @Get('admins')
  @UseGuards(AdminJwtGuard, SuperAdminGuard)
  getAllAdmins() {
    return this.adminService.findAll();
  }

  /**
   * POST /admin/admins
   * Crear nuevo administrador (solo super_admin)
   */
  @Post('admins')
  @UseGuards(AdminJwtGuard, SuperAdminGuard)
  createAdmin(@Body() createDto: CreateAdminDto) {
    return this.adminService.create(createDto);
  }

  /**
   * PATCH /admin/admins/:id
   * Actualizar administrador (solo super_admin)
   */
  @Patch('admins/:id')
  @UseGuards(AdminJwtGuard, SuperAdminGuard)
  updateAdmin(@Param('id') id: string, @Body() updateDto: UpdateAdminDto) {
    return this.adminService.update(+id, updateDto);
  }
}
