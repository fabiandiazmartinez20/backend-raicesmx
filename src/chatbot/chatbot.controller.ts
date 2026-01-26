// src/chatbot/chatbot.controller.ts
import { Controller, Post, Body, Get } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { SendMessageDto } from './dto/send-message.dto';

@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  /**
   * GET /chatbot/greeting
   * Obtiene un saludo de bienvenida
   */
  @Get('greeting')
  async getGreeting() {
    try {
      const greeting = await this.chatbotService.generateGreeting();

      return {
        success: true,
        message: greeting,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        message: '¡Hola! Soy el asistente de RaícesMX. 🇲🇽',
        timestamp: new Date(),
      };
    }
  }

  /**
   * GET /chatbot/products
   * Lista todos los productos disponibles
   */
  @Get('products')
  async listProducts() {
    try {
      const productList = await this.chatbotService.listProducts();

      return {
        success: true,
        message: productList,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al obtener la lista de productos',
        error: error.message,
        timestamp: new Date(),
      };
    }
  }

  // REEMPLAZAR el método sendMessage() en chatbot.controller.ts

  /**
   * POST /chatbot/message
   * Envía un mensaje al chatbot y obtiene respuesta
   */
  @Post('message')
  async sendMessage(@Body() dto: SendMessageDto) {
    try {
      const { message } = dto;

      // 🗺️ NUEVO: Detectar si el usuario pregunta por productos cercanos
      if (this.chatbotService.isMapRequest(message)) {
        const mapResponse = await this.chatbotService.generateMapRequest();
        return {
          success: true,
          type: 'map_request', // ✅ Indica al frontend que muestre mapa
          message: mapResponse.message,
          timestamp: new Date(),
        };
      }

      // Detectar si el usuario pregunta por productos
      const isProductRequest = this.isProductListRequest(message);

      let response: string;

      if (isProductRequest) {
        response = await this.chatbotService.listProducts();
      } else {
        response = await this.chatbotService.generateResponse(message);
      }

      return {
        success: true,
        type: 'text', // ✅ Respuesta normal de texto
        message: response,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('Error en chatbot:', error);

      return {
        success: false,
        type: 'text',
        message:
          'Lo siento, tuve un problema al procesar tu mensaje. Por favor, intenta de nuevo o contacta a nuestro equipo de soporte. 😊',
        timestamp: new Date(),
      };
    }
  }

  /**
   * POST /chatbot/search
   * Busca productos según una consulta
   */
  @Post('search')
  async searchProducts(@Body() dto: SendMessageDto) {
    try {
      const { message } = dto;
      const products = await this.chatbotService.searchProducts(message);

      return {
        success: true,
        count: products.length,
        products,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al buscar productos',
        error: error.message,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Detecta si el usuario quiere ver la lista de productos
   */
  private isProductListRequest(message: string): boolean {
    const lowerMessage = message.toLowerCase();
    const productKeywords = [
      'productos',
      'categorias',
      'categorías',
      'que venden',
      'qué venden',
      'que tienen',
      'qué tienen',
      'que hay',
      'qué hay',
      'mostrar productos',
      'ver productos',
      'lista de productos',
      'artesanías',
      'artesanias',
      'que ofrecen',
      'qué ofrecen',
    ];

    return productKeywords.some((keyword) => lowerMessage.includes(keyword));
  }
}
