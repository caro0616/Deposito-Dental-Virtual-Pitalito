import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  stock: number;
}

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.scss'],
})
export class CatalogComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: string[] = [];
  selectedCategory = '';
  loading = false;
  error: string | null = null;

  private readonly apiUrl = 'http://localhost:3000';

  constructor(private readonly http: HttpClient) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.error = null;

    this.http.get<Product[]>(`${this.apiUrl}/products`).subscribe({
      next: (products: Product[]) => {
        this.products = products;
        this.filteredProducts = products;
        this.categories = [...new Set(products.map((p) => p.category))];
        this.loading = false;
      },
      error: () => {
        this.error = 'Error al cargar el catálogo';
        this.loading = false;
      },
    });
  }

  filterByCategory(category: string): void {
    this.selectedCategory = category;
    if (!category) {
      this.filteredProducts = this.products;
    } else {
      this.filteredProducts = this.products.filter((p) => p.category === category);
    }
  }
}
