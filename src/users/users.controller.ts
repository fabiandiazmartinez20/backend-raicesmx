import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    return {
      success: true,
      message: 'Usuario creado exitosamente',
      user,
    };
  }

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
