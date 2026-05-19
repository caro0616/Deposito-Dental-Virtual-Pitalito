import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { ProductService } from '../../services/product.service';
import { OrderService } from '../../services/order.service';
import { Order, Product } from '../../models/product.model';

interface AdminStatusOption {
  value: Order['status'];
  label: string;
}

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-panel">
      <h1>Panel de Administración</h1>

      @if (!auth.isAdmin()) {
        <div class="admin-warning">
          Esta vista es solo para administradores.
        </div>
      } @else {
        <nav class="admin-nav">
          <button (click)="section.set('news')" [class.active]="section() === 'news'">Crear Noticia</button>
          <button (click)="section.set('stock')" [class.active]="section() === 'stock'">Modificar Stock</button>
          <button (click)="section.set('orders')" [class.active]="section() === 'orders'">Órdenes y Estados</button>
        </nav>

        @if (section() === 'news') {
          <section>
            <h2>Crear Noticia Global</h2>
            <form (submit)="$event.preventDefault(); publishNews()">
              <input type="text" [(ngModel)]="newsTitle" name="title" placeholder="Título" required />
              <textarea [(ngModel)]="newsContent" name="content" placeholder="Contenido" required></textarea>
              <input type="text" [(ngModel)]="newsUrl" name="url" placeholder="URL opcional (ej: /catalogo)" />
              <button type="submit" [disabled]="newsLoading()">{{ newsLoading() ? 'Publicando...' : 'Publicar' }}</button>
            </form>

            @if (newsSuccess()) {
              <div class="success">Noticia publicada para todos los usuarios.</div>
            }
            @if (newsError()) {
              <div class="error">{{ newsError() }}</div>
            }
          </section>
        }

        @if (section() === 'stock') {
          <section>
            <h2>Inventario y Stock</h2>
            <p class="hint">Aquí se muestra el inventario real que administra la tienda. Si el stock llega a 0, el producto se verá sin stock para el usuario.</p>

            <div class="toolbar">
              <input
                type="text"
                [(ngModel)]="stockSearch"
                name="stockSearch"
                placeholder="Buscar por nombre, marca, SKU o categoría"
              />
              <button type="button" (click)="loadInventory()" [disabled]="inventoryLoading()">
                {{ inventoryLoading() ? 'Actualizando...' : 'Recargar' }}
              </button>
            </div>

            @if (inventoryError()) {
              <div class="error">{{ inventoryError() }}</div>
            }

            @if (inventoryLoading()) {
              <div class="loading">Cargando inventario...</div>
            } @else {
              <div class="table-wrap">
                <table class="admin-table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Categoría</th>
                      <th>Marca</th>
                      <th>Estado</th>
                      <th>Stock</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (product of filteredInventory(); track product.id) {
                      <tr [class.row-out]="product.stock <= 0">
                        <td>
                          <strong>{{ product.name }}</strong>
                          <div class="sub">SKU: {{ product.sku || '—' }}</div>
                        </td>
                        <td>{{ product.category }}</td>
                        <td>{{ product.brand || '—' }}</td>
                        <td>
                          @if (product.stock <= 0) {
                            <span class="pill pill-out">Sin stock</span>
                          } @else {
                            <span class="pill pill-ok">Disponible</span>
                          }
                        </td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            [ngModel]="stockDraft(product.id)"
                            (ngModelChange)="setStockDraft(product.id, $event)"
                            [name]="'stock-' + product.id"
                          />
                        </td>
                        <td>
                          <button
                            type="button"
                            (click)="saveStock(product.id)"
                            [disabled]="stockSavingId() === product.id"
                          >
                            {{ stockSavingId() === product.id ? 'Guardando...' : 'Guardar' }}
                          </button>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          </section>
        }

        @if (section() === 'orders') {
          <section>
            <h2>Órdenes y Estados</h2>

            <div class="toolbar">
              <button type="button" (click)="loadOrders()" [disabled]="ordersLoading()">
                {{ ordersLoading() ? 'Actualizando...' : 'Recargar' }}
              </button>
            </div>

            @if (ordersError()) {
              <div class="error">{{ ordersError() }}</div>
            }

            @if (ordersLoading()) {
              <div class="loading">Cargando órdenes...</div>
            } @else {
              <div class="table-wrap">
                <table class="admin-table">
                  <thead>
                    <tr>
                      <th>Pedido</th>
                      <th>Cliente</th>
                      <th>Total</th>
                      <th>Estado actual</th>
                      <th>Cambiar estado</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (order of allOrders(); track order.id) {
                      <tr>
                        <td>
                          <strong>#{{ order.orderNumber ?? order.id.slice(0, 8) }}</strong>
                          <div class="sub">{{ formatDate(order.createdAt) }}</div>
                        </td>
                        <td>
                          {{ order.checkoutDetails?.customer?.fullName || '—' }}
                          <div class="sub">{{ order.checkoutDetails?.customer?.email || '' }}</div>
                        </td>
                        <td><span class="money-symbol">$</span>{{ order.total | number:'1.0-0' }}</td>
                        <td>
                          <span class="pill" [style.background]="orderService.getStatusColor(order.status)">
                            {{ orderService.getStatusLabel(order.status) }}
                          </span>
                        </td>
                        <td>
                          <select
                            [ngModel]="statusDraft(order.id)"
                            (ngModelChange)="setStatusDraft(order.id, $event)"
                            [name]="'status-' + order.id"
                          >
                            @for (option of statusOptions; track option.value) {
                              <option [ngValue]="option.value">{{ option.label }}</option>
                            }
                          </select>
                        </td>
                        <td>
                          <button
                            type="button"
                            (click)="saveOrderStatus(order.id)"
                            [disabled]="statusSavingId() === order.id"
                          >
                            {{ statusSavingId() === order.id ? 'Actualizando...' : 'Actualizar' }}
                          </button>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          </section>
        }
      }
    </div>
  `,
  styles: [`
    .admin-panel {
      max-width: 1100px;
      margin: 2rem auto;
      padding: 1.5rem;
      background: #fff;
      border-radius: 1rem;
      box-shadow: 0 2px 16px #0001;
    }

    .admin-warning {
      background: #fff7ed;
      border: 1px solid #fdba74;
      color: #9a3412;
      padding: 0.75rem 1rem;
      border-radius: 0.75rem;
      margin-top: 1rem;
    }

    .admin-nav {
      display: flex;
      gap: 0.75rem;
      margin: 1rem 0 1.25rem;
      flex-wrap: wrap;
    }

    .admin-nav button {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 999px;
      background: #f1f5f9;
      cursor: pointer;
      font-weight: 600;
    }

    .admin-nav button.active,
    .admin-nav button:hover {
      background: #0ea5e9;
      color: #fff;
    }

    section h2 {
      margin: 0.5rem 0 0.75rem;
    }

    .hint {
      color: #475569;
      margin-bottom: 0.75rem;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      max-width: 560px;
    }

    input, textarea, select {
      padding: 0.55rem 0.65rem;
      border-radius: 0.6rem;
      border: 1px solid #cbd5e1;
      font-size: 0.95rem;
    }

    textarea {
      min-height: 110px;
      resize: vertical;
    }

    button {
      border: none;
      border-radius: 0.6rem;
      padding: 0.55rem 0.9rem;
      background: #0ea5e9;
      color: #fff;
      font-weight: 600;
      cursor: pointer;
    }

    button:disabled {
      opacity: 0.65;
      cursor: not-allowed;
    }

    .toolbar {
      display: flex;
      gap: 0.65rem;
      margin-bottom: 0.9rem;
      align-items: center;
      flex-wrap: wrap;
    }

    .toolbar input {
      min-width: 320px;
      flex: 1;
    }

    .table-wrap {
      overflow-x: auto;
      border: 1px solid #e2e8f0;
      border-radius: 0.75rem;
    }

    .admin-table {
      width: 100%;
      border-collapse: collapse;
    }

    .admin-table th,
    .admin-table td {
      border-bottom: 1px solid #e2e8f0;
      text-align: left;
      vertical-align: middle;
      padding: 0.6rem;
      white-space: nowrap;
    }

    .admin-table th {
      background: #f8fafc;
      color: #0f172a;
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .sub {
      color: #64748b;
      font-size: 0.8rem;
      margin-top: 0.15rem;
    }

    .pill {
      color: #fff;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.18rem 0.55rem;
      display: inline-flex;
    }

    .pill-out {
      background: #9ca3af;
    }

    .pill-ok {
      background: #16a34a;
    }

    .row-out {
      background: #f8fafc;
      color: #64748b;
    }

    .loading {
      color: #334155;
      padding: 0.35rem 0;
    }

    .success {
      margin-top: 0.75rem;
      color: #15803d;
      font-weight: 600;
    }

    .error {
      margin-top: 0.75rem;
      color: #b91c1c;
      font-weight: 600;
    }
  `],
})
export class AdminPanelComponent implements OnInit {
  auth = inject(AuthService);
  private notificationService = inject(NotificationService);
  private productService = inject(ProductService);
  readonly orderService = inject(OrderService);

  section = signal<'news' | 'stock' | 'orders'>('news');

  newsTitle = '';
  newsContent = '';
  newsUrl = '';
  newsLoading = signal(false);
  newsSuccess = signal(false);
  newsError = signal('');

  inventory = signal<Product[]>([]);
  inventoryLoading = signal(false);
  inventoryError = signal('');
  stockSavingId = signal<string | null>(null);
  stockSearch = '';
  stockDraftMap = signal<Record<string, number>>({});

  allOrders = signal<Order[]>([]);
  ordersLoading = signal(false);
  ordersError = signal('');
  statusSavingId = signal<string | null>(null);
  statusDraftMap = signal<Record<string, Order['status']>>({});

  readonly statusOptions: AdminStatusOption[] = [
    { value: 'pending', label: 'Pendiente' },
    { value: 'paid', label: 'Pagado' },
    { value: 'shipped', label: 'En reparto' },
    { value: 'delivered', label: 'Entregado' },
    { value: 'cancelled', label: 'Cancelado' },
  ];

  filteredInventory = computed(() => {
    const query = this.stockSearch.trim().toLowerCase();
    if (!query) return this.inventory();

    return this.inventory().filter((product) =>
      [product.name, product.brand, product.sku, String(product.category)]
        .join(' ')
        .toLowerCase()
        .includes(query)
    );
  });

  ngOnInit(): void {
    if (!this.auth.isAdmin()) return;
    void this.loadInventory();
    void this.loadOrders();
  }

  async publishNews(): Promise<void> {
    this.newsError.set('');
    this.newsSuccess.set(false);

    const title = this.newsTitle.trim();
    const message = this.newsContent.trim();
    const url = this.newsUrl.trim();

    if (!title || !message) {
      this.newsError.set('Completa título y contenido para publicar la noticia.');
      return;
    }

    this.newsLoading.set(true);
    try {
      await this.notificationService.createNews(title, message, url || undefined);
      this.newsTitle = '';
      this.newsContent = '';
      this.newsUrl = '';
      this.newsSuccess.set(true);
      setTimeout(() => this.newsSuccess.set(false), 2500);
    } catch {
      this.newsError.set('No se pudo publicar la noticia. Intenta nuevamente.');
    } finally {
      this.newsLoading.set(false);
    }
  }

  async loadInventory(): Promise<void> {
    this.inventoryError.set('');
    this.inventoryLoading.set(true);
    try {
      const products = await this.productService.getAdminInventory();
      this.inventory.set(products);
      const draft: Record<string, number> = {};
      for (const p of products) {
        draft[p.id] = p.stock;
      }
      this.stockDraftMap.set(draft);
    } catch {
      this.inventoryError.set('No se pudo cargar el inventario.');
    } finally {
      this.inventoryLoading.set(false);
    }
  }

  stockDraft(productId: string): number {
    const map = this.stockDraftMap();
    return map[productId] ?? 0;
  }

  setStockDraft(productId: string, value: number): void {
    const parsed = Number.isFinite(Number(value)) ? Number(value) : 0;
    this.stockDraftMap.update((prev) => ({
      ...prev,
      [productId]: Math.max(0, Math.floor(parsed)),
    }));
  }

  async saveStock(productId: string): Promise<void> {
    const stock = this.stockDraft(productId);
    this.stockSavingId.set(productId);
    try {
      const updated = await this.productService.updateAdminStock(productId, stock);
      this.inventory.update((list) =>
        list.map((product) => (product.id === updated.id ? updated : product))
      );
    } catch {
      this.inventoryError.set('No se pudo actualizar el stock para ese producto.');
    } finally {
      this.stockSavingId.set(null);
    }
  }

  async loadOrders(): Promise<void> {
    this.ordersError.set('');
    this.ordersLoading.set(true);
    try {
      const orders = await this.orderService.loadAllOrders();
      this.allOrders.set(
        [...orders].sort((a, b) => {
          const da = new Date(a.createdAt ?? 0).getTime();
          const db = new Date(b.createdAt ?? 0).getTime();
          return db - da;
        })
      );

      const draft: Record<string, Order['status']> = {};
      for (const order of orders) {
        draft[order.id] = order.status;
      }
      this.statusDraftMap.set(draft);
    } catch {
      this.ordersError.set('No se pudieron cargar las órdenes de compra.');
    } finally {
      this.ordersLoading.set(false);
    }
  }

  statusDraft(orderId: string): Order['status'] {
    const map = this.statusDraftMap();
    return map[orderId] ?? 'pending';
  }

  setStatusDraft(orderId: string, status: Order['status']): void {
    this.statusDraftMap.update((prev) => ({ ...prev, [orderId]: status }));
  }

  async saveOrderStatus(orderId: string): Promise<void> {
    const status = this.statusDraft(orderId);
    this.statusSavingId.set(orderId);
    try {
      const updated = await this.orderService.updateStatus(orderId, status);
      this.allOrders.update((list) =>
        list.map((order) => (order.id === updated.id ? updated : order))
      );
    } catch {
      this.ordersError.set('No se pudo actualizar el estado del pedido.');
    } finally {
      this.statusSavingId.set(null);
    }
  }

  formatDate(value: string | Date | undefined): string {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleString('es-CO');
  }
}
