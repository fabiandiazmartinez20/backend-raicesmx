import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsBoolean,
  IsOptional,
} from 'class-validator';

/**
 * RegisterDto
 * -------------------------------------------------------
 * Data Transfer Object utilizado para el registro de usuarios.
 *
 * Este DTO define y valida los datos necesarios para crear
 * una nueva cuenta dentro del sistema.
 *
 * Se utiliza en:
 * - AuthController → POST /auth/register
 *
 * Validaciones:
 * - email: debe ser un email válido y no vacío
 * - fullName: texto obligatorio
 * - password: mínimo 6 caracteres
 * - isSeller: opcional, indica si el usuario se registra como vendedor
 */
export class RegisterDto {
  /**
   * Correo electrónico del usuario.
   * Debe ser único dentro del sistema.
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
   * Contraseña del usuario.
   * Debe tener al menos 6 caracteres.
   */
  @IsString()
  @MinLength(6)
  password: string;

  /**
   * Indica si el usuario se registra como vendedor.
   * Campo opcional, por defecto es false.
   */
  @IsBoolean()
  @IsOptional()
  isSeller?: boolean;
}
