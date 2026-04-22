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

    const htmlItems = payload.items
      .map(
        (item) =>
          `<li><strong>${item.name}</strong> x${item.quantity} - $${item.subtotal.toLocaleString('es-CO')}</li>`,
      )
      .join('');

    const html = `
      <p>Hola ${payload.customerName},</p>
      <p>Tu pedido <strong>#${payload.orderNumber}</strong> fue confirmado exitosamente.</p>
      <p><strong>Fecha:</strong> ${createdAt}</p>
      <p><strong>Resumen:</strong></p>
      <ul>${htmlItems}</ul>
      <p><strong>Total:</strong> $${payload.total.toLocaleString('es-CO')}</p>
      <p>Gracias por comprar en Depósito Dental Pitalito.</p>
    `;

    await this.transporter.sendMail({
      from: this.smtpFrom,
      to,
      subject: `Confirmación de pedido #${payload.orderNumber}`,
      text,
      html,
    });
  }
}
