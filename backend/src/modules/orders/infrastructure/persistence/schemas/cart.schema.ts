import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// ─── CartItem subdocument ─────────────────────────────────────────────────────

export interface CartItemDocument {
  _id: Types.ObjectId;
  productId: Types.ObjectId;
  name: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

@Schema({ _id: true, versionKey: false })
export class CartItemSubdoc {
  @Prop({ type: Types.ObjectId, auto: true })
  _id!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: 'Product' })
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

export const CartItemSubdocSchema = SchemaFactory.createForClass(CartItemSubdoc);

// ─── Cart document ────────────────────────────────────────────────────────────

export type CartDocument = CartDoc & Document;

@Schema({
  collection: 'carts',
  versionKey: false,
  timestamps: { createdAt: false, updatedAt: 'updatedAt' },
})
export class CartDoc {
  @Prop({ type: Types.ObjectId, required: true, ref: 'User', unique: true })
  userId!: Types.ObjectId;

  @Prop({ type: [CartItemSubdocSchema], default: [] })
  items!: CartItemSubdoc[];

  @Prop({ required: true, default: 0, min: 0 })
  total!: number;

  updatedAt?: Date;
}

export const CartSchema = SchemaFactory.createForClass(CartDoc);

CartSchema.index({ updatedAt: -1 });
