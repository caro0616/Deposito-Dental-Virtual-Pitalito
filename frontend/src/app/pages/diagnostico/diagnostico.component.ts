import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';

type StepStatus = 'pending' | 'running' | 'ok' | 'error' | 'skipped';

interface FlowStep {
  id: string;
  label: string;
  method: string;
  endpoint: string;
  status: StepStatus;
  ms: number;
  responsePreview: string;
  errorDetail: string;
}

@Component({
  selector: 'app-diagnostico',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './diagnostico.component.html',
  styleUrl: './diagnostico.component.scss',
})
export class DiagnosticoComponent {
  private http = inject(HttpClient);
  readonly api = environment.apiUrl;

  running = signal(false);
  finished = signal(false);
  currentStep = signal('');

  // State accumulated across steps
  private token = '';
  private userId = '';
  private productId = '';
  private cartItemId = '';
  private orderId = '';

  // Unique email for each run to avoid conflicts
  private testEmail = `test_${Date.now()}@diagnostico.com`;
  private testPassword = 'TestDiag2024!';
  private testName = 'Usuario Diagnóstico';

  steps = signal<FlowStep[]>([
    this.mkStep('health',           'Conexión al backend',                  'GET',    '/products'),
    this.mkStep('register',         'Registro de usuario nuevo',            'POST',   '/auth/register'),
    this.mkStep('login',            'Login con credenciales',               'POST',   '/auth/login'),
    this.mkStep('me',               'Verificar sesión (JWT)',               'GET',    '/auth/me'),
    this.mkStep('catalog',          'Listar catálogo público',              'GET',    '/products'),
    this.mkStep('categories',       'Obtener categorías con conteo',        'GET',    '/products/categories'),
    this.mkStep('search',           'Buscar productos (q=resina)',          'GET',    '/products/search?q=resina'),
    this.mkStep('product_detail',   'Ficha de producto por ID',             'GET',    '/products/:id'),
    this.mkStep('filter_category',  'Filtrar por categoría',                'GET',    '/products?category=instrumental'),
    this.mkStep('filter_price',     'Filtrar por rango de precio',          'GET',    '/products?minPrice=10000&maxPrice=100000'),
    this.mkStep('cart_empty',       'Ver carrito (vacío)',                   'GET',    '/cart'),
    this.mkStep('cart_add',         'Agregar producto al carrito',          'POST',   '/cart/items'),
    this.mkStep('cart_add2',        'Agregar segundo producto',             'POST',   '/cart/items'),
    this.mkStep('cart_view',        'Ver carrito (con ítems)',              'GET',    '/cart'),
    this.mkStep('cart_update',      'Modificar cantidad de ítem',           'PATCH',  '/cart/items/:itemId'),
    this.mkStep('cart_remove',      'Eliminar un ítem del carrito',         'DELETE', '/cart/items/:itemId'),
    this.mkStep('checkout',         'Checkout (crear orden)',               'POST',   '/orders/checkout'),
    this.mkStep('my_orders',        'Historial de órdenes',                 'GET',    '/orders/my'),
    this.mkStep('cart_after',       'Carrito post-checkout (vacío)',         'GET',    '/cart'),
    this.mkStep('admin_products',   'Admin: listar productos',              'GET',    '/admin/products'),
    this.mkStep('admin_orders',     'Admin: listar órdenes',                'GET',    '/admin/orders'),
  ]);

  get summary() {
    const s = this.steps();
    return {
      total: s.length,
      ok: s.filter(x => x.status === 'ok').length,
      error: s.filter(x => x.status === 'error').length,
      skipped: s.filter(x => x.status === 'skipped').length,
      pending: s.filter(x => x.status === 'pending').length,
    };
  }

  get avgMs(): number {
    const done = this.steps().filter(x => x.status === 'ok' && x.ms > 0);
    if (!done.length) return 0;
    return Math.round(done.reduce((s, x) => s + x.ms, 0) / done.length);
  }

  async runAll() {
    this.running.set(true);
    this.finished.set(false);
    this.token = '';
    this.userId = '';
    this.productId = '';
    this.cartItemId = '';
    this.orderId = '';
    this.testEmail = `test_${Date.now()}@diagnostico.com`;

    // Reset steps
    this.steps.update(steps => steps.map(s => ({
      ...s, status: 'pending' as StepStatus, ms: 0, responsePreview: '', errorDetail: '',
    })));

    const runners: Record<string, () => Promise<any>> = {
      health:          () => this.get('/products'),
      register:        () => this.post('/auth/register', { name: this.testName, email: this.testEmail, password: this.testPassword }),
      login:           () => this.post('/auth/login', { email: this.testEmail, password: this.testPassword }),
      me:              () => this.get('/auth/me'),
      catalog:         () => this.get('/products'),
      categories:      () => this.get('/products/categories'),
      search:          () => this.get('/products/search?q=resina'),
      product_detail:  () => this.get(`/products/${this.productId}`),
      filter_category: () => this.get('/products?category=instrumental'),
      filter_price:    () => this.get('/products?minPrice=10000&maxPrice=100000'),
      cart_empty:      () => this.get('/cart'),
      cart_add:        () => this.post('/cart/items', { productId: this.productId, quantity: 2 }),
      cart_add2:       () => this.addSecondProduct(),
      cart_view:       () => this.get('/cart'),
      cart_update:     () => this.patch(`/cart/items/${this.cartItemId}`, { quantity: 5 }),
      cart_remove:     () => this.removeSecondItem(),
      checkout:        () => this.post('/orders/checkout', {}),
      my_orders:       () => this.get('/orders/my'),
      cart_after:      () => this.get('/cart'),
      admin_products:  () => this.getAdmin('/admin/products'),
      admin_orders:    () => this.getAdmin('/admin/orders'),
    };

    for (const step of this.steps()) {
      this.currentStep.set(step.id);
      this.updateStep(step.id, { status: 'running' });

      const runner = runners[step.id];
      if (!runner) {
        this.updateStep(step.id, { status: 'skipped', responsePreview: 'No runner definido' });
        continue;
      }

      const t0 = performance.now();
      try {
        const res = await runner();
        const ms = Math.round(performance.now() - t0);

        // Extract state from responses
        this.extractState(step.id, res);

        const preview = this.formatPreview(res);
        this.updateStep(step.id, { status: 'ok', ms, responsePreview: preview });
      } catch (err: unknown) {
        const ms = Math.round(performance.now() - t0);
        const errMsg = err?.error?.message || err?.message || JSON.stringify(err?.error || err);
        this.updateStep(step.id, { status: 'error', ms, errorDetail: errMsg });

        // If auth fails, skip subsequent steps that require auth
        if (['register', 'login'].includes(step.id)) {
          this.skipRemaining(step.id);
          break;
        }
      }

      // Small delay for visual feedback
      await this.delay(120);
    }

    this.running.set(false);
    this.finished.set(true);
    this.currentStep.set('');
  }

