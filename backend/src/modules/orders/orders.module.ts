import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CartService } from './application/cart.service';
import { OrderService } from './application/order.service';

import { CART_REPOSITORY } from './infrastructure/cart.repository';
import { ORDER_REPOSITORY } from './infrastructure/order.repository';

import { MongooseCartRepository } from './infrastructure/persistence/mongoose-cart.repository';
import { MongooseOrderRepository } from './infrastructure/persistence/mongoose-order.repository';

import { CartDoc, CartSchema } from './infrastructure/persistence/schemas/cart.schema';
import { OrderDoc, OrderSchema } from './infrastructure/persistence/schemas/order.schema';

import { CartController } from './presentation/cart.controller';
import { OrdersController } from './presentation/orders.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CartDoc.name, schema: CartSchema },
      { name: OrderDoc.name, schema: OrderSchema },
    ]),
  ],
  controllers: [CartController, OrdersController],
  providers: [
    CartService,
    OrderService,
    {
      provide: CART_REPOSITORY,
      useClass: MongooseCartRepository,
    },
    {
      provide: ORDER_REPOSITORY,
      useClass: MongooseOrderRepository,
    },
  ],
})
export class OrdersModule {}
