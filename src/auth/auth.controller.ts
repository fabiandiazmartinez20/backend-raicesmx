// src/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  Response,
  Res, // ← Agregar este import
} from '@nestjs/common';
import type { Response as ExpressResponse } from 'express'; // ← Esta línea debe estar
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

/**
 * Controlador de Autenticación
 *
 * Expone los endpoints públicos y protegidos
 * relacionados con autenticación de usuarios.
 *
 * Ruta base: /auth
 */
@Controller('auth')
export class AuthController {
  constructor(
    /**
     * Servicio de autenticación
     * Contiene la lógica de negocio (login, register, JWT, cookies)
     */
    private readonly authService: AuthService,
  ) {}

  /**
   * Registro de usuario
   *
   * Endpoint público que permite crear un nuevo usuario
   * y establece automáticamente una cookie HTTP-Only con el token JWT.
   */
  @Post('register')
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) response: ExpressResponse, // ← Cambiar @Response por @Res
  ) {
    return await this.authService.register(registerDto, response);
  }

  /**
   * Login de usuario
   *
   * Endpoint público que valida credenciales
   * y establece una cookie HTTP-Only con el token JWT si son correctas.
   */
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: ExpressResponse, // ← Cambiar @Response por @Res
  ) {
    return await this.authService.login(loginDto, response);
  }

  /**
   * Obtener perfil del usuario autenticado
   *
   * Endpoint protegido por JWT.
   * Devuelve la información del usuario extraída del token en la cookie.
   */
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return {
      success: true,
      message: 'Perfil obtenido correctamente',
      user: req.user,
    };
  }

  /**
   * Logout de usuario
   *
   * Endpoint protegido que elimina la cookie HTTP-Only
   * cerrando efectivamente la sesión del usuario.
   */
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Res({ passthrough: true }) response: ExpressResponse) {
    // ← Cambiar @Response por @Res
    return this.authService.logout(response);
  }
}
