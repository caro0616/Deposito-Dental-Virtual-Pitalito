import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { OrderService } from './order.service';
import { environment } from '../../environments/environment';

describe('OrderService', () => {
  let service: OrderService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OrderService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(OrderService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('checkout posts payload and refreshes my orders', async () => {
    const payload = {
      customer: {
        fullName: 'Cliente',
        email: 'cliente@test.com',
        phone: '3000000000',
        documentType: 'cc' as const,
        documentNumber: '123',
      },
      shipping: {
        department: 'Huila',
        city: 'Pitalito',
        addressLine1: 'Calle 1',
      },
      payment: {
        method: 'pse' as const,
      },
    };

    const promise = service.checkout(payload);

    const checkoutReq = httpMock.expectOne(`${environment.apiUrl}/orders/checkout`);
    expect(checkoutReq.request.method).toBe('POST');
    checkoutReq.flush({ id: 'o1', status: 'pending', items: [], total: 100, userId: 'u1', statusHistory: [] });

    await Promise.resolve();

    const myOrdersReq = httpMock.expectOne(`${environment.apiUrl}/orders/my`);
    expect(myOrdersReq.request.method).toBe('GET');
    myOrdersReq.flush([]);

    const order = await promise;
    expect(order.id).toBe('o1');
    expect(service.loading()).toBeFalse();
  });

  it('loadMyOrders sets internal orders list', async () => {
    const promise = service.loadMyOrders();

    const req = httpMock.expectOne(`${environment.apiUrl}/orders/my`);
    req.flush([{ id: 'o1', status: 'pending', items: [], total: 100, userId: 'u1', statusHistory: [] }]);

    await promise;
    expect(service.orders().length).toBe(1);
  });

  it('loadAllOrders and updateStatus include admin header', async () => {
    const allPromise = service.loadAllOrders();
    const allReq = httpMock.expectOne(`${environment.apiUrl}/admin/orders`);
    expect(allReq.request.headers.get('x-admin-id')).toBe('admin');
    allReq.flush([]);
    await allPromise;

    const updatePromise = service.updateStatus('o1', 'paid');
    const updateReq = httpMock.expectOne(`${environment.apiUrl}/admin/orders/o1/status`);
    expect(updateReq.request.method).toBe('PATCH');
    expect(updateReq.request.headers.get('x-admin-id')).toBe('admin');
    expect(updateReq.request.body).toEqual({ status: 'paid' });
    updateReq.flush({ id: 'o1', status: 'paid', items: [], total: 100, userId: 'u1', statusHistory: [] });

    const updated = await updatePromise;
    expect(updated.status).toBe('paid');
  });

  it('getOrderById and reorder call corresponding endpoints', async () => {
    const byIdPromise = service.getOrderById('o1');
    const byIdReq = httpMock.expectOne(`${environment.apiUrl}/orders/o1`);
    byIdReq.flush({ id: 'o1', status: 'pending', items: [], total: 100, userId: 'u1', statusHistory: [] });
    const order = await byIdPromise;
    expect(order.id).toBe('o1');

    const reorderPromise = service.reorder('o1');
    const reorderReq = httpMock.expectOne(`${environment.apiUrl}/orders/o1/reorder`);
    expect(reorderReq.request.method).toBe('POST');
    reorderReq.flush({
      addedItems: [],
      skippedItems: [],
      summary: {
        requestedItems: 0,
        addedItems: 0,
        skippedItems: 0,
        requestedUnits: 0,
        addedUnits: 0,
        skippedUnits: 0,
      },
    });

    await Promise.resolve();

    const refreshReq = httpMock.expectOne(`${environment.apiUrl}/orders/my`);
    refreshReq.flush([]);

    const reorder = await reorderPromise;
    expect(reorder.summary.addedItems).toBe(0);
  });

  it('status helpers return mapped and fallback values', () => {
    expect(service.getStatusLabel('pending')).toBe('Pendiente');
    expect(service.getStatusLabel('custom')).toBe('custom');
    expect(service.getStatusColor('paid')).toBe('#00AEEF');
    expect(service.getStatusColor('other')).toBe('#8AACBC');
  });
});
