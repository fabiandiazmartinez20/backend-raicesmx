import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

/**
 * Módulo raíz de la aplicación
 *
 * Responsabilidades:
 * - Cargar configuración global (.env)
 * - Inicializar la conexión a la base de datos
 * - Importar módulos principales del dominio
 *
 * Este módulo es el punto de unión de toda la arquitectura.
 */
@Module({
  imports: [
    /**
     * Módulo de configuración global
     *
     * - Carga variables de entorno desde .env
     * - Disponible en toda la aplicación
     */
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    /**
     * Configuración de TypeORM
     *
     * - Conexión a base de datos MySQL
     * - URL tomada desde variable de entorno
     * - Carga automática de entidades
     * - Sincronización activa (solo recomendado en desarrollo)
     */
    TypeOrmModule.forRoot({
      type: 'mysql',
      url: process.env.DATABASE_URL,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
      logging: true,

      /**
       * Configuración avanzada de conexión
       */
      extra: {
        connectionLimit: 10,
        connectTimeout: 60000,
        waitForConnections: true,
      },

      /**
       * Configuración SSL (útil para DBs en la nube)
       */
      ssl: {
        rejectUnauthorized: false,
      },
    }),

    /**
     * Módulo de usuarios
     * Gestiona entidades, servicios y controladores de usuarios
     */
    UsersModule,

    /**
     * Módulo de autenticación
     * Encapsula JWT, guards, strategies y login
     */
    AuthModule,
  ],

  /**
   * Controladores globales
   */
  controllers: [AppController],

  /**
   * Providers globales
   */
  providers: [AppService],
})
export class AppModule {
  /**
   * Constructor del módulo raíz
   *
   * Útil para verificar variables de entorno
   * durante el arranque de la aplicación
   */
  constructor() {
    console.log(
      'Database URL:',
      process.env.DATABASE_URL ? process.env.DATABASE_URL : 'Not defined',
    );
  }
}
