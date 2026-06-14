const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env.local') });

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;

  // Try the raw Supabase project URL
  const projectRef = url.replace('https://', '').replace('.supabase.co', '');
  console.log(`Project ref: ${projectRef}`);

  const supabase = createClient(url, key, { auth: { persistSession: false } });

  // Try running SQL via pg_query RPC (if it exists)
  async function runSQL(sql) {
    try {
      const { data, error } = await supabase.rpc('pg_query', { query: sql });
      if (error) throw error;
      return { success: true, data };
    } catch (e) {
      // Fallback: try the SQL endpoint via fetch
      console.log(`  RPC failed, trying direct API... (${e.message?.substring(0, 50)})`);
      return { success: false, error: e.message };
    }
  }

  // 1. Add columns
  console.log('--- Adding columns ---');
  const r1 = await runSQL('ALTER TABLE agent_credentials ADD COLUMN IF NOT EXISTS shipping_name TEXT;');
  console.log('shipping_name:', r1.success ? '✅' : '❌');

  const r2 = await runSQL('ALTER TABLE agent_credentials ADD COLUMN IF NOT EXISTS mailing_address TEXT;');
  console.log('mailing_address:', r2.success ? '✅' : '❌');

  // 2. Get all agents
  const { data: agents, error: agentsErr } = await supabase.from('agents').select('id, name, outlet');
  if (agentsErr) { console.error('Agents fetch error:', agentsErr); return; }
  console.log(`\nAgents: ${agents.length}`);

  // 3. Get existing credentials
  const { data: existingCreds } = await supabase.from('agent_credentials').select('id, agent_id');
  const existingIds = new Set(existingCreds?.map(c => c.agent_id) || []);
  console.log(`Existing credentials: ${existingIds.size}`);

  // 4. Insert placeholders
  const outletDefaults = {
    'ebay': { email: 'UPDATE-ME@ebay.com', profile: 'https://ebay.com/usr/UPDATEME' },
    'tcgplayer': { email: 'UPDATE-ME@tcgplayer.com', profile: 'https://tcgplayer.com/profile/UPDATEME' },
    'pokemoncenter': { email: 'UPDATE-ME@pokemoncenter.com', profile: 'https://pokemoncenter.com/account' },
  };

  let inserted = 0;
  for (const agent of agents) {
    if (existingIds.has(agent.id)) {
      console.log(`  ${agent.name}: already has credentials, skipping`);
      continue;
    }
    const defaults = outletDefaults[agent.outlet] || { email: `UPDATE-ME-${agent.name}@placeholder.com`, profile: 'UPDATE-ME' };

    const { error: insErr } = await supabase.from('agent_credentials').insert({
      agent_id: agent.id,
      outlet: agent.outlet || 'unknown',
      login_email: defaults.email,
      login_password_encrypted: 'UPDATE-ME',
      api_key_encrypted: 'UPDATE-ME',
      profile_url: defaults.profile,
      shipping_name: 'UPDATE-ME-YOUR-NAME',
      mailing_address: 'UPDATE-ME-123 YOUR STREET, CITY, STATE ZIP',
    });
    if (insErr) {
      console.log(`  ${agent.name}: ❌ ${insErr.message.substring(0, 80)}`);
    } else {
      console.log(`  ${agent.name}: ✅ placeholder created`);
      inserted++;
    }
  }

  console.log(`\n✅ Created ${inserted} placeholder credentials`);
}

main().catch(console.error);
