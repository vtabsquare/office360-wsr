import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL || '', process.env.VITE_SUPABASE_ANON_KEY || '');
async function run() {
  const { data } = await supabase.from('crc6f_permissions').select('crc6f_status');
  console.log([...new Set(data?.map(d => d.crc6f_status))]);
}
run();
