import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import {
  CardBrand,
  CustomerDocumentType,
  OrderStatus,
  PaymentMethod,
} from '../../../domain/order.entity';

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

const CUSTOMER_DOCUMENT_TYPES: CustomerDocumentType[] = ['cc', 'ce', 'nit', 'passport'];
const PAYMENT_METHODS: PaymentMethod[] = ['pse', 'card'];
const CARD_BRANDS: CardBrand[] = ['visa', 'mastercard', 'amex'];

@Schema({ _id: false, versionKey: false })
export class OrderCustomerSubdoc {
  @Prop({ required: true })
  fullName!: string;

  @Prop({ required: true })
  email!: string;

  @Prop({ required: true })
  phone!: string;

  @Prop({ required: true, type: String, enum: CUSTOMER_DOCUMENT_TYPES })
  documentType!: CustomerDocumentType;

  @Prop({ required: true })
  documentNumber!: string;
}

export const OrderCustomerSubdocSchema = SchemaFactory.createForClass(OrderCustomerSubdoc);

@Schema({ _id: false, versionKey: false })
export class OrderShippingSubdoc {
  @Prop({ required: true })
  department!: string;

  @Prop({ required: true })
  city!: string;

  @Prop({ required: true })
  addressLine1!: string;

  @Prop()
  addressLine2?: string;

  @Prop()
  reference?: string;
}

export const OrderShippingSubdocSchema = SchemaFactory.createForClass(OrderShippingSubdoc);

@Schema({ _id: false, versionKey: false })
export class OrderPaymentSubdoc {
  @Prop({ required: true, type: String, enum: PAYMENT_METHODS })
  method!: PaymentMethod;

  @Prop({ type: String, enum: CARD_BRANDS })
  cardBrand?: CardBrand;
}

export const OrderPaymentSubdocSchema = SchemaFactory.createForClass(OrderPaymentSubdoc);

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

  @Prop({ type: OrderCustomerSubdocSchema, required: true })
  customer!: OrderCustomerSubdoc;

  @Prop({ type: OrderShippingSubdocSchema, required: true })
  shipping!: OrderShippingSubdoc;

  @Prop({ type: OrderPaymentSubdocSchema, required: true })
  payment!: OrderPaymentSubdoc;

  @Prop({
    required: true,
    type: String,
    enum: ORDER_STATUSES,
    default: 'pending' satisfies OrderStatus,
  })
  status!: OrderStatus;

  @Prop({ type: [OrderStatusChangeSubdocSchema], default: [] })
  statusHistory!: OrderStatusChangeSubdoc[];

  @Prop({ required: true, unique: true })
  orderNumber!: number;

  @Prop({ type: Date })
  createdAt?: Date;

  @Prop({ type: Date })
  updatedAt?: Date;
}

export const OrderSchema = SchemaFactory.createForClass(OrderDoc);

OrderSchema.index({ userId: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ userId: 1, createdAt: -1 });
