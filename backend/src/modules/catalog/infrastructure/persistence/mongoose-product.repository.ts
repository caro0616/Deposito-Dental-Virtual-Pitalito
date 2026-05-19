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
  private readonly categoryHints: Array<{ slug: string; terms: string[] }> = [
    { slug: 'instrumental', terms: ['instrumental', 'pinza', 'espejo', 'explorador', 'fresa'] },
    {
      slug: 'materiales',
      terms: ['material', 'materiales', 'resina', 'adhesivo', 'cemento', 'ionomero', 'composite'],
    },
    {
      slug: 'consumibles',
      terms: ['consumible', 'consumibles', 'endodoncia', 'gutta', 'sellador', 'canal'],
    },
    {
      slug: 'proteccion',
      terms: ['proteccion', 'bioseguridad', 'nitrilo', 'guante', 'tapabocas', 'mascarilla'],
    },
    { slug: 'equipos', terms: ['equipo', 'equipos', 'turbina', 'micromotor', 'cavitron'] },
  ];

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
   * US-03: búsqueda por lenguaje natural sobre inventario real.
   * Prioriza coincidencias por nombre, descripción, marca, SKU, materiales,
   * categoría e INVIMA y soporta términos parciales/sin acentos.
   */
  async search(query: string): Promise<Product[]> {
    const normalized = this.normalizeText(query);
    if (!normalized) return this.findActive();

    const tokens = normalized.split(/\s+/).filter(Boolean);
    const category = this.detectCategory(normalized);

    const docs = await this.productModel
      .find({ active: true, ...(category ? { category } : {}) })
      .lean<Array<ProductDoc & { _id: Types.ObjectId }>>()
      .exec();

    const scored = docs
      .map((doc) => {
        const product = this.toDomain(doc);
        const haystack = this.normalizeText(
          [
            product.name,
            product.description,
            product.sku,
            product.brand,
            product.materials,
            product.invima,
            String(product.category),
          ].join(' '),
        );

        const name = this.normalizeText(product.name);
        let score = 0;

        for (const token of tokens) {
          if (haystack.includes(token)) score += 2;
          if (name.includes(token)) score += 2;
        }

        if (category && String(product.category) === category) score += 2;
        return { product, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score);

    return scored.map((x) => x.product);
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

  private normalizeText(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/anestecia/g, 'anestesia')
      .trim();
  }

  private detectCategory(query: string): string | null {
    for (const hint of this.categoryHints) {
      if (hint.terms.some((term) => query.includes(term))) {
        return hint.slug;
      }
    }
    return null;
  }
}
