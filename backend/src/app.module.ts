import { Module } from '@nestjs/common';
import { OrdersModule } from './modules/orders/orders.module';
import { ProductsModule } from './modules/products/products.module';
import { CatalogModule } from './modules/catalog/catalog.module';

@Module({
  imports: [OrdersModule, ProductsModule, CatalogModule],
})
export class AppModule {}
