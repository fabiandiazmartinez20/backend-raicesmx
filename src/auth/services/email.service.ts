// src/auth/services/email.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as brevo from '@getbrevo/brevo';

/**
 * EmailService
 * -------------
 * Servicio responsable del envío de correos electrónicos transaccionales.
 *
 * Funcionalidades:
 * - Envío de códigos de recuperación de contraseña
 * - Notificación de aprobación de vendedor
 * - Notificación de rechazo de vendedor
 * - Uso de plantillas HTML personalizadas
 *
 * Plataforma de envío:
 * - Brevo (antes Sendinblue)
 */

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
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
  //  ENVÍO DE CORREOS
  // ======================================================

  /**
   * Envía un código de recuperación de contraseña al usuario.
   */
  async sendPasswordResetCode(
    email: string,
    code: string,
    userName: string,
  ): Promise<void> {
    try {
      const sendSmtpEmail = new brevo.SendSmtpEmail();

      sendSmtpEmail.subject = 'Código de Recuperación - RaícesMX 🇲🇽';
      sendSmtpEmail.to = [{ email, name: userName }];
      sendSmtpEmail.sender = {
        email: this.fromEmail,
        name: this.fromName,
      };
      sendSmtpEmail.htmlContent = this.getPasswordResetTemplate(code, userName);

      const result = await this.apiInstance.sendTransacEmail(sendSmtpEmail);

      this.logger.log(`✅ Código de recuperación enviado a: ${email}`);
      this.logger.log(`📧 Message ID: ${result.body.messageId}`);
    } catch (error) {
      this.logger.error('Error al enviar email con Brevo:', error);

      if (error.response) {
        this.logger.error('Respuesta de Brevo:', error.response.body);
      }

      throw new Error('No se pudo enviar el email de recuperación');
    }
  }

  /**
   * ✨ NUEVO: Envía email de aprobación de vendedor
   */
  async sendSellerApprovalEmail(
    email: string,
    userName: string,
  ): Promise<void> {
    try {
      const sendSmtpEmail = new brevo.SendSmtpEmail();

      sendSmtpEmail.subject =
        '✅ ¡Tu cuenta de vendedor ha sido aprobada! - RaícesMX';
      sendSmtpEmail.to = [{ email, name: userName }];
      sendSmtpEmail.sender = {
        email: this.fromEmail,
        name: this.fromName,
      };
      sendSmtpEmail.htmlContent = this.getSellerApprovalTemplate(userName);

      const result = await this.apiInstance.sendTransacEmail(sendSmtpEmail);

      this.logger.log(`✅ Email de aprobación enviado a: ${email}`);
      this.logger.log(`📧 Message ID: ${result.body.messageId}`);
    } catch (error) {
      this.logger.error('Error al enviar email de aprobación:', error);

      if (error.response) {
        this.logger.error('Respuesta de Brevo:', error.response.body);
      }

      throw new Error('No se pudo enviar el email de aprobación');
    }
  }

  /**
   * ✨ NUEVO: Envía email de rechazo de vendedor
   */
  async sendSellerRejectionEmail(
    email: string,
    userName: string,
    rejectionReason: string,
  ): Promise<void> {
    try {
      const sendSmtpEmail = new brevo.SendSmtpEmail();

      sendSmtpEmail.subject =
        '📋 Actualización sobre tu solicitud de vendedor - RaícesMX';
      sendSmtpEmail.to = [{ email, name: userName }];
      sendSmtpEmail.sender = {
        email: this.fromEmail,
        name: this.fromName,
      };
      sendSmtpEmail.htmlContent = this.getSellerRejectionTemplate(
        userName,
        rejectionReason,
      );

      const result = await this.apiInstance.sendTransacEmail(sendSmtpEmail);

      this.logger.log(`✅ Email de rechazo enviado a: ${email}`);
      this.logger.log(`📧 Message ID: ${result.body.messageId}`);
    } catch (error) {
      this.logger.error('Error al enviar email de rechazo:', error);

      if (error.response) {
        this.logger.error('Respuesta de Brevo:', error.response.body);
      }

      throw new Error('No se pudo enviar el email de rechazo');
    }
  }

  // ======================================================
  //  PLANTILLAS DE EMAIL
  // ======================================================

  /**
   * Genera el template HTML del correo de recuperación de contraseña.
   */
  private getPasswordResetTemplate(code: string, userName: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      margin: 0;
      padding: 40px 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    .header {
      background: linear-gradient(135deg, #8B0000 0%, #DC143C 100%);
      padding: 40px 30px;
      text-align: center;
    }
    .logo {
      font-size: 32px;
      font-weight: bold;
      color: white;
      margin: 0;
    }
    .logo .vino { color: #FFD700; }
    .logo .dorado { color: white; }
    .content {
      padding: 40px 30px;
    }
    h1 {
      color: #333;
      font-size: 24px;
      margin: 0 0 20px 0;
    }
    p {
      color: #666;
      font-size: 16px;
      line-height: 1.6;
      margin: 0 0 20px 0;
    }
    .code-box {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      padding: 30px;
      text-align: center;
      margin: 30px 0;
    }
    .code {
      font-size: 48px;
      font-weight: bold;
      color: white;
      letter-spacing: 8px;
      font-family: 'Courier New', monospace;
    }
    .warning {
      background: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .warning p {
      margin: 0;
      color: #856404;
      font-size: 14px;
    }
    .footer {
      background: #f8f9fa;
      padding: 20px 30px;
      text-align: center;
      border-top: 1px solid #e9ecef;
    }
    .footer p {
      color: #6c757d;
      font-size: 14px;
      margin: 5px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <p class="logo"><span class="vino">Raíces</span><span class="dorado">MX</span></p>
    </div>
    
    <div class="content">
      <h1>¡Hola, ${userName}! 👋</h1>
      <p>Recibimos una solicitud para restablecer tu contraseña en RaícesMX.</p>
      <p>Tu código de verificación es:</p>
      
      <div class="code-box">
        <div class="code">${code}</div>
      </div>
      
      <p>Ingresa este código en la aplicación para continuar con el proceso de recuperación.</p>
      
      <div class="warning">
        <p><strong>⚠️ Importante:</strong> Este código expira en 15 minutos y solo puede usarse una vez.</p>
      </div>
      
      <p>Si no solicitaste este código, puedes ignorar este email. Tu cuenta permanece segura.</p>
    </div>
    
    <div class="footer">
      <p>© ${new Date().getFullYear()} RaícesMX - Marketplace Mexicano</p>
      <p>Este es un email automático, por favor no respondas a este mensaje.</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  /**
   * ✨ NUEVO: Template de aprobación de vendedor
   */
  private getSellerApprovalTemplate(userName: string): string {
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
      max-width: 600px;
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
      font-size: 60px;
      margin-bottom: 20px;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      color: white;
    }
    .content {
      padding: 40px 30px;
    }
    h2 {
      color: #333;
      font-size: 20px;
      margin: 30px 0 15px 0;
    }
    p {
      color: #666;
      font-size: 16px;
      line-height: 1.6;
      margin: 0 0 15px 0;
    }
    .highlight-box {
      background: linear-gradient(135deg, #e8f5e9 0%, #f1f8f4 100%);
      border-left: 4px solid #2e7d32;
      padding: 20px;
      margin: 25px 0;
      border-radius: 8px;
    }
    .highlight-box p {
      margin: 0;
      font-weight: 600;
      color: #1b5e20;
    }
    .features {
      display: table;
      width: 100%;
      margin: 30px 0;
    }
    .feature {
      display: table-cell;
      text-align: center;
      padding: 20px 10px;
    }
    .feature-icon {
      font-size: 40px;
      margin-bottom: 10px;
    }
    .feature p {
      font-size: 14px;
      font-weight: 600;
      color: #333;
      margin: 0;
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
    .tips {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin: 25px 0;
    }
    .tips ul {
      margin: 10px 0;
      padding-left: 20px;
      color: #666;
      font-size: 14px;
    }
    .tips li {
      margin: 8px 0;
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
      <div class="success-icon">✅</div>
      <h1>¡Felicidades, ${userName}!</h1>
      <p>Tu cuenta de vendedor ha sido aprobada</p>
    </div>
    
    <div class="content">
      <p>Nos complace informarte que tu solicitud para vender en <strong>RaícesMX</strong> ha sido aprobada exitosamente.</p>
      
      <div class="highlight-box">
        <p>🎉 ¡Ya puedes comenzar a vender tus productos!</p>
        <p style="font-weight: normal; margin-top: 10px;">Tu cuenta ha sido activada como vendedor verificado. Ahora tienes acceso completo a todas las herramientas para gestionar tus artesanías.</p>
      </div>

      <h2>¿Qué puedes hacer ahora?</h2>
      <div class="features">
        <div class="feature">
          <div class="feature-icon">📦</div>
          <p>Publicar<br>productos</p>
        </div>
        <div class="feature">
          <div class="feature-icon">📊</div>
          <p>Ver<br>estadísticas</p>
        </div>
        <div class="feature">
          <div class="feature-icon">💰</div>
          <p>Gestionar<br>ventas</p>
        </div>
      </div>

      <div style="text-align: center;">
        <a href="http://localhost:4200/perfil" class="btn">Ir a Mi Perfil</a>
      </div>

      <div class="tips">
        <h2 style="margin-top: 0;">Consejos para empezar:</h2>
        <ul>
          <li>Sube fotos de alta calidad de tus productos</li>
          <li>Escribe descripciones detalladas y atractivas</li>
          <li>Establece precios competitivos</li>
          <li>Responde rápido a las consultas de los clientes</li>
        </ul>
      </div>

      <p>Si tienes alguna duda, no dudes en contactarnos.</p>
      <p><strong>¡Te deseamos mucho éxito en tus ventas! 🚀</strong></p>
    </div>
    
    <div class="footer">
      <p>© ${new Date().getFullYear()} RaícesMX - Artesanía Mexicana Auténtica</p>
      <p>Este es un email automático, por favor no respondas a este mensaje.</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  /**
   * ✨ NUEVO: Template de rechazo de vendedor
   */
  private getSellerRejectionTemplate(
    userName: string,
    rejectionReason: string,
  ): string {
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
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 40px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #c62828 0%, #b71c1c 100%);
      padding: 40px 30px;
      text-align: center;
      color: white;
    }
    .header h1 {
      margin: 0;
      font-size: 26px;
      color: white;
    }
    .content {
      padding: 40px 30px;
    }
    p {
      color: #666;
      font-size: 16px;
      line-height: 1.6;
      margin: 0 0 15px 0;
    }
    .reason-box {
      background: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 20px;
      margin: 25px 0;
      border-radius: 8px;
    }
    .reason-box p {
      margin: 0;
      color: #856404;
    }
    .reason-box strong {
      color: #333;
      display: block;
      margin-bottom: 10px;
    }
    h2 {
      color: #333;
      font-size: 20px;
      margin: 30px 0 15px 0;
    }
    ul {
      color: #666;
      line-height: 1.8;
      margin: 15px 0;
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
      <h1>Actualización de tu Solicitud</h1>
      <p>Solicitud de Vendedor en RaícesMX</p>
    </div>
    
    <div class="content">
      <p>Hola <strong>${userName}</strong>,</p>
      <p>Hemos revisado tu solicitud para ser vendedor en RaícesMX.</p>
      
      <div class="reason-box">
        <strong>❌ Lamentablemente, tu solicitud no pudo ser aprobada en este momento.</strong>
        <p><strong>Razón:</strong> ${rejectionReason}</p>
      </div>

      <p>No te desanimes, puedes enviar una nueva solicitud cuando hayas solucionado el problema mencionado.</p>

      <h2>Recomendaciones:</h2>
      <ul>
        <li>Asegúrate de que tus documentos (INE, CURP) sean legibles</li>
        <li>Verifica que la información proporcionada coincida con tus documentos</li>
        <li>Las fotografías deben estar bien iluminadas y sin cortes</li>
        <li>El formato CURP debe tener exactamente 18 caracteres</li>
      </ul>

      <div style="text-align: center;">
        <a href="http://localhost:4200/vendedor" class="btn">Enviar Nueva Solicitud</a>
      </div>

      <p>Si tienes alguna duda o necesitas ayuda, no dudes en contactarnos.</p>
    </div>
    
    <div class="footer">
      <p>© ${new Date().getFullYear()} RaícesMX - Artesanía Mexicana Auténtica</p>
      <p>Este es un email automático, por favor no respondas a este mensaje.</p>
    </div>
  </div>
</body>
</html>
    `;
  }
}
