import { Inject, Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { ICartRepository, CART_REPOSITORY } from '../infrastructure/cart.repository';
import { Order, OrderStatus, OrderCheckoutDetails } from '../domain/order.entity';
import { IOrderRepository, ORDER_REPOSITORY } from '../infrastructure/order.repository';
import {
  PRODUCT_REPOSITORY,
  IProductRepository,
} from '../../catalog/infrastructure/product.repository';
import { randomUUID } from 'crypto';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    @Inject(CART_REPOSITORY)
    private readonly cartRepository: ICartRepository,
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  /**
   * US-10: finalizar compra.
   * Valida stock, crea la orden, decrementa inventario y vacía el carrito.
   */
  async checkout(userId: string, checkoutDetails: OrderCheckoutDetails): Promise<Order> {
    const cart = await this.cartRepository.findByUserId(userId);
    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('El carrito está vacío');
    }

    // Validar stock para todos los ítems antes de crear la orden
    const outOfStock: string[] = [];
    for (const item of cart.items) {
      const product = await this.productRepository.findById(item.productId);
      if (!product || product.stock < item.quantity) {
        outOfStock.push(item.name);
      }
    }

    if (outOfStock.length > 0) {
      throw new BadRequestException(`Stock insuficiente para: ${outOfStock.join(', ')}`);
    }

    const order = new Order(
      randomUUID(),
      userId,
      cart.items.map((item) => ({
        productId: item.productId,
        name: item.name,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        subtotal: item.subtotal,
      })),
      cart.total,
      checkoutDetails,
      'pending',
    );

    // Decrementar stock atómicamente por cada ítem
    for (const item of cart.items) {
      const success = await this.productRepository.decreaseStockAtomic(
        item.productId,
        item.quantity,
      );
      if (!success) {
        this.logger.warn(
          `No se pudo decrementar stock del producto ${item.productId} — puede haber race condition`,
        );
      }
    }

    await this.orderRepository.save(order);

    // Vaciar carrito tras checkout exitoso
    cart.items = [];
    cart.total = 0;
    await this.cartRepository.save(cart);

    return order;
  }

  /** US-24: listar todas las órdenes (admin) */
  async listAll(): Promise<Order[]> {
    return this.orderRepository.findAll();
  }

  /**
   * US-10: historial de órdenes del usuario autenticado.
   * Devuelve las órdenes ordenadas de más reciente a más antigua.
   */
  async getUserOrders(userId: string): Promise<Order[]> {
    return this.orderRepository.findByUserId(userId);
  }

  /**
   * US-24: cambiar estado de una orden.
   * Mantiene historial completo de cambios.
   */
  async updateStatus(orderId: string, status: OrderStatus, adminId: string): Promise<Order> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundException('Orden no encontrada');
    }

    order.changeStatus(status, adminId);
    await this.orderRepository.save(order);
    return order;
  }
}
