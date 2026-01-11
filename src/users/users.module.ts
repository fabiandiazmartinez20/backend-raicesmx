import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';

/**
 * UsersModule
 * -------------------------------------------------------
 * Módulo encargado de la gestión de usuarios.
 *
 * Responsabilidades:
 * - Proveer acceso a la entidad User
 * - Contener la lógica de negocio relacionada con usuarios
 * - Exponer UsersService a otros módulos (AuthModule)
 *
 * Dependencias:
 * - TypeORM
 */
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
