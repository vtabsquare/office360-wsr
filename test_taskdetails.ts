import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL || '', process.env.VITE_SUPABASE_ANON_KEY || '');

async function test() {
  const { data, error } = await supabase.from('crc6f_hr_taskdetailses').select('*').limit(3);
  console.log('Error:', error);
  console.log('Data:', data);
  
  // also group by status if there is a status field
  const { data: statuses } = await supabase.from('crc6f_hr_taskdetailses').select('crc6f_status').limit(20);
  console.log('Statuses:', [...new Set(statuses?.map(s => s.crc6f_status))]);
}
test();
