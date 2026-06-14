import { NextRequest, NextResponse } from 'next/server';
import supabase from '../../../../db';

export async function POST() {
  const amount = 1000;

  // Record deposit
  await supabase.from('deposits').insert({
    method: 'test_funds',
    amount,
    currency: 'USD',
    status: 'confirmed',
  });

  // Record transaction
  await supabase.from('transactions').insert({
    type: 'deposit',
    amount,
    source: 'test',
    description: '🧪 Test funds added for PoC',
  });

  return NextResponse.redirect(new URL('/admin/wallet?deposit=test', 'https://pokemonwiz.vercel.app'));
}
