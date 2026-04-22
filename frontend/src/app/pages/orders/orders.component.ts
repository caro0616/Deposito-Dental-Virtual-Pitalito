import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../services/order.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {
  private orderService = inject(OrderService);
  private cartService = inject(CartService);

  orders = this.orderService.orders;
  loading = this.orderService.loading;

  // Paginación
  page = 1;
  pageSize = 5;

  get paginatedOrders() {
    // Ordenar por fecha descendente (más reciente primero)
    const sorted = [...this.orders()].sort((a, b) => {
      const da = new Date(a.createdAt ?? a.statusHistory?.[0]?.changedAt ?? 0).getTime();
      const db = new Date(b.createdAt ?? b.statusHistory?.[0]?.changedAt ?? 0).getTime();
      return db - da;
    });
    const start = (this.page - 1) * this.pageSize;
    return sorted.slice(start, start + this.pageSize);
  }

  get totalPages() {
    return Math.ceil(this.orders().length / this.pageSize);
  }

  setPage(p: number) {
    if (p >= 1 && p <= this.totalPages) this.page = p;
  }

  isLast<T>(items: T[], item: T): boolean {
    return items[items.length - 1] === item;
  }

  ngOnInit(): void {
    this.orderService.loadMyOrders();
  }

  async reorder(orderId: string) {
    await this.orderService.reorder(orderId);
    await this.cartService.loadCart();
  }

  getStatusLabel(status: string) {
    return this.orderService.getStatusLabel(status);
  }

  getStatusColor(status: string) {
    return this.orderService.getStatusColor(status);
  }
}