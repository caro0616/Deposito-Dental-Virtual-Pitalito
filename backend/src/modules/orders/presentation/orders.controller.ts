import {
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Body,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { OrderService } from '../application/order.service';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { CheckoutOrderDto } from './dto/checkout-order.dto';
import { ReorderResponseDto } from './dto/reorder-response.dto';

/**
 * Controlador de órdenes.
 *
 * Autenticación: se espera el header `x-user-id` en los endpoints de usuario
 * y `x-admin-id` en los endpoints de administrador.
 * Se reemplazarán por JwtAuthGuard + RolesGuard cuando el módulo auth esté completo.
 */
@Controller()
export class OrdersController {
  constructor(private readonly orderService: OrderService) {}

  private extractHeader(headers: Record<string, string>, key: string): string {
    const value = headers[key];
    if (!value) {
      throw new UnauthorizedException(`Header ${key} es requerido`);
    }
    return value;
  }

  /**
   * US-10: finalizar compra.
   * Crea la orden, decrementa inventario y vacía el carrito.
   */
  @Post('orders/checkout')
  async checkout(@Headers() headers: Record<string, string>, @Body() body: CheckoutOrderDto) {
    const userId = this.extractHeader(headers, 'x-user-id');
    return this.orderService.checkout(userId, body);
  }

  /**
   * US-10: historial de órdenes del usuario autenticado.
   * Devuelve las órdenes más recientes primero.
   */
  @Get('orders/my')
  async getMyOrders(@Headers() headers: Record<string, string>) {
    const userId = this.extractHeader(headers, 'x-user-id');
    return this.orderService.getUserOrders(userId);
  }

  /** US-24: listar todas las órdenes (admin) */
  @Get('admin/orders')
  async listAll(@Headers() headers: Record<string, string>) {
    this.extractHeader(headers, 'x-admin-id');
    return this.orderService.listAll();
  }

  /**
   * US-24: cambiar estado de una orden.
   * Mantiene historial completo de transiciones.
   */
  @Patch('admin/orders/:id/status')
  async updateStatus(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
    @Body() body: UpdateOrderStatusDto,
  ) {
    const adminId = this.extractHeader(headers, 'x-admin-id');
    return this.orderService.updateStatus(id, body.status, adminId);
  }

  /**
   * US-15: ver una orden específica
   */
  @Get('orders/:id')
  async getOrderById(@Headers() headers: Record<string, string>, @Param('id') id: string) {
    const userId = this.extractHeader(headers, 'x-user-id');
    return this.orderService.getOrderById(id, userId);
  }

  /**
   * US-14: reordenar pedido
   */
  @Post('orders/:id/reorder')
  async reorder(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
  ): Promise<ReorderResponseDto> {
    const userId = this.extractHeader(headers, 'x-user-id');
    return this.orderService.reorder(id, userId);
  }
}
