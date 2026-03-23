import { Order } from '../domain/order.entity';

export abstract class OrderRepository {
  abstract findAll(): Promise<Order[]>;
  abstract findById(id: string): Promise<Order | null>;
  abstract save(order: Order): Promise<void>;
}

export class InMemoryOrderRepository extends OrderRepository {
  private readonly orders = new Map<string, Order>();

  async findAll(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }

  async findById(id: string): Promise<Order | null> {
    return this.orders.get(id) ?? null;
  }

  async save(order: Order): Promise<void> {
    this.orders.set(order.id, order);
  }
}
