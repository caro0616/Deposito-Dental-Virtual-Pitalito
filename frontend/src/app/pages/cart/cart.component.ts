import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { CartService } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';
import { AuthService } from '../../services/auth.service';
import { OrderService } from '../../services/order.service';
import { Order } from '../../models/product.model';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductCardComponent],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent implements OnInit {
  cartService    = inject(CartService);
  productService = inject(ProductService);
  authService    = inject(AuthService);
  orderService   = inject(OrderService);
  router         = inject(Router);

  previousOrders = signal<Order[]>([]);
  checkingOut    = signal(false);
  checkoutError  = signal('');

  // Paginación
  page = signal(1);
  pageSize = 5;

  get paginatedOrders() {
    // Ordenar por fecha descendente (más reciente primero)
    const sorted = [...this.previousOrders()].sort((a, b) => {
      const da = new Date(a.createdAt ?? a.statusHistory?.[0]?.changedAt ?? 0).getTime();
      const db = new Date(b.createdAt ?? b.statusHistory?.[0]?.changedAt ?? 0).getTime();
      return db - da;
    });
    const start = (this.page() - 1) * this.pageSize;
    return sorted.slice(start, start + this.pageSize);
  }

  get totalPages() {
    return Math.ceil(this.previousOrders().length / this.pageSize);
  }

  setPage(p: number) {
    if (p >= 1 && p <= this.totalPages) this.page.set(p);
  }

  async ngOnInit() {
    if (this.authService.isLoggedIn()) {
      await this.cartService.loadCart();
      await this.orderService.loadMyOrders();
      this.previousOrders.set(this.orderService.orders());
    }
  }

  get favorites() { return this.productService.getFavorites(); }

  async checkout() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/auth']);
      return;
    }
    if (this.cartService.items().length === 0) {
      this.checkoutError.set('Agrega productos al carrito antes de continuar.');
      return;
    }
    this.router.navigate(['/checkout']);
  }

  getStatusLabel(status: string): string {
    return this.orderService.getStatusLabel(status);
  }

  getStatusColor(status: string): string {
    return this.orderService.getStatusColor(status);
  }

  formatDate(dateVal: string | Date): string {
    try {
      const d = dateVal instanceof Date ? dateVal : new Date(dateVal);
      return d.toLocaleDateString('es-CO', {
        year: 'numeric', month: 'short', day: 'numeric'
      });
    } catch { return String(dateVal); }
  }

  openOrderHistory(): void {
    this.router.navigate(['/orders']);
  }
}
