// src/auth/auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Response } from 'express';
import * as bcrypt from 'bcrypt';

/**
 * Servicio de Autenticación
 *
 * Responsabilidades:
 * - Registrar nuevos usuarios
 * - Validar credenciales de login
 * - Generar y establecer tokens JWT en cookies HTTP-Only
 * - Coordinar autenticación con UsersService
 *
 * Seguridad:
 * - Usa HTTP-Only cookies para prevenir ataques XSS
 * - Hashea contraseñas con bcrypt
 * - Valida credenciales antes de generar tokens
 */
@Injectable()
export class AuthService {
  constructor(
    /**
     * Servicio de usuarios
     * Utilizado para crear y buscar usuarios en la base de datos
     */
    private usersService: UsersService,

    /**
     * Servicio JWT
     * Utilizado para firmar tokens de acceso con el secreto configurado
     */
    private jwtService: JwtService,
  ) {}

  /**
   * Registro de nuevos usuarios
   *
   * Flujo:
   * 1. Verifica si el email ya existe en la base de datos
   * 2. Crea el usuario con contraseña hasheada
   * 3. Genera un token JWT con información del usuario
   * 4. Establece el token en una cookie HTTP-Only
   *
   * @param registerDto Datos de registro (email, fullName, password, isSeller)
   * @param response Objeto Response de Express para establecer cookies
   *
   * @returns Objeto con mensaje de éxito y datos del usuario (sin password)
   * @throws ConflictException si el email ya está registrado
   */
  async register(registerDto: RegisterDto, response: Response) {
    // Verifica si el usuario ya existe
    const existingUser = await this.usersService.findByEmail(registerDto.email);

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    // Crea el usuario (el password se hashea en UsersService)
    const user = await this.usersService.create({
      email: registerDto.email,
      fullName: registerDto.fullName,
      password: registerDto.password,
      isSeller: registerDto.isSeller || false,
    });

    /**
     * Payload del token JWT
     *
     * - sub: Subject (ID del usuario) - Estándar JWT
     * - email: Email del usuario para identificación rápida
     * - isSeller: Rol del usuario para autorización
     */
    const payload = {
      sub: user.id,
      email: user.email,
      isSeller: user.isSeller,
    };

    // Genera el token firmado
    const access_token = this.jwtService.sign(payload);

    /**
     * Establece cookie HTTP-Only
     *
     * Configuración de seguridad:
     * - httpOnly: true → No accesible desde JavaScript (previene XSS)
     * - secure: true en producción → Solo envía por HTTPS
     * - sameSite: 'lax' → Protección contra CSRF
     * - maxAge: 7 días en milisegundos
     * - path: '/' → Cookie disponible en toda la aplicación
     */
    response.cookie('access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
      path: '/',
    });

    return {
      success: true,
      message: '¡Registro exitoso! Bienvenido a nuestro marketplace',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        isSeller: user.isSeller,
      },
    };
  }

  /**
   * Login de usuario
   *
   * Flujo:
   * 1. Busca usuario por email
   * 2. Valida la contraseña con bcrypt.compare
   * 3. Genera token JWT si las credenciales son válidas
   * 4. Establece el token en una cookie HTTP-Only
   *
   * @param loginDto Credenciales del usuario (email, password)
   * @param response Objeto Response de Express para establecer cookies
   *
   * @returns Objeto con mensaje de bienvenida y datos del usuario
   * @throws UnauthorizedException si las credenciales son incorrectas
   */
  async login(loginDto: LoginDto, response: Response) {
    // Busca el usuario por email
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user) {
      // No revelar si el email existe o no (seguridad)
      throw new UnauthorizedException('Email o contraseña incorrectos');
    }

    /**
     * Verifica la contraseña
     *
     * bcrypt.compare compara la contraseña en texto plano
     * con el hash almacenado en la base de datos
     */
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Email o contraseña incorrectos');
    }

    // Payload del token JWT
    const payload = {
      sub: user.id,
      email: user.email,
      isSeller: user.isSeller,
    };

    // Genera el token firmado
    const access_token = this.jwtService.sign(payload);

    // Establece cookie HTTP-Only con la misma configuración que en register
    response.cookie('access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
      path: '/',
    });

    return {
      success: true,
      message: `¡Bienvenido de nuevo, ${user.fullName}!`,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        isSeller: user.isSeller,
      },
    };
  }

  /**
   * Logout de usuario
   *
   * Elimina la cookie HTTP-Only estableciendo su valor a vacío
   * y una fecha de expiración en el pasado
   *
   * @param response Objeto Response de Express para limpiar cookies
   *
   * @returns Mensaje de confirmación de logout
   */
  async logout(response: Response) {
    /**
     * Elimina la cookie del navegador
     *
     * clearCookie establece maxAge: 0 y expires en el pasado,
     * haciendo que el navegador elimine la cookie inmediatamente
     */
    response.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return {
      success: true,
      message: 'Sesión cerrada correctamente. ¡Hasta pronto!',
    };
  }

  /**
   * Validación de usuario
   *
   * Usado por JWT Strategy para verificar que el usuario
   * del token aún existe en la base de datos
   *
   * @param userId ID del usuario extraído del token JWT
   *
   * @returns Usuario encontrado o null
   */
  async validateUser(userId: number) {
    return await this.usersService.findOne(userId);
  }
}
