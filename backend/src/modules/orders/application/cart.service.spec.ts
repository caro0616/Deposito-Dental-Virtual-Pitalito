import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Product } from '../../catalog/domain/product.entity';
import { Cart } from '../domain/cart.entity';
import { CartService } from './cart.service';
import { ICartRepository } from '../infrastructure/cart.repository';
import { IProductRepository } from '../../catalog/infrastructure/product.repository';

describe('CartService', () => {
  function createDeps() {
    const cartRepository: jest.Mocked<ICartRepository> = {
      findByUserId: jest.fn(),
      getOrCreateByUserId: jest.fn(),
      save: jest.fn(),
    };

    const productRepository: jest.Mocked<IProductRepository> = {
      findAll: jest.fn(),
      findActive: jest.fn(),
      findById: jest.fn(),
      findByCategory: jest.fn(),
      search: jest.fn(),
      countByCategories: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      decreaseStockAtomic: jest.fn(),
    };

    return {
      cartRepository,
      productRepository,
      service: new CartService(cartRepository, productRepository),
    };
  }

  it('getUserCart returns existing cart', async () => {
    const { service, cartRepository } = createDeps();
    const existing = new Cart('c1', 'u1', [], 0);
    cartRepository.findByUserId.mockResolvedValue(existing);

    const result = await service.getUserCart('u1');

    expect(result).toBe(existing);
    expect(cartRepository.save).not.toHaveBeenCalled();
  });

  it('getUserCart creates cart when missing', async () => {
    const { service, cartRepository } = createDeps();
    cartRepository.findByUserId.mockResolvedValue(null);

    const result = await service.getUserCart('u1');

    expect(result.userId).toBe('u1');
    expect(result.items.length).toBe(0);
    expect(cartRepository.save).toHaveBeenCalledTimes(1);
  });

  it('addItem validates quantity and product availability', async () => {
    const { service, productRepository } = createDeps();

    await expect(service.addItem('u1', 'p1', 0)).rejects.toBeInstanceOf(BadRequestException);

    productRepository.findById.mockResolvedValue(null);
    await expect(service.addItem('u1', 'p1', 1)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('addItem throws when stock is insufficient', async () => {
    const { service, productRepository } = createDeps();
    const product = new Product('p1', 'Resina', '', 100, '', 'materiales', 1, true);
    productRepository.findById.mockResolvedValue(product);

    await expect(service.addItem('u1', 'p1', 2)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('addItem stores item in cart', async () => {
    const { service, cartRepository, productRepository } = createDeps();
    const product = new Product('p1', 'Resina', '', 100, '', 'materiales', 10, true);
    productRepository.findById.mockResolvedValue(product);
    const cart = new Cart('c1', 'u1', [], 0);
    cartRepository.findByUserId.mockResolvedValue(cart);

    const result = await service.addItem('u1', 'p1', 2);

    expect(result.items.length).toBe(1);
    expect(result.total).toBe(200);
    expect(cartRepository.save).toHaveBeenCalledTimes(1);
  });

  it('removeItem and updateItemQuantity throw when cart does not exist', async () => {
    const { service, cartRepository } = createDeps();
    cartRepository.findByUserId.mockResolvedValue(null);

    await expect(service.removeItem('u1', 'i1')).rejects.toBeInstanceOf(NotFoundException);
    await expect(service.updateItemQuantity('u1', 'i1', 2)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('updateItemQuantity validates quantity and updates cart', async () => {
    const { service, cartRepository } = createDeps();
    const cart = new Cart('c1', 'u1', [], 0);
    cart.addItem('p1', 'Resina', 100, 1);
    const itemId = cart.items[0]?.id as string;
    cartRepository.findByUserId.mockResolvedValue(cart);

    await expect(service.updateItemQuantity('u1', itemId, 0)).rejects.toBeInstanceOf(
      BadRequestException,
    );

    const updated = await service.updateItemQuantity('u1', itemId, 3);
    expect(updated.items[0]?.quantity).toBe(3);
    expect(updated.total).toBe(300);
  });
});
