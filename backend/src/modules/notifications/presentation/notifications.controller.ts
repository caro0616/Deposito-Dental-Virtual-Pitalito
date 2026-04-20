import { Controller, Get, Post, Body } from '@nestjs/common';
import { NotificationService } from '../application/notification.service';
import { Notification } from '../domain/notification.entity';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly service: NotificationService) {}

  @Get()
  async findAll(): Promise<Notification[]> {
    return this.service.findAll();
  }

  @Post()
  async create(@Body() notification: Notification): Promise<Notification> {
    return this.service.create(notification);
  }
}
