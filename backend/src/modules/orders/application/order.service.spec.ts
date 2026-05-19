import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Cart } from '../domain/cart.entity';
import { OrderCheckoutDetails } from '../domain/order.entity';
import { OrderService } from './order.service';
import { ICartRepository } from '../infrastructure/cart.repository';
import { IOrderRepository } from '../infrastructure/order.repository';
import { IProductRepository } from '../../catalog/infrastructure/product.repository';
import { MailService } from '../../../shared/mail.service';
import { UserService } from '../../users/application/user.service';

describe('OrderService', () => {
  const checkoutDetails: OrderCheckoutDetails = {
    customer: {
      fullName: 'Cliente Prueba',
      email: 'cliente@test.com',
      phone: '3000000000',
      documentType: 'cc',
      documentNumber: '123456',
    },
    shipping: {
      department: 'Huila',
      city: 'Pitalito',
      addressLine1: 'Calle 1',
      addressLine2: '',
      reference: '',
    },
    payment: {
      method: 'pse',
    },
  };

  function createOrderServiceDeps() {
    const cartRepository: jest.Mocked<ICartRepository> = {
      findByUserId: jest.fn(),
      getOrCreateByUserId: jest.fn(),
      save: jest.fn(),
    };

    const orderRepository: jest.Mocked<IOrderRepository> = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
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

    const mailService = {
      sendOrderConfirmation: jest.fn(),
      sendOrderStatusUpdate: jest.fn(),
    } as unknown as jest.Mocked<MailService>;

    const userService = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<UserService>;

    const orderModel = {
      findOne: jest.fn(() => ({
        sort: jest.fn(() => ({
          select: jest.fn(() => ({
            lean: jest.fn(() => ({
              exec: jest.fn().mockResolvedValue({ orderNumber: 7 }),
            })),
          })),
        })),
      })),
    };

    const counterModel = {
      findOneAndUpdate: jest
        .fn()
        .mockResolvedValueOnce({})
        .mockReturnValueOnce({
          lean: jest.fn(() => ({
            exec: jest.fn().mockResolvedValue({ seq: 8 }),
          })),
        }),
    };

    const service = new OrderService(
      cartRepository,
      orderRepository,
      productRepository,
      mailService,
      userService,
      counterModel as never,
      orderModel as never,
    );

    return {
      service,
      cartRepository,
      orderRepository,
      productRepository,
      mailService,
      userService,
    };
  }

  it('checkout throws when cart is empty', async () => {
    const { service, cartRepository } = createOrderServiceDeps();
    cartRepository.findByUserId.mockResolvedValue(new Cart('c1', 'u1', [], 0));

    await expect(service.checkout('u1', checkoutDetails)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('checkout throws when any product has insufficient stock', async () => {
    const { service, cartRepository, productRepository } = createOrderServiceDeps();
    const cart = new Cart('c1', 'u1', [
      {
        id: 'i1',
        productId: 'p1',
        name: 'Resina',
        unitPrice: 10,
        quantity: 3,
        subtotal: 30,
      },
    ], 30);

    cartRepository.findByUserId.mockResolvedValue(cart);
    productRepository.findById.mockResolvedValue({ stock: 1 } as never);

    await expect(service.checkout('u1', checkoutDetails)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('checkout saves order, decreases stock and clears cart', async () => {
    const {
      service,
      cartRepository,
      orderRepository,
      productRepository,
      mailService,
      userService,
    } = createOrderServiceDeps();

    const cart = new Cart('c1', 'u1', [
      {
        id: 'i1',
        productId: 'p1',
        name: 'Resina',
        unitPrice: 20,
        quantity: 2,
        subtotal: 40,
      },
    ], 40);

    cartRepository.findByUserId.mockResolvedValue(cart);
    productRepository.findById.mockResolvedValue({ stock: 10 } as never);
    productRepository.decreaseStockAtomic.mockResolvedValue(true);
    userService.findById.mockResolvedValue({ email: 'user@test.com', name: 'User' } as never);

    const created = await service.checkout('u1', checkoutDetails);

    expect(created.orderNumber).toBe(8);
    expect(orderRepository.save).toHaveBeenCalledTimes(1);
    expect(productRepository.decreaseStockAtomic).toHaveBeenCalledWith('p1', 2);
    expect(cart.items).toHaveLength(0);
    expect(cart.total).toBe(0);
    expect(mailService.sendOrderConfirmation).toHaveBeenCalledTimes(1);
  });

  it('updateStatus throws when order does not exist', async () => {
    const { service, orderRepository } = createOrderServiceDeps();
    orderRepository.findById.mockResolvedValue(null);

    await expect(service.updateStatus('o1', 'paid', 'admin')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('reorder adds available items and reports skipped items', async () => {
    const { service, orderRepository, cartRepository, productRepository } = createOrderServiceDeps();

    orderRepository.findById.mockResolvedValue({
      id: 'o1',
      userId: 'u1',
      items: [
        { productId: 'missing', name: 'No Existe', quantity: 1 },
        { productId: 'inactive', name: 'Inactivo', quantity: 1 },
        { productId: 'short', name: 'Sin Stock', quantity: 3 },
        { productId: 'ok', name: 'Valido', quantity: 2 },
      ],
    } as never);

    const cart = new Cart('c1', 'u1', [], 0);
    cartRepository.getOrCreateByUserId.mockResolvedValue(cart);

    productRepository.findById.mockImplementation(async (id: string) => {
      if (id === 'missing') return null;
      if (id === 'inactive') {
        return {
          id,
          name: 'Inactivo',
          active: false,
          stock: 10,
          price: 20,
        } as never;
      }
      if (id === 'short') {
        return {
          id,
          name: 'Sin Stock',
          active: true,
          stock: 1,
          price: 30,
        } as never;
      }
      return {
        id,
        name: 'Valido',
        active: true,
        stock: 10,
        price: 40,
      } as never;
    });

    const result = await service.reorder('o1', 'u1');

    expect(result.addedItems).toHaveLength(1);
    expect(result.skippedItems).toHaveLength(3);
    expect(result.summary.requestedItems).toBe(4);
    expect(result.summary.addedUnits).toBe(2);
    expect(result.summary.skippedUnits).toBe(5);
    expect(cart.items).toHaveLength(1);
    expect(cartRepository.save).toHaveBeenCalledWith(cart);
  });
});
