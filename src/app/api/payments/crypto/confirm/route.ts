import { NextRequest, NextResponse } from 'next/server';
const supabase = require('/Users/kmtwarrior/projects2026/pokemon-wiz/src/db').default;

export async function POST(req: NextRequest) {
  try {
    const { amount, tx_hash, method } = await req.json();

    if (!amount || amount < 1) {
      return NextResponse.json({ error: 'Minimum deposit is $1.00' }, { status: 400 });
    }
    if (!tx_hash) {
      return NextResponse.json({ error: 'Transaction ID required' }, { status: 400 });
    }

    // Record the deposit
    const { data: deposit, error: depositError } = await supabase
      .from('deposits')
      .insert({
        method: method || 'usdt',
        amount,
        currency: 'USD',
        status: 'confirmed',
        tx_hash,
      })
      .select()
      .single();

    if (depositError) {
      return NextResponse.json({ error: depositError.message }, { status: 500 });
    }

    // Record in transactions log
    await supabase.from('transactions').insert({
      type: 'deposit',
      amount,
      source: method || 'usdt',
      reference_id: tx_hash,
      description: `Crypto deposit via ${method || 'USDT'}`,
    });

    return NextResponse.json({ success: true, deposit });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
