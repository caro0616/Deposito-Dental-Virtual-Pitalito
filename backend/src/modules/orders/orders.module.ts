import { Module } from '@nestjs/common';
import { CartService } from './application/cart.service';
import { CartRepository, InMemoryCartRepository } from './infrastructure/cart.repository';
import { CartController } from './presentation/cart.controller';
import { OrderService } from './application/order.service';
import { OrderRepository, InMemoryOrderRepository } from './infrastructure/order.repository';
import { OrdersController } from './presentation/orders.controller';

@Module({
  controllers: [CartController, OrdersController],
  providers: [
    CartService,
    OrderService,
    {
      provide: CartRepository,
      useClass: InMemoryCartRepository,
    },
    {
      provide: OrderRepository,
      useClass: InMemoryOrderRepository,
    },
  ],
})
export class OrdersModule {}
