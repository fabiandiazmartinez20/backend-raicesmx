// src/common/common.controller.ts
import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { GeocodingService } from './services/geocoding.service';

@Controller('geocoding')
export class CommonController {
  constructor(private readonly geocodingService: GeocodingService) {}

  /**
   * GET /geocoding/codigo-postal?cp=56700
   */
  @Get('codigo-postal')
  async buscarCodigoPostal(@Query('cp') cp: string): Promise<any> {
    // 👈 AGREGAR `: Promise<any>`
    if (!cp) {
      throw new BadRequestException('Parámetro "cp" requerido');
    }

    const datos = await this.geocodingService.obtenerDatosPorCodigoPostal(cp);

    return {
      success: true,
      message: 'Código postal encontrado',
      data: datos,
    };
  }

  /**
   * GET /geocoding/reverse?lat=19.4326&lng=-99.1332
   */
  @Get('reverse')
  async geocodificarInversa(
    @Query('lat') lat: number,
    @Query('lng') lng: number,
  ): Promise<any> {
    // 👈 AGREGAR `: Promise<any>`
    if (!lat || !lng) {
      throw new BadRequestException('Parámetros "lat" y "lng" requeridos');
    }

    const direccion =
      await this.geocodingService.obtenerDireccionPorCoordenadas(
        Number(lat),
        Number(lng),
      );

    return {
      success: true,
      message: 'Dirección obtenida',
      data: direccion,
    };
  }
}
