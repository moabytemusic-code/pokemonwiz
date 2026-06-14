import { NextRequest, NextResponse } from 'next/server';
import supabase from '../../../../../db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data, error } = await supabase
    .from('agent_credentials')
    .select('*')
    .eq('agent_id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return NextResponse.json(null); // no rows
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  const { data, error } = await supabase
    .from('agent_credentials')
    .update({
      login_email: body.login_email,
      login_password_encrypted: body.login_password_encrypted,
      api_key_encrypted: body.api_key_encrypted,
      profile_url: body.profile_url,
      shipping_name: body.shipping_name,
      mailing_address: body.mailing_address,
    })
    .eq('agent_id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
