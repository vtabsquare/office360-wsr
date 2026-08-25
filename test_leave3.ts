import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL || '', process.env.VITE_SUPABASE_ANON_KEY || '');

async function test() {
  const { data } = await supabase.from('crc6f_hr_leavemangements').select('*').in('crc6f_employeeid', ['EMP004', 'EMP018']);
  console.log('Leaves for EMP004 and EMP018:', data);
}
test();
