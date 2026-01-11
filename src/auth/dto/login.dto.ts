import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

/**
 * LoginDto
 * -------------------------------------------------------
 * Data Transfer Object utilizado para la autenticación
 * de usuarios existentes.
 *
 * Se utiliza en:
 * - AuthController → POST /auth/login
 *
 * Validaciones:
 * - email: debe ser un email válido
 * - password: obligatorio
 */
export class LoginDto {
  /**
   * Correo electrónico del usuario.
   */
  @IsEmail()
  @IsNotEmpty()
  email: string;

  /**
   * Contraseña del usuario.
   */
  @IsString()
  @IsNotEmpty()
  password: string;
}
