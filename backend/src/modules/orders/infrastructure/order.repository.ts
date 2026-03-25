import { Order } from '../domain/order.entity';

/**
 * Injection token for the order repository.
 * Use this symbol when binding the concrete implementation in the module.
 */
export const ORDER_REPOSITORY = Symbol('IOrderRepository');

export interface IOrderRepository {
  findAll(): Promise<Order[]>;
  findById(id: string): Promise<Order | null>;
  save(order: Order): Promise<void>;
}

// ─── In-memory implementation (kept for unit tests / local dev without DB) ────

export class InMemoryOrderRepository implements IOrderRepository {
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

/**
 * @deprecated Use ORDER_REPOSITORY injection token instead.
 * Kept as abstract class so existing service constructors compile without changes.
 */
export abstract class OrderRepository implements IOrderRepository {
  abstract findAll(): Promise<Order[]>;
  abstract findById(id: string): Promise<Order | null>;
  abstract save(order: Order): Promise<void>;
}
