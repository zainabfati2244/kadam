import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocalOrderById, getLocalOrders, updateLocalOrderStatus } from '../src/services/localOrderStore';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe('getLocalOrderById', () => {
  beforeEach(() => jest.resetAllMocks());

  it('returns an order with a local id from storage', async () => {
    const localOrder = {
      id: 'local-1727950000000',
      customerName: 'Amina Khan',
      total: 3250,
      status: 'Pending',
      createdAt: '2026-10-03T10:00:00.000Z',
      items: [{ name: 'Sneakers', quantity: 1, price: 3000 }],
    };
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify([localOrder]));

    await expect(getLocalOrderById('local-1727950000000')).resolves.toEqual({
      ...localOrder,
      orderNumber: 1,
    });
  });

  it('persists an updated status for a local order', async () => {
    const localOrder = {
      id: 'local-1727950000000',
      customerName: 'Amina Khan',
      total: 3250,
      status: 'Pending',
      createdAt: '2026-10-03T10:00:00.000Z',
      items: [],
    };
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify([localOrder]));

    await expect(updateLocalOrderStatus(localOrder.id, 'Confirmed')).resolves.toMatchObject({
      id: localOrder.id,
      status: 'Confirmed',
    });
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      '@kadam_testing_orders',
      JSON.stringify([{ ...localOrder, status: 'Confirmed', orderNumber: 1 }])
    );
  });

  it('numbers local orders in creation order', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify([
      { id: 'local-new', customerName: 'New Customer', createdAt: '2026-10-03T10:00:00.000Z' },
      { id: 'local-old', customerName: 'Old Customer', createdAt: '2026-10-02T10:00:00.000Z' },
    ]));

    const orders = await getLocalOrders();
    expect(orders.map((order) => [order.id, order.orderNumber])).toEqual([
      ['local-new', 2],
      ['local-old', 1],
    ]);
  });
});
