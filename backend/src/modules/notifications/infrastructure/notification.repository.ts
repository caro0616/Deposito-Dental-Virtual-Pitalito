import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification } from '../domain/notification.entity';
import { NotificationDoc } from './schemas/notification.schema';

@Injectable()
export class NotificationRepository {
  constructor(
    @InjectModel('Notification')
    private readonly notificationModel: Model<NotificationDoc>,
  ) {}

  async findAll(): Promise<Notification[]> {
    return this.notificationModel.find().sort({ createdAt: -1 }).lean();
  }

  async create(notification: Notification): Promise<Notification> {
    return this.notificationModel.create(notification);
  }
}
