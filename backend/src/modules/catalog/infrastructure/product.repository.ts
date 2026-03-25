import { Product } from '../domain/product.entity';

export abstract class ProductRepository {
  abstract findAll(): Promise<Product[]>;
  abstract findActive(): Promise<Product[]>;
  abstract findById(id: string): Promise<Product | null>;
  abstract findByCategory(category: string): Promise<Product[]>;
  abstract save(product: Product): Promise<void>;
  abstract delete(id: string): Promise<void>;
}

export class InMemoryProductRepository extends ProductRepository {
  private readonly products = new Map<string, Product>();

  async findAll(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async findActive(): Promise<Product[]> {
    return Array.from(this.products.values()).filter((p) => p.active);
  }

  async findById(id: string): Promise<Product | null> {
    return this.products.get(id) ?? null;
  }

  async findByCategory(category: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter((p) => p.active && p.category === category);
  }

  async save(product: Product): Promise<void> {
    this.products.set(product.id, product);
  }

  async delete(id: string): Promise<void> {
    this.products.delete(id);
  }
}
