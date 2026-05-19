import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AdminPanelComponent } from './admin-panel.component';
import { NotificationService } from '../../services/notification.service';
import { ProductService } from '../../services/product.service';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { Order, Product } from '../../models/product.model';

describe('AdminPanelComponent', () => {
  let fixture: ComponentFixture<AdminPanelComponent>;
  let component: AdminPanelComponent;

  let notificationService: { createNews: jasmine.Spy };
  let productService: {
    getAdminInventory: jasmine.Spy;
    updateAdminStock: jasmine.Spy;
  };
  let orderService: {
    loadAllOrders: jasmine.Spy;
    updateStatus: jasmine.Spy;
    getStatusColor: jasmine.Spy;
    getStatusLabel: jasmine.Spy;
  };

  const productFixture: Product = {
    id: 'p1',
    name: 'Resina',
    description: 'desc',
    price: 10000,
    imageUrl: '',
    category: 'materiales',
    stock: 3,
    active: true,
    sku: 'R1',
    brand: '3M',
    invima: '',
    materials: 'resina',
    dimensions: '',
  };

  function makeOrder(id: string, createdAt: string, status: Order['status']): Order {
    return {
      id,
      userId: 'u1',
      items: [],
      total: 100,
      status,
      statusHistory: [],
      createdAt,
      checkoutDetails: {
        customer: {
          fullName: 'Cliente',
          email: 'cliente@test.com',
          phone: '3000000000',
          documentType: 'cc',
          documentNumber: '123',
        },
        shipping: {
          department: 'Huila',
          city: 'Pitalito',
          addressLine1: 'Calle 1',
        },
        payment: {
          method: 'pse',
        },
      },
    };
  }

  beforeEach(async () => {
    notificationService = {
      createNews: jasmine.createSpy('createNews').and.resolveTo({ _id: 'n1' }),
    };

    productService = {
      getAdminInventory: jasmine.createSpy('getAdminInventory').and.resolveTo([productFixture]),
      updateAdminStock: jasmine
        .createSpy('updateAdminStock')
        .and.callFake(async (id: string, stock: number) => ({ ...productFixture, id, stock })),
    };

    orderService = {
      loadAllOrders: jasmine
        .createSpy('loadAllOrders')
        .and.resolveTo([
          makeOrder('o-old', '2024-01-01T00:00:00.000Z', 'pending'),
          makeOrder('o-new', '2024-02-01T00:00:00.000Z', 'paid'),
        ]),
      updateStatus: jasmine
        .createSpy('updateStatus')
        .and.callFake(async (id: string, status: Order['status']) =>
          makeOrder(id, '2024-02-01T00:00:00.000Z', status),
        ),
      getStatusColor: jasmine.createSpy('getStatusColor').and.returnValue('#000'),
      getStatusLabel: jasmine.createSpy('getStatusLabel').and.returnValue('Estado'),
    };

    await TestBed.configureTestingModule({
      imports: [AdminPanelComponent],
      providers: [
        { provide: AuthService, useValue: { isAdmin: () => true } },
        { provide: NotificationService, useValue: notificationService },
        { provide: ProductService, useValue: productService },
        { provide: OrderService, useValue: orderService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminPanelComponent);
    component = fixture.componentInstance;
  });

  it('publishNews validates empty title/content', async () => {
    component.newsTitle = '   ';
    component.newsContent = '   ';

    await component.publishNews();

    expect(notificationService.createNews).not.toHaveBeenCalled();
    expect(component.newsError()).toContain('Completa título y contenido');
  });

  it('publishNews creates news and resets form state', fakeAsync(async () => {
    component.newsTitle = 'Nueva noticia';
    component.newsContent = 'Contenido';
    component.newsUrl = '/catalogo';

    await component.publishNews();

    expect(notificationService.createNews).toHaveBeenCalledWith(
      'Nueva noticia',
      'Contenido',
      '/catalogo',
    );
    expect(component.newsTitle).toBe('');
    expect(component.newsContent).toBe('');
    expect(component.newsSuccess()).toBeTrue();

    tick(2500);
    expect(component.newsSuccess()).toBeFalse();
  }));

  it('loadInventory loads products and initializes stock drafts', async () => {
    await component.loadInventory();

    expect(productService.getAdminInventory).toHaveBeenCalledTimes(1);
    expect(component.inventory().length).toBe(1);
    expect(component.stockDraft('p1')).toBe(3);
  });

  it('saveStock updates local inventory with returned product', async () => {
    component.inventory.set([{ ...productFixture, stock: 3 }]);
    component.setStockDraft('p1', 0);

    await component.saveStock('p1');

    expect(productService.updateAdminStock).toHaveBeenCalledWith('p1', 0);
    expect(component.inventory()[0]?.stock).toBe(0);
    expect(component.stockSavingId()).toBeNull();
  });

  it('loadOrders sorts descending by createdAt and initializes status drafts', async () => {
    await component.loadOrders();

    expect(orderService.loadAllOrders).toHaveBeenCalledTimes(1);
    expect(component.allOrders()[0]?.id).toBe('o-new');
    expect(component.statusDraft('o-old')).toBe('pending');
    expect(component.statusDraft('o-new')).toBe('paid');
  });

  it('saveOrderStatus persists and updates order list', async () => {
    component.allOrders.set([makeOrder('o1', '2024-01-01T00:00:00.000Z', 'pending')]);
    component.setStatusDraft('o1', 'shipped');

    await component.saveOrderStatus('o1');

    expect(orderService.updateStatus).toHaveBeenCalledWith('o1', 'shipped');
    expect(component.allOrders()[0]?.status).toBe('shipped');
    expect(component.statusSavingId()).toBeNull();
  });
});
