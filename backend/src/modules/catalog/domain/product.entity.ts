export interface ProductProps {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  stock: number;
  active: boolean;
}

export class Product {
  constructor(
    public readonly id: string,
    public name: string,
    public description: string,
    public price: number,
    public imageUrl: string,
    public category: string,
    public stock: number,
    public active: boolean = true,
  ) {}

  deactivate(): void {
    this.active = false;
  }

  activate(): void {
    this.active = true;
  }

  updateStock(quantity: number): void {
    if (quantity < 0) {
      throw new Error('Stock cannot be negative');
    }
    this.stock = quantity;
  }
}
