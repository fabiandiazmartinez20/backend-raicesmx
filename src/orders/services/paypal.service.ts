// src/orders/services/paypal.service.ts - VERSIÓN CORREGIDA
import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class PaypalService {
  private readonly logger = new Logger(PaypalService.name);
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly apiUrl: string;

  constructor(private configService: ConfigService) {
    // ✅ CORRECCIÓN: Validar que las variables existan
    const clientId = this.configService.get<string>('PAYPAL_CLIENT_ID');
    const clientSecret = this.configService.get<string>('PAYPAL_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      throw new Error(
        '❌ PAYPAL_CLIENT_ID y PAYPAL_CLIENT_SECRET deben estar configurados en .env',
      );
    }

    this.clientId = clientId;
    this.clientSecret = clientSecret;

    // Usar sandbox o production según entorno
    const mode = this.configService.get<string>('PAYPAL_MODE') || 'sandbox';
    this.apiUrl =
      mode === 'sandbox'
        ? 'https://api-m.sandbox.paypal.com'
        : 'https://api-m.paypal.com';

    this.logger.log(`🔧 PayPal configurado en modo: ${mode}`);
    this.logger.log(`🔑 Client ID: ${this.clientId.substring(0, 10)}...`);
  }

  /**
   * Obtener access token de PayPal
   */
  private async getAccessToken(): Promise<string> {
    try {
      const auth = Buffer.from(
        `${this.clientId}:${this.clientSecret}`,
      ).toString('base64');

      const response = await axios.post(
        `${this.apiUrl}/v1/oauth2/token`,
        'grant_type=client_credentials',
        {
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      this.logger.log('✅ Token de PayPal obtenido');
      return response.data.access_token;
    } catch (error: any) {
      this.logger.error(
        '❌ Error al obtener token de PayPal:',
        error.response?.data || error.message,
      );
      throw new InternalServerErrorException('Error al conectar con PayPal');
    }
  }

  /**
   * Crear orden de PayPal
   */
  async createOrder(
    amount: number,
    currency: string = 'MXN',
    orderId: string,
  ): Promise<any> {
    try {
      const accessToken = await this.getAccessToken();

      const orderData = {
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: orderId,
            amount: {
              currency_code: currency,
              value: amount.toFixed(2),
            },
            description: `Orden RaícesMX #${orderId}`,
          },
        ],
        application_context: {
          brand_name: 'RaícesMX',
          locale: 'es-MX',
          landing_page: 'BILLING',
          shipping_preference: 'NO_SHIPPING',
          user_action: 'PAY_NOW',
          return_url: `${this.configService.get('FRONTEND_URL')}/orden/confirmacion`,
          cancel_url: `${this.configService.get('FRONTEND_URL')}/carrito`,
        },
      };

      const response = await axios.post(
        `${this.apiUrl}/v2/checkout/orders`,
        orderData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      this.logger.log(`✅ Orden PayPal creada: ${response.data.id}`);
      return response.data;
    } catch (error: any) {
      this.logger.error(
        '❌ Error al crear orden PayPal:',
        error.response?.data || error.message,
      );
      throw new InternalServerErrorException('Error al crear orden de pago');
    }
  }

  /**
   * Capturar pago de PayPal
   */
  async captureOrder(paypalOrderId: string): Promise<any> {
    try {
      const accessToken = await this.getAccessToken();

      const response = await axios.post(
        `${this.apiUrl}/v2/checkout/orders/${paypalOrderId}/capture`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      this.logger.log(`✅ Pago capturado: ${paypalOrderId}`);
      return response.data;
    } catch (error: any) {
      this.logger.error(
        '❌ Error al capturar pago:',
        error.response?.data || error.message,
      );
      throw new InternalServerErrorException('Error al procesar el pago');
    }
  }

  /**
   * Obtener detalles de orden
   */
  async getOrderDetails(paypalOrderId: string): Promise<any> {
    try {
      const accessToken = await this.getAccessToken();

      const response = await axios.get(
        `${this.apiUrl}/v2/checkout/orders/${paypalOrderId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return response.data;
    } catch (error: any) {
      this.logger.error(
        '❌ Error al obtener detalles:',
        error.response?.data || error.message,
      );
      throw new InternalServerErrorException('Error al verificar pago');
    }
  }

  /**
   * Reembolsar orden
   */
  async refundOrder(captureId: string, amount?: number): Promise<any> {
    try {
      const accessToken = await this.getAccessToken();

      const refundData: any = {};
      if (amount) {
        refundData.amount = {
          value: amount.toFixed(2),
          currency_code: 'MXN',
        };
      }

      const response = await axios.post(
        `${this.apiUrl}/v2/payments/captures/${captureId}/refund`,
        refundData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      this.logger.log(`✅ Reembolso procesado: ${captureId}`);
      return response.data;
    } catch (error: any) {
      this.logger.error(
        '❌ Error al procesar reembolso:',
        error.response?.data || error.message,
      );
      throw new InternalServerErrorException('Error al procesar reembolso');
    }
  }
}
