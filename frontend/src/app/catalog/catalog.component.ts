import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.scss'],
})
export class CatalogComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  searchQuery = '';
  selectedCategory = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.http.get<Product[]>('http://localhost:3000/products').subscribe({
      next: (data) => {
        this.products = data;
        this.filteredProducts = data;
      },
      error: (err) => {
        console.error('Error loading products:', err);
        alert(
          'Error al cargar productos. Verifica que el backend esté ejecutándose en http://localhost:3000',
        );
      },
    });
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.http
        .get<Product[]>(
          `http://localhost:3000/products/search?query=${encodeURIComponent(this.searchQuery)}`
        )
        .subscribe({
          next: (data) => (this.filteredProducts = data),
          error: (err) => console.error('Error searching products:', err),
        });
    } else {
      this.filteredProducts = this.products;
    }
  }

  onFilterCategory(): void {
    if (this.selectedCategory) {
      this.http
        .get<Product[]>(`http://localhost:3000/products?category=${this.selectedCategory}`)
        .subscribe({
          next: (data) => (this.filteredProducts = data),
          error: (err) => console.error('Error filtering products:', err),
        });
    } else {
      this.filteredProducts = this.products;
    }
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedCategory = '';
    this.filteredProducts = this.products;
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