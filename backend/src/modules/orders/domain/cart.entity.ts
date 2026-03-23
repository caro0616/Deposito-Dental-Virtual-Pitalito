export interface CartItem {
  id: string;
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export class Cart {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public items: CartItem[] = [],
    public total: number = 0,
  ) {}

  updateItemQuantity(itemId: string, quantity: number): void {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new Error('Quantity must be a positive integer');
    }

    const itemIndex = this.items.findIndex((item) => item.id === itemId);
    if (itemIndex === -1) {
      throw new Error('Item not found in cart');
    }

    const item = this.items[itemIndex];
    const updatedItem: CartItem = {
      ...item,
      quantity,
      subtotal: item.unitPrice * quantity,
    };

    this.items[itemIndex] = updatedItem;
    this.recalculateTotal();
  }

  recalculateTotal(): void {
    this.total = this.items.reduce((sum, item) => sum + item.subtotal, 0);
  }
}
