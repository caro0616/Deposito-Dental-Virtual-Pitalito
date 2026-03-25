import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { OrderStatus } from '../../../domain/order.entity';

// ─── OrderItem subdocument ────────────────────────────────────────────────────

@Schema({ _id: false, versionKey: false })
export class OrderItemSubdoc {
  @Prop({ type: Types.ObjectId, required: true })
  productId!: Types.ObjectId;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true, min: 0 })
  unitPrice!: number;

  @Prop({ required: true, min: 1 })
  quantity!: number;

  @Prop({ required: true, min: 0 })
  subtotal!: number;
}

export const OrderItemSubdocSchema = SchemaFactory.createForClass(OrderItemSubdoc);

// ─── OrderStatusChange subdocument ───────────────────────────────────────────

@Schema({ _id: false, versionKey: false })
export class OrderStatusChangeSubdoc {
  @Prop({ type: String, default: null })
  from!: string | null;

  @Prop({ required: true })
  to!: string;

  @Prop({ required: true, type: Date })
  changedAt!: Date;

  @Prop({ required: true })
  changedBy!: string;
}

export const OrderStatusChangeSubdocSchema = SchemaFactory.createForClass(OrderStatusChangeSubdoc);

// ─── Order document ───────────────────────────────────────────────────────────

export type OrderDocument = OrderDoc & Document;

const ORDER_STATUSES: OrderStatus[] = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];

@Schema({
  collection: 'orders',
  versionKey: false,
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
})
export class OrderDoc {
  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  userId!: Types.ObjectId;

  @Prop({ type: [OrderItemSubdocSchema], required: true })
  items!: OrderItemSubdoc[];

  @Prop({ required: true, min: 0 })
  total!: number;

  @Prop({
    required: true,
    type: String,
    enum: ORDER_STATUSES,
    default: 'pending' satisfies OrderStatus,
  })
  status!: OrderStatus;

  @Prop({ type: [OrderStatusChangeSubdocSchema], default: [] })
  statusHistory!: OrderStatusChangeSubdoc[];

  createdAt?: Date;
  updatedAt?: Date;
}

export const OrderSchema = SchemaFactory.createForClass(OrderDoc);

OrderSchema.index({ userId: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ userId: 1, createdAt: -1 });
