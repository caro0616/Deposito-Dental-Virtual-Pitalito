import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { CartService } from './cart.service';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

describe('CartService', () => {
  let service: CartService;
  let httpMock: HttpTestingController;
  let auth: { isLoggedIn: jasmine.Spy };

  beforeEach(() => {
    spyOn(console, 'error').and.stub();

    auth = { isLoggedIn: jasmine.createSpy('isLoggedIn').and.returnValue(true) };

    TestBed.configureTestingModule({
      providers: [
        CartService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: auth },
      ],
    });

    service = TestBed.inject(CartService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('loadCart does nothing when user is not logged in', async () => {
    auth.isLoggedIn.and.returnValue(false);

    await service.loadCart();

    httpMock.expectNone(`${environment.apiUrl}/cart`);
    expect(service.loading()).toBeFalse();
  });

  it('loadCart loads cart and updates computed totals', async () => {
    const promise = service.loadCart();

    const req = httpMock.expectOne(`${environment.apiUrl}/cart`);
    expect(req.request.method).toBe('GET');
    req.flush({
      id: 'c1',
      userId: 'u1',
      items: [{ id: 'i1', productId: 'p1', name: 'Resina', unitPrice: 100, quantity: 2, subtotal: 200 }],
      total: 200,
    });

    await promise;
    expect(service.cart()?.id).toBe('c1');
    expect(service.count()).toBe(2);
    expect(service.subtotal()).toBe(200);
    expect(service.shipping()).toBe(12000);
    expect(service.total()).toBe(12200);
  });

  it('loadCart handles backend errors and resets loading', async () => {
    const promise = service.loadCart();

    const req = httpMock.expectOne(`${environment.apiUrl}/cart`);
    req.flush({ message: 'fail' }, { status: 500, statusText: 'Server Error' });

    await promise;
    expect(service.loading()).toBeFalse();
  });

  it('add posts item and updates cart', async () => {
    const promise = service.add('p1', 3);

    const req = httpMock.expectOne(`${environment.apiUrl}/cart/items`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ productId: 'p1', quantity: 3 });
    req.flush({ id: 'c1', userId: 'u1', items: [], total: 0 });

    await promise;
    expect(service.loading()).toBeFalse();
  });

  it('add does nothing when user is not logged in', async () => {
    auth.isLoggedIn.and.returnValue(false);

    await service.add('p1', 1);

    httpMock.expectNone(`${environment.apiUrl}/cart/items`);
    expect(service.loading()).toBeFalse();
  });

  it('add rethrows backend error', async () => {
    const promise = service.add('p1', 1);

    const req = httpMock.expectOne(`${environment.apiUrl}/cart/items`);
    req.flush({ message: 'fail' }, { status: 400, statusText: 'Bad Request' });

    await expectAsync(promise).toBeRejected();
    expect(service.loading()).toBeFalse();
  });

  it('updateQty removes item when quantity < 1', async () => {
    const removeSpy = spyOn(service, 'remove').and.resolveTo();

    await service.updateQty('i1', 0);

    expect(removeSpy).toHaveBeenCalledWith('i1');
    httpMock.expectNone(`${environment.apiUrl}/cart/items/i1`);
  });

  it('updateQty patches quantity when valid', async () => {
    const promise = service.updateQty('i1', 5);

    const req = httpMock.expectOne(`${environment.apiUrl}/cart/items/i1`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ quantity: 5 });
    req.flush({ id: 'c1', userId: 'u1', items: [], total: 0 });

    await promise;
    expect(service.loading()).toBeFalse();
  });

  it('updateQty and remove absorb backend errors', async () => {
    const updatePromise = service.updateQty('i1', 2);
    const updateReq = httpMock.expectOne(`${environment.apiUrl}/cart/items/i1`);
    updateReq.flush({}, { status: 500, statusText: 'Server Error' });
    await updatePromise;

    const removePromise = service.remove('i1');
    const removeReq = httpMock.expectOne(`${environment.apiUrl}/cart/items/i1`);
    removeReq.flush({}, { status: 500, statusText: 'Server Error' });
    await removePromise;

    expect(service.loading()).toBeFalse();
  });

  it('remove deletes item and clearLocal resets cart', async () => {
    service['\u005Fcart'].set({ id: 'c1', userId: 'u1', items: [], total: 0 });

    const promise = service.remove('i1');

    const req = httpMock.expectOne(`${environment.apiUrl}/cart/items/i1`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ id: 'c1', userId: 'u1', items: [], total: 0 });

    await promise;
    expect(service.cart()).not.toBeNull();

    service.clearLocal();
    expect(service.cart()).toBeNull();
    expect(service.shipping()).toBe(0);
  });
});
