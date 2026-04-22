import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  forwardRef,
  Inject as NestInject,
} from '@nestjs/common';
import { ICartRepository, CART_REPOSITORY } from '../infrastructure/cart.repository';
import { Order, OrderStatus, OrderCheckoutDetails } from '../domain/order.entity';
import { IOrderRepository, ORDER_REPOSITORY } from '../infrastructure/order.repository';
import {
  PRODUCT_REPOSITORY,
  IProductRepository,
} from '../../catalog/infrastructure/product.repository';
import { randomUUID } from 'crypto';
import { MailService } from '../../../shared/mail.service';
import { UserService } from '../../users/application/user.service';
import {
  ReorderResponseDto,
  ReorderAddedItemDto,
  ReorderSkippedItemDto,
} from '../presentation/dto/reorder-response.dto';

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
    @NestInject(forwardRef(() => MailService))
    private readonly mailService: MailService,
    @NestInject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

  async checkout(userId: string, checkoutDetails: OrderCheckoutDetails): Promise<Order> {
    const cart = await this.cartRepository.findByUserId(userId);
    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('El carrito está vacío');
    }

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

    // Obtener el último orderNumber y sumar 1
    let lastOrderNumber = 0;
    const allOrders = await this.orderRepository.findAll();
    if (allOrders.length > 0) {
      lastOrderNumber = Math.max(...allOrders.map((o) => o.orderNumber || 0));
    }
    const newOrderNumber = lastOrderNumber + 1;

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
      undefined,
      newOrderNumber,
      new Date(),
    );

    for (const item of cart.items) {
      const success = await this.productRepository.decreaseStockAtomic(
        item.productId,
        item.quantity,
      );
      if (!success) {
        this.logger.warn(`No se pudo decrementar stock del producto ${item.productId}`);
      }
    }

    await this.orderRepository.save(order);

    cart.items = [];
    cart.total = 0;
    await this.cartRepository.save(cart);

    return order;
  }

  async listAll(): Promise<Order[]> {
    return this.orderRepository.findAll();
  }

  async getUserOrders(userId: string): Promise<Order[]> {
    return this.orderRepository.findByUserId(userId);
  }

  async updateStatus(orderId: string, status: OrderStatus, adminId: string): Promise<Order> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundException('Orden no encontrada');
    }

    order.changeStatus(status, adminId);
    await this.orderRepository.save(order);

    try {
      const user = await this.userService.findById(order.userId);
      if (user && user.email) {
        const subject = `Actualización de tu pedido: ${status}`;
        const text = `Hola ${user.name},\n\nEl estado de tu pedido ha cambiado a: ${status}.`;
        await this.mailService.sendOrderStatusUpdate(user.email, subject, text);
      }
    } catch (e) {
      this.logger.error('No se pudo enviar el correo', e);
    }

    return order;
  }

  async getOrderById(orderId: string, userId: string): Promise<Order> {
    const order = await this.orderRepository.findById(orderId);

    if (!order || order.userId !== userId) {
      throw new NotFoundException('Orden no encontrada');
    }

    return order;
  }

  async reorder(orderId: string, userId: string): Promise<ReorderResponseDto> {
    const order = await this.orderRepository.findById(orderId);

    if (!order || order.userId !== userId) {
      throw new NotFoundException('Orden no encontrada');
    }

    const cart = await this.cartRepository.getOrCreateByUserId(userId);
    const addedItems: ReorderAddedItemDto[] = [];
    const skippedItems: ReorderSkippedItemDto[] = [];

    for (const item of order.items) {
      const product = await this.productRepository.findById(item.productId);

      if (!product) {
        skippedItems.push({
          productId: item.productId,
          name: item.name,
          requestedQuantity: item.quantity,
          reason: 'not_found',
        });
        continue;
      }

      if (!product.active) {
        skippedItems.push({
          productId: item.productId,
          name: product.name,
          requestedQuantity: item.quantity,
          reason: 'inactive',
          availableStock: product.stock,
        });
        continue;
      }

      if (product.stock < item.quantity) {
        skippedItems.push({
          productId: item.productId,
          name: product.name,
          requestedQuantity: item.quantity,
          reason: 'out_of_stock',
          availableStock: product.stock,
        });
        continue;
      }

      cart.addItem(product.id, product.name, product.price, item.quantity);
      addedItems.push({
        productId: product.id,
        name: product.name,
        requestedQuantity: item.quantity,
        addedQuantity: item.quantity,
        unitPrice: product.price,
        lineTotal: product.price * item.quantity,
      });
    }

    await this.cartRepository.save(cart);

    const requestedUnits = order.items.reduce((sum, item) => sum + item.quantity, 0);
    const addedUnits = addedItems.reduce((sum, item) => sum + item.addedQuantity, 0);

    return {
      addedItems,
      skippedItems,
      summary: {
        requestedItems: order.items.length,
        addedItems: addedItems.length,
        skippedItems: skippedItems.length,
        requestedUnits,
        addedUnits,
        skippedUnits: requestedUnits - addedUnits,
      },
    };
  }
}
