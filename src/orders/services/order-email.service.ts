// src/orders/services/order-email.service.ts - VERSIÓN CORREGIDA FINAL
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as brevo from '@getbrevo/brevo';
import { Order } from '../entities/order.entity';

/**
 * OrderEmailService
 * -----------------
 * Servicio dedicado al envío de emails relacionados con órdenes de compra.
 *
 * Funcionalidades:
 * - Email de confirmación de compra al comprador
 * - Email de notificación de venta a cada vendedor
 * - Plantillas HTML profesionales y responsive
 */

@Injectable()
export class OrderEmailService {
  private readonly logger = new Logger(OrderEmailService.name);
  private apiInstance: brevo.TransactionalEmailsApi;
  private fromEmail: string;
  private fromName: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('BREVO_API_KEY');
    const fromEmail = this.configService.get<string>('BREVO_FROM_EMAIL');
    const fromName = this.configService.get<string>('BREVO_FROM_NAME');

    if (!apiKey) {
      throw new Error('BREVO_API_KEY no está configurado en .env');
    }

    if (!fromEmail) {
      throw new Error('BREVO_FROM_EMAIL no está configurado en .env');
    }

    this.fromEmail = fromEmail;
    this.fromName = fromName || 'RaícesMX';

    // Configurar cliente de Brevo
    this.apiInstance = new brevo.TransactionalEmailsApi();
    this.apiInstance.setApiKey(
      brevo.TransactionalEmailsApiApiKeys.apiKey,
      apiKey,
    );
  }

  // ======================================================
  //  ENVÍO DE CORREOS DE ÓRDENES
  // ======================================================

  /**
   * Envía email de confirmación de compra al comprador
   */
  async sendOrderConfirmationToBuyer(order: Order): Promise<void> {
    try {
      const sendSmtpEmail = new brevo.SendSmtpEmail();

      sendSmtpEmail.subject = `✅ Orden Confirmada #${order.orderNumber} - RaícesMX`;
      sendSmtpEmail.to = [
        {
          email: order.shippingEmail,
          name: order.shippingName,
        },
      ];
      sendSmtpEmail.sender = {
        email: this.fromEmail,
        name: this.fromName,
      };
      sendSmtpEmail.htmlContent = this.getBuyerConfirmationTemplate(order);

      const result = await this.apiInstance.sendTransacEmail(sendSmtpEmail);

      this.logger.log(
        `✅ Confirmación enviada al comprador: ${order.shippingEmail}`,
      );
      this.logger.log(`📧 Message ID: ${result.body.messageId}`);
    } catch (error) {
      this.logger.error('❌ Error al enviar confirmación al comprador:', error);

      if (error.response) {
        this.logger.error('Respuesta de Brevo:', error.response.body);
      }

      // No lanzar error para no bloquear el flujo de pago
      this.logger.warn(
        '⚠️ El pago se procesó correctamente pero el email no pudo enviarse',
      );
    }
  }

  /**
   * Envía email de notificación de venta a cada vendedor
   * NOTA: Requiere inyectar UserRepository para obtener emails de vendedores
   */
  async sendSaleNotificationToSellers(order: Order): Promise<void> {
    try {
      // Agrupar items por vendedor
      const itemsBySeller = new Map<
        number,
        { sellerName: string; items: any[] }
      >();

      for (const item of order.items) {
        if (!itemsBySeller.has(item.sellerId)) {
          itemsBySeller.set(item.sellerId, {
            sellerName: item.sellerName,
            items: [],
          });
        }

        // ✅ CORRECCIÓN: Verificar que el valor existe antes de usarlo
        const sellerData = itemsBySeller.get(item.sellerId);
        if (sellerData) {
          sellerData.items.push(item);
        }
      }

      // TODO: Obtener emails de vendedores de la BD
      // Por ahora, enviamos a un email de prueba
      // En producción, deberías inyectar UserRepository y hacer:
      // const seller = await this.userRepository.findOne({ where: { id: sellerId } });

      for (const [sellerId, sellerData] of itemsBySeller.entries()) {
        this.logger.log(
          `📧 Enviando notificación al vendedor ID ${sellerId} (${sellerData.sellerName})`,
        );

        // PLACEHOLDER: Reemplazar con email real del vendedor
        const sellerEmail = `vendedor-${sellerId}@ejemplo.com`;

        await this.sendEmailToSeller(
          sellerEmail,
          sellerData.sellerName,
          order,
          sellerData.items,
        );
      }
    } catch (error) {
      this.logger.error(
        '❌ Error al enviar notificaciones a vendedores:',
        error,
      );
      this.logger.warn(
        '⚠️ El pago se procesó correctamente pero el email al vendedor no pudo enviarse',
      );
    }
  }

  /**
   * Envía email individual a un vendedor
   */
  private async sendEmailToSeller(
    sellerEmail: string,
    sellerName: string,
    order: Order,
    items: any[],
  ): Promise<void> {
    try {
      const sendSmtpEmail = new brevo.SendSmtpEmail();

      sendSmtpEmail.subject = `🎉 ¡Nueva Venta! Orden #${order.orderNumber} - RaícesMX`;
      sendSmtpEmail.to = [
        {
          email: sellerEmail,
          name: sellerName,
        },
      ];
      sendSmtpEmail.sender = {
        email: this.fromEmail,
        name: this.fromName,
      };
      sendSmtpEmail.htmlContent = this.getSellerNotificationTemplate(
        sellerName,
        order,
        items,
      );

      const result = await this.apiInstance.sendTransacEmail(sendSmtpEmail);

      this.logger.log(`✅ Notificación enviada al vendedor: ${sellerEmail}`);
      this.logger.log(`📧 Message ID: ${result.body.messageId}`);
    } catch (error) {
      this.logger.error(
        `❌ Error al enviar notificación al vendedor ${sellerEmail}:`,
        error,
      );
    }
  }

  // ======================================================
  //  PLANTILLAS DE EMAIL
  // ======================================================

  /**
   * Plantilla de confirmación para el comprador
   */
  private getBuyerConfirmationTemplate(order: Order): string {
    const itemsHtml = order.items
      .map(
        (item) => `
      <tr>
        <td style="padding: 15px; border-bottom: 1px solid #e9ecef;">
          <div style="display: flex; align-items: center; gap: 15px;">
            ${item.productImageUrl ? `<img src="${item.productImageUrl}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;" />` : ''}
            <div>
              <strong style="color: #333; font-size: 14px;">${item.productTitle}</strong>
              <p style="margin: 5px 0; color: #666; font-size: 13px;">
                Cantidad: ${item.quantity} × $${Number(item.productPrice).toFixed(2)} MXN
              </p>
              <p style="margin: 0; color: #999; font-size: 12px;">
                Vendido por: ${item.sellerName}
              </p>
            </div>
          </div>
        </td>
        <td style="padding: 15px; text-align: right; border-bottom: 1px solid #e9ecef;">
          <strong style="color: #9D2235; font-size: 16px;">
            $${Number(item.total).toFixed(2)} MXN
          </strong>
        </td>
      </tr>
    `,
      )
      .join('');

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f4f4f4;
      margin: 0;
      padding: 40px 20px;
    }
    .container {
      max-width: 650px;
      margin: 0 auto;
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 40px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%);
      padding: 40px 30px;
      text-align: center;
      color: white;
    }
    .success-icon {
      font-size: 70px;
      margin-bottom: 15px;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      color: white;
    }
    .header p {
      margin: 10px 0 0 0;
      color: #e8f5e9;
      font-size: 16px;
    }
    .content {
      padding: 40px 30px;
    }
    .order-number {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      margin: 20px 0;
    }
    .order-number strong {
      font-size: 24px;
      color: #9D2235;
    }
    h2 {
      color: #333;
      font-size: 20px;
      margin: 30px 0 15px 0;
      border-bottom: 2px solid #e9ecef;
      padding-bottom: 10px;
    }
    p {
      color: #666;
      font-size: 15px;
      line-height: 1.6;
      margin: 0 0 15px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    .shipping-box {
      background: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 20px;
      margin: 25px 0;
      border-radius: 8px;
    }
    .shipping-box p {
      margin: 5px 0;
      color: #856404;
      font-size: 14px;
    }
    .shipping-box strong {
      color: #333;
    }
    .total-box {
      background: #e8f5e9;
      padding: 20px;
      border-radius: 8px;
      margin: 25px 0;
    }
    .total-line {
      display: flex;
      justify-content: space-between;
      margin: 10px 0;
      font-size: 15px;
    }
    .total-line.final {
      font-size: 20px;
      font-weight: bold;
      color: #1b5e20;
      padding-top: 15px;
      border-top: 2px solid #c8e6c9;
      margin-top: 15px;
    }
    .btn {
      display: inline-block;
      background: linear-gradient(135deg, #9D2235 0%, #7a1a2a 100%);
      color: white;
      padding: 15px 40px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: bold;
      margin: 20px 0;
    }
    .footer {
      background: #f8f9fa;
      padding: 25px 30px;
      text-align: center;
      border-top: 1px solid #e9ecef;
    }
    .footer p {
      color: #6c757d;
      font-size: 13px;
      margin: 5px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="success-icon"></div>
      <h1>¡Compra Exitosa!</h1>
      <p>Gracias por tu compra en RaícesMX</p>
    </div>
    
    <div class="content">
      <p>Hola <strong>${order.shippingName}</strong>,</p>
      <p>Tu orden ha sido confirmada y pagada exitosamente. Los vendedores han sido notificados y comenzarán a preparar tu pedido.</p>
      
      <div class="order-number">
        <p style="margin: 0; color: #666; font-size: 14px;">Número de Orden</p>
        <strong>${order.orderNumber}</strong>
      </div>

      <h2>📦 Productos Comprados</h2>
      <table>
        ${itemsHtml}
      </table>

      <div class="total-box">
        <div class="total-line">
          <span>Subtotal:</span>
          <span>$${Number(order.subtotal).toFixed(2)} MXN</span>
        </div>
        <div class="total-line">
          <span>Envío:</span>
          <span>$${Number(order.shippingCost).toFixed(2)} MXN</span>
        </div>
        ${order.discount > 0 ? `<div class="total-line" style="color: #2e7d32;"><span>Descuento:</span><span>-$${Number(order.discount).toFixed(2)} MXN</span></div>` : ''}
        <div class="total-line final">
          <span>Total Pagado:</span>
          <span>$${Number(order.total).toFixed(2)} MXN</span>
        </div>
      </div>

      <h2>🚚 Información de Envío</h2>
      <div class="shipping-box">
        <p><strong>Nombre:</strong> ${order.shippingName}</p>
        <p><strong>Dirección:</strong> ${order.shippingAddress}</p>
        <p><strong>Ciudad:</strong> ${order.shippingCity}, ${order.shippingState}</p>
        <p><strong>Código Postal:</strong> ${order.shippingPostalCode}</p>
        <p><strong>Teléfono:</strong> ${order.shippingPhone || 'No proporcionado'}</p>
      </div>

      <h2>📋 ¿Qué sigue?</h2>
      <p>1. Los vendedores prepararán tu pedido</p>
      <p>2. Decidirán si usar logística propia o servicio de envío (DHL, FedEx, etc.)</p>
      <p>3. Recibirás el número de rastreo por email cuando se envíe</p>
      <p>4. Tu pedido llegará en los próximos 3-7 días hábiles</p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="http://localhost:4200/ordenes/${order.id}" class="btn">Ver Detalle de la Orden</a>
      </div>

      <p style="margin-top: 30px;">Si tienes alguna pregunta, no dudes en contactarnos.</p>
      <p><strong>¡Gracias por apoyar a los artesanos mexicanos! 🇲🇽</strong></p>
    </div>
    
    <div class="footer">
      <p>© ${new Date().getFullYear()} RaícesMX - Artesanía Mexicana Auténtica</p>
      <p>Orden #${order.orderNumber} | ${new Date(order.createdAt).toLocaleDateString('es-MX')}</p>
      <p>Este es un email automático, por favor no respondas a este mensaje.</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  /**
   * Plantilla de notificación para el vendedor
   */
  private getSellerNotificationTemplate(
    sellerName: string,
    order: Order,
    items: any[],
  ): string {
    const itemsHtml = items
      .map(
        (item) => `
      <tr>
        <td style="padding: 15px; border-bottom: 1px solid #e9ecef;">
          <strong style="color: #333; font-size: 15px;">${item.productTitle}</strong>
          <p style="margin: 5px 0; color: #666; font-size: 13px;">
            Cantidad vendida: <strong>${item.quantity}</strong>
          </p>
        </td>
        <td style="padding: 15px; text-align: right; border-bottom: 1px solid #e9ecef;">
          <strong style="color: #2e7d32; font-size: 16px;">
            $${Number(item.total).toFixed(2)} MXN
          </strong>
        </td>
      </tr>
    `,
      )
      .join('');

    const totalVenta = items.reduce((sum, item) => sum + Number(item.total), 0);

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f4f4f4;
      margin: 0;
      padding: 40px 20px;
    }
    .container {
      max-width: 650px;
      margin: 0 auto;
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 40px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #9D2235 0%, #7a1a2a 100%);
      padding: 40px 30px;
      text-align: center;
      color: white;
    }
    .sale-icon {
      font-size: 70px;
      margin-bottom: 15px;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      color: white;
    }
    .header p {
      margin: 10px 0 0 0;
      color: #f8d7da;
      font-size: 16px;
    }
    .content {
      padding: 40px 30px;
    }
    .highlight-box {
      background: linear-gradient(135deg, #e8f5e9 0%, #f1f8f4 100%);
      border-left: 4px solid #2e7d32;
      padding: 20px;
      margin: 25px 0;
      border-radius: 8px;
      text-align: center;
    }
    .highlight-box h2 {
      margin: 0 0 10px 0;
      color: #1b5e20;
      font-size: 24px;
    }
    .highlight-box p {
      margin: 0;
      color: #2e7d32;
      font-size: 16px;
    }
    h2 {
      color: #333;
      font-size: 20px;
      margin: 30px 0 15px 0;
      border-bottom: 2px solid #e9ecef;
      padding-bottom: 10px;
    }
    p {
      color: #666;
      font-size: 15px;
      line-height: 1.6;
      margin: 0 0 15px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    .customer-box {
      background: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 20px;
      margin: 25px 0;
      border-radius: 8px;
    }
    .customer-box p {
      margin: 5px 0;
      color: #856404;
      font-size: 14px;
    }
    .customer-box strong {
      color: #333;
    }
    .action-box {
      background: #e3f2fd;
      padding: 25px;
      border-radius: 8px;
      margin: 25px 0;
    }
    .action-box h3 {
      margin: 0 0 15px 0;
      color: #1976d2;
      font-size: 18px;
    }
    .action-box p {
      margin: 8px 0;
      color: #0d47a1;
      font-size: 14px;
    }
    .action-box input[type="radio"] {
      margin-right: 8px;
    }
    .btn {
      display: inline-block;
      background: linear-gradient(135deg, #9D2235 0%, #7a1a2a 100%);
      color: white;
      padding: 15px 40px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: bold;
      margin: 10px 5px;
    }
    .btn-secondary {
      background: linear-gradient(135deg, #1976d2 0%, #0d47a1 100%);
    }
    .footer {
      background: #f8f9fa;
      padding: 25px 30px;
      text-align: center;
      border-top: 1px solid #e9ecef;
    }
    .footer p {
      color: #6c757d;
      font-size: 13px;
      margin: 5px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="sale-icon">🎉</div>
      <h1>¡Nueva Venta!</h1>
      <p>Tienes un nuevo pedido que preparar</p>
    </div>
    
    <div class="content">
      <p>Hola <strong>${sellerName}</strong>,</p>
      <p>¡Felicidades! Has realizado una nueva venta en RaícesMX.</p>
      
      <div class="highlight-box">
        <h2>$${totalVenta.toFixed(2)} MXN</h2>
        <p>Total de esta venta</p>
      </div>

      <h2>🛍️ Productos Vendidos</h2>
      <table>
        ${itemsHtml}
      </table>

      <h2>👤 Información del Cliente</h2>
      <div class="customer-box">
        <p><strong>Nombre:</strong> ${order.shippingName}</p>
        <p><strong>Email:</strong> ${order.shippingEmail}</p>
        <p><strong>Teléfono:</strong> ${order.shippingPhone || 'No proporcionado'}</p>
        <p><strong>Dirección de Envío:</strong></p>
        <p style="margin-left: 20px;">
          ${order.shippingAddress}<br>
          ${order.shippingCity}, ${order.shippingState}<br>
          C.P. ${order.shippingPostalCode}, ${order.shippingCountry}
        </p>
      </div>

      <h2>📦 Siguiente Paso: Preparar el Envío</h2>
      <p>Es momento de preparar el paquete para tu cliente. Tienes dos opciones para el envío:</p>

      <div class="action-box">
        <h3>Opciones de Logística</h3>
        <p><strong>Opción 1: Logística Propia (con Tracking)</strong></p>
        <p>• Tú manejas el envío y proporcionas número de rastreo</p>
        <p>• Mayor control sobre el proceso</p>
        <p>• Debes actualizar el tracking en RaícesMX</p>
        
        <p style="margin-top: 15px;"><strong>Opción 2: Servicio Externo (DHL, FedEx, Estafeta, etc.)</strong></p>
        <p>• Contratas el servicio de paquetería</p>
        <p>• Obtienes guía de envío directamente</p>
        <p>• Número de rastreo automático</p>
      </div>

      <h2>✅ Checklist para el Envío</h2>
      <p>☐ Verificar que los productos estén en buen estado</p>
      <p>☐ Empacar de forma segura con protección adecuada</p>
      <p>☐ Incluir nota de agradecimiento (opcional pero recomendado)</p>
      <p>☐ Elegir método de envío (propio o paquetería)</p>
      <p>☐ Actualizar número de rastreo en RaícesMX</p>
      <p>☐ Marcar como "Enviado" en el sistema</p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="http://localhost:4200/vendedor/ordenes/${order.id}" class="btn">
          Ver Detalles de la Orden
        </a>
        <a href="http://localhost:4200/vendedor/ordenes/${order.id}/envio" class="btn btn-secondary">
          Gestionar Envío
        </a>
      </div>

      <p style="margin-top: 30px;"><strong>Nota importante:</strong> El cliente está esperando su pedido. Por favor, procesa el envío lo antes posible (máximo 2 días hábiles).</p>
      
      <p><strong>¡Gracias por ser parte de RaícesMX! 🇲🇽</strong></p>
    </div>
    
    <div class="footer">
      <p>© ${new Date().getFullYear()} RaícesMX - Artesanía Mexicana Auténtica</p>
      <p>Orden #${order.orderNumber} | ${new Date(order.createdAt).toLocaleDateString('es-MX')}</p>
      <p>Este es un email automático, por favor no respondas a este mensaje.</p>
    </div>
  </div>
</body>
</html>
    `;
  }
}
