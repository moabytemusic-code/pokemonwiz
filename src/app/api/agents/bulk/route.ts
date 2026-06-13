import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/db';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const count = Math.min(Math.max(1, body.count || 5), 100);
  const prefix = body.name_prefix || 'Agent';
  const outlet = body.outlet || 'ebay';
  const balance = body.starting_balance || 0;

  // Build agents array
  const agents = [];
  for (let i = 1; i <= count; i++) {
    const name = `${prefix}-${String(i).padStart(2, '0')}`;
    agents.push({
      name,
      outlet,
      status: 'idle',
      fund_balance: balance,
    });
  }

  const { data, error } = await supabase
    .from('agents')
    .insert(agents)
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
