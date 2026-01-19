// src/auth/auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/entities/user.entity';
import { PasswordResetCode } from './entities/password-reset-code.entity';
import { EmailService } from './services/email.service';
import type { Response } from 'express';
import * as bcrypt from 'bcrypt';
/**
 * AuthService
 * -------------
 * Servicio encargado de la autenticación y autorización de usuarios.
 *
 * Funcionalidades principales:
 * - Registro de usuarios
 * - Inicio de sesión (email/contraseña y Google)
 * - Generación y validación de JWT
 * - Cierre de sesión
 * - Recuperación de contraseña por código enviado por email
 *
 * @author RaícesMX
 */

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailService: EmailService,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(PasswordResetCode)
    private resetCodeRepository: Repository<PasswordResetCode>,
  ) {}
  // ======================================================
  // AUTENTICACIÓN BÁSICA
  // ======================================================

  /**
   * Registra un nuevo usuario en el sistema.
   *
   * - Valida que el email no exista
   * - Crea el usuario
   * - Genera un JWT
   * - Guarda el token en una cookie HttpOnly
   *
   * @param registerDto Datos de registro del usuario
   * @param response Objeto Response para setear cookies
   * @throws ConflictException si el email ya está registrado
   */
  // ========== MÉTODOS EXISTENTES ==========

  async register(registerDto: RegisterDto, response: Response) {
    const existingUser = await this.usersService.findByEmail(registerDto.email);

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    const user = await this.usersService.create({
      email: registerDto.email,
      fullName: registerDto.fullName,
      password: registerDto.password,
      isSeller: registerDto.isSeller || false,
    });

    const payload = {
      sub: user.id,
      email: user.email,
      isSeller: user.isSeller,
    };

    const access_token = this.jwtService.sign(payload);

    response.cookie('access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
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
   * Inicia sesión con email y contraseña.
   *
   * - Verifica credenciales
   * - Genera JWT
   * - Guarda token en cookie HttpOnly
   *
   * @param loginDto Credenciales de acceso
   * @param response Objeto Response para setear cookies
   * @throws UnauthorizedException si las credenciales son inválidas
   */

  async login(loginDto: LoginDto, response: Response) {
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Email o contraseña incorrectos');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Email o contraseña incorrectos');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      isSeller: user.isSeller,
    };

    const access_token = this.jwtService.sign(payload);

    response.cookie('access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
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
   * Autenticación mediante Google OAuth.
   *
   * - Si el usuario no existe, se crea automáticamente
   * - Genera JWT
   * - Guarda token en cookie HttpOnly
   *
   * @param googleUser Usuario obtenido desde Google
   * @param response Objeto Response
   * @throws UnauthorizedException si falla la autenticación
   */

  async googleLogin(googleUser: any, response: Response) {
    if (!googleUser) {
      throw new UnauthorizedException('No se pudo autenticar con Google');
    }

    let user = await this.usersService.findByEmail(googleUser.email);

    if (!user) {
      const randomPassword =
        Math.random().toString(36).slice(-16) +
        Math.random().toString(36).slice(-16);

      user = await this.usersService.create({
        email: googleUser.email,
        fullName: googleUser.fullName,
        password: randomPassword,
        isSeller: false,
      });

      console.log('✅ Nueva cuenta creada con Google:', user.email);
    } else {
      console.log('✅ Usuario existente autenticado con Google:', user.email);
    }

    const payload = {
      sub: user.id,
      email: user.email,
      isSeller: user.isSeller,
    };

    const access_token = this.jwtService.sign(payload);

    response.cookie('access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    return {
      success: true,
      message: user
        ? `¡Bienvenido de nuevo, ${user.fullName}!`
        : '¡Bienvenido a RaícesMX!',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        isSeller: user.isSeller,
      },
    };
  }

  async logout(response: Response) {
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

  async validateUser(userId: number) {
    return await this.usersService.findOne(userId);
  }

  // ========== NUEVOS MÉTODOS PARA RECUPERACIÓN DE CONTRASEÑA ==========

  /**
   * Genera código aleatorio de 6 dígitos
   */
  private generateResetCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Limpia códigos expirados (tarea de mantenimiento)
   */
  async cleanupExpiredCodes(): Promise<void> {
    await this.resetCodeRepository.delete({
      expiresAt: LessThan(new Date()),
    });
  }

  /**
   * PASO 1: Solicitar código de recuperación
   */
  async requestPasswordReset(email: string) {
    // Buscar usuario
    const user = await this.usersRepository.findOne({ where: { email } });

    if (!user) {
      // Por seguridad, NO revelamos si el email existe
      return {
        success: true,
        message: 'Si el email existe, recibirás un código de recuperación',
      };
    }

    // Generar código de 6 dígitos
    const code = this.generateResetCode();

    // Establecer expiración (15 minutos)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    // Invalidar códigos anteriores del usuario
    await this.resetCodeRepository.update(
      { userId: user.id, used: false },
      { used: true },
    );

    // Guardar nuevo código
    await this.resetCodeRepository.save({
      userId: user.id,
      code,
      expiresAt,
      used: false,
    });

    // Enviar email con código
    try {
      await this.emailService.sendPasswordResetCode(
        user.email,
        code,
        user.fullName,
      );
    } catch (error) {
      throw new BadRequestException(
        'No se pudo enviar el email. Intenta de nuevo.',
      );
    }

    return {
      success: true,
      message: 'Código de recuperación enviado a tu email',
    };
  }

  /**
   * PASO 2: Verificar código de recuperación
   */
  async verifyResetCode(email: string, code: string) {
    // Buscar usuario
    const user = await this.usersRepository.findOne({ where: { email } });

    if (!user) {
      throw new UnauthorizedException('Código inválido o expirado');
    }

    // Buscar código válido
    const resetCode = await this.resetCodeRepository.findOne({
      where: {
        userId: user.id,
        code,
        used: false,
      },
    });

    if (!resetCode) {
      throw new UnauthorizedException('Código inválido o expirado');
    }

    // Verificar si expiró
    if (new Date() > resetCode.expiresAt) {
      throw new UnauthorizedException('El código ha expirado');
    }

    return {
      success: true,
      message: 'Código verificado correctamente',
    };
  }

  /**
   * PASO 3: Restablecer contraseña
   */
  async resetPassword(email: string, code: string, newPassword: string) {
    // Buscar usuario
    const user = await this.usersRepository.findOne({ where: { email } });

    if (!user) {
      throw new UnauthorizedException('Código inválido o expirado');
    }

    // Buscar código válido
    const resetCode = await this.resetCodeRepository.findOne({
      where: {
        userId: user.id,
        code,
        used: false,
      },
    });

    if (!resetCode) {
      throw new UnauthorizedException('Código inválido o expirado');
    }

    // Verificar si expiró
    if (new Date() > resetCode.expiresAt) {
      throw new UnauthorizedException('El código ha expirado');
    }

    // Hashear nueva contraseña
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña
    await this.usersRepository.update({ id: user.id }, { passwordHash });

    // Marcar código como usado
    await this.resetCodeRepository.update({ id: resetCode.id }, { used: true });

    return {
      success: true,
      message: '¡Contraseña restablecida exitosamente!',
    };
  }
}
