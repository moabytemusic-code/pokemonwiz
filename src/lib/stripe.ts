let _stripe: any = null;

export function getStripe() {
  if (!_stripe) {
    const Stripe = require('stripe');
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error('STRIPE_SECRET_KEY is not set');
    _stripe = new Stripe(key, { apiVersion: '2025-03-31.changelog' });
  }
  return _stripe;
}
