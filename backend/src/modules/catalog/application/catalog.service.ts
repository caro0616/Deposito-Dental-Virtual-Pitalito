import { Injectable, NotFoundException } from '@nestjs/common';
import { Product } from '../domain/product.entity';
import { ProductRepository } from '../infrastructure/product.repository';

@Injectable()
export class CatalogService {
  constructor(private readonly productRepo: ProductRepository) {}

  async getPublicCatalog(): Promise<Product[]> {
    return this.productRepo.findActive();
  }

  async getProductById(id: string): Promise<Product> {
    const product = await this.productRepo.findById(id);
    if (!product || !product.active) {
      throw new NotFoundException(`Product ${id} not found`);
    }
    return product;
  }

  async getByCategory(category: string): Promise<Product[]> {
    return this.productRepo.findByCategory(category);
  }
}
