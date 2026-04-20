import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CartBackend } from '../models/product.model';
import { AuthService } from './auth.service';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CartService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private api = `${environment.apiUrl}/cart`;

  // ── State ─────────────────────────────────────────────
  private _cart = signal<CartBackend | null>(null);
  private _loading = signal(false);

  readonly cart     = this._cart.asReadonly();
  readonly loading  = this._loading.asReadonly();
  readonly items    = computed(() => this._cart()?.items ?? []);
  readonly count    = computed(() => this.items().reduce((s, i) => s + i.quantity, 0));
  readonly subtotal = computed(() => this._cart()?.total ?? 0);
  readonly shipping = computed(() => this.items().length > 0 ? 12000 : 0);
  readonly total    = computed(() => this.subtotal() + this.shipping());

  // ── Load cart from backend ────────────────────────────
  async loadCart(): Promise<void> {
    if (!this.auth.isLoggedIn()) return;
    this._loading.set(true);
    try {
      const cart = await firstValueFrom(this.http.get<CartBackend>(this.api));
      this._cart.set(cart);
    } catch (err) {
      console.error('Error loading cart:', err);
    } finally {
      this._loading.set(false);
    }
  }

  // ── Add item ──────────────────────────────────────────
  async add(productId: string, quantity = 1): Promise<void> {
    if (!this.auth.isLoggedIn()) return;
    this._loading.set(true);
    try {
      const cart = await firstValueFrom(
        this.http.post<CartBackend>(`${this.api}/items`, { productId, quantity })
      );
      this._cart.set(cart);
    } catch (err) {
      console.error('Error adding to cart:', err);
      throw err;
    } finally {
      this._loading.set(false);
    }
  }

  // ── Update item quantity ──────────────────────────────
  async updateQty(itemId: string, quantity: number): Promise<void> {
    if (quantity < 1) { await this.remove(itemId); return; }
    this._loading.set(true);
    try {
      const cart = await firstValueFrom(
        this.http.patch<CartBackend>(`${this.api}/items/${itemId}`, { quantity })
      );
      this._cart.set(cart);
    } catch (err) {
      console.error('Error updating cart item:', err);
    } finally {
      this._loading.set(false);
    }
  }

  // ── Remove item ───────────────────────────────────────
  async remove(itemId: string): Promise<void> {
    this._loading.set(true);
    try {
      const cart = await firstValueFrom(
        this.http.delete<CartBackend>(`${this.api}/items/${itemId}`)
      );
      this._cart.set(cart);
    } catch (err) {
      console.error('Error removing cart item:', err);
    } finally {
      this._loading.set(false);
    }
  }

  // ── Clear local state (after checkout) ────────────────
  clearLocal(): void {
    this._cart.set(null);
  }
}
