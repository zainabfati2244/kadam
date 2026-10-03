import { adminApi } from '../src/services/adminApi';

function responseWith(payload: unknown): Response {
  return {
    ok: true,
    text: async () => JSON.stringify(payload),
  } as Response;
}

describe('adminApi', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('loads categories and brands from their documented routes', async () => {
    const fetchMock = jest.fn()
      .mockResolvedValueOnce(responseWith([{ id: 1, name: 'Running', count: 8 }]))
      .mockResolvedValueOnce(responseWith([{ id: 2, name: 'Nike', count: 5 }]));
    globalThis.fetch = fetchMock as typeof fetch;

    await expect(adminApi.getCategories('token')).resolves.toEqual([
      { id: '1', name: 'Running', count: 8, type: 'category' },
      { id: '2', name: 'Nike', count: 5, type: 'brand' },
    ]);
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      expect.stringContaining('/admin/products/categories'),
      expect.stringContaining('/admin/products/brands'),
    ]);
  });

  it('updates order status with the documented method and values', async () => {
    const fetchMock = jest.fn().mockResolvedValue(responseWith({ id: 7, status: 'processing' }));
    globalThis.fetch = fetchMock as typeof fetch;

    await expect(adminApi.updateOrderStatus('token', '7', 'Confirmed')).resolves.toMatchObject({
      id: 7,
      status: 'Confirmed',
    });
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/admin/orders/7/status'),
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({ status: 'processing' }),
      })
    );
  });
});
