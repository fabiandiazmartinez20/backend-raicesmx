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

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

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

    // Genera el token
    const payload = {
      sub: user.id,
      email: user.email,
      isSeller: user.isSeller,
    };
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

    // Genera el token
    const payload = {
      sub: user.id,
      email: user.email,
      isSeller: user.isSeller,
    };
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

  async validateUser(userId: number) {
    return await this.usersService.findOne(userId);
  }
}
