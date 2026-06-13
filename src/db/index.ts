import type { SupabaseClient } from '@supabase/supabase-js';

let _supabase: SupabaseClient | null = null;

function initClient(): SupabaseClient {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { createClient } = require('@supabase/supabase-js');
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error('Supabase env vars not configured');
  _supabase = createClient(url, key, { auth: { persistSession: false } });
  return _supabase!;
}

// Lazy Proxy — defers createClient() until first property access at runtime
const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    if (!_supabase) _supabase = initClient();
    return _supabase[prop as keyof SupabaseClient];
  },
});

export default supabase;
export async function getSupabase() {
  if (!_supabase) _supabase = initClient();
  return _supabase;
}
