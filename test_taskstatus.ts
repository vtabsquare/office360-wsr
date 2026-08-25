import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL || '', process.env.VITE_SUPABASE_ANON_KEY || '');

async function test() {
  const { data: statuses } = await supabase.from('crc6f_hr_taskdetailses').select('crc6f_taskstatus');
  console.log('Task Statuses:', [...new Set(statuses?.map(s => s.crc6f_taskstatus))]);
}
test();
