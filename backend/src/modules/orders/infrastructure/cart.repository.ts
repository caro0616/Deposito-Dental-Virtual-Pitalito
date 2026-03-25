import { Cart } from '../domain/cart.entity';

/**
 * Injection token for the cart repository.
 * Use this symbol when binding the concrete implementation in the module.
 */
export const CART_REPOSITORY = Symbol('ICartRepository');

export interface ICartRepository {
  findByUserId(userId: string): Promise<Cart | null>;
  save(cart: Cart): Promise<void>;
}

// ─── In-memory implementation (kept for unit tests / local dev without DB) ────

export class InMemoryCartRepository implements ICartRepository {
  private readonly carts = new Map<string, Cart>();

  async findByUserId(userId: string): Promise<Cart | null> {
    return this.carts.get(userId) ?? null;
  }

  async save(cart: Cart): Promise<void> {
    this.carts.set(cart.userId, cart);
  }
}

/**
 * @deprecated Use CART_REPOSITORY injection token instead.
 * Kept as abstract class so existing service constructors compile without changes.
 */
export abstract class CartRepository implements ICartRepository {
  abstract findByUserId(userId: string): Promise<Cart | null>;
  abstract save(cart: Cart): Promise<void>;
}
