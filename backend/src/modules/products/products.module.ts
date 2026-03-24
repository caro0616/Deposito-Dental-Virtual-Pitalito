import { Module } from '@nestjs/common';
import { ProductService } from './application/product.service';
import { ProductRepository, InMemoryProductRepository } from './infrastructure/product.repository';
import { ProductsController } from './presentation/products.controller';

@Module({
  controllers: [ProductsController],
  providers: [
    ProductService,
    {
      provide: ProductRepository,
      useClass: InMemoryProductRepository,
    },
  ],
  exports: [ProductService],
})
export class ProductsModule {}
