import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL || '', process.env.VITE_SUPABASE_ANON_KEY || '');

async function test() {
  const { data: timesheets } = await supabase.from('crc6f_hr_timesheetlogs').select('crc6f_taskname, crc6f_billingtype').ilike('crc6f_taskname', '%leave%');
  console.log('Timesheets with leave:', timesheets?.length);
  
  const { data: timesheets2 } = await supabase.from('crc6f_hr_timesheetlogs').select('crc6f_taskname, crc6f_billingtype').ilike('crc6f_taskname', '%holiday%');
  console.log('Timesheets with holiday:', timesheets2?.length);

  const { data: leaves } = await supabase.from('crc6f_hr_leavemangements').select('*').limit(5);
  console.log('Leaves sample:', leaves);
}
test();
