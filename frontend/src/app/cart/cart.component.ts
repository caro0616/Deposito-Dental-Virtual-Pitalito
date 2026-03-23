import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

interface CartItem {
  id: string;
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

interface CartResponse {
  id: string;
  userId: string;
  total: number;
  items: CartItem[];
}

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
})
export class CartComponent implements OnInit {
  cart: CartResponse | null = null;
  loading = false;
  error: string | null = null;

  private readonly apiUrl = 'http://localhost:3000';

  constructor(private readonly http: HttpClient) {}

  ngOnInit(): void {
    // In a real app we would have an endpoint to fetch the cart
    // For now we assume it will be pre-populated on the backend side
  }

  changeQuantity(item: CartItem, delta: number): void {
    const nextQuantity = item.quantity + delta;
    if (nextQuantity <= 0) {
      return;
    }

    this.loading = true;
    this.error = null;

    this.http
      .patch<CartResponse>(`${this.apiUrl}/cart/items/${item.id}`, {
        quantity: nextQuantity,
      })
      .subscribe({
        next: (cart: CartResponse) => {
          this.cart = cart;
          this.loading = false;
        },
        error: (err: unknown) => {
          const message = err instanceof Error ? err.message : 'Error updating quantity';
          this.error = message;
          this.loading = false;
        },
      });
  }
}
