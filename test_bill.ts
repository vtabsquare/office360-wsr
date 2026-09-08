import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL || '', process.env.VITE_SUPABASE_ANON_KEY || '');
async function run() {
  const { data, error } = await supabase.from('crc6f_hr_timesheetlogs').select('crc6f_billingtype').neq('crc6f_billingtype', 'Billable').limit(5);
  console.log('Non-billable types:', new Set(data?.map(d => d.crc6f_billingtype)));
}
run();
