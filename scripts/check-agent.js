const { createClient } = require('@supabase/supabase-js');
const s = createClient('https://fypepxvkwpussjjiacit.supabase.co', process.env.SUPABASE_SERVICE_KEY);
(async () => {
  const { data, error } = await s.from('audit_logs').select('event_type,message,created_at').order('created_at', { ascending: false }).limit(5);
  if (error) return console.log('DB error:', error.message);
  if (!data || !data.length) return console.log('No audit entries found');
  data.forEach(l => console.log(l.created_at?.slice(11,19) || '?', l.event_type, (l.message||'').slice(0,80)));
  // Also check if agents table is accessible
  const { data: a } = await s.from('agents').select('id,name,status,last_active').limit(3);
  if (a) a.forEach(x => console.log('Agent:', x.name, x.status, x.last_active?.slice(0,19)||'never'));
})();
