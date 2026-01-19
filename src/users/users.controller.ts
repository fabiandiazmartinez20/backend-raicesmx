import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

/**
 * Controlador encargado de la gestión de usuarios.
 *
 * @remarks
 * Este controlador expone endpoints para:
 * - Crear usuarios
 * - Obtener todos los usuarios
 * - Obtener el perfil del usuario autenticado
 * - Obtener un usuario por su ID
 */
@Controller('users')
export class UsersController {
  /**
   * Constructor del controlador de usuarios
   *
   * @param usersService Servicio que contiene la lógica de negocio de usuarios
   */
  constructor(private readonly usersService: UsersService) {}

  /**
   * Crear un nuevo usuario
   *
   * @param createUserDto Datos necesarios para crear un usuario
   * @returns Objeto con el estado de la operación y el usuario creado
   *
   * @example
   * POST /users
   */
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    return {
      success: true,
      message: 'Usuario creado exitosamente',
      user,
    };
  }

  /**
   * Obtener todos los usuarios registrados
   *
   * @remarks
   * Este endpoint está protegido por JWT
   *
   * @returns Lista de usuarios y el total encontrado
   *
   * @example
   * GET /users
   */
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll() {
    const users = await this.usersService.findAll();
    return {
      success: true,
      message: `Se encontraron ${users.length} usuarios`,
      count: users.length,
      users,
    };
  }

  /**
   * Obtener el perfil del usuario autenticado
   *
   * @param user Usuario extraído del token JWT
   * @returns Perfil del usuario autenticado
   *
   * @example
   * GET /users/me
   */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMyProfile(@GetUser() user) {
    const profile = await this.usersService.findOne(user.id);
    return {
      success: true,
      message: 'Tu perfil se obtuvo correctamente',
      user: profile,
    };
  }

  /**
   * Obtener un usuario por su ID
   *
   * @param id Identificador único del usuario
   * @returns Usuario encontrado
   *
   * @example
   * GET /users/1
   */
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOne(+id);
    return {
      success: true,
      message: 'Usuario encontrado',
      user,
    };
  }
}
