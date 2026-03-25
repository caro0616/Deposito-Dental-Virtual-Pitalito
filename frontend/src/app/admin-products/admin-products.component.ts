import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  stock: number;
  active: boolean;
}

interface ProductForm {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  stock: number;
  active: boolean;
}

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-products.component.html',
  styleUrls: ['./admin-products.component.scss'],
})
export class AdminProductsComponent implements OnInit {
  products: Product[] = [];
  loading = false;
  error: string | null = null;
  showForm = false;
  editingId: string | null = null;

  form: ProductForm = this.emptyForm();

  private readonly apiUrl = 'http://localhost:3000';

  constructor(private readonly http: HttpClient) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.error = null;

    this.http.get<Product[]>(`${this.apiUrl}/admin/products`).subscribe({
      next: (products: Product[]) => {
        this.products = products;
        this.loading = false;
      },
      error: () => {
        this.error = 'Error al cargar productos';
        this.loading = false;
      },
    });
  }

  openCreateForm(): void {
    this.form = this.emptyForm();
    this.editingId = null;
    this.showForm = true;
  }

  openEditForm(product: Product): void {
    this.form = {
      name: product.name,
      description: product.description,
      price: product.price,
      imageUrl: product.imageUrl,
      category: product.category,
      stock: product.stock,
      active: product.active,
    };
    this.editingId = product.id;
    this.showForm = true;
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingId = null;
  }

  saveProduct(): void {
    this.loading = true;

    if (this.editingId) {
      this.http
        .put<Product>(`${this.apiUrl}/admin/products/${this.editingId}`, this.form)
        .subscribe({
          next: () => {
            this.showForm = false;
            this.editingId = null;
            this.loadProducts();
          },
          error: () => {
            this.error = 'Error al actualizar producto';
            this.loading = false;
          },
        });
    } else {
      this.http.post<Product>(`${this.apiUrl}/admin/products`, this.form).subscribe({
        next: () => {
          this.showForm = false;
          this.loadProducts();
        },
        error: () => {
          this.error = 'Error al crear producto';
          this.loading = false;
        },
      });
    }
  }

  deleteProduct(id: string): void {
    if (!confirm('¿Estás seguro de eliminar este producto?')) {
      return;
    }

    this.http.delete(`${this.apiUrl}/admin/products/${id}`).subscribe({
      next: () => this.loadProducts(),
      error: () => {
        this.error = 'Error al eliminar producto';
      },
    });
  }

  private emptyForm(): ProductForm {
    return {
      name: '',
      description: '',
      price: 0,
      imageUrl: '',
      category: '',
      stock: 0,
      active: true,
    };
  }
}
