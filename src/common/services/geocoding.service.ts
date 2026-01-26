// src/common/services/geocoding.service.ts
import { Injectable, NotFoundException, Logger } from '@nestjs/common';

interface DireccionMexicana {
  colonia: string;
  municipio: string;
  estado: string;
  codigoPostal: string;
  latitud: number;
  longitud: number;
  colonias: string[];
}

@Injectable()
export class GeocodingService {
  private readonly logger = new Logger(GeocodingService.name);
  private readonly MAPTILER_API_KEY = process.env.MAPTILER_API_KEY || 'demo';

  async obtenerDatosPorCodigoPostal(cp: string): Promise<DireccionMexicana> {
    if (!/^\d{5}$/.test(cp)) {
      throw new NotFoundException(
        'Código postal inválido (debe tener 5 dígitos)',
      );
    }

    try {
      // 1️⃣ Obtener datos del CP desde API de México
      const response = await fetch(
        `https://mexico-api.devaleff.com/api/codigo-postal/${cp}`,
        {
          headers: { 'User-Agent': 'RaicesMX/1.0' },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (!data?.data?.length) {
        throw new NotFoundException(`Código postal ${cp} no encontrado`);
      }

      const info = data.data[0];
      const colonia = info.d_asenta || info.D_asenta;
      const municipio = info.D_mnpio || info.d_mnpio;
      const estado = info.d_estado;

      const colonias: string[] = data.data
        .map((item: any) => item.d_asenta || item.D_asenta)
        .filter((c: string) => c);

      this.logger.log(`✅ CP ${cp} encontrado: ${municipio}, ${estado}`);

      // 2️⃣ Geocodificar con MapTiler (RÁPIDO)
      const coords = await this.geocodificar(colonia, municipio, estado);

      return {
        colonia,
        municipio,
        estado,
        codigoPostal: cp,
        latitud: coords.lat,
        longitud: coords.lng,
        colonias: Array.from(new Set(colonias)),
      };
    } catch (error: any) {
      this.logger.error(`❌ Error obteniendo CP ${cp}:`, error.message);
      throw new NotFoundException(`Código postal ${cp} no válido`);
    }
  }

  /**
   * Geocodificar: MapTiler primero, Nominatim como respaldo
   */
  private async geocodificar(
    colonia: string,
    municipio: string,
    estado: string,
  ): Promise<{ lat: number; lng: number }> {
    const query = `${colonia}, ${municipio}, ${estado}, México`;

    // 🚀 OPCIÓN 1: MapTiler (RÁPIDO - 100-200ms)
    if (this.MAPTILER_API_KEY && this.MAPTILER_API_KEY !== 'demo') {
      try {
        const coords = await this.geocodificarConMapTiler(query);
        if (coords) {
          this.logger.log(`✅ MapTiler: ${coords.lat}, ${coords.lng}`);
          return coords;
        }
      } catch (error) {
        this.logger.warn('⚠️ MapTiler falló, intentando Nominatim...');
      }
    }

    // 🐌 OPCIÓN 2: Nominatim (LENTO - puede bloquearte)
    try {
      const coords = await this.geocodificarConNominatim(query);
      this.logger.log(`✅ Nominatim: ${coords.lat}, ${coords.lng}`);
      return coords;
    } catch (error) {
      this.logger.warn(
        '⚠️ Ambas geocodificaciones fallaron, usando coordenadas por defecto',
      );
      return { lat: 23.6345, lng: -102.5528 };
    }
  }

  /**
   * 🚀 MapTiler Geocoding (RÁPIDO)
   */
  private async geocodificarConMapTiler(
    query: string,
  ): Promise<{ lat: number; lng: number } | null> {
    try {
      const url = `https://api.maptiler.com/geocoding/${encodeURIComponent(query)}.json?key=${this.MAPTILER_API_KEY}&country=mx&limit=1`;

      const response = await fetch(url, {
        headers: { 'User-Agent': 'RaicesMX/1.0' },
      });

      const data = await response.json();

      if (data.features?.[0]?.geometry?.coordinates) {
        const [lng, lat] = data.features[0].geometry.coordinates;
        return { lat, lng };
      }

      return null;
    } catch (error) {
      this.logger.error('❌ Error en MapTiler:', error);
      return null;
    }
  }

  /**
   * 🐌 Nominatim (RESPALDO)
   */
  private async geocodificarConNominatim(
    query: string,
  ): Promise<{ lat: number; lng: number }> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=mx&q=${encodeURIComponent(query)}`;

      const response = await fetch(url, {
        headers: { 'User-Agent': 'RaicesMX/1.0' },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      if (data[0]?.lat && data[0]?.lon) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
        };
      }

      throw new Error('Sin coordenadas');
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }
  // AGREGAR este método al final de la clase GeocodingService
  // (DESPUÉS de geocodificarInversaConNominatim, ANTES del cierre de la clase)

  /**
   * 🗺️ Obtener URL del estilo de mapa de MapTiler
   * Este método se usa para el frontend con MapLibre GL
   */
  getMapStyleUrl(): string {
    if (!this.MAPTILER_API_KEY || this.MAPTILER_API_KEY === 'demo') {
      this.logger.warn(
        '⚠️ MapTiler API Key no configurada, usando estilo demo',
      );
      return `https://api.maptiler.com/maps/streets-v2/style.json?key=demo`;
    }

    return `https://api.maptiler.com/maps/streets-v2/style.json?key=${this.MAPTILER_API_KEY}`;
  }

