import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { Product, getProductImages } from '../../models/product.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductCardComponent],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss'
})
export class ProductDetailComponent implements OnInit {
  ps          = inject(ProductService);
  cartService = inject(CartService);
  auth        = inject(AuthService);
  route       = inject(ActivatedRoute);
  router      = inject(Router);

  product        = signal<Product | undefined>(undefined);
  images         = signal<string[]>([]);
  selectedImg    = signal(0);
  quantity       = signal(1);
  related        = signal<Product[]>([]);
  recentlyViewed = signal<Product[]>([]);
  activeTab      = signal<'desc' | 'mat' | 'dim'>('desc');
  addedToCart     = signal(false);
  loading        = signal(true);

  async ngOnInit() {
    this.route.params.subscribe(async p => {
      const id = p['id'];
      if (!id) return;
      this.loading.set(true);
      try {
        const prod = await this.ps.getProductById(id);
        if (prod) {
          this.product.set(prod);
          this.images.set(getProductImages(prod));
          this.ps.addToRecentlyViewed(prod);
          this.related.set(this.ps.getRelated(prod));
          this.recentlyViewed.set(this.ps.getRecentlyViewed().filter(r => r.id !== prod.id));
          this.selectedImg.set(0);
          this.quantity.set(1);
        }
      } catch (err) {
        console.error('Error loading product:', err);
      } finally {
        this.loading.set(false);
      }
    });
  }

  async addToCart() {
    const prod = this.product();
    if (!prod) return;
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/auth']);
      return;
    }
    try {
      await this.cartService.add(prod.id, this.quantity());
      this.addedToCart.set(true);
      setTimeout(() => this.addedToCart.set(false), 2000);
    } catch (err) {
      console.error('Error adding to cart:', err);
    }
  }

  async buyNow() {
    const prod = this.product();
    if (!prod) return;
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/auth']);
      return;
    }
    try {
      await this.cartService.add(prod.id, this.quantity());
      this.router.navigate(['/checkout']);
    } catch (err) {
      console.error('Error en compra rápida:', err);
    }
  }

  incQty() { this.quantity.update(q => q + 1); }
  decQty() { this.quantity.update(q => Math.max(1, q - 1)); }

  toggleFavorite() {
    const prod = this.product();
    if (prod) {
      this.ps.toggleFavorite(prod.id);
      this.product.set({ ...prod, isFavorite: !prod.isFavorite });
    }
  }

  get isFav() { return this.product()?.isFavorite ?? false; }

  get categoryLabel(): string {
    const cat = this.product()?.category;
    return cat ? (this.ps.categoryLabels[cat] || cat) : '';
  }
}
