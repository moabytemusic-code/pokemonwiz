import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/db';

export async function GET() {
  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const { data, error } = await supabase
    .from('campaigns')
    .insert({
      name: body.name,
      card_name: body.card_name,
      set_name: body.set_name || null,
      card_number: body.card_number || null,
      max_price: body.max_price || null,
      target_quantity: body.target_quantity || 10,
      priority: body.priority || 'normal',
      status: 'active',
      sources: body.sources || 'tcgplayer,pokemoncenter,ebay',
      notes: body.notes || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
