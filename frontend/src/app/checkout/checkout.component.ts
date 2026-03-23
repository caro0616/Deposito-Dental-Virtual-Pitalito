import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
})
export class CheckoutComponent {
  loading = false;
  error: string | null = null;
  lastOrderId: string | null = null;

  private readonly apiUrl = 'http://localhost:3000';

  constructor(private readonly http: HttpClient) {}

  finalizeOrder(): void {
    this.loading = true;
    this.error = null;

    this.http.post<{ id: string }>(`${this.apiUrl}/orders/checkout`, {}).subscribe({
      next: (order: { id: string }) => {
        this.lastOrderId = order.id;
        this.loading = false;
      },
      error: (err: unknown) => {
        const message = err instanceof Error ? err.message : 'Error al finalizar la compra';
        this.error = message;
        this.loading = false;
      },
    });
  }
}
