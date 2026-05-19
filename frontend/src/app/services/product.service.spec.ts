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

  const baseProduct = {
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
  };

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
    req.flush([baseProduct]);

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
    req.flush({ ...baseProduct, stock: 0 });

    const product = await promise;
    expect(product.stock).toBe(0);
  });

  it('loadCatalog caches products and getAll/getById/getFavorites reflect state', async () => {
    const loadPromise = service.loadCatalog();
    const req = httpMock.expectOne(`${environment.apiUrl}/products`);
    req.flush([{ ...baseProduct, isFavorite: false }, { ...baseProduct, id: 'p2', category: 'equipos' }]);
    await loadPromise;

    const all = service.getAll();
    expect(all.length).toBe(2);
    expect(service.getById('p1')?.name).toBe('Resina');

    service.toggleFavorite('p1');
    expect(service.isFavorite('p1')).toBeTrue();
    expect(service.getFavorites().map((x) => x.id)).toEqual(['p1']);
  });

  it('search with empty query returns current cached list and no request', async () => {
    const loadPromise = service.loadCatalog();
    const loadReq = httpMock.expectOne(`${environment.apiUrl}/products`);
    loadReq.flush([baseProduct]);
    await loadPromise;

    const result = await service.search('   ');
    httpMock.expectNone(`${environment.apiUrl}/products/search?q=`);
    expect(result.length).toBe(1);
  });

  it('getProductById returns null on backend error', async () => {
    const promise = service.getProductById('missing');
    const req = httpMock.expectOne(`${environment.apiUrl}/products/missing`);
    req.flush({}, { status: 404, statusText: 'Not Found' });

    const result = await promise;
    expect(result).toBeNull();
  });

  it('getFilteredFromApi sends all params and returns enriched products', async () => {
    const promise = service.getFilteredFromApi({
      category: 'materiales',
      available: true,
      minPrice: 100,
      maxPrice: 200,
    });

    const req = httpMock.expectOne((request) => request.url === `${environment.apiUrl}/products`);
    expect(req.request.params.get('category')).toBe('materiales');
    expect(req.request.params.get('available')).toBe('true');
    expect(req.request.params.get('minPrice')).toBe('100');
    expect(req.request.params.get('maxPrice')).toBe('200');
    req.flush([baseProduct]);

    const result = await promise;
    expect(result.length).toBe(1);
  });

  it('getCategoriesWithCount hits categories endpoint', async () => {
    const promise = service.getCategoriesWithCount();

    const req = httpMock.expectOne(`${environment.apiUrl}/products/categories`);
    expect(req.request.method).toBe('GET');
    req.flush([
      {
        id: 'c1',
        name: 'Materiales',
        slug: 'materiales',
        icon: 'icon',
        description: 'desc',
        productCount: 2,
      },
    ]);

    const categories = await promise;
    expect(categories[0]?.slug).toBe('materiales');
  });

  it('analyzeAttachment posts form-data to backend', async () => {
    const file = new File(['hello'], 'test.txt', { type: 'text/plain' });
    const promise = service.analyzeAttachment(file);

    const req = httpMock.expectOne(`${environment.apiUrl}/products/analyze-file`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof FormData).toBeTrue();
    req.flush([baseProduct]);

    const result = await promise;
    expect(result.length).toBe(1);
  });

  it('getFiltered, recently viewed and related helpers work as expected', async () => {
    const loadPromise = service.loadCatalog();
    const req = httpMock.expectOne(`${environment.apiUrl}/products`);
    req.flush([
      baseProduct,
      { ...baseProduct, id: 'p2', brand: 'Hu-Friedy', materials: 'NiTi', category: 'equipos', price: 30000 },
      { ...baseProduct, id: 'p3', category: 'materiales', price: 9000 },
    ]);
    await loadPromise;

    const filtered = service.getFiltered({
      category: 'materiales',
      brand: '3M',
      materials: ['resina'],
      priceMin: 9000,
      priceMax: 11000,
    });
    expect(filtered.map((x) => x.id)).toEqual(['p1', 'p3']);

    service.addToRecentlyViewed({ ...baseProduct, id: 'p1' });
    service.addToRecentlyViewed({ ...baseProduct, id: 'p2' });
    service.addToRecentlyViewed({ ...baseProduct, id: 'p1' });
    expect(service.getRecentlyViewed().map((x) => x.id)).toEqual(['p1', 'p2']);

    const related = service.getRelated({ ...baseProduct, id: 'p1' });
    expect(related.every((x) => x.category === 'materiales' && x.id !== 'p1')).toBeTrue();
  });

  it('toggleFavorite handles add and remove branches', async () => {
    const loadPromise = service.loadCatalog();
    const req = httpMock.expectOne(`${environment.apiUrl}/products`);
    req.flush([baseProduct]);
    await loadPromise;

    service.toggleFavorite('p1');
    expect(service.isFavorite('p1')).toBeTrue();

    service.toggleFavorite('p1');
    expect(service.isFavorite('p1')).toBeFalse();
  });

  it('getFilteredFromApi works with empty filters object', async () => {
    const promise = service.getFilteredFromApi({});

    const req = httpMock.expectOne((request) => request.url === `${environment.apiUrl}/products`);
    expect(req.request.params.keys().length).toBe(0);
    req.flush([baseProduct]);

    const result = await promise;
    expect(result.length).toBe(1);
  });

  it('getFiltered excludes products by each guard branch', async () => {
    const loadPromise = service.loadCatalog();
    const req = httpMock.expectOne(`${environment.apiUrl}/products`);
    req.flush([
      { ...baseProduct, id: 'p1', brand: '3M', materials: 'resina', price: 10000, category: 'materiales' },
      { ...baseProduct, id: 'p2', brand: 'Hu-Friedy', materials: 'NiTi', price: 5000, category: 'equipos' },
    ]);
    await loadPromise;

    expect(service.getFiltered({ brand: 'NoExiste' }).length).toBe(0);
    expect(service.getFiltered({ materials: ['NoExiste'] }).length).toBe(0);
    expect(service.getFiltered({ priceMin: 20000 }).length).toBe(0);
    expect(service.getFiltered({ priceMax: 1000 }).length).toBe(0);
  });

  it('getAll triggers lazy load when catalog is not loaded', () => {
    const loadSpy = spyOn(service, 'loadCatalog').and.resolveTo([]);

    const all = service.getAll();

    expect(loadSpy).toHaveBeenCalledTimes(1);
    expect(all).toEqual([]);
  });

  it('restoreFavorites tolerates malformed localStorage JSON', () => {
    localStorage.setItem('favorites', '{invalid');

    const call = () =>
      (
        service as never as {
          restoreFavorites: () => void;
        }
      ).restoreFavorites();

    expect(call).not.toThrow();
  });
});
