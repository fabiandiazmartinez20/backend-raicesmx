import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * User Entity
 * -------------------------------------------------------
 * Representa a un usuario dentro del sistema.
 *
 * Esta entidad se utiliza para:
 * - Persistir usuarios en la base de datos
 * - Autenticación y autorización
 * - Determinar si un usuario es vendedor
 *
 * Tabla: users
 */
@Entity('users')
export class User {
  /**
   * Identificador único del usuario.
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * Correo electrónico del usuario.
   * Debe ser único.
   */
  @Column({ unique: true, length: 255 })
  email: string;

  /**
   * Nombre completo del usuario.
   */
  @Column({ name: 'full_name', length: 255 })
  fullName: string;

  /**
   * Hash de la contraseña del usuario.
   * Nunca se almacena la contraseña en texto plano.
   */
  @Column({ name: 'password_hash', length: 255 })
  passwordHash: string;

  /**
   * Indica si el usuario tiene rol de vendedor.
   */
  @Column({ name: 'is_seller', default: false })
  isSeller: boolean;

  /**
   * Fecha de creación del usuario.
   */
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  /**
   * Fecha de la última actualización del usuario.
   */
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
