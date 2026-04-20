import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.example.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER || 'user@example.com',
      pass: process.env.SMTP_PASS || 'password',
    },
  });

  async sendOrderStatusUpdate(to: string, subject: string, text: string, html?: string) {
    await this.transporter.sendMail({
      from: process.env.SMTP_FROM || 'no-reply@dentalpitalito.com',
      to,
      subject,
      text,
      html,
    });
  }
}
