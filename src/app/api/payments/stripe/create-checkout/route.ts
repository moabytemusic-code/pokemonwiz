import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '../../../../../lib/stripe';

export async function POST(req: NextRequest) {
  try {
    const { amount } = await req.json();

    if (!amount || amount < 1) {
      return NextResponse.json({ error: 'Minimum deposit is $1.00' }, { status: 400 });
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: 'Pokemon Wiz — Wallet Deposit' },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      }],
      metadata: { purpose: 'wallet_deposit' },
      success_url: `${req.headers.get('origin')}/admin/wallet?success=true&amount=${amount}`,
      cancel_url: `${req.headers.get('origin')}/admin/wallet?canceled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
