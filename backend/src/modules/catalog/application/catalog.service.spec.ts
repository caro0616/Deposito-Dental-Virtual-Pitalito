import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Product } from '../domain/product.entity';
import { CatalogService } from './catalog.service';
import { IProductRepository } from '../infrastructure/product.repository';

describe('CatalogService', () => {
  const activeProduct = new Product(
    'p1',
    'Resina X',
    'Resina para restauracion',
    100,
    '',
    'materiales',
    10,
    true,
  );

  const inactiveProduct = new Product('p2', 'Guantes', 'Nitrilo', 50, '', 'proteccion', 0, false);

  function createRepoMock(): jest.Mocked<IProductRepository> {
    return {
      findAll: jest.fn(),
      findActive: jest.fn(),
      findById: jest.fn(),
      findByCategory: jest.fn(),
      search: jest.fn(),
      countByCategories: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      decreaseStockAtomic: jest.fn(),
    };
  }

  it('getProductById returns active product', async () => {
    const repo = createRepoMock();
    repo.findById.mockResolvedValue(activeProduct);
    const service = new CatalogService(repo);

    const result = await service.getProductById('p1');

    expect(result.id).toBe('p1');
  });

  it('getProductById throws when product is missing or inactive', async () => {
    const repo = createRepoMock();
    const service = new CatalogService(repo);

    repo.findById.mockResolvedValueOnce(null);
    await expect(service.getProductById('missing')).rejects.toBeInstanceOf(NotFoundException);

    repo.findById.mockResolvedValueOnce(inactiveProduct);
    await expect(service.getProductById('p2')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('search returns active catalog when query is empty', async () => {
    const repo = createRepoMock();
    repo.findActive.mockResolvedValue([activeProduct]);
    const service = new CatalogService(repo);

    const result = await service.search('   ');

    expect(repo.findActive).toHaveBeenCalledTimes(1);
    expect(repo.search).not.toHaveBeenCalled();
    expect(result).toHaveLength(1);
  });

  it('filter applies available and price bounds', async () => {
    const repo = createRepoMock();
    const p1 = new Product('p1', 'Prod 1', '', 80, '', 'materiales', 2, true);
    const p2 = new Product('p2', 'Prod 2', '', 120, '', 'materiales', 0, true);
    const p3 = new Product('p3', 'Prod 3', '', 160, '', 'materiales', 5, true);
    repo.findByCategory.mockResolvedValue([p1, p2, p3]);
    const service = new CatalogService(repo);

    const result = await service.filter({
      category: 'materiales',
      available: true,
      minPrice: 70,
      maxPrice: 150,
    });

    expect(result.map((x) => x.id)).toEqual(['p1']);
  });

  it('getCategoriesWithCount maps categories with repository counts', async () => {
    const repo = createRepoMock();
    repo.countByCategories.mockResolvedValue({ materiales: 2, proteccion: 1 });
    const service = new CatalogService(repo);

    const result = await service.getCategoriesWithCount();

    const materiales = result.find((x) => x.slug === 'materiales');
    const instrumental = result.find((x) => x.slug === 'instrumental');
    expect(materiales?.productCount).toBe(2);
    expect(instrumental?.productCount).toBe(0);
  });

  it('searchFromAttachment throws for empty files', async () => {
    const repo = createRepoMock();
    const service = new CatalogService(repo);

    await expect(
      service.searchFromAttachment({
        buffer: Buffer.from(''),
        mimetype: 'application/pdf',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('searchFromAttachment scores tokens and returns top available products', async () => {
    const repo = createRepoMock();
    const service = new CatalogService(repo);

    const pA = new Product('A', 'Resina Ultra', '', 100, '', 'materiales', 4, true);
    const pB = new Product('B', 'Adhesivo Prime', '', 90, '', 'materiales', 6, true);
    const pOut = new Product('C', 'Producto sin stock', '', 80, '', 'materiales', 0, true);

    jest
      .spyOn(
        service as unknown as { extractTextFromAttachment: (f: unknown) => Promise<string> },
        'extractTextFromAttachment',
      )
      .mockResolvedValue('resina adhesivo resina');

    repo.search.mockImplementation(async (token: string) => {
      if (token.includes('resina')) return [pA, pOut];
      if (token.includes('adhesivo')) return [pB];
      return [];
    });

    const result = await service.searchFromAttachment({
      buffer: Buffer.from('ok'),
      mimetype: 'application/pdf',
    });

    expect(result.map((x) => x.id)).toEqual(['A', 'B']);
  });
});
