import {
  addLocalOrdersToOverview,
  mergeRecentOrders,
  mergeTopCustomers,
} from '../src/services/adminDashboardData';
import type { AdminOrder } from '../src/services/adminApi';

const order = (overrides: Partial<AdminOrder> = {}): AdminOrder => ({
  id: 'local-1',
  customerName: 'Amina Khan',
  customerEmail: 'amina@example.com',
  total: 3250,
  status: 'Pending',
  createdAt: '2026-10-03T10:00:00.000Z',
  items: [],
  ...overrides,
});

describe('admin dashboard order aggregation', () => {
  it('includes local sales, orders, and customers in the overview', () => {
    expect(addLocalOrdersToOverview({
      totalSales: 10000,
      totalOrders: 4,
      totalCustomers: 3,
      conversionRate: 2,
      revenueTrend: 5,
    }, [order()])).toEqual({
      totalSales: 13250,
      totalOrders: 5,
      totalCustomers: 4,
      conversionRate: 2,
      revenueTrend: 5,
    });
  });

  it('shows local orders by newest date with the customer name and amount', () => {
    const older = order({ id: 'remote-1', customerName: 'Remote Customer', createdAt: '2026-10-02T10:00:00.000Z' });
    expect(mergeRecentOrders([older], [order()]).map(({ customerName, total }) => ({ customerName, total }))).toEqual([
      { customerName: 'Amina Khan', total: 3250 },
      { customerName: 'Remote Customer', total: 3250 },
    ]);
  });

  it('groups local orders by email for customer totals', () => {
    const customers = mergeTopCustomers([], [
      order(),
      order({ id: 'local-2', total: 500 }),
    ]);
    expect(customers).toHaveLength(1);
    expect(customers[0]).toMatchObject({
      name: 'Amina Khan',
      email: 'amina@example.com',
      totalSpent: 3750,
      orders: 2,
    });
  });
});
