import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category:
    | 'odontologia_general'
    | 'endodoncia'
    | 'ortodoncia'
    | 'periodoncia'
    | 'cirugia_oral'
    | 'protesis'
    | 'radiologia'
    | 'esterilizacion';
  stock: number;
  invimaRegistrationCode: string;
}

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-products.component.html',
  styleUrls: ['./admin-products.component.scss'],
})
export class AdminProductsComponent implements OnInit {
  products: Product[] = [];
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
        this.loading = false;
      },
      error: (err: unknown) => {
        const message = err instanceof Error ? err.message : 'Error al cargar productos';
        this.error = message;
        this.loading = false;
      },
    });
  }

  getCategoryName(category: string): string {
    const categoryNames: { [key: string]: string } = {
      odontologia_general: 'Odontología General',
      endodoncia: 'Endodoncia',
      ortodoncia: 'Ortodoncia',
      periodoncia: 'Periodoncia',
      cirugia_oral: 'Cirugía Oral',
      protesis: 'Prótesis',
      radiologia: 'Radiología',
      esterilizacion: 'Esterilización',
    };
    return categoryNames[category] || category;
  }
}