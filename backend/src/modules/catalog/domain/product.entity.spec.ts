import { Product } from './product.entity';

describe('Product entity', () => {
  it('isAvailable returns true only when active and stock > 0', () => {
    const available = new Product('1', 'Resina', '', 10000, '', 'materiales', 10, true);
    const inactive = new Product('2', 'Resina', '', 10000, '', 'materiales', 10, false);
    const out = new Product('3', 'Resina', '', 10000, '', 'materiales', 0, true);

    expect(available.isAvailable()).toBe(true);
    expect(inactive.isAvailable()).toBe(false);
    expect(out.isAvailable()).toBe(false);
  });

  it('updateStock rejects negative values', () => {
    const product = new Product('1', 'Resina', '', 10000, '', 'materiales', 10, true);
    expect(() => product.updateStock(-1)).toThrow('Stock cannot be negative');
  });

  it('decreaseStock updates stock and validates limits', () => {
    const product = new Product('1', 'Resina', '', 10000, '', 'materiales', 5, true);

    product.decreaseStock(2);
    expect(product.stock).toBe(3);

    expect(() => product.decreaseStock(0)).toThrow('Quantity must be positive');
    expect(() => product.decreaseStock(99)).toThrow(
      'Insufficient stock: available 3, requested 99',
    );
  });
});
