import { Component, OnInit, inject } from '@angular/core';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {
  private orderService = inject(OrderService);

  orders = this.orderService.orders;
  loading = this.orderService.loading;

  ngOnInit(): void {
    this.orderService.loadMyOrders();
  }

  async reorder(orderId: string) {
    await this.orderService.reorder(orderId);
    alert('Productos agregados al carrito 🛒');
  }

  getStatusLabel(status: string) {
    return this.orderService.getStatusLabel(status);
  }

  getStatusColor(status: string) {
    return this.orderService.getStatusColor(status);
  }
}