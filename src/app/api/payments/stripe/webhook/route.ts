import { NextRequest, NextResponse } from 'next/server';
import supabase from '../../../../../db';

function getStripe() {
  const Stripe = require('stripe');
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is not set');
  return new Stripe(key, { apiVersion: '2025-03-31.changelog' });
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook signature: ${err.message}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const amount = (session.amount_total || 0) / 100;

    // Record deposit
    await supabase.from('deposits').insert({
      method: 'stripe',
      amount,
      currency: 'USD',
      status: 'confirmed',
      provider_payment_id: session.id,
    });

    // Record transaction
    await supabase.from('transactions').insert({
      type: 'deposit',
      amount,
      source: 'stripe',
      reference_id: session.id,
      description: 'Stripe deposit via checkout',
    });
  }

  return NextResponse.json({ received: true });
}
