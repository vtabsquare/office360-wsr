import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL || '', process.env.VITE_SUPABASE_ANON_KEY || '');

async function test() {
  const { data: tables, error } = await supabase.rpc('get_tables_function'); 
  // If rpc doesn't work, we can't easily list tables unless we query the postgrest root / endpoint
  // Let's just fetch from URL directly using fetch
  const response = await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/`, {
    headers: {
      apikey: process.env.VITE_SUPABASE_ANON_KEY || ''
    }
  });
  const json = await response.json();
  console.log('Tables:', Object.keys(json.paths || {}));
}
test();
