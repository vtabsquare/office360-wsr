import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

async function check() {
  const { data, error } = await supabase
    .from('crc6f_table13s')
    .select('*')
    .limit(3);
  if (error) console.error(error);
  else console.log(data);
}

check();
