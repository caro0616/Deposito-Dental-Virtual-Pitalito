import { Injectable } from '@nestjs/common';
import { NotificationRepository } from '../infrastructure/notification.repository';
import { Notification } from '../domain/notification.entity';

@Injectable()
export class NotificationService {
  constructor(private readonly repo: NotificationRepository) {}

  async findAll(): Promise<Notification[]> {
    return this.repo.findAll();
  }

  async create(notification: Notification): Promise<Notification> {
    return this.repo.create(notification);
  }
}
