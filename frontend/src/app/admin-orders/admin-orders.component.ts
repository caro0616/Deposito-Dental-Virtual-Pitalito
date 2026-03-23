import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

interface OrderItem {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
}

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-orders.component.html',
  styleUrls: ['./admin-orders.component.scss'],
})
export class AdminOrdersComponent implements OnInit {
  orders: Order[] = [];
  loading = false;
  error: string | null = null;

  private readonly apiUrl = 'http://localhost:3000';

  constructor(private readonly http: HttpClient) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.error = null;

    this.http.get<Order[]>(`${this.apiUrl}/admin/orders`).subscribe({
      next: (orders: Order[]) => {
        this.orders = orders;
        this.loading = false;
      },
      error: (err: unknown) => {
        const message = err instanceof Error ? err.message : 'Error al cargar órdenes';
        this.error = message;
        this.loading = false;
      },
    });
  }

  changeStatus(order: Order, status: Order['status']): void {
    this.loading = true;
    this.error = null;

    this.http.patch<Order>(`${this.apiUrl}/admin/orders/${order.id}/status`, { status }).subscribe({
      next: () => this.loadOrders(),
      error: (err: unknown) => {
        const message = err instanceof Error ? err.message : 'Error al actualizar estado';
        this.error = message;
        this.loading = false;
      },
    });
  }

  onStatusChange(order: Order, event: Event): void {
    const target = event.target as HTMLSelectElement | null;
    if (!target) return;
    const status = target.value as Order['status'];
    this.changeStatus(order, status);
  }
}
