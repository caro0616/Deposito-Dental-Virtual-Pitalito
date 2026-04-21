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

  /**
   * US-03: búsqueda de texto completo por nombre, descripción, SKU o marca.
   * Usa el índice de texto creado en el schema.
   */
  async search(query: string): Promise<Product[]> {
    const docs = await this.productModel
      .find({ $text: { $search: query }, active: true }, { score: { $meta: 'textScore' } })
      .sort({ score: { $meta: 'textScore' } })
      .lean<Array<ProductDoc & { _id: Types.ObjectId }>>()
      .exec();
    return docs.map((doc) => this.toDomain(doc));
  }

  async countByCategories(): Promise<Record<string, number>> {
    const result = await this.productModel
      .aggregate([
        { $match: { active: true } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
      ])
      .exec();
    const counts: Record<string, number> = {};
    for (const item of result) {
      counts[item._id as string] = item.count;
    }
    return counts;
  }

  async save(product: Product): Promise<void> {
    const data = {
      sku: product.sku || undefined,
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      brand: product.brand,
      imageUrl: product.imageUrl,
      stock: product.stock,
      active: product.active,
      invima: product.invima,
      materials: product.materials,
      dimensions: product.dimensions,
    };

    if (Types.ObjectId.isValid(product.id)) {
      await this.productModel
        .findByIdAndUpdate(product.id, { $set: data }, { returnDocument: 'after' })
        .exec();
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

  async decreaseStockAtomic(id: string, quantity: number): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const result = await this.productModel
      .findOneAndUpdate(
        { _id: id, stock: { $gte: quantity } },
        { $inc: { stock: -quantity } },
        { returnDocument: 'after' },
      )
      .exec();
    return result !== null;
  }

  // ─── Mapping helpers ──────────────────────────────────────────────────────

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
      doc.sku ?? '',
      doc.brand ?? '',
      doc.invima ?? '',
      doc.materials ?? '',
      doc.dimensions ?? '',
    );
  }
}
