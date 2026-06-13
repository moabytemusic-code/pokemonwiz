import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/db';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const formData = await req.formData();
  const amount = parseFloat(formData.get('amount') as string);

  if (!amount || amount <= 0) {
    return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
  }

  // Get current agent
  const { data: agent } = await supabase
    .from('agents')
    .select('fund_balance')
    .eq('id', id)
    .single();

  if (!agent) {
    return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
  }

  const newBalance = Number(agent.fund_balance) + amount;

  // Update agent balance + log transaction
  const { error: updateError } = await supabase
    .from('agents')
    .update({ fund_balance: newBalance })
    .eq('id', id);

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

  await supabase.from('transactions').insert({
    type: 'agent_topup',
    amount: amount,
    to_entity: String(id),
    description: `Top-up agent #${id}`,
  });

  return NextResponse.redirect(new URL(`/admin/agents/${id}`, req.url));
}
