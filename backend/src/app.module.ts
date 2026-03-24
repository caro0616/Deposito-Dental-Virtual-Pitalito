import { Module } from '@nestjs/common';
import { OrdersModule } from './modules/orders/orders.module';
import { ProductsModule } from './modules/products/products.module';

@Module({
  imports: [OrdersModule, ProductsModule],
})
export class AppModule {}
