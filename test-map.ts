import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkMap() {
  const { data: employees } = await supabase
    .from('crc6f_table12s')
    .select('*')
    .eq('crc6f_activeflag', true);

  console.log('All employees:', employees?.map(e => ({
    id: e.crc6f_employeeid,
    name: e.crc6f_firstname + ' ' + e.crc6f_lastname,
    team: e.crc6f_department
  })));
}

checkMap();
