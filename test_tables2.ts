import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL || '', process.env.VITE_SUPABASE_ANON_KEY || '');

async function test() {
  const { data, error } = await supabase.from('crc6f_hr_leavedetails').select('*').limit(1);
  console.log('Error:', error);
  console.log('Data:', data);
  const { data: d2, error: e2 } = await supabase.from('crc6f_hr_leaverequests').select('*').limit(1);
  console.log('Error2:', e2);
}
test();
