export type ProductCategory =
  | 'instrumental'
  | 'materiales'
  | 'equipos'
  | 'consumibles'
  | 'proteccion'
  | 'otros';

export class Product {
  constructor(
    public readonly id: string,
    public name: string,
    public description: string,
    public price: number,
    public imageUrl: string,
    public category: ProductCategory | string,
    public stock: number,
    public active: boolean = true,
    public sku: string = '',
    public brand: string = '',
  ) {}

  isAvailable(): boolean {
    return this.active && this.stock > 0;
  }

  updateStock(newStock: number): void {
    if (newStock < 0) {
      throw new Error('Stock cannot be negative');
    }
    this.stock = newStock;
  }

  decreaseStock(quantity: number): void {
    if (quantity <= 0) {
      throw new Error('Quantity must be positive');
    }
    if (this.stock < quantity) {
      throw new Error(`Insufficient stock: available ${this.stock}, requested ${quantity}`);
    }
    this.stock -= quantity;
  }

  activate(): void {
    this.active = true;
  }

  deactivate(): void {
    this.active = false;
  }
}
