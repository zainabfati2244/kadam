const mockInvoke = jest.fn();

jest.mock('react-native-config', () => ({
  __esModule: true,
  default: { STRIPE_PUBLISHABLE_KEY: 'pk_test_fixture' },
}));

jest.mock('../src/lib/supabase', () => ({
  supabase: {
    functions: {
      invoke: (...args: unknown[]) => mockInvoke(...args),
    },
  },
}));

import { createPaymentIntent } from '../src/services/stripeService';

describe('createPaymentIntent error handling', () => {
  beforeEach(() => mockInvoke.mockReset());

  it('preserves Supabase network errors instead of treating them as Responses', async () => {
    mockInvoke.mockResolvedValue({
      data: null,
      error: Object.assign(new Error('Failed to send a request to the Edge Function'), {
        context: new TypeError('Network request failed'),
      }),
    });

    await expect(createPaymentIntent({
      items: [{ id: '1', quantity: 1 }],
      shippingMethod: 'prepay',
      authToken: 'test-token',
    })).rejects.toThrow('Network request failed');
  });
});
