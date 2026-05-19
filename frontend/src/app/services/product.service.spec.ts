import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ProductService } from './product.service';
import { environment } from '../../environments/environment';

describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [ProductService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('search sends query to API', async () => {
    const promise = service.search('resina');

    const req = httpMock.expectOne(`${environment.apiUrl}/products/search?q=resina`);
    expect(req.request.method).toBe('GET');
    req.flush([
      {
        id: 'p1',
        name: 'Resina',
        description: 'desc',
        price: 10000,
        imageUrl: '',
        category: 'materiales',
        stock: 10,
        active: true,
        sku: 'R1',
        brand: '3M',
        invima: '',
        materials: 'resina',
        dimensions: '',
      },
    ]);

    const products = await promise;
    expect(products.length).toBe(1);
    expect(products[0]?.name).toBe('Resina');
  });

  it('getAdminInventory includes admin header', async () => {
    const promise = service.getAdminInventory();

    const req = httpMock.expectOne(`${environment.apiUrl}/admin/products`);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('x-admin-id')).toBe('admin');
    req.flush([]);

    await promise;
  });

  it('updateAdminStock sends PATCH body', async () => {
    const promise = service.updateAdminStock('p1', 0);

    const req = httpMock.expectOne(`${environment.apiUrl}/admin/products/p1/stock`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ stock: 0 });
    req.flush({
      id: 'p1',
      name: 'Resina',
      description: 'desc',
      price: 10000,
      imageUrl: '',
      category: 'materiales',
      stock: 0,
      active: true,
      sku: 'R1',
      brand: '3M',
      invima: '',
      materials: 'resina',
      dimensions: '',
    });

    const product = await promise;
    expect(product.stock).toBe(0);
  });
});
