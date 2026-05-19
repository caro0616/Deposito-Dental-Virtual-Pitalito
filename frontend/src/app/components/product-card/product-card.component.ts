import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss'
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
  @Input() size: 'normal' | 'small' = 'normal';
  @Output() favoriteToggled = new EventEmitter<string>();

  productService = inject(ProductService);
  cartService = inject(CartService);
  auth = inject(AuthService);

  get imageUrl(): string {
    return this.product.imageUrl || 'assets/placeholder.png';
  }

  get stockLabel(): string {
    if (!this.product.stock || this.product.stock <= 0) return 'Agotado';
    if (this.product.stock <= 5) return `Quedan ${this.product.stock}`;
    return 'Disponible';
  }

  toggleFavorite(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.productService.toggleFavorite(this.product.id);
    this.favoriteToggled.emit(this.product.id);
  }

  async addToCart(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (this.product.stock <= 0) return;
    if (this.auth.isLoggedIn()) {
      await this.cartService.add(this.product.id);
    }
  }
}
