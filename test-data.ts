import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
  const { data: employees } = await supabase
    .from('crc6f_table12s')
    .select('*')
    .ilike('crc6f_firstname', '%Sanjay%');

  console.log('Employees named Sanjay:', employees);
}

checkData();
