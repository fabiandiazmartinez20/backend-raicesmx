// src/auth/services/email.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as brevo from '@getbrevo/brevo';
/**
 * EmailService
 * -------------
 * Servicio responsable del envío de correos electrónicos transaccionales.
 *
 * Funcionalidades actuales:
 * - Envío de códigos de recuperación de contraseña
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

  /**
   * Constructor del servicio de email.
   *
   * - Valida la existencia de las variables de entorno requeridas
   * - Configura el cliente de Brevo
   *
   * Variables necesarias:
   * - BREVO_API_KEY
   * - BREVO_FROM_EMAIL
   * - BREVO_FROM_NAME (opcional)
   *
   * @param configService Servicio de configuración (.env)
   * @throws Error si falta alguna variable crítica
   */

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
   *
   * - Genera un email transaccional con plantilla HTML
   * - Envía el correo mediante la API de Brevo
   * - Registra logs de éxito y error
   *
   * @param email Correo electrónico del destinatario
   * @param code Código de verificación de recuperación
   * @param userName Nombre del usuario para personalizar el mensaje
   * @throws Error si el envío del email falla
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

      // Mensaje de error más específico
      if (error.response) {
        this.logger.error('Respuesta de Brevo:', error.response.body);
      }

      throw new Error('No se pudo enviar el email de recuperación');
    }
  }

  // ======================================================
  //  PLANTILLAS DE EMAIL
  // ======================================================

  /**
   * Genera el template HTML del correo de recuperación de contraseña.
   *
   * Características:
   * - Diseño responsivo
   * - Código de verificación destacado
   * - Mensaje de seguridad y expiración
   *
   * @param code Código de recuperación
   * @param userName Nombre del usuario
   * @returns Template HTML listo para envío
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
}
