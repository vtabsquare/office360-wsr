import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL || '', process.env.VITE_SUPABASE_ANON_KEY || '');

async function test() {
  const { data } = await supabase.from('crc6f_hr_leavemangements').select('*').eq('crc6f_employeeid', 'EMP004');
  console.log('EMP004 Metadata:', data?.[0]?.metadata);
}
test();
