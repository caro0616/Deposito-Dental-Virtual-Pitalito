import { Product } from '../domain/product.entity';

/** Injection token for the product repository. */
export const PRODUCT_REPOSITORY = Symbol('IProductRepository');

export interface IProductRepository {
  findAll(): Promise<Product[]>;
  findActive(): Promise<Product[]>;
  findById(id: string): Promise<Product | null>;
  findByCategory(category: string): Promise<Product[]>;
  /** US-03: búsqueda de texto completo por nombre o referencia */
  search(query: string): Promise<Product[]>;
  countByCategories(): Promise<Record<string, number>>;
  save(product: Product): Promise<void>;
  delete(id: string): Promise<void>;
  decreaseStockAtomic(id: string, quantity: number): Promise<boolean>;
}

// ─── In-memory implementation (unit tests / local dev without DB) ─────────────

export class InMemoryProductRepository implements IProductRepository {
  private readonly products = new Map<string, Product>();
  private readonly categoryHints: Array<{ slug: string; terms: string[] }> = [
    { slug: 'instrumental', terms: ['instrumental', 'pinza', 'espejo', 'explorador', 'fresa'] },
    { slug: 'materiales', terms: ['material', 'materiales', 'resina', 'adhesivo', 'cemento', 'ionomero', 'composite'] },
    { slug: 'consumibles', terms: ['consumible', 'consumibles', 'endodoncia', 'gutta', 'sellador', 'canal'] },
    { slug: 'proteccion', terms: ['proteccion', 'bioseguridad', 'nitrilo', 'guante', 'tapabocas', 'mascarilla'] },
    { slug: 'equipos', terms: ['equipo', 'equipos', 'turbina', 'micromotor', 'cavitron'] },
  ];

  async findAll(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async findActive(): Promise<Product[]> {
    return Array.from(this.products.values()).filter((p) => p.active);
  }

  async findById(id: string): Promise<Product | null> {
    return this.products.get(id) ?? null;
  }

  async findByCategory(category: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter((p) => p.active && p.category === category);
  }

  async search(query: string): Promise<Product[]> {
    const normalized = this.normalize(query);
    if (!normalized) return this.findActive();

    const tokens = normalized.split(/\s+/).filter(Boolean);
    const category = this.detectCategory(normalized);

    return Array.from(this.products.values())
      .filter((p) => p.active && (!category || String(p.category) === category))
      .map((p) => {
        const haystack = this.normalize(
          [p.name, p.description, p.sku, p.brand, p.materials, p.invima, String(p.category)].join(' '),
        );
        const name = this.normalize(p.name);
        let score = 0;

        for (const token of tokens) {
          if (haystack.includes(token)) score += 2;
          if (name.includes(token)) score += 2;
        }

        if (category && String(p.category) === category) score += 2;
        return { product: p, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((x) => x.product);
  }

  private normalize(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/anestecia/g, 'anestesia')
      .trim();
  }

  private detectCategory(query: string): string | null {
    for (const hint of this.categoryHints) {
      if (hint.terms.some((term) => query.includes(term))) {
        return hint.slug;
      }
    }
    return null;
  }

  async countByCategories(): Promise<Record<string, number>> {
    const counts: Record<string, number> = {};
    const products = Array.from(this.products.values()).filter((p) => p.active);
    for (const product of products) {
      const cat = product.category as string;
      counts[cat] = (counts[cat] ?? 0) + 1;
    }
    return counts;
  }

  async save(product: Product): Promise<void> {
    this.products.set(product.id, product);
  }

  async delete(id: string): Promise<void> {
    this.products.delete(id);
  }

  async decreaseStockAtomic(id: string, quantity: number): Promise<boolean> {
    const product = this.products.get(id);
    if (!product || product.stock < quantity) return false;
    product.stock -= quantity;
    return true;
  }
}
