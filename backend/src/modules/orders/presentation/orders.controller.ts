import { Controller, Get, Param, Patch, Post, Body } from '@nestjs/common';
import { OrderService } from '../application/order.service';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Controller()
export class OrdersController {
  constructor(private readonly orderService: OrderService) {}

  // TODO: replace hardcoded user/admin ids with real authentication
  private readonly demoUserId = 'demo-user';
  private readonly demoAdminId = 'demo-admin';

  @Post('orders/checkout')
  async checkout() {
    const order = await this.orderService.checkout(this.demoUserId);
    return order;
  }

  @Get('admin/orders')
  async listAll() {
    return this.orderService.listAll();
  }

  @Patch('admin/orders/:id/status')
  async updateStatus(@Param('id') id: string, @Body() body: UpdateOrderStatusDto) {
    const order = await this.orderService.updateStatus(id, body.status, this.demoAdminId);
    return order;
  }
}
