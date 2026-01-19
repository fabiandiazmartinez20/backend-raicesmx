// src/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  Res,
  Req,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard'; // ← Nuevo import
import { ConfigService } from '@nestjs/config';
import {
  RequestResetDto,
  VerifyCodeDto,
  ResetPasswordDto,
} from './dto/password-reset.dto';

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
     * Contiene la lógica de negocio (login, register, JWT, cookies, Google OAuth)
     */
    private readonly authService: AuthService,

    /**
     * Servicio de configuración
     * Para obtener variables de entorno como FRONTEND_URL
     */
    private readonly configService: ConfigService,
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
    @Res({ passthrough: true }) response: Response,
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
    @Res({ passthrough: true }) response: Response,
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
  logout(@Res({ passthrough: true }) response: Response) {
    return this.authService.logout(response);
  }

  /**
   * Endpoint que inicia el flujo de OAuth con Google
   *
   * Cuando el usuario hace click en "Continuar con Google",
   * este endpoint redirige automáticamente a la página de Google
   *
   * GET /auth/google
   */
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {
    /**
     * El guard GoogleAuthGuard maneja automáticamente la redirección a Google
     * Este método no se ejecuta, solo es necesario para definir la ruta
     */
  }

  /**
   * Callback de Google OAuth
   *
   * Google redirige aquí después de que el usuario autoriza la app
   *
   * GET /auth/google/callback?code=...
   *
   * @param req Request con datos del usuario de Google (inyectado por GoogleStrategy)
   * @param res Response para establecer cookies y redirigir
   */
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(
    @Req() req,
    @Res({ passthrough: true }) res: Response,
  ) {
    /**
     * req.user contiene los datos extraídos por GoogleStrategy:
     * - googleId
     * - email
     * - fullName
     * - picture
     * - provider
     */
    const result = await this.authService.googleLogin(req.user, res);

    /**
     * Redirige al frontend con el resultado
     *
     * El frontend detectará la autenticación exitosa
     * gracias a la cookie HTTP-Only establecida
     */
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:4200';

    /**
     * Redirige a marketplace con parámetro de éxito
     * El frontend lo detectará y mostrará mensaje de bienvenida
     */
    return res.redirect(`${frontendUrl}/marketplace?login=google-success`);
  }

  /**
   * POST /auth/password-reset/request
   * PASO 1: Solicitar código de recuperación
   */
  @Post('password-reset/request')
  async requestPasswordReset(@Body() dto: RequestResetDto) {
    return this.authService.requestPasswordReset(dto.email);
  }

  /**
   * POST /auth/password-reset/verify
   * PASO 2: Verificar código
   */
  @Post('password-reset/verify')
  async verifyResetCode(@Body() dto: VerifyCodeDto) {
    return this.authService.verifyResetCode(dto.email, dto.code);
  }

  /**
   * POST /auth/password-reset/reset
   * PASO 3: Restablecer contraseña
   */
  @Post('password-reset/reset')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.email, dto.code, dto.newPassword);
  }
}
