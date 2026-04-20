import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationService } from './application/notification.service';
import { NotificationRepository } from './infrastructure/notification.repository';
import { NotificationDoc, NotificationSchema } from './infrastructure/schemas/notification.schema';
import { NotificationsController } from './presentation/notifications.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Notification', schema: NotificationSchema },
    ]),
  ],
  controllers: [NotificationsController],
  providers: [NotificationService, NotificationRepository],
  exports: [NotificationService],
})
export class NotificationsModule {}
