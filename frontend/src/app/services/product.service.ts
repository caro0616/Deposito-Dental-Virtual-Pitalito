import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Product, FilterState, CategoryWithCount } from '../models/product.model';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/products`;

  // Local caches
  private _products = signal<Product[]>([]);
  private _recentlyViewed = signal<Product[]>([]);
  private _favorites = signal<Set<string>>(new Set());
  private _loaded = false;

  readonly products = this._products.asReadonly();

  // ── Catalog labels (para filtros en UI) ────────────────
  readonly categories = [
    'instrumental', 'materiales', 'equipos',
    'consumibles', 'proteccion', 'otros',
  ];
  readonly categoryLabels: Record<string, string> = {
    instrumental: 'Instrumental Clínico',
    materiales: 'Materiales de Restauración',
    equipos: 'Equipos Dentales',
    consumibles: 'Endodoncia y Consumibles',
    proteccion: 'Protección y Bioseguridad',
    otros: 'Ortodoncia y Otros',
  };
  readonly brands = ['3M ESPE', 'Hu-Friedy', 'Dentsply Maillefer', 'Medesy', 'Woodpecker', 'Morelli', 'Supermax', 'New Stetic'];
  readonly materials = ['Acero inoxidable', 'NiTi', 'Nitrilo', 'Resina', 'Ionómero de vidrio'];
  readonly maxPrice = 600000;

  constructor() {
    this.restoreFavorites();
  }

  // ── API calls ──────────────────────────────────────────
  async loadCatalog(): Promise<Product[]> {
    const products = await firstValueFrom(this.http.get<Product[]>(this.api));
    const enriched = products.map(p => ({ ...p, isFavorite: this._favorites().has(p.id) }));
    this._products.set(enriched);
    this._loaded = true;
    return enriched;
  }

  async search(query: string): Promise<Product[]> {
    if (!query.trim()) return this.getAll();
    const products = await firstValueFrom(
      this.http.get<Product[]>(`${this.api}/search`, { params: { q: query } })
    );
    return products.map(p => ({ ...p, isFavorite: this._favorites().has(p.id) }));
  }

  async getProductById(id: string): Promise<Product | null> {
    try {
      const product = await firstValueFrom(this.http.get<Product>(`${this.api}/${id}`));
      return { ...product, isFavorite: this._favorites().has(product.id) };
    } catch {
      return null;
    }
  }

  async getFilteredFromApi(filters: {
    category?: string;
    available?: boolean;
    minPrice?: number;
    maxPrice?: number;
  }): Promise<Product[]> {
    let params = new HttpParams();
    if (filters.category) params = params.set('category', filters.category);
    if (filters.available !== undefined) params = params.set('available', String(filters.available));
    if (filters.minPrice !== undefined) params = params.set('minPrice', String(filters.minPrice));
    if (filters.maxPrice !== undefined) params = params.set('maxPrice', String(filters.maxPrice));

    const products = await firstValueFrom(this.http.get<Product[]>(this.api, { params }));
    return products.map(p => ({ ...p, isFavorite: this._favorites().has(p.id) }));
  }

  async getCategoriesWithCount(): Promise<CategoryWithCount[]> {
    return firstValueFrom(
      this.http.get<CategoryWithCount[]>(`${this.api}/categories`)
    );
  }

  async getAdminInventory(): Promise<Product[]> {
    const products = await firstValueFrom(
      this.http.get<Product[]>(`${environment.apiUrl}/admin/products`, {
        headers: { 'x-admin-id': 'admin' }
      })
    );
    return products.map(p => ({ ...p, isFavorite: this._favorites().has(p.id) }));
  }

  async updateAdminStock(productId: string, stock: number): Promise<Product> {
    const updated = await firstValueFrom(
      this.http.patch<Product>(`${environment.apiUrl}/admin/products/${productId}/stock`, { stock }, {
        headers: { 'x-admin-id': 'admin' }
      })
    );
    return { ...updated, isFavorite: this._favorites().has(updated.id) };
  }

  async analyzeAttachment(file: File): Promise<Product[]> {
    const formData = new FormData();
    formData.append('file', file);
    const products = await firstValueFrom(
      this.http.post<Product[]>(`${this.api}/analyze-file`, formData)
    );
    return products.map(p => ({ ...p, isFavorite: this._favorites().has(p.id) }));
  }

  // ── Sync / cached access ───────────────────────────────
  getAll(): Product[] {
    if (!this._loaded) {
      this.loadCatalog(); // fire and forget for initial load
    }
    return this._products();
  }

  getById(id: string): Product | undefined {
    return this._products().find(p => p.id === id);
  }

  getFavorites(): Product[] {
    return this._products().filter(p => p.isFavorite);
  }

  getRecentlyViewed(): Product[] {
    return this._recentlyViewed();
  }

  getFiltered(filters: Partial<FilterState>): Product[] {
    return this._products().filter(p => {
      if (filters.category && p.category !== filters.category) return false;
      if (filters.brand && p.brand !== filters.brand) return false;
      if (filters.materials?.length && !filters.materials.includes(p.materials)) return false;
      if (filters.priceMin !== undefined && p.price < filters.priceMin) return false;
      if (filters.priceMax !== undefined && p.price > filters.priceMax) return false;
      return true;
    });
  }

  // ── Favorites (localStorage only) ─────────────────────
  toggleFavorite(id: string): void {
    this._favorites.update(set => {
      const next = new Set(set);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
    this._products.update(ps =>
      ps.map(p => p.id === id ? { ...p, isFavorite: !p.isFavorite } : p)
    );
    this.saveFavorites();
  }

  isFavorite(id: string): boolean {
    return this._favorites().has(id);
  }

  private saveFavorites(): void {
    localStorage.setItem('favorites', JSON.stringify([...this._favorites()]));
  }

  private restoreFavorites(): void {
    try {
      const raw = localStorage.getItem('favorites');
      if (raw) this._favorites.set(new Set(JSON.parse(raw)));
    } catch { /* ignore */ }
  }

  // ── Recently viewed ───────────────────────────────────
  addToRecentlyViewed(product: Product): void {
    this._recentlyViewed.update(list =>
      [product, ...list.filter(p => p.id !== product.id)].slice(0, 5)
    );
  }

  getRelated(product: Product): Product[] {
    return this._products()
      .filter(p => p.id !== product.id && p.category === product.category)
      .slice(0, 5);
  }
}
