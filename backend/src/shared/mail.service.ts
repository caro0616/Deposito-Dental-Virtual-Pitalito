import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

interface OrderConfirmationItem {
  name: string;
  quantity: number;
  subtotal: number;
}

interface OrderConfirmationPayload {
  orderNumber: number;
  customerName: string;
  total: number;
  items: OrderConfirmationItem[];
  createdAt: Date;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly smtpHost = process.env.SMTP_HOST ?? '';
  private readonly smtpPort = Number(process.env.SMTP_PORT ?? 587);
  private readonly smtpUser = process.env.SMTP_USER ?? '';
  private readonly smtpPass = process.env.SMTP_PASS ?? '';
  private readonly smtpFrom = process.env.SMTP_FROM ?? 'no-reply@dentalpitalito.com';
  private readonly smtpSecure =
    (process.env.SMTP_SECURE ?? '').toLowerCase() === 'true' || this.smtpPort === 465;
  private readonly isConfigured =
    this.smtpHost.length > 0 &&
    this.smtpPort > 0 &&
    this.smtpUser.length > 0 &&
    this.smtpPass.length > 0;
  private readonly transporter = nodemailer.createTransport({
    host: this.smtpHost,
    port: this.smtpPort,
    secure: this.smtpSecure,
    auth: {
      user: this.smtpUser,
      pass: this.smtpPass,
    },
  });

  constructor() {
    if (!this.isConfigured) {
      this.logger.warn(
        'SMTP no configurado completamente. Define SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS y SMTP_FROM en .env.',
      );
    }
  }

  async sendOrderStatusUpdate(to: string, subject: string, text: string, html?: string) {
    if (!this.isConfigured) {
      this.logger.warn(`No se envío correo de estado a ${to}: SMTP no configurado.`);
      return;
    }
    await this.transporter.sendMail({
      from: this.smtpFrom,
      to,
      subject,
      text,
      html,
    });
  }

  async sendOrderConfirmation(to: string, payload: OrderConfirmationPayload): Promise<void> {
    if (!this.isConfigured) {
      this.logger.warn(`No se envío correo de confirmación a ${to}: SMTP no configurado.`);
      return;
    }
    const createdAt = payload.createdAt.toLocaleString('es-CO');
    const safeCustomerName = this.escapeHtml(payload.customerName);
    const lines = payload.items.map((item) => `- ${item.name} x${item.quantity}: $${item.subtotal}`);
    const text = [
      `Hola ${payload.customerName},`,
      '',
      `Tu pedido #${payload.orderNumber} fue confirmado exitosamente.`,
      `Fecha: ${createdAt}`,
      '',
      'Resumen:',
      ...lines,
      '',
      `Total: $${payload.total}`,
      '',
      'Gracias por comprar en Depósito Dental Pitalito.',
    ].join('\n');

    const htmlRows = payload.items
      .map(
        (item) =>
          `<tr>
            <td style="padding: 10px 12px; border-bottom: 1px solid #e6eef5; color: #1A2940; font-size: 14px;">${this.escapeHtml(item.name)}</td>
            <td style="padding: 10px 12px; border-bottom: 1px solid #e6eef5; color: #4A6572; font-size: 14px; text-align: center;">x${item.quantity}</td>
            <td style="padding: 10px 12px; border-bottom: 1px solid #e6eef5; color: #00AEEF; font-size: 14px; text-align: right; font-weight: 700;">$${item.subtotal.toLocaleString('es-CO')}</td>
          </tr>`,
      )
      .join('');

    const html = `
      <div style="margin: 0; padding: 0; background: #f7fbfe; font-family: Arial, Helvetica, sans-serif;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background: #f7fbfe; padding: 24px 0;">
          <tr>
            <td align="center">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="640" style="max-width: 640px; width: 100%; background: #ffffff; border: 1px solid #d5eaf5; border-radius: 12px; overflow: hidden;">
                <tr>
                  <td style="background: #00AEEF; color: #ffffff; padding: 24px;">
                    <p style="margin: 0; font-size: 13px; letter-spacing: 0.4px; opacity: 0.95;">Depósito Dental Pitalito</p>
                    <h1 style="margin: 8px 0 0; font-size: 22px; line-height: 1.3;">Pedido confirmado #${payload.orderNumber}</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 24px;">
                    <p style="margin: 0 0 14px; color: #1A2940; font-size: 15px; line-height: 1.5;">
                      Hola <strong>${safeCustomerName}</strong>,
                    </p>
                    <p style="margin: 0 0 16px; color: #4A6572; font-size: 14px; line-height: 1.6;">
                      Tu compra fue registrada con éxito. Puedes revisar y modificar tus pedidos desde tu cuenta.
                    </p>

                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 0 0 16px; background: #f7fbfe; border: 1px solid #e3f6fd; border-radius: 10px;">
                      <tr>
                        <td style="padding: 12px 14px; color: #4A6572; font-size: 13px;">Fecha de confirmación</td>
                        <td style="padding: 12px 14px; color: #1A2940; font-size: 13px; text-align: right; font-weight: 700;">${createdAt}</td>
                      </tr>
                    </table>

                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border: 1px solid #e6eef5; border-radius: 10px; overflow: hidden; margin-bottom: 14px;">
                      <tr style="background: #ebf5fb;">
                        <th align="left" style="padding: 10px 12px; color: #1A2940; font-size: 13px; border-bottom: 1px solid #d5eaf5;">Producto</th>
                        <th align="center" style="padding: 10px 12px; color: #1A2940; font-size: 13px; border-bottom: 1px solid #d5eaf5;">Cant.</th>
                        <th align="right" style="padding: 10px 12px; color: #1A2940; font-size: 13px; border-bottom: 1px solid #d5eaf5;">Subtotal</th>
                      </tr>
                      ${htmlRows}
                    </table>

                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 8px;">
                      <tr>
                        <td style="font-size: 14px; color: #4A6572;">Total del pedido</td>
                        <td align="right" style="font-size: 24px; font-weight: 700; color: #00AEEF;">$${payload.total.toLocaleString('es-CO')}</td>
                      </tr>
                    </table>

                    <p style="margin: 14px 0 0; color: #4A6572; font-size: 13px; line-height: 1.6;">
                      Gracias por comprar con nosotros. Si necesitas ayuda con tu pedido, responde este correo.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 14px 24px; background: #f7fbfe; border-top: 1px solid #e6eef5; color: #8AACBC; font-size: 12px;">
                    Depósito Dental Pitalito · Este es un correo automático de confirmación.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>
    `;

    await this.transporter.sendMail({
      from: this.smtpFrom,
      to,
      subject: `Confirmación de pedido #${payload.orderNumber}`,
      text,
      html,
    });
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}
