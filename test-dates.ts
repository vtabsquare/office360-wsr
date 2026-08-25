import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSanjay() {
  const fromDate = '2026-08-10';
  const toDate = '2026-08-16'; 

  const { data: timesheets, error } = await supabase
    .from('crc6f_hr_timesheetlogs')
    .select('crc6f_workdate, crc6f_hoursworked')
    .eq('crc6f_employeeid', 'EMP004') // Sanjay Janakiraman
    .gte('crc6f_workdate', fromDate)
    .lte('crc6f_workdate', toDate);

  if (error) console.error(error);
  console.log('Sanjay Janakiraman timesheets (Aug 10 - Aug 16):', timesheets);
  
  const total = timesheets?.reduce((acc, row) => acc + (row.crc6f_hoursworked || 0), 0);
  console.log('Total for Sanjay Janakiraman:', total);
}

checkSanjay();
