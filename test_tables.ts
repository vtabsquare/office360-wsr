import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL || '', process.env.VITE_SUPABASE_ANON_KEY || '');

async function test() {
  const { data: timesheets } = await supabase.from('crc6f_hr_timesheetlogs').select('*').limit(5);
  console.log('Timesheets:', timesheets);
  
  // also try to get table names if possible, but Postgrest doesn't expose it directly without RPC or querying pg_catalog which might be restricted.
}
test();