  /**
   * 🗺️ Obtener la API Key de MapTiler (para uso del frontend)
   * Solo devuelve la key si está configurada correctamente
   */
  getMapTilerApiKey(): string {
    if (!this.MAPTILER_API_KEY || this.MAPTILER_API_KEY === 'demo') {
      this.logger.warn(
        '⚠️ MapTiler API Key no configurada. El mapa puede no funcionar correctamente.',
      );
      return 'demo';
    }

    return this.MAPTILER_API_KEY;
  }
  /**
   * Geocodificación inversa
   */
  async obtenerDireccionPorCoordenadas(
    lat: number,
    lng: number,
  ): Promise<{ colonia: string; municipio: string; estado: string }> {
    // Intentar con MapTiler primero
    if (this.MAPTILER_API_KEY && this.MAPTILER_API_KEY !== 'demo') {
      try {
        return await this.geocodificarInversaConMapTiler(lat, lng);
      } catch (error) {
        this.logger.warn('MapTiler reverse falló, usando Nominatim');
      }
    }

    // Respaldo: Nominatim
    return await this.geocodificarInversaConNominatim(lat, lng);
  }

  private async geocodificarInversaConMapTiler(
    lat: number,
    lng: number,
  ): Promise<{ colonia: string; municipio: string; estado: string }> {
    const url = `https://api.maptiler.com/geocoding/${lng},${lat}.json?key=${this.MAPTILER_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    const feature = data.features?.[0];
    if (!feature) {
      throw new Error('Sin resultados');
    }

    const context = feature.context || [];

    return {
      colonia: feature.text || 'N/A',
      municipio:
        context.find((c: any) => c.id.includes('place'))?.text || 'N/A',
      estado: context.find((c: any) => c.id.includes('region'))?.text || 'N/A',
    };
  }

  private async geocodificarInversaConNominatim(
    lat: number,
    lng: number,
  ): Promise<{ colonia: string; municipio: string; estado: string }> {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&countrycodes=mx`;

      const response = await fetch(url, {
        headers: { 'User-Agent': 'RaicesMX/1.0' },
      });

      const data = await response.json();
      const addr = data.address;

      return {
        colonia: addr.suburb || addr.neighbourhood || addr.quarter || 'N/A',
        municipio: addr.city || addr.town || addr.municipality || 'N/A',
        estado: addr.state || 'N/A',
      };
    } catch (error) {
      this.logger.error('Error en geocodificación inversa:', error);
      throw new NotFoundException('No se pudo obtener la dirección');
    }
  }
}
