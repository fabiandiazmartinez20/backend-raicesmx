// src/chatbot/chatbot.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GoogleGenAI } from '@google/genai';
import { Product } from '../products/entities/product.entity';
import { Category } from '../products/entities/category.entity';

@Injectable()
export class ChatbotService {
  private ai: GoogleGenAI;
  private requestCount = 0;
  private lastResetTime = Date.now();
  private readonly MAX_REQUESTS_PER_MINUTE = 10; // Límite de seguridad

  // Caché simple para respuestas comunes
  private responseCache = new Map<
    string,
    { text: string; timestamp: number }
  >();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutos

  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {
    this.ai = new GoogleGenAI({});
  }

  /**
   * Verifica si se puede hacer una nueva petición
   */
  private canMakeRequest(): boolean {
    const now = Date.now();

    // Reset contador cada minuto
    if (now - this.lastResetTime > 60000) {
      this.requestCount = 0;
      this.lastResetTime = now;
    }

    if (this.requestCount >= this.MAX_REQUESTS_PER_MINUTE) {
      console.warn('⚠️ Rate limit alcanzado. Esperando...');
      return false;
    }

    this.requestCount++;
    return true;
  }

  /**
   * Obtiene respuesta del caché si existe
   */
  private getCachedResponse(key: string): string | null {
    const cached = this.responseCache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      console.log('✅ Respuesta obtenida del caché');
      return cached.text;
    }
    return null;
  }

  /**
   * Guarda respuesta en caché
   */
  private setCachedResponse(key: string, text: string): void {
    this.responseCache.set(key, { text, timestamp: Date.now() });
  }

  /**
   * Genera un saludo personalizado
   */
  async generateGreeting(): Promise<string> {
    try {
      // Usar caché para saludo
      const cacheKey = 'greeting';
      const cached = this.getCachedResponse(cacheKey);
      if (cached) return cached;

      if (!this.canMakeRequest()) {
        return '¡Hola! 👋 Soy el asistente virtual de RaícesMX. Estoy aquí para ayudarte con nuestros productos artesanales mexicanos. 🇲🇽';
      }

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash', // ✅ Modelo con mejor cuota
        contents: `
          Eres un asistente virtual amigable de RaícesMX, un marketplace de productos artesanales mexicanos.
          
          Genera un saludo de bienvenida corto (máximo 2 líneas) que sea:
          - Amigable y profesional
          - Que mencione que puedes ayudar con productos artesanales
          - Usa 1-2 emojis mexicanos (🇲🇽 🎨 ✨)
          
          Genera SOLO el saludo, sin explicaciones adicionales.
        `,
      });

      const text = this.extractText(response);
      this.setCachedResponse(cacheKey, text.trim());
      return text.trim();
    } catch (error) {
      console.error('Error generando saludo con Gemini:', error);
      return '¡Hola! 👋 Soy el asistente virtual de RaícesMX. Estoy aquí para ayudarte con nuestros productos artesanales mexicanos. 🇲🇽';
    }
  }

  /**
   * Lista los productos y categorías disponibles
   */
  async listProducts(): Promise<string> {
    try {
      // Usar caché para lista de productos
      const cacheKey = 'products_list';
      const cached = this.getCachedResponse(cacheKey);
      if (cached) return cached;

      const categories = await this.categoryRepository.find({
        order: { nombre: 'ASC' },
      });

      const productCounts = await this.productRepository
        .createQueryBuilder('product')
        .select('product.categoryId', 'categoryId')
        .addSelect('COUNT(product.id)', 'count')
        .groupBy('product.categoryId')
        .getRawMany();

      const countMap = new Map(
        productCounts.map((pc) => [pc.categoryId, parseInt(pc.count)]),
      );

      let categoriesList = categories
        .map((cat) => {
          const emoji = this.getCategoryEmoji(cat.nombre);
          const count = countMap.get(cat.id) || 0;
          return `${emoji} **${cat.nombre}** - ${cat.descripcion} (${count} productos)`;
        })
        .join('\n');

      const totalProducts = await this.productRepository.count();

      const response = `
🛍️ **Productos Artesanales Disponibles en RaícesMX**

Actualmente tenemos **${totalProducts} productos** en ${categories.length} categorías:

${categoriesList}

Cada producto es único, hecho a mano por artesanos mexicanos con técnicas tradicionales. 🇲🇽

¿Te interesa alguna categoría en particular?
      `.trim();

      this.setCachedResponse(cacheKey, response);
      return response;
    } catch (error) {
      console.error('Error listando productos:', error);

      return `
🛍️ **Productos Artesanales Disponibles en RaícesMX**

Tenemos 11 categorías principales de artesanías mexicanas:

🎨 **Artesanías Mexicanas** - Alebrijes, máscaras, papel picado
🧵 **Textiles y Bordados** - Huipiles, rebozos, sarapes
🏺 **Cerámica y Barro** - Talavera, barro negro, macetas
💍 **Joyería Tradicional** - Plata de Taxco, ámbar, filigrana
🪑 **Muebles Típicos** - Equipales, baúles pintados
🍬 **Dulces Mexicanos** - Ate, cocadas, palanquetas
🍫 **Bebidas Tradicionales** - Mezcal, chocolate de metate
🎸 **Instrumentos Musicales** - Guitarras, jaranas, marimbas
👗 **Ropa Tradicional** - Vestidos típicos, guayaberas
🏠 **Decoración Mexicana** - Piñatas, velas, macetas
✨ **Otros Productos** - Artículos diversos de artesanos

¿Te interesa alguna categoría en particular? 🇲🇽
      `.trim();
    }
  }

  /**
   * Genera una respuesta personalizada usando Gemini
   */
  async generateResponse(userMessage: string): Promise<string> {
    try {
      // Revisar caché para mensajes similares
      const cacheKey = `response_${userMessage.toLowerCase().trim()}`;
      const cached = this.getCachedResponse(cacheKey);
      if (cached) return cached;

      // Verificar rate limit
      if (!this.canMakeRequest()) {
        return 'Lo siento, estoy procesando muchas solicitudes en este momento. Por favor, espera un momento e intenta de nuevo. 😊';
      }

      const totalProducts = await this.productRepository.count();
      const totalCategories = await this.categoryRepository.count();

      const categories = await this.categoryRepository.find({
        order: { nombre: 'ASC' },
      });

      const categoriesText = categories
        .map((cat) => `- ${cat.nombre}: ${cat.descripcion}`)
        .join('\n');

      const systemPrompt = `
Eres un asistente virtual amigable de RaícesMX, un marketplace de productos artesanales mexicanos.

**INFORMACIÓN ACTUALIZADA DE LA PLATAFORMA:**
- Total de productos activos: ${totalProducts}
- Total de categorías: ${totalCategories}

**CATEGORÍAS DISPONIBLES:**
${categoriesText}

**CARACTERÍSTICAS DE LA PLATAFORMA:**
- Conectamos artesanos mexicanos con compradores de todo el mundo
- Todos los productos son auténticos y hechos a mano
- Apoyamos el comercio justo y la preservación de técnicas tradicionales
- Comisión del 10% por venta
- Verificación de vendedores con documentos oficiales (CURP + INE)
- Sistema de geolocalización para productos
- Subida de hasta 5 imágenes por producto
- Filtros por categoría, precio y ubicación
- Envíos seguros con rastreo

**PROCESO PARA VENDEDORES:**
1. Registro en la plataforma (gratuito)
2. Envío de solicitud con CURP e INE
3. Verificación por parte de administradores (1-2 días)
4. Una vez aprobado, puede publicar productos
5. Subir fotos, descripción, precio y ubicación
6. Comisión del 10% por venta exitosa

**PARA COMPRADORES:**
- Explora productos por categoría
- Filtra por precio, ubicación, estado
- Contacta directamente con artesanos
- Pagos seguros (próximamente: Stripe, PayPal, Mercado Pago)
- Rastreo de pedidos

**TU COMPORTAMIENTO:**
- Sé amigable, profesional y entusiasta sobre la artesanía mexicana
- Proporciona información clara y concisa
- Usa emojis ocasionalmente (🎨 🇲🇽 ✨ 🛍️)
- Si no sabes algo, sé honesto y ofrece contactar al equipo
- Responde en español de México
- Mantén respuestas breves (máximo 3-4 párrafos)
- Si te preguntan por productos específicos, sugiere categorías relevantes
- Promueve el valor cultural de las artesanías mexicanas

**PREGUNTA DEL USUARIO:**
${userMessage}

**RESPUESTA:**
      `.trim();

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: systemPrompt,
      });

      const text = this.extractText(response);
      this.setCachedResponse(cacheKey, text.trim());
      return text.trim();
    } catch (error) {
      console.error('Error generando respuesta con Gemini:', error);

      // Mensaje de error más amigable
      if (error.status === 429) {
        return 'Lo siento, he alcanzado el límite de solicitudes por ahora. Por favor, intenta de nuevo en un momento. Mientras tanto, puedes contactar a nuestro equipo en soporte@raicesmx.com 📧';
      }

      throw new Error(
        'Error al procesar tu mensaje. Por favor, intenta de nuevo.',
      );
    }
  }

  /**
   * Busca productos por categoría o nombre
   */
  async searchProducts(query: string): Promise<any> {
    try {
      const products = await this.productRepository
        .createQueryBuilder('product')
        .leftJoinAndSelect('product.category', 'category')
        .leftJoinAndSelect('product.images', 'images')
        .where('product.titulo LIKE :query', { query: `%${query}%` })
        .orWhere('product.descripcion LIKE :query', { query: `%${query}%` })
        .orWhere('category.nombre LIKE :query', { query: `%${query}%` })
        .take(5)
        .getMany();

      return products;
    } catch (error) {
      console.error('Error buscando productos:', error);
      return [];
    }
  }

  /**
   * Extrae el texto de la respuesta de Gemini
   */
  private extractText(response: any): string {
    try {
      if (response.text) {
        return response.text;
      }

      if (response.candidates && response.candidates.length > 0) {
        const candidate = response.candidates[0];
        if (
          candidate.content &&
          candidate.content.parts &&
          candidate.content.parts.length > 0
        ) {
          return candidate.content.parts[0].text || '';
        }
      }

      return 'Lo siento, no pude generar una respuesta. Por favor, intenta de nuevo.';
    } catch (error) {
      console.error('Error extrayendo texto de respuesta:', error);
      return 'Error al procesar la respuesta.';
    }
  }

  /**
   * Obtiene un emoji según la categoría
   */
  private getCategoryEmoji(categoryName: string): string {
    const emojiMap: { [key: string]: string } = {
      'Artesanías Mexicanas': '🎨',
      'Textiles y Bordados': '🧵',
      'Cerámica y Barro': '🏺',
      'Joyería Tradicional': '💍',
      'Muebles Típicos': '🪑',
      'Dulces Mexicanos': '🍬',
      'Bebidas Tradicionales': '🍫',
      'Instrumentos Musicales': '🎸',
      'Ropa Tradicional': '👗',
      'Decoración Mexicana': '🏠',
      'Otros Productos': '✨',
    };

    return emojiMap[categoryName] || '📦';
  }
}
