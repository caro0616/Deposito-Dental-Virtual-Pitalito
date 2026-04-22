import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getModelToken } from '@nestjs/mongoose';
import { OrderDoc } from './modules/orders/infrastructure/persistence/schemas/order.schema';
import { Model } from 'mongoose';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const orderModel = app.get<Model<OrderDoc>>(getModelToken(OrderDoc.name));

  const result = await orderModel.deleteMany({});
  console.log(`Órdenes eliminadas: ${result.deletedCount}`);
  await app.close();
}

bootstrap();
