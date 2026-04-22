import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { CartService } from '../../services/cart.service';
import { ReorderResponse, ReorderSkippedItem } from '../../models/product.model';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {
  private orderService = inject(OrderService);
  private cartService = inject(CartService);

  orders = this.orderService.orders;
  loading = this.orderService.loading;
  reorderingOrderId: string | null = null;
  reorderResult: ReorderResponse | null = null;
  reorderError = '';

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

  ngOnInit(): void {
    this.orderService.loadMyOrders();
  }

  async reorder(orderId: string) {
    if (this.reorderingOrderId) return;

    this.reorderingOrderId = orderId;
    this.reorderResult = null;
    this.reorderError = '';

    try {
      const result = await this.orderService.reorder(orderId);
      this.reorderResult = result;
      await this.cartService.loadCart();
    } catch (err: unknown) {
      this.reorderError = this.extractErrorMessage(err);
    } finally {
      this.reorderingOrderId = null;
    }
  }

  getStatusLabel(status: string) {
    return this.orderService.getStatusLabel(status);
  }

  getStatusColor(status: string) {
    return this.orderService.getStatusColor(status);
  }

  getReorderReasonLabel(item: ReorderSkippedItem): string {
    if (item.reason === 'out_of_stock') {
      return `Stock insuficiente (disponible: ${item.availableStock ?? 0})`;
    }
    if (item.reason === 'inactive') {
      return 'Producto inactivo';
    }
    return 'Producto no encontrado';
  }

  getReorderFeedbackTitle(): string {
    if (!this.reorderResult) return '';
    return this.reorderResult.summary.skippedItems > 0
      ? 'Pedido reordenado parcialmente'
      : 'Pedido reordenado correctamente';
  }

  getReorderFeedbackDescription(): string {
    if (!this.reorderResult) return '';
    const { addedItems, skippedItems } = this.reorderResult.summary;
    if (skippedItems > 0) {
      return `Agregamos ${addedItems} producto(s) al carrito y omitimos ${skippedItems}. Puedes revisar los detalles abajo y ajustar tu compra.`;
    }
    return `Agregamos ${addedItems} producto(s) al carrito con los precios actuales.`;
  }

  private extractErrorMessage(err: unknown): string {
    if (typeof err === 'object' && err !== null) {
      const e = err as Record<string, unknown>;
      if (
        'error' in e &&
        typeof e['error'] === 'object' &&
        e['error'] !== null &&
        'message' in (e['error'] as Record<string, unknown>)
      ) {
        return ((e['error'] as Record<string, unknown>)['message'] as string);
      }
      if ('message' in e && typeof e['message'] === 'string') {
        return e['message'];
      }
    }
    return 'No fue posible reordenar el pedido.';
  }
}