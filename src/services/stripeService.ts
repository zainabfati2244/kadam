import Config from 'react-native-config';
import { supabase } from '../lib/supabase';

/** This key identifies the Stripe account to the mobile SDK; it is safe to ship in the app. */
export const STRIPE_PUBLISHABLE_KEY = Config.STRIPE_PUBLISHABLE_KEY?.trim() || '';

export interface CardDetails {
  number: string;
  expMonth: string;
  expYear: string;
  cvc: string;
  name: string;
}

/**
 * Validate Card Number using Luhn Algorithm
 */
export function validateCardNumber(number: string): boolean {
  const sanitized = number.replace(/\s+/g, '');
  if (!/^\d{13,19}$/.test(sanitized)) return false;

  let sum = 0;
  let shouldDouble = false;
  for (let i = sanitized.length - 1; i >= 0; i--) {
    let digit = parseInt(sanitized.charAt(i), 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

/**
 * Detect Card Brand from card number
 */
export function detectCardBrand(number: string): string {
  const sanitized = number.replace(/\s+/g, '');
  if (/^4/.test(sanitized)) return 'Visa';
  if (/^(5[1-5]|222[1-9]|22[3-9]|2[3-6]|27[0-1]|2720)/.test(sanitized)) return 'Mastercard';
  if (/^3[47]/.test(sanitized)) return 'American Express';
  if (/^6(?:011|5[0-9]{2})/.test(sanitized)) return 'Discover';
  if (/^3(?:0[0-5]|[68])/.test(sanitized)) return 'Diners Club';
  if (/^(?:2131|1800|35)/.test(sanitized)) return 'JCB';
  return 'Card';
}

/**
 * Format Card Number with spaces (XXXX XXXX XXXX XXXX)
 */
export function formatCardNumber(text: string): string {
  const cleaned = text.replace(/\D/g, '').slice(0, 16);
  return cleaned.replace(/(.{4})/g, '$1 ').trim();
}

/**
 * Format Expiry Date (MM/YY)
 */
export function formatExpiry(text: string): string {
  const cleaned = text.replace(/\D/g, '').slice(0, 4);
  if (cleaned.length >= 3) {
    return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
  }
  return cleaned;
}

type CreatePaymentIntentInput = {
  items: Array<{ id: string; quantity: number }>;
  shippingMethod: 'prepay' | 'express';
  authToken: string;
};

type PaymentIntentResponse = {
  clientSecret: string;
  paymentIntentId: string;
};

/** Creates an intent through the server-side Edge Function. */
export async function createPaymentIntent({
  items,
  shippingMethod,
  authToken,
}: CreatePaymentIntentInput): Promise<PaymentIntentResponse> {
  if (!STRIPE_PUBLISHABLE_KEY) {
    throw new Error('Stripe is not configured. Add STRIPE_PUBLISHABLE_KEY to your .env file and rebuild the app.');
  }

  if (!authToken || !items.length) {
    throw new Error('Please sign in and add an item before paying.');
  }

  const { data, error } = await supabase.functions.invoke<PaymentIntentResponse>(
    'create-payment-intent',
    {
      body: { items, shippingMethod },
      headers: { 'x-kadam-auth': authToken },
    }
  );

  if (error) {
    const context = (error as { context?: unknown }).context;
    let status: number | undefined;
    let contextMessage: string | undefined;
    let responseMessage: string | undefined;

    if (context && typeof context === 'object') {
      const errorContext = context as {
        status?: unknown;
        message?: unknown;
        clone?: () => Response;
      };
      if (typeof errorContext.status === 'number') status = errorContext.status;
      if (typeof errorContext.message === 'string') contextMessage = errorContext.message.trim();

      if (typeof errorContext.clone === 'function') {
        try {
          const payload: unknown = await errorContext.clone.call(context).json();
          if (payload && typeof payload === 'object') {
            const body = payload as { error?: unknown; message?: unknown };
            if (typeof body.error === 'string') responseMessage = body.error.trim();
            else if (typeof body.message === 'string') responseMessage = body.message.trim();
          }
        } catch {
          // Keep the original Supabase error when the response has no JSON body.
        }
      }
    }

    const message = responseMessage || contextMessage || error.message?.trim();
    if (message) {
      throw new Error(`${message}${status ? ` (HTTP ${status})` : ''}`);
    }
    throw new Error(
      'Unable to start the Stripe payment. Please try again.'
    );
  }
  if (!data?.clientSecret || !data.paymentIntentId) {
    throw new Error('The payment server returned an invalid response.');
  }

  return data;
}
