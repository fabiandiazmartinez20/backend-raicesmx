import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

/**
 * Servicio de Autenticación
 *
 * Responsabilidades:
 * - Registrar nuevos usuarios
 * - Validar credenciales de login
 * - Generar tokens JWT
 * - Coordinar autenticación con UsersService
 */
@Injectable()
export class AuthService {
  constructor(
    /**
     * Servicio de usuarios
     * Utilizado para crear y buscar usuarios
     */
    private usersService: UsersService,

    /**
     * Servicio JWT
     * Utilizado para firmar tokens de acceso
     */
    private jwtService: JwtService,
  ) {}

  /**
   * Registro de nuevos usuarios
   *
   * Flujo:
   * 1. Verifica si el email ya existe
   * 2. Crea el usuario
   * 3. Genera un token JWT
   *
   * @param registerDto Datos de registro del usuario
   */
  async register(registerDto: RegisterDto) {
    // Verifica si el usuario ya existe
    const existingUser = await this.usersService.findByEmail(registerDto.email);

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    // Crea el usuario
    const user = await this.usersService.create({
      email: registerDto.email,
      fullName: registerDto.fullName,
      password: registerDto.password,
      isSeller: registerDto.isSeller || false,
    });

    // Payload del token JWT
    const payload = {
      sub: user.id,
      email: user.email,
      isSeller: user.isSeller,
    };

    // Genera el token
    const access_token = this.jwtService.sign(payload);

    return {
      success: true,
      message: '¡Registro exitoso! Bienvenido a nuestro marketplace',
      access_token,
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
   * 2. Valida la contraseña con bcrypt
   * 3. Genera token JWT
   *
   * @param loginDto Credenciales del usuario
   */
  async login(loginDto: LoginDto) {
    // Busca el usuario
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Email o contraseña incorrectos');
    }

    // Verifica la contraseña
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

    // Genera el token
    const access_token = this.jwtService.sign(payload);

    return {
      success: true,
      message: `¡Bienvenido de nuevo, ${user.fullName}!`,
      access_token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        isSeller: user.isSeller,
      },
    };
  }

  /**
   * Validación de usuario
   *
   * Usado principalmente por estrategias de Passport
   * para obtener el usuario a partir del ID
   *
   * @param userId ID del usuario autenticado
   */
  async validateUser(userId: number) {
    return await this.usersService.findOne(userId);
  }
}
