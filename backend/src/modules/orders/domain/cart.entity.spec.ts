import { Cart } from './cart.entity';

describe('Cart entity', () => {
  it('adds and merges items by productId', () => {
    const cart = new Cart('cart-1', 'user-1');

    cart.addItem('p1', 'Resina', 20000, 1);
    cart.addItem('p1', 'Resina', 20000, 2);

    expect(cart.items).toHaveLength(1);
    expect(cart.items[0]?.quantity).toBe(3);
    expect(cart.total).toBe(60000);
  });

  it('updates item quantity and recalculates total', () => {
    const cart = new Cart('cart-1', 'user-1');
    cart.addItem('p1', 'Resina', 10000, 1);
    cart.addItem('p2', 'Adhesivo', 5000, 2);

    const itemId = cart.items[0]?.id as string;
    cart.updateItemQuantity(itemId, 3);

    expect(cart.items[0]?.quantity).toBe(3);
    expect(cart.total).toBe(3 * 10000 + 2 * 5000);
  });

  it('removeItem throws for unknown ids', () => {
    const cart = new Cart('cart-1', 'user-1');
    expect(() => cart.removeItem('missing')).toThrow('Item not found in cart');
  });
});
