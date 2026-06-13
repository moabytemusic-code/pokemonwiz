import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = 'https://fypepxvkwpussjjiacit.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

// Read migration SQL, strip Drizzle statement markers
const sql = readFileSync('./drizzle/0000_daffy_thunderball.sql', 'utf-8')
  .replace(/--> statement-breakpoint/g, '\n')
  .trim();

async function main() {
  const statements = sql.split(';').filter(s => s.trim().length > 0);
  console.log(`Executing ${statements.length} SQL statements...`);
  
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i].trim() + ';';
    try {
      const { error } = await supabase.rpc('pg_query', { query: stmt });
      if (error) {
        console.error(`Statement ${i + 1} failed:`, error.message);
        console.error('SQL:', stmt.substring(0, 200));
      } else {
        console.log(`✓ Statement ${i + 1}/${statements.length}`);
      }
    } catch (e: any) {
      console.error(`Statement ${i + 1} error:`, e.message);
    }
  }
  console.log('Done.');
}

main();
