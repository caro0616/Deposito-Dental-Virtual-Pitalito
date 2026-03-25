import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  stock: number;
  technicalSpecs?: Record<string, string>;
  invimaRegistry: string;
}

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss'],
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  loading = false;
  error: string | null = null;

  private readonly apiUrl = 'http://localhost:3000';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly http: HttpClient
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadProduct(id);
  }

  loadProduct(id: string): void {
    this.loading = true;
    this.http.get<Product>(`${this.apiUrl}/products/${id}`).subscribe({
      next: (product: Product) => {
        this.product = product;
        this.loading = false;
      },
      error: () => {
        this.error = 'Producto no encontrado';
        this.loading = false;
      },
    });
  }

  specEntries(): { key: string; value: string }[] {
    if (!this.product?.technicalSpecs) return [];
    return Object.entries(this.product.technicalSpecs).map(([key, value]) => ({
      key,
      value,
    }));
  }
  
  addToCart(): void {
    if (!this.product) return;

    this.http.post(`${this.apiUrl}/cart/items`, {
      productId: this.product.id,
      quantity: 1,
    }).subscribe({
      next: () => {
      sessionStorage.setItem('cartUpdated', 'true');
      alert('Producto agregado al carrito');
    },
    error: () => alert('Error al agregar al carrito'),
  });
  }
}