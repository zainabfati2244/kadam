import { COD_DELIVERY_FEE_PKR, getDeliveryFee } from '../src/services/checkoutPricing';

describe('checkout delivery pricing', () => {
  it('charges the COD delivery fee', () => {
    expect(getDeliveryFee()).toBe(COD_DELIVERY_FEE_PKR);
    expect(COD_DELIVERY_FEE_PKR).toBe(250);
  });
});
