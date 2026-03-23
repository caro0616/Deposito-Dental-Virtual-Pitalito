import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
// Lightweight uuid v4 generator compatible with CommonJS
function uuidv4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
import { CartRepository } from '../infrastructure/cart.repository';
import { Order, OrderStatus } from '../domain/order.entity';
import { OrderRepository } from '../infrastructure/order.repository';

@Injectable()
export class OrderService {
  constructor(
    private readonly cartRepository: CartRepository,
    private readonly orderRepository: OrderRepository,
  ) {}

  async checkout(userId: string): Promise<Order> {
    const cart = await this.cartRepository.findByUserId(userId);
    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    const order = new Order(
      uuidv4(),
      userId,
      cart.items.map((item) => ({
        productId: item.productId,
        name: item.name,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        subtotal: item.subtotal,
      })),
      cart.total,
      'pending',
    );

    await this.orderRepository.save(order);

    // In a real implementation we would persist an emptied cart here
    cart.items = [];
    cart.total = 0;
    await this.cartRepository.save(cart);

    return order;
  }

  async listAll(): Promise<Order[]> {
    return this.orderRepository.findAll();
  }

  async updateStatus(orderId: string, status: OrderStatus, adminId: string): Promise<Order> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    order.changeStatus(status, adminId);
    await this.orderRepository.save(order);
    return order;
  }
}
