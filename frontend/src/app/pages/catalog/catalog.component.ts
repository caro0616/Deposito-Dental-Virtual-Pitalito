

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';
import { ProductCardComponent } from '../../components/product-card/product-card.component';


@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductCardComponent],
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.scss']
})


export class CatalogComponent implements OnInit {
  ps: ProductService = inject(ProductService);
  route: ActivatedRoute = inject(ActivatedRoute);


  allProducts = signal<Product[]>([]);
  loading = signal<boolean>(true);
  searchQuery = signal<string | null>(null);

  selectedCategory  = signal<string | null>(null);
  selectedBrand     = signal<string | null>(null);
  selectedMaterials = signal<string[]>([]);
  priceMax          = signal<number>(600000);
  sortBy            = signal<string>('Más nuevo');




  private async loadProducts() {
    this.loading.set(true);
    try {
      let products: Product[];
      if (this.searchQuery()) {
        products = await (this.ps.search(this.searchQuery()!) as Promise<Product[]>);
      } else {
        products = await (this.ps.loadCatalog() as Promise<Product[]>);
      }
      this.allProducts.set(products);
    } catch (err) {
      console.error('Error loading catalog:', err);
    } finally {
      this.loading.set(false);
    }
  }

  toggleMaterial(mat: string) {
    this.selectedMaterials.update(list =>
      list.includes(mat) ? list.filter(m => m !== mat) : [...list, mat]
    );
  }

  isMaterialSelected(mat: string) { return this.selectedMaterials().includes(mat); }
  isCategorySelected(cat: string) { return this.selectedCategory() === cat; }
  isBrandSelected(brand: string)  { return this.selectedBrand() === brand; }

  selectCategory(cat: string) {
    this.selectedCategory.update(v => v === cat ? null : cat);
  }
  selectBrand(brand: string) {
    this.selectedBrand.update(v => v === brand ? null : brand);
  }


  categoryLabel(slug: string): string {
    return (this.ps.categoryLabels as Record<string, string>)[slug] || slug;
  }
  ngOnInit(): void {
    this.loadProducts();
  }

  clearFilters() {
    this.selectedCategory.set(null);
    this.selectedBrand.set(null);
    this.selectedMaterials.set([]);
    this.priceMax.set(500000);
  }
  
  // Propiedades para el template
  get categories() { return this.ps.categories; }
  get brands() { return this.ps.brands; }
  get materials() { return this.ps.materials; }
  get products() { return this.allProducts; }
  
  // Paginación
  page = signal<number>(1);
  pageSize = 9; // 3x3 grid
  get totalPages() {
    return Math.ceil(this.allProducts().length / this.pageSize) || 1;
  }
  pagedProducts() {
    const start = (this.page() - 1) * this.pageSize;
    return this.allProducts().slice(start, start + this.pageSize);
  }
  nextPage() { if (this.page() < this.totalPages) this.page.set(this.page() + 1); }
  prevPage() { if (this.page() > 1) this.page.set(this.page() - 1); }
  
  // Título de la página
  pageTitle() {
    return this.selectedCategory() ? this.categoryLabel(this.selectedCategory()!) : 'Catálogo';
  }

  get breadcrumbs() {
    const crumbs: { label: string; route: string }[] = [
      { label: 'Catálogo', route: '/catalogo' }
    ];
    if (this.selectedCategory()) {
      crumbs.push({ label: this.categoryLabel(this.selectedCategory()!), route: '' });
    }
    return crumbs;
  }
}
