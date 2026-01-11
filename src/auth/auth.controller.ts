import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
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
     * Contiene la lógica de negocio (login, register, JWT)
     */
    private readonly authService: AuthService,
  ) {}

  /**
   * Registro de usuario
   *
   * Endpoint público que permite crear un nuevo usuario
   * y devuelve un token JWT de acceso.
   *
   * @param registerDto Datos necesarios para el registro
   */
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return await this.authService.register(registerDto);
  }

  /**
   * Login de usuario
   *
   * Endpoint público que valida credenciales
   * y devuelve un token JWT si son correctas.
   *
   * @param loginDto Credenciales del usuario
   */
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.login(loginDto);
  }

  /**
   * Obtener perfil del usuario autenticado
   *
   * Endpoint protegido por JWT.
   * Devuelve la información del usuario extraída del token.
   *
   * Requiere header:
   * Authorization: Bearer <token>
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
   * Endpoint protegido.
   * En sistemas JWT el logout es principalmente
   * una acción lógica del frontend (eliminar token).
   */
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout() {
    return {
      success: true,
      message: 'Sesión cerrada correctamente. ¡Hasta pronto!',
    };
  }
}
