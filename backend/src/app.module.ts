import { Module } from '@nestjs/common';
import { OrdersModule } from './modules/orders/orders.module';

@Module({
  imports: [OrdersModule],
})
export class AppModule {}
