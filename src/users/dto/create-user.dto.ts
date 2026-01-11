import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsBoolean,
  IsOptional,
} from 'class-validator';

/**
 * CreateUserDto
 * -------------------------------------------------------
 * Data Transfer Object utilizado internamente para la
 * creación de usuarios en el sistema.
 *
 * A diferencia de RegisterDto:
 * - Se usa a nivel de servicio (UsersService)
 * - No expone detalles de autenticación
 *
 * Se utiliza en:
 * - UsersService.create()
 */
export class CreateUserDto {
  /**
   * Correo electrónico del usuario.
   * Debe ser único.
   */
  @IsEmail()
  @IsNotEmpty()
  email: string;

  /**
   * Nombre completo del usuario.
   */
  @IsString()
  @IsNotEmpty()
  fullName: string;

  /**
   * Contraseña en texto plano.
   * Será hasheada antes de guardarse.
   */
  @IsString()
  @MinLength(6)
  password: string;

  /**
   * Indica si el usuario es vendedor.
   * Campo opcional.
   */
  @IsBoolean()
  @IsOptional()
  isSeller?: boolean;
}
