import { Cart } from '../domain/cart.entity';

export abstract class CartRepository {
  abstract findByUserId(userId: string): Promise<Cart | null>;
  abstract save(cart: Cart): Promise<void>;
}

export class InMemoryCartRepository extends CartRepository {
  private readonly carts = new Map<string, Cart>();

  async findByUserId(userId: string): Promise<Cart | null> {
    return this.carts.get(userId) ?? null;
  }

  async save(cart: Cart): Promise<void> {
    this.carts.set(cart.userId, cart);
  }
}
