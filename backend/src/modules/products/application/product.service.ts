import { Injectable } from '@nestjs/common';
import { Product } from '../domain/product.entity';
import { ProductRepository } from '../infrastructure/product.repository';

@Injectable()
export class ProductService {
  constructor(private readonly productRepository: ProductRepository) {}

  async getAllProducts(): Promise<Product[]> {
    return this.productRepository.findAll();
  }

  async getProductById(id: string): Promise<Product | null> {
    return this.productRepository.findById(id);
  }

  async searchProducts(query: string): Promise<Product[]> {
    return this.productRepository.search(query);
  }

  async filterProductsByCategory(category: string): Promise<Product[]> {
    return this.productRepository.filterByCategory(category);
  }

  async getProductByInvimaCode(invimaCode: string): Promise<Product | null> {
    return this.productRepository.findByInvimaCode(invimaCode);
  }
}
