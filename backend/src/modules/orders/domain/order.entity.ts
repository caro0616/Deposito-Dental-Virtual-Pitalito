export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface OrderStatusChange {
  from: OrderStatus | null;
  to: OrderStatus;
  changedAt: Date;
  changedBy: string; // admin user id or system
}

export class Order {
  public statusHistory: OrderStatusChange[] = [];

  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly items: OrderItem[],
    public total: number,
    public status: OrderStatus = 'pending',
    statusHistory?: OrderStatusChange[],
  ) {
    if (statusHistory) {
      this.statusHistory = statusHistory;
    } else {
      this.statusHistory.push({
        from: null,
        to: status,
        changedAt: new Date(),
        changedBy: 'system',
      });
    }
  }

  changeStatus(nextStatus: OrderStatus, changedBy: string): void {
    if (this.status === nextStatus) {
      return;
    }

    const previous = this.status;
    this.status = nextStatus;
    this.statusHistory.push({
      from: previous,
      to: nextStatus,
      changedAt: new Date(),
      changedBy,
    });
  }
}
