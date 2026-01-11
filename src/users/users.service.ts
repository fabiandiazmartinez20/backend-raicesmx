import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

/**
 * UsersService
 * -------------------------------------------------------
 * Servicio encargado de la lógica de negocio relacionada
 * con los usuarios del sistema.
 *
 * Funciones principales:
 * - Crear usuarios
 * - Buscar usuarios por ID o email
 * - Proveer datos al módulo de autenticación
 */
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  /**
   * Crea un nuevo usuario en el sistema.
   *
   * Flujo:
   * - Verifica si el email ya existe
   * - Hashea la contraseña con bcrypt
   * - Guarda el usuario en la base de datos
   *
   * @param createUserDto Datos necesarios para crear el usuario
   * @returns Usuario creado
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    const passwordHash = await bcrypt.hash(createUserDto.password, 10);

    const user = this.usersRepository.create({
      email: createUserDto.email,
      fullName: createUserDto.fullName,
      passwordHash,
      isSeller: createUserDto.isSeller || false,
    });

    return await this.usersRepository.save(user);
  }

  /**
   * Obtiene todos los usuarios del sistema.
   */
  async findAll(): Promise<User[]> {
    return await this.usersRepository.find();
  }

  /**
   * Busca un usuario por su ID.
   *
   * @param id Identificador del usuario
   * @throws NotFoundException si no existe
   */
  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return user;
  }

  /**
   * Busca un usuario por su correo electrónico.
   *
   * Método utilizado principalmente por el módulo de autenticación.
   *
   * @param email Correo electrónico del usuario
   * @returns Usuario o undefined si no existe
   */
  async findByEmail(email: string): Promise<User | undefined> {
    const user = await this.usersRepository.findOne({ where: { email } });
    return user ?? undefined;
  }
}
