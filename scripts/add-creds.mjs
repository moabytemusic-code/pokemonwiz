const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env.local') });

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;

  console.log('URL:', url ? '✅ found' : '❌ missing');
  console.log('Key:', key ? `✅ ${key.substring(0, 12)}...` : '❌ missing');

  if (!url || !key) {
    console.log('Trying from process.argv or hardcoded...');
    process.exit(1);
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });

  // 1. Add mailing_address and shipping_name columns to agent_credentials
  console.log('\n--- Adding columns ---');
  const { error: err1 } = await supabase.rpc('exec_sql', {
    sql: `ALTER TABLE agent_credentials ADD COLUMN IF NOT EXISTS mailing_address TEXT;`
  });
  console.log('mailing_address:', err1 ? `❌ ${err1.message}` : '✅ done');

  const { error: err2 } = await supabase.rpc('exec_sql', {
    sql: `ALTER TABLE agent_credentials ADD COLUMN IF NOT EXISTS shipping_name TEXT;`
  });
  console.log('shipping_name:', err2 ? `❌ ${err2.message}` : '✅ done');

  // 2. Get all agents
  const { data: agents, error: agentsErr } = await supabase.from('agents').select('id, name, outlet');
  if (agentsErr) { console.error('Agents error:', agentsErr); return; }
  console.log(`\nFound ${agents.length} agents`);

  // 3. Get existing credentials
  const { data: existingCreds } = await supabase.from('agent_credentials').select('id, agent_id');
  const existingIds = new Set(existingCreds?.map(c => c.agent_id) || []);
  console.log(`Existing credentials: ${existingIds.size}`);

  // 4. Insert placeholder credentials for agents that don't have them
  for (const agent of agents) {
    if (existingIds.has(agent.id)) continue;

    const { error: insErr } = await supabase.from('agent_credentials').insert({
      agent_id: agent.id,
      outlet: agent.outlet || 'unknown',
      login_email: `UPDATE-ME-${agent.name.toLowerCase()}@placeholder.com`,
      login_password_encrypted: 'UPDATE-ME-ENCRYPT-PASSWORD-HERE',
      api_key_encrypted: 'UPDATE-ME-API-KEY-HERE',
      profile_url: 'UPDATE-ME-OUTLET-PROFILE-URL',
      shipping_name: 'UPDATE-ME-YOUR-NAME',
      mailing_address: 'UPDATE-ME-123 YOUR STREET, CITY, STATE ZIP',
    });

    if (insErr) {
      console.log(`  ${agent.name}: ❌ ${insErr.message}`);
    } else {
      console.log(`  ${agent.name}: ✅ placeholder created`);
    }
  }

  console.log('\n✅ Done!');
}

main().catch(console.error);
