import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CheckoutPayload, Order } from '../models/product.model';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;

  private _orders = signal<Order[]>([]);
  private _loading = signal(false);

  readonly orders = this._orders.asReadonly();
  readonly loading = this._loading.asReadonly();

  // ── Checkout (crear orden desde carrito) ───────────────
  async checkout(payload: CheckoutPayload): Promise<Order> {
    this._loading.set(true);
    try {
      const order = await firstValueFrom(
        this.http.post<Order>(`${this.api}/orders/checkout`, payload)
      );
      // Refresh orders list
      await this.loadMyOrders();
      return order;
    } finally {
      this._loading.set(false);
    }
  }

  // ── Historial del usuario ─────────────────────────────
  async loadMyOrders(): Promise<void> {
    this._loading.set(true);
    try {
      const orders = await firstValueFrom(
        this.http.get<Order[]>(`${this.api}/orders/my`)
      );
      this._orders.set(orders);
    } catch (err) {
      console.error('Error loading orders:', err);
    } finally {
      this._loading.set(false);
    }
  }

  // ── Admin: listar todas ───────────────────────────────
  async loadAllOrders(): Promise<Order[]> {
    return firstValueFrom(
      this.http.get<Order[]>(`${this.api}/admin/orders`, {
        headers: { 'x-admin-id': 'admin' }
      })
    );
  }

  // ── Admin: cambiar estado ─────────────────────────────
  async updateStatus(orderId: string, status: string): Promise<Order> {
    return firstValueFrom(
      this.http.patch<Order>(`${this.api}/admin/orders/${orderId}/status`, { status }, {
        headers: { 'x-admin-id': 'admin' }
      })
    );
  }

  // ── Helper: label para status ─────────────────────────
  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending:   'Pendiente',
      paid:      'Pagado',
      shipped:   'Enviado',
      delivered: 'Entregado',
      cancelled: 'Cancelado',
    };
    return labels[status] ?? status;
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      pending:   '#F5A623',
      paid:      '#00AEEF',
      shipped:   '#7B61FF',
      delivered: '#2DB87E',
      cancelled: '#E8524A',
    };
    return colors[status] ?? '#8AACBC';
  }

  // ── Obtener una orden específica ─────────────────────
  async getOrderById(orderId: string): Promise<Order> {
    return firstValueFrom(
      this.http.get<Order>(`${this.api}/orders/${orderId}`)
    );
  }

  // ── Reordenar pedido ────────────────────────────────
  async reorder(orderId: string): Promise<void> {
    await firstValueFrom(
      this.http.post(`${this.api}/orders/${orderId}/reorder`, {})
    );

    // opcional: recargar carrito o pedidos
    await this.loadMyOrders();
  }
}