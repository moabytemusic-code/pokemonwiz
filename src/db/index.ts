let _supabase: any = null;

function initClient() {
  const { createClient } = require('@supabase/supabase-js');
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error('Supabase env vars not configured');
  _supabase = createClient(url, key, { auth: { persistSession: false } });
}

// Lazy singleton — only initializes on first access
export default new Proxy({}, {
  get(_, prop) {
    if (!_supabase) initClient();
    return _supabase[prop];
  }
});

export async function getSupabase() {
  if (!_supabase) initClient();
  return _supabase;
}
