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
    const docs = await this.notificationModel.find({}, null, { sort: { createdAt: -1 } }).lean();
    return docs.map((doc) => ({
      _id: doc._id ? String(doc._id) : undefined,
      title: doc.title,
      message: doc.message,
      url: doc.url,
      createdAt: (doc as { createdAt?: Date }).createdAt ?? new Date(0),
    }));
  }

  async create(notification: Notification): Promise<Notification> {
    const doc = await this.notificationModel.create(notification);
    return {
      _id: doc._id?.toString?.() ?? doc._id,
      title: doc.title,
      message: doc.message,
      url: doc.url,
      createdAt: doc.createdAt ?? new Date(),
    };
  }
}
