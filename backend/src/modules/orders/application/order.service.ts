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

    for (const item of cart.items) {
      const success = await this.productRepository.decreaseStockAtomic(
        item.productId,
        item.quantity,
      );
      if (!success) {
        this.logger.warn(
          `No se pudo decrementar stock del producto ${item.productId}`,
        );
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

  // 🔥 FIX AQUÍ
  async reorder(orderId: string, userId: string): Promise<void> {
    const order = await this.orderRepository.findById(orderId);

    if (!order || order.userId !== userId) {
      throw new NotFoundException('Orden no encontrada');
    }

    let cart = await this.cartRepository.findByUserId(userId);

    if (!cart) {
      throw new BadRequestException('Carrito no encontrado');
    }

    for (const item of order.items) {
      const product = await this.productRepository.findById(item.productId);

      if (!product || product.stock < item.quantity) {
        this.logger.warn(`Producto sin stock en reorden: ${item.name}`);
        continue;
      }

      // ✅ USAR LA ENTIDAD (NO EL REPO)
      cart.addItem(
    item.productId,
    item.name,
    item.unitPrice,
    item.quantity,
);
    }

    // ✅ GUARDAR AL FINAL
    await this.cartRepository.save(cart);
  }
}