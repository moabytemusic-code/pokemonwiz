import { NextResponse } from 'next/server';
import supabase from '../../../db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const results: { step: string; ok?: boolean; error?: string; count?: number }[] = [];

  // 1. Get agents
  const { data: agents } = await supabase.from('agents').select('id, name, outlet');
  results.push({ step: 'agents', count: agents?.length || 0 });

  // 2. Get existing credentials
  const { data: existing } = await supabase.from('agent_credentials').select('agent_id');
  const existingIds = new Set(existing?.map(c => c.agent_id) || []);

  // 3. Insert placeholders for agents that don't have credentials
  const outletDefaults: Record<string, { email: string; profile: string }> = {
    ebay: { email: 'UPDATE-ME@ebay.com', profile: 'https://ebay.com/usr/UPDATEME' },
    tcgplayer: { email: 'UPDATE-ME@tcgplayer.com', profile: 'https://tcgplayer.com/profile/UPDATEME' },
    pokemoncenter: { email: 'UPDATE-ME@pokemoncenter.com', profile: 'https://pokemoncenter.com/account' },
  };

  let inserted = 0;
  const errors: string[] = [];
  for (const agent of agents || []) {
    if (existingIds.has(agent.id)) continue;
    const d = outletDefaults[agent.outlet || ''] || {
      email: `UPDATE-ME-${agent.name}@email.com`,
      profile: 'UPDATE-ME',
    };
    const { error } = await supabase.from('agent_credentials').insert({
      agent_id: agent.id,
      outlet: agent.outlet || 'unknown',
      login_email: d.email,
      login_password_encrypted: 'UPDATE-ME',
      api_key_encrypted: 'UPDATE-ME',
      profile_url: d.profile,
    });
    if (error) {
      errors.push(`${agent.name}: ${error.message.substring(0, 60)}`);
    } else {
      inserted++;
    }
  }
  results.push({ step: 'inserted', count: inserted });
  if (errors.length) results.push({ step: 'errors', error: errors.join('; ') });

  // 4. Return all credentials
  const { data: creds } = await supabase
    .from('agent_credentials')
    .select('id, agent_id, outlet, login_email, profile_url');

  return NextResponse.json({ results, credentials: creds });
}
