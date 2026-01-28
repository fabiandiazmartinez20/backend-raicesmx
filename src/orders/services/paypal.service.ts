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
  private readonly paypalFrontendUrl: string;

  constructor(private readonly configService: ConfigService) {
    // =============================
    // PAYPAL CREDENTIALS
    // =============================
    const clientId = this.configService.get<string>('PAYPAL_CLIENT_ID');

    const clientSecret = this.configService.get<string>('PAYPAL_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      throw new Error(
        '❌ PAYPAL_CLIENT_ID o PAYPAL_CLIENT_SECRET no configurados',
      );
    }

    this.clientId = clientId.trim();
    this.clientSecret = clientSecret.trim();

    // =============================
    // PAYPAL MODE
    // =============================
    const mode =
      this.configService.get<string>('PAYPAL_MODE')?.trim() || 'sandbox';

    this.apiUrl =
      mode === 'sandbox'
        ? 'https://api-m.sandbox.paypal.com'
        : 'https://api-m.paypal.com';

    // =============================
    // PAYPAL FRONTEND URL
    // =============================
    const paypalUrl = this.configService.get<string>('PAYPAL_FRONTEND_URL');

    if (!paypalUrl) {
      throw new Error('❌ PAYPAL_FRONTEND_URL no está configurado en Render');
    }

    // Quita espacios, enters y "/" final
    this.paypalFrontendUrl = paypalUrl.trim().replace(/\/$/, '');

    // =============================
    // LOGS
    // =============================
    this.logger.log(`🔧 PayPal Mode: ${mode}`);
    this.logger.log(`🔑 Client ID: ${this.clientId.substring(0, 10)}...`);
    this.logger.log(`🌐 PayPal Frontend: ${this.paypalFrontendUrl}`);
  }

  // =====================================================
  // GET ACCESS TOKEN
  // =====================================================
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

      this.logger.log('✅ Token PayPal obtenido');

      return response.data.access_token;
    } catch (error: any) {
      this.logger.error(
        '❌ Error obteniendo token PayPal',
        error.response?.data || error.message,
      );

      throw new InternalServerErrorException('Error al conectar con PayPal');
    }
  }

  // =====================================================
  // CREATE ORDER
  // =====================================================
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

          // ✅ AQUÍ YA USA PAYPAL_FRONTEND_URL
          return_url: `${this.paypalFrontendUrl}/orden/confirmacion`,
          cancel_url: `${this.paypalFrontendUrl}/carrito`,
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
        '❌ Error creando orden PayPal',
        error.response?.data || error.message,
      );

      throw new InternalServerErrorException('Error al crear orden de pago');
    }
  }

  // =====================================================
  // CAPTURE PAYMENT
  // =====================================================
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
        '❌ Error capturando pago',
        error.response?.data || error.message,
      );

      throw new InternalServerErrorException('Error al procesar el pago');
    }
  }

  // =====================================================
  // GET ORDER DETAILS
  // =====================================================
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
        '❌ Error obteniendo detalles',
        error.response?.data || error.message,
      );

      throw new InternalServerErrorException('Error al verificar pago');
    }
  }

  // =====================================================
  // REFUND
  // =====================================================
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

      this.logger.log(`✅ Reembolso: ${captureId}`);

      return response.data;
    } catch (error: any) {
      this.logger.error(
        '❌ Error en reembolso',
        error.response?.data || error.message,
      );

      throw new InternalServerErrorException('Error al procesar reembolso');
    }
  }
}
