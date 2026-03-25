import { Routes } from '@angular/router';
import { CatalogComponent } from './catalog/catalog.component.js';
import { CartComponent } from './cart/cart.component.js';
import { CheckoutComponent } from './checkout/checkout.component.js';
import { AdminOrdersComponent } from './admin-orders/admin-orders.component.js';
import { AdminProductsComponent } from './admin-products/admin-products.component.js';
import { ProductDetailComponent } from './product-detail/product-detail.component.js';

export const routes: Routes = [
  { path: 'catalog', component: CatalogComponent },
  { path: 'products/:id', component: ProductDetailComponent },
  { path: 'cart', component: CartComponent },
  { path: 'checkout', component: CheckoutComponent },
  { path: 'admin/orders', component: AdminOrdersComponent },
  { path: 'admin/products', component: AdminProductsComponent },
  { path: '', pathMatch: 'full', redirectTo: 'catalog' },
];
