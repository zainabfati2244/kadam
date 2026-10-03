type CartLine = { id: string; quantity: number };
type PaymentIntentResponse = { id: string; client_secret: string };

// Keep this in sync with the product catalogue. A production catalogue should
// be read from the database here, never priced by the mobile client.
const PRODUCT_PRICES_PKR: Record<string, number> = {
  '1': 2800, '2': 3200, '3': 2950, '4': 3100, '5': 3500,
  '6': 3400, '7': 3600, '8': 3300, '9': 2950, '10': 2750,
  '11': 2650, '12': 2850, '13': 3200, '14': 3800, '15': 4200,
};

const SHIPPING_COSTS_PKR: Record<string, number> = { prepay: 0 };
const AUTH_API_URL = 'https://staging-ecom-admin-qge2.encr.app/auth/me';

function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { 'Content-Type': 'application/json' } });
}

Deno.serve(async (request) => {
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);

  try {
    const authToken = request.headers.get('x-kadam-auth');
    if (!authToken) return json({ error: 'Sign in is required to make a payment.' }, 401);

    // The app's existing auth service validates the custom bearer token before
    // the function is allowed to create a Stripe PaymentIntent.
    const authResponse = await fetch(AUTH_API_URL, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    if (!authResponse.ok) {
      const authError = await authResponse.json().catch(() => null) as { message?: string; error?: string } | null;
      return json({
        error: authError?.message || authError?.error || 'Your session has expired. Please sign in again.',
      }, 401);
    }
    const customer = await authResponse.json();

    const { items, shippingMethod } = await request.json() as {
      items?: CartLine[];
      shippingMethod?: string;
    };
    if (!Array.isArray(items) || items.length === 0 || items.length > 20) {
      return json({ error: 'Your cart is invalid.' }, 400);
    }
    if (!(shippingMethod in SHIPPING_COSTS_PKR)) {
      return json({ error: 'The selected shipping method is invalid.' }, 400);
    }

    const subtotal = items.reduce((total, item) => {
      const unitPrice = PRODUCT_PRICES_PKR[String(item?.id)];
      const quantity = item?.quantity;
      if (!unitPrice || !Number.isSafeInteger(quantity) || quantity < 1 || quantity > 10) {
        throw new Error('Your cart contains an invalid item.');
      }
      return total + unitPrice * quantity;
    }, 0);
    const amount = (subtotal + SHIPPING_COSTS_PKR[shippingMethod]) * 100;
    if (!Number.isSafeInteger(amount) || amount <= 0) {
      return json({ error: 'The payment amount is invalid.' }, 400);
    }

    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) throw new Error('Stripe is not configured on the payment server.');

    const form = new URLSearchParams({
      amount: String(amount),
      currency: 'pkr',
      'payment_method_types[0]': 'card',
      'metadata[customer_id]': String(customer.id || ''),
    });
    if (typeof customer.email === 'string' && customer.email.includes('@')) {
      form.set('receipt_email', customer.email);
    }
    const stripeResponse = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: form.toString(),
    });
    const stripeData = await stripeResponse.json();
    if (!stripeResponse.ok) {
      return json({ error: stripeData?.error?.message || 'Stripe could not create a payment.' }, stripeResponse.status);
    }

    const paymentIntent = stripeData as PaymentIntentResponse;
    return json({ clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to start payment.';
    return json({ error: message }, 400);
  }
});
