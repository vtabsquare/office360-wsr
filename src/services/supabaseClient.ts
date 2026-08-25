import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { TeamWsrData, EmployeeWsrRecord } from '../types/wsr';

let cachedClient: SupabaseClient | null = null;
let currentProjectUrl = '';
let currentApiKey = '';

export function getSupabaseClient(projectUrl: string, apiKey: string): SupabaseClient {
  if (cachedClient && currentProjectUrl === projectUrl && currentApiKey === apiKey) {
    return cachedClient;
  }
  currentProjectUrl = projectUrl;
  currentApiKey = apiKey;
  cachedClient = createClient(projectUrl, apiKey);
  return cachedClient;
}

/**
 * SQL Schema migration script that the user can copy into Supabase SQL Editor
 * to set up the OfficeHub360 WSR database tables.
 */
export const SUPABASE_SQL_SCHEMA_SCRIPT = `-- ==============================================================================
-- OfficeHub360 WSR (Weekly Status Report) Database Schema for Supabase
-- Project Reference: ofzdvvjkqgnheogwfdnk
-- ==============================================================================

-- 1. Teams Table
CREATE TABLE IF NOT EXISTS teams (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    lead_name TEXT,
    theme_color TEXT DEFAULT '#0097a7',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Employees / Members Table
CREATE TABLE IF NOT EXISTS employees (
    id TEXT PRIMARY KEY,
    team_id TEXT REFERENCES teams(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    display_name TEXT NOT NULL,
    email TEXT UNIQUE,
    role TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Weekly Timesheets & WSR Records
CREATE TABLE IF NOT EXISTS timesheets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id TEXT REFERENCES employees(id) ON DELETE CASCADE,
    week_start_date DATE NOT NULL,
    week_end_date DATE NOT NULL,
    date_range_label TEXT NOT NULL, -- e.g. '10th Aug – 15th Aug 2026'
    total_hours NUMERIC(6, 2) NOT NULL DEFAULT 0.00,
    productive_hours NUMERIC(6, 2) NOT NULL DEFAULT 0.00,
    non_productive_hours NUMERIC(6, 2) NOT NULL DEFAULT 0.00,
    tasks_completed INTEGER NOT NULL DEFAULT 0,
    carry_forward INTEGER NOT NULL DEFAULT 0,
    billable_hours NUMERIC(6, 2) NOT NULL DEFAULT 0.00,
    non_billable_hours NUMERIC(6, 2) NOT NULL DEFAULT 0.00,
    holidays_availed INTEGER NOT NULL DEFAULT 0,
    notes TEXT,
    synced_from TEXT DEFAULT 'officehub360_app',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Bot Execution & Email Dispatch Logs
CREATE TABLE IF NOT EXISTS bot_email_dispatches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dispatched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    manager_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    week_label TEXT NOT NULL,
    teams_included TEXT[] NOT NULL,
    pptx_attachment_name TEXT,
    ai_executive_summary TEXT,
    delivery_status TEXT DEFAULT 'sent'
);

-- 5. Seed Initial Teams
INSERT INTO teams (id, name, lead_name, theme_color)
VALUES 
    ('team-python', 'Python Team', 'Shoaib Akhtar', '#0097a7'),
    ('team-hr-dashboard', 'HR Dashboard Team', 'Mohamed Yasin', '#00838f'),
    ('team-westcoast', 'Westcoast Team', 'Sanjay Janakiraman', '#0288d1'),
    ('team-core-mobile', 'Admin Team', 'Vignesh Raja S', '#0f766e')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, lead_name = EXCLUDED.lead_name;

-- 6. Enable RLS (Row Level Security) with open public policy for demo
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE timesheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_email_dispatches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read teams" ON teams FOR SELECT USING (true);
CREATE POLICY "Allow public read employees" ON employees FOR SELECT USING (true);
CREATE POLICY "Allow public read timesheets" ON timesheets FOR SELECT USING (true);
CREATE POLICY "Allow public read bot_email_dispatches" ON bot_email_dispatches FOR SELECT USING (true);
`;

/**
 * Test connectivity to Supabase
 */
export async function testSupabaseConnection(
  projectUrl: string,
  apiKey: string
): Promise<{ success: boolean; message: string; tableCount?: number }> {
  try {
    if (!projectUrl || !apiKey) {
      return { success: false, message: 'Missing Project URL or API Key' };
    }
    const client = getSupabaseClient(projectUrl, apiKey);
    // Simple ping to check if API is reachable
    const { error } = await client.from('teams').select('id').limit(1);
    if (error && error.code !== 'PGRST116' && !error.message.includes('relation "teams" does not exist')) {
      return { success: false, message: `Supabase returned error: ${error.message}` };
    }
    return {
      success: true,
      message: 'Successfully connected to Supabase project ofzdvvjkqgnheogwfdnk'
    };
  } catch (err: any) {
    return { success: false, message: err.message || 'Failed to connect to Supabase' };
  }
}
