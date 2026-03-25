import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CatalogService } from './application/catalog.service';
import { ProductAdminService } from './application/product-admin.service';

import { PRODUCT_REPOSITORY } from './infrastructure/product.repository';
import { MongooseProductRepository } from './infrastructure/persistence/mongoose-product.repository';

import { ProductDoc, ProductSchema } from './infrastructure/persistence/schemas/product.schema';

import { CatalogController } from './presentation/catalog.controller';
import { ProductAdminController } from './presentation/product-admin.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: ProductDoc.name, schema: ProductSchema }])],
  controllers: [CatalogController, ProductAdminController],
  providers: [
    CatalogService,
    ProductAdminService,
    {
      provide: PRODUCT_REPOSITORY,
      useClass: MongooseProductRepository,
    },
  ],
  exports: [PRODUCT_REPOSITORY],
})
export class CatalogModule {}
