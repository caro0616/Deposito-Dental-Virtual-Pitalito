import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProductService } from '../application/product.service';
import { Product } from '../domain/product.entity';

@Controller('products')
export class ProductsController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  async getAllProducts(@Query('category') category?: string): Promise<Product[]> {
    if (category) {
      return this.productService.filterProductsByCategory(category);
    }
    return this.productService.getAllProducts();
  }

  @Get('search')
  async searchProducts(@Query('query') query: string): Promise<Product[]> {
    return this.productService.searchProducts(query);
  }

  @Get(':id')
  async getProductById(@Param('id') id: string): Promise<Product | null> {
    return this.productService.getProductById(id);
  }

  @Get('invima/:code')
  async getProductByInvimaCode(@Param('code') code: string): Promise<Product | null> {
    return this.productService.getProductByInvimaCode(code);
  }
}
