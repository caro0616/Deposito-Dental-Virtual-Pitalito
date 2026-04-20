import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class NotificationDoc {
  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  message!: string;

  @Prop()
  url?: string;

  @Prop()
  createdAt?: Date;
}

export type NotificationDocument = NotificationDoc & Document;
export const NotificationSchema = SchemaFactory.createForClass(NotificationDoc);
