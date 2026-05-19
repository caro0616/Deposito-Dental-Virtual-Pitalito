import { NotFoundException } from '@nestjs/common';
import { Product } from '../domain/product.entity';
import { ProductAdminService } from './product-admin.service';
import { IProductRepository } from '../infrastructure/product.repository';

describe('ProductAdminService', () => {
  function createRepo(): jest.Mocked<IProductRepository> {
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

  it('create builds and stores product', async () => {
    const repo = createRepo();
    const service = new ProductAdminService(repo);

    const created = await service.create({
      name: 'Resina',
      description: 'Desc',
      price: 100,
      imageUrl: '',
      category: 'materiales',
      stock: 5,
      sku: 'R1',
      brand: '3M',
      invima: 'INV',
      materials: 'resina',
      dimensions: '1x1',
    });

    expect(created.name).toBe('Resina');
    expect(repo.save).toHaveBeenCalledTimes(1);
  });

  it('listAll and findById delegate to repository', async () => {
    const repo = createRepo();
    const service = new ProductAdminService(repo);
    const product = new Product('p1', 'Resina', '', 100, '', 'materiales', 3, true);
    repo.findAll.mockResolvedValue([product]);
    repo.findById.mockResolvedValue(product);

    expect((await service.listAll()).length).toBe(1);
    expect((await service.findById('p1'))?.id).toBe('p1');
  });

  it('update throws when product does not exist', async () => {
    const repo = createRepo();
    const service = new ProductAdminService(repo);
    repo.findById.mockResolvedValue(null);

    await expect(service.update('missing', { name: 'X' })).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('update mutates fields and saves', async () => {
    const repo = createRepo();
    const service = new ProductAdminService(repo);
    const product = new Product('p1', 'Old', 'Old', 100, '', 'materiales', 3, true);
    repo.findById.mockResolvedValue(product);

    const updated = await service.update('p1', {
      name: 'New',
      description: 'New Desc',
      price: 150,
      stock: 0,
      active: false,
    });

    expect(updated.name).toBe('New');
    expect(updated.description).toBe('New Desc');
    expect(updated.price).toBe(150);
    expect(updated.stock).toBe(0);
    expect(updated.active).toBe(false);
    expect(repo.save).toHaveBeenCalledTimes(1);
  });

  it('delete and updateStock throw when product is missing', async () => {
    const repo = createRepo();
    const service = new ProductAdminService(repo);
    repo.findById.mockResolvedValue(null);

    await expect(service.delete('missing')).rejects.toBeInstanceOf(NotFoundException);
    await expect(service.updateStock('missing', 2)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('updateStock updates stock and persists', async () => {
    const repo = createRepo();
    const service = new ProductAdminService(repo);
    const product = new Product('p1', 'Resina', '', 100, '', 'materiales', 3, true);
    repo.findById.mockResolvedValue(product);

    const updated = await service.updateStock('p1', 11);

    expect(updated.stock).toBe(11);
    expect(repo.save).toHaveBeenCalledTimes(1);
  });
});
