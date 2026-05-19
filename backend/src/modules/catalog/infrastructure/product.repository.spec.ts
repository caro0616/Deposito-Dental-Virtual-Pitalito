import { Product } from '../domain/product.entity';
import { InMemoryProductRepository } from './product.repository';

describe('InMemoryProductRepository', () => {
  it('search matches semantic tokens and category hints', async () => {
    const repo = new InMemoryProductRepository();

    await repo.save(
      new Product('p1', 'Resina Z350', 'Resina de restauracion', 100, '', 'materiales', 10, true),
    );
    await repo.save(
      new Product('p2', 'Guantes Nitrilo', 'Proteccion clinica', 50, '', 'proteccion', 12, true),
    );
    await repo.save(new Product('p3', 'Turbina Pro', 'Equipo dental', 500, '', 'equipos', 3, true));

    const materiales = await repo.search('necesito materiales para resina');
    expect(materiales[0]?.id).toBe('p1');

    const bioseguridad = await repo.search('bioseguridad nitrilo');
    expect(bioseguridad.some((x) => x.id === 'p2')).toBe(true);
  });

  it('decreaseStockAtomic returns false when stock is insufficient', async () => {
    const repo = new InMemoryProductRepository();
    await repo.save(new Product('p1', 'Resina', '', 100, '', 'materiales', 2, true));

    expect(await repo.decreaseStockAtomic('p1', 3)).toBe(false);
    expect(await repo.decreaseStockAtomic('p1', 2)).toBe(true);
  });
});
