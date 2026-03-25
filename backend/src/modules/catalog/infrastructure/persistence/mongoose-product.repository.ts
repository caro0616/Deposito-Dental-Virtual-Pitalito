import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IProductRepository } from '../product.repository';
import { Product, ProductCategory } from '../../domain/product.entity';
import { ProductDoc, ProductDocument } from './schemas/product.schema';

/**
 * Mongoose-backed implementation of IProductRepository.
 * Persists product data to the 'products' collection in MongoDB Atlas.
 */
@Injectable()
export class MongooseProductRepository implements IProductRepository {
  constructor(
    @InjectModel(ProductDoc.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  async findAll(): Promise<Product[]> {
    const docs = await this.productModel
      .find()
      .sort({ name: 1 })
      .lean<Array<ProductDoc & { _id: Types.ObjectId }>>()
      .exec();

    return docs.map((doc) => this.toDomain(doc));
  }

  async findActive(): Promise<Product[]> {
    const docs = await this.productModel
      .find({ active: true })
      .sort({ name: 1 })
      .lean<Array<ProductDoc & { _id: Types.ObjectId }>>()
      .exec();

    return docs.map((doc) => this.toDomain(doc));
  }

  async findById(id: string): Promise<Product | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    const doc = await this.productModel
      .findById(id)
      .lean<ProductDoc & { _id: Types.ObjectId }>()
      .exec();

    if (!doc) return null;

    return this.toDomain(doc);
  }

  async findByCategory(category: string): Promise<Product[]> {
    const docs = await this.productModel
      .find({ category, active: true })
      .sort({ name: 1 })
      .lean<Array<ProductDoc & { _id: Types.ObjectId }>>()
      .exec();

    return docs.map((doc) => this.toDomain(doc));
  }

  async save(product: Product): Promise<void> {
    const data = {
      sku: product.sku || `SKU-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      brand: product.brand,
      imageUrl: product.imageUrl,
      stock: product.stock,
      active: product.active,
    };

    if (Types.ObjectId.isValid(product.id)) {
      await this.productModel.findByIdAndUpdate(product.id, { $set: data }, { new: true }).exec();
    } else {
      const created = await this.productModel.create(data);
      (product as { id: string }).id = (created._id as Types.ObjectId).toHexString();
    }
  }

  async delete(id: string): Promise<void> {
    if (Types.ObjectId.isValid(id)) {
      await this.productModel.findByIdAndDelete(id).exec();
    }
  }

  // ─── Mapping helpers ────────────────────────────────────────────────────────

  private toDomain(doc: ProductDoc & { _id: Types.ObjectId }): Product {
    return new Product(
      doc._id.toHexString(),
      doc.name,
      doc.description,
      doc.price,
      doc.imageUrl,
      doc.category as ProductCategory,
      doc.stock,
      doc.active,
      doc.sku,
      doc.brand,
    );
  }
}