  // ── HTTP helpers with auth ───────────────────────────────
  private get<T = unknown>(path: string) {
    return firstValueFrom(this.http.get<T>(`${this.api}${path}`, { headers: this.authHeaders() }));
  }
  private post<T = unknown>(path: string, body: unknown) {
    return firstValueFrom(this.http.post<T>(`${this.api}${path}`, body, { headers: this.authHeaders() }));
  }
  private patch<T = unknown>(path: string, body: unknown) {
    return firstValueFrom(this.http.patch<T>(`${this.api}${path}`, body, { headers: this.authHeaders() }));
  }
  private del<T = unknown>(path: string) {
    return firstValueFrom(this.http.delete<T>(`${this.api}${path}`, { headers: this.authHeaders() }));
  }
  private getAdmin<T = unknown>(path: string) {
    const h = this.authHeaders();
    h['x-admin-id'] = this.userId || 'admin';
    return firstValueFrom(this.http.get<T>(`${this.api}${path}`, { headers: h }));
  }

  private authHeaders(): Record<string, string> {
    const h: Record<string, string> = {};
    if (this.token) h['Authorization'] = `Bearer ${this.token}`;
    if (this.userId) h['x-user-id'] = this.userId;
    return h;
  }

  // ── State extraction ─────────────────────────────────────
  private extractState(stepId: string, res: unknown) {
    if (stepId === 'register' || stepId === 'login') {
      if (res?.token) {
        this.token = res.token;
        try {
          const payload = JSON.parse(atob(res.token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
          this.userId = payload.sub || '';
        } catch { /* ignore */ }
      }
    }
    if (stepId === 'catalog' || stepId === 'health') {
      if (Array.isArray(res) && res.length > 0) {
        this.productId = res[0].id || '';
      }
    }
    if (stepId === 'cart_add') {
      if (res?.items?.length > 0) {
        this.cartItemId = res.items[0].id || '';
      }
    }
    if (stepId === 'checkout') {
      this.orderId = res?.id || '';
    }
  }

  private async addSecondProduct(): Promise<unknown> {
    // Get a second product ID from catalog
    const products = await this.get('/products');
    const secondId = Array.isArray(products) && products.length > 1
      ? products[1].id
      : this.productId;
    return this.post('/cart/items', { productId: secondId, quantity: 1 });
  }

  private async removeSecondItem(): Promise<unknown> {
    // Get current cart and remove the last item
    const cart = await this.get('/cart');
    if (cart?.items?.length > 1) {
      const lastItem = cart.items[cart.items.length - 1];
      return this.del(`/cart/items/${lastItem.id}`);
    }
    // If only one item, just return cart
    return cart;
  }

  // ── Helpers ──────────────────────────────────────────────
  private mkStep(id: string, label: string, method: string, endpoint: string): FlowStep {
    return { id, label, method, endpoint, status: 'pending', ms: 0, responsePreview: '', errorDetail: '' };
  }

  private updateStep(id: string, patch: Partial<FlowStep>) {
    this.steps.update(steps =>
      steps.map(s => s.id === id ? { ...s, ...patch } : s)
    );
  }

  private skipRemaining(afterId: string) {
    let skip = false;
    this.steps.update(steps => steps.map(s => {
      if (s.id === afterId) { skip = true; return s; }
      if (skip && s.status === 'pending') return { ...s, status: 'skipped' as StepStatus, errorDetail: 'Saltado: paso previo falló' };
      return s;
    }));
  }

  private formatPreview(res: unknown): string {
    if (res === null || res === undefined) return '(vacío)';
    if (Array.isArray(res)) {
      const items = res.slice(0, 2).map((r: any) => r.name || r.id || JSON.stringify(r).slice(0, 60));
      return `[${res.length} items] → ${items.join(', ')}${res.length > 2 ? '…' : ''}`;
    }
    if (typeof res === 'object') {
      // Specific previews
      if (res.token) return `token: ${res.token.slice(0, 40)}…`;
      if (res.sub) return `userId: ${res.sub}, role: ${res.role}, email: ${res.email}`;
      if (res.items !== undefined && res.total !== undefined) return `${res.items?.length ?? 0} ítems, total: $${res.total?.toLocaleString()}`;
      if (res.status && res.id) return `orden: ${res.id.slice(-8)}, estado: ${res.status}, total: $${res.total?.toLocaleString()}`;
      if (res.deleted) return 'Eliminado ✓';
      const str = JSON.stringify(res);
      return str.length > 120 ? str.slice(0, 120) + '…' : str;
    }
    return String(res);
  }

  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
