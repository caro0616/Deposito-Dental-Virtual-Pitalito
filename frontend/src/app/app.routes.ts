import { Routes } from '@angular/router';
import { HomeComponent }          from './pages/home/home.component';
import { CatalogComponent }       from './pages/catalog/catalog.component';
import { ProductDetailComponent } from './pages/product-detail/product-detail.component';
import { CartComponent }          from './pages/cart/cart.component';
import { CheckoutComponent }      from './pages/checkout/checkout.component';
import { AuthComponent }          from './pages/auth/auth.component';
import { DiagnosticoComponent }   from './pages/diagnostico/diagnostico.component';

export const routes: Routes = [
  { path: '',              component: HomeComponent,          title: 'Inicio – Dental Edna Pitalito' },
  { path: 'catalogo',      component: CatalogComponent,       title: 'Catálogo – Dental Edna Pitalito' },
  { path: 'producto/:id',  component: ProductDetailComponent, title: 'Producto – Dental Edna Pitalito' },
  { path: 'carrito',       component: CartComponent,          title: 'Mi Carrito – Dental Edna Pitalito' },
  { path: 'checkout',      component: CheckoutComponent,      title: 'Checkout – Dental Edna Pitalito' },
  { path: 'auth',          component: AuthComponent,          title: 'Inicia sesión – Dental Edna Pitalito' },
  { path: 'diagnostico',   component: DiagnosticoComponent,   title: 'Diagnóstico API – Dental Edna Pitalito' },
  { path: '**',            redirectTo: '' }
];
