export interface ProductProps {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  stock: number;
  active: boolean;
  technicalSpecs: Record<string, string>;
  invimaRegistry: string;
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
    public technicalSpecs: Record<string, string> = {},
    public invimaRegistry: string,
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

  updateTechnicalSpecs(specs: Record<string, string>): void {
    this.technicalSpecs = { ...this.technicalSpecs, ...specs };
  }
}
