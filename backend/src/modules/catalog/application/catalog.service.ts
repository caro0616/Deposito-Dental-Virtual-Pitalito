import { Injectable, NotFoundException, Inject, BadRequestException } from '@nestjs/common';
import { tmpdir } from 'os';
import { join } from 'path';
import { Product } from '../domain/product.entity';
import { Category, DENTAL_CATEGORIES } from '../domain/categories';
import { PRODUCT_REPOSITORY, IProductRepository } from '../infrastructure/product.repository';

export interface CategoryWithCount extends Category {
  productCount: number;
}

interface UploadedAttachment {
  buffer: Buffer;
  mimetype: string;
}

@Injectable()
export class CatalogService {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepo: IProductRepository,
  ) {}

  /** US-01: catálogo público de productos activos con stock disponible */
  async getPublicCatalog(): Promise<Product[]> {
    return this.productRepo.findActive();
  }

  /** US-05 / US-06: ficha técnica completa de un producto */
  async getProductById(id: string): Promise<Product> {
    const product = await this.productRepo.findById(id);
    if (!product || !product.active) {
      throw new NotFoundException(`Producto ${id} no encontrado`);
    }
    return product;
  }

  /** US-02: filtrado por categoría */
  async getByCategory(category: string): Promise<Product[]> {
    return this.productRepo.findByCategory(category);
  }

  /** US-03: búsqueda por nombre o referencia (búsquedas parciales incluidas) */
  async search(query: string): Promise<Product[]> {
    if (!query || query.trim().length === 0) {
      return this.productRepo.findActive();
    }
    return this.productRepo.search(query.trim());
  }

  /** US-04: filtros combinados — categoría y/o disponibilidad */
  async filter(params: {
    category?: string;
    available?: boolean;
    minPrice?: number;
    maxPrice?: number;
  }): Promise<Product[]> {
    let products: Product[];

    if (params.category) {
      products = await this.productRepo.findByCategory(params.category);
    } else {
      products = await this.productRepo.findActive();
    }

    if (params.available === true) {
      products = products.filter((p) => p.isAvailable());
    }

    if (params.minPrice !== undefined) {
      products = products.filter((p) => p.price >= (params.minPrice as number));
    }

    if (params.maxPrice !== undefined) {
      products = products.filter((p) => p.price <= (params.maxPrice as number));
    }

    return products;
  }

  /** US-02: categorías con conteo de productos activos */
  async getCategoriesWithCount(): Promise<CategoryWithCount[]> {
    const counts = await this.productRepo.countByCategories();
    return DENTAL_CATEGORIES.map((cat) => ({
      ...cat,
      productCount: counts[cat.slug] ?? 0,
    }));
  }

  /** Búsqueda asistida a partir de texto extraído de PDF/imagen */
  async searchFromAttachment(file: UploadedAttachment): Promise<Product[]> {
    if (!file?.buffer || file.buffer.length === 0) {
      throw new BadRequestException('Archivo vacío o no válido.');
    }

    const text = await this.extractTextFromAttachment(file);
    const normalized = this.normalizeText(text);
    if (!normalized) return [];

    const tokens = Array.from(
      new Set(
        normalized
          .split(/\s+/)
          .filter((t) => t.length >= 3)
          .slice(0, 50),
      ),
    );

    const scored = new Map<string, { product: Product; score: number }>();

    for (const token of tokens) {
      const matches = await this.productRepo.search(token);
      for (const product of matches.slice(0, 12)) {
        if (!product.isAvailable()) continue;
        const current = scored.get(product.id);
        const tokenScore = token.length >= 6 ? 2 : 1;
        if (!current) {
          scored.set(product.id, { product, score: tokenScore });
        } else {
          current.score += tokenScore;
        }
      }
    }

    return Array.from(scored.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((entry) => entry.product);
  }

  private async extractTextFromAttachment(file: UploadedAttachment): Promise<string> {
    const mime = file.mimetype || '';
    if (mime === 'application/pdf') {
      const pdfParseModule = await import('pdf-parse');
      const parser =
        (pdfParseModule as unknown as { default?: (buffer: Buffer) => Promise<{ text?: string }> })
          .default ?? (pdfParseModule as unknown as (buffer: Buffer) => Promise<{ text?: string }>);
      const parsed = await parser(file.buffer);
      return parsed?.text ?? '';
    }

    if (mime === 'image/png' || mime === 'image/jpeg') {
      const tesseract = await import('tesseract.js');
      const worker = await tesseract.createWorker('spa+eng', 1, {
        cachePath: join(tmpdir(), 'deposito-dental-tesseract-cache'),
      });
      try {
        const { data } = await worker.recognize(file.buffer);
        return data?.text ?? '';
      } finally {
        await worker.terminate();
      }
    }

    throw new BadRequestException('Tipo de archivo no soportado. Usa PNG, JPG/JPEG o PDF.');
  }

  private normalizeText(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
