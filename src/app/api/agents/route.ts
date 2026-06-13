import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/db';

export async function GET() {
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .order('name');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const { data: agent, error: agentError } = await supabase
    .from('agents')
    .insert({
      name: body.name,
      outlet: body.outlet,
      outlet_account_label: body.outlet_account_label || null,
      status: 'idle',
    })
    .select()
    .single();

  if (agentError) return NextResponse.json({ error: agentError.message }, { status: 500 });

  // Store encrypted credentials
  if (body.login_email || body.login_password || body.api_key) {
    await supabase.from('agent_credentials').insert({
      agent_id: agent.id,
      outlet: body.outlet,
      login_email: body.login_email || null,
      login_password_encrypted: body.login_password || null,
      api_key_encrypted: body.api_key || null,
      profile_url: body.profile_url || null,
    });
  }

  return NextResponse.json(agent, { status: 201 });
}
