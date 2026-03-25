import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ProductCategory } from '../../../domain/product.entity';

export type ProductDocument = ProductDoc & Document;

const PRODUCT_CATEGORIES: ProductCategory[] = [
  'instrumental',
  'materiales',
  'equipos',
  'consumibles',
  'proteccion',
  'otros',
];

@Schema({
  collection: 'products',
  versionKey: false,
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
})
export class ProductDoc {
  @Prop({ required: false, unique: true, trim: true, uppercase: true })
  sku!: string;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ default: '' })
  description!: string;

  @Prop({ required: true, min: 0 })
  price!: number;

  @Prop({
    required: true,
    type: String,
    enum: PRODUCT_CATEGORIES,
    default: 'otros' satisfies ProductCategory,
  })
  category!: ProductCategory;

  @Prop({ default: '' })
  brand!: string;

  @Prop({ default: '' })
  imageUrl!: string;

  @Prop({ required: true, default: 0, min: 0 })
  stock!: number;

  @Prop({ required: true, default: true })
  active!: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

export const ProductSchema = SchemaFactory.createForClass(ProductDoc);

ProductSchema.index({ category: 1 });
ProductSchema.index({ active: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ name: 'text', description: 'text' });
