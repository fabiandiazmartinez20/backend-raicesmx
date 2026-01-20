// src/common/services/cloudinary.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

/**
 * Servicio para subir imágenes a Cloudinary
 *
 * Características:
 * - Convierte automáticamente a WebP
 * - Optimiza calidad (80%)
 * - Genera thumbnails
 * - Elimina imágenes antiguas
 */
@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(private configService: ConfigService) {
    // Configurar Cloudinary
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });

    this.logger.log('✅ Cloudinary configurado');
  }

  /**
   * Sube imagen a Cloudinary con conversión a WebP
   *
   * @param file Buffer del archivo
   * @param folder Carpeta en Cloudinary (ej: 'ine_documents')
   * @param filename Nombre del archivo (opcional)
   * @returns URL pública y public_id
   */
  async uploadImage(
    file: Express.Multer.File,
    folder: string,
    filename?: string,
  ): Promise<{ url: string; publicId: string }> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `raicesmx/${folder}`,
          public_id: filename,
          format: 'webp', // Convertir a WebP
          quality: 'auto:good', // Optimización automática
          transformation: [
            { width: 1200, height: 1200, crop: 'limit' }, // Max 1200x1200
            { quality: 80 }, // Calidad 80%
          ],
        },
        (error, result) => {
          if (error) {
            this.logger.error('Error al subir imagen a Cloudinary:', error);
            return reject(error);
          }

          if (!result || !result.public_id || !result.secure_url) {
            const msg = 'La respuesta de Cloudinary es inválida';
            this.logger.error(msg, result);
            return reject(new Error(msg));
          }

          this.logger.log(`✅ Imagen subida: ${result.public_id}`);
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        },
      );

      // Convertir buffer a stream y subirlo
      const bufferStream = new Readable();
      bufferStream.push(file.buffer);
      bufferStream.push(null);
      bufferStream.pipe(uploadStream);
    });
  }

  /**
   * Elimina imagen de Cloudinary
   *
   * @param publicId ID público de Cloudinary
   */
  async deleteImage(publicId: string): Promise<void> {
    try {
      const result = await cloudinary.uploader.destroy(publicId);

      if (result.result === 'ok') {
        this.logger.log(`✅ Imagen eliminada: ${publicId}`);
      } else {
        this.logger.warn(`⚠️ No se pudo eliminar: ${publicId}`);
      }
    } catch (error) {
      this.logger.error('Error al eliminar imagen:', error);
      throw error;
    }
  }

  /**
   * Elimina múltiples imágenes
   *
   * @param publicIds Array de IDs públicos
   */
  async deleteImages(publicIds: string[]): Promise<void> {
    try {
      await cloudinary.api.delete_resources(publicIds);
      this.logger.log(`✅ ${publicIds.length} imágenes eliminadas`);
    } catch (error) {
      this.logger.error('Error al eliminar imágenes:', error);
      throw error;
    }
  }
}
