import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { Product } from '../domain/product.entity';
import { PRODUCT_REPOSITORY, IProductRepository } from '../infrastructure/product.repository';

@Injectable()
export class CatalogService {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepo: IProductRepository,
  ) {}

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
