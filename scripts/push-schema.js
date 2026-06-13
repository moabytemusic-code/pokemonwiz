// Execute SQL migration against Supabase via REST API
// This uses the raw REST endpoint with service_role key

const https = require('https');
const fs = require('fs');

const SQL = fs.readFileSync('./drizzle/0000_daffy_thunderball.sql', 'utf-8')
  .replace(/--> statement-breakpoint/g, ';\n')
  .replace(/public/g, 'public')
  .trim();

const statements = SQL.split(';').filter(s => s.trim().length > 0).map(s => s.trim() + ';');

const SUPABASE_URL = 'https://fypepxvkwpussjjiacit.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

async function execSQL(sql) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query: sql });
    const url = new URL(`${SUPABASE_URL}/rest/v1/rpc/pg_query`);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    };
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', (e) => reject(e));
    req.write(data);
    req.end();
  });
}

async function main() {
  console.log(`Attempting to execute ${statements.length} statements...`);
  
  let success = 0;
  let failed = 0;
  
  for (let i = 0; i < statements.length; i++) {
    const sql = statements[i];
    // Skip empty or comment-only statements
    if (!sql || sql === ';' || sql.startsWith('--')) continue;
    
    try {
      const result = await execSQL(sql);
      if (result.status === 200) {
        console.log(`✓ [${i+1}/${statements.length}]`);
        success++;
      } else {
        console.log(`✗ [${i+1}/${statements.length}] HTTP ${result.status}: ${result.body.substring(0, 100)}`);
        failed++;
      }
    } catch (e) {
      console.log(`✗ [${i+1}/${statements.length}] Error: ${e.message}`);
      failed++;
    }
  }
  
  console.log(`\nDone: ${success} succeeded, ${failed} failed`);
  
  // Try a simple query to verify
  const test = await execSQL('SELECT current_database(), version()');
  console.log('Test query result:', JSON.stringify(test));
}

main();
