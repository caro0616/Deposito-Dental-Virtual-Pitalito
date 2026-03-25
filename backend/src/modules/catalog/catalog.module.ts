import { Module } from '@nestjs/common';
import { CatalogService } from './application/catalog.service';
import { ProductAdminService } from './application/product-admin.service';
import { ProductRepository, InMemoryProductRepository } from './infrastructure/product.repository';
import { CatalogController } from './presentation/catalog.controller';
import { ProductAdminController } from './presentation/product-admin.controller';

@Module({
  controllers: [CatalogController, ProductAdminController],
  providers: [
    CatalogService,
    ProductAdminService,
    {
      provide: ProductRepository,
      useClass: InMemoryProductRepository,
    },
  ],
  exports: [ProductRepository],
})
export class CatalogModule {}
