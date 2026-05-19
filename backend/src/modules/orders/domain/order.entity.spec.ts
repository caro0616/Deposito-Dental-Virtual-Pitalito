import { Order } from './order.entity';

describe('Order entity', () => {
  it('creates initial status history automatically', () => {
    const order = new Order('o1', 'u1', [], 0);

    expect(order.status).toBe('pending');
    expect(order.statusHistory).toHaveLength(1);
    expect(order.statusHistory[0]?.from).toBeNull();
    expect(order.statusHistory[0]?.to).toBe('pending');
  });

  it('changeStatus appends history only when status changes', () => {
    const order = new Order('o1', 'u1', [], 0);

    order.changeStatus('pending', 'admin-1');
    expect(order.statusHistory).toHaveLength(1);

    order.changeStatus('paid', 'admin-1');
    expect(order.status).toBe('paid');
    expect(order.statusHistory).toHaveLength(2);
    expect(order.statusHistory[1]?.from).toBe('pending');
    expect(order.statusHistory[1]?.to).toBe('paid');
    expect(order.statusHistory[1]?.changedBy).toBe('admin-1');
  });
});
