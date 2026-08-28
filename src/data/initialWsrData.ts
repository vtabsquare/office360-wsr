import { TeamWsrData, BotScheduleConfig, SupabaseConfig } from '../types/wsr';
import { calculateDynamicDateRange } from '../utils/dateUtils';

export const INITIAL_TEAMS_DATA: TeamWsrData[] = [
  {
    id: 'team-python',
    name: 'Python Team',
    dateRange: calculateDynamicDateRange(),
    themeColor: '#0097a7',
    leadName: 'Sohib Akhtar',
    members: [
      {
        id: 'emp-harish',
        name: 'Harish kadhiravan',
        displayName: 'Harish',
        teamId: 'team-python',
        totalHours: 46.57,
        productiveHours: 36.00,
        nonProductiveHours: 10.57,
        tasksCompleted: 7,
        carryForward: 0,
        billableHours: 0.00,
        nonBillableHours: 46.57,
        holidaysAvailed: 0,
        role: 'Python Backend Engineer'
      },
      {
        id: 'emp-aakash',
        name: 'Aakaash Padhmanaban',
        displayName: 'Aakash',
        teamId: 'team-python',
        totalHours: 33.27,
        productiveHours: 27.00,
        nonProductiveHours: 6.27,
        tasksCompleted: 6,
        carryForward: 0,
        billableHours: 0.00,
        nonBillableHours: 33.27,
        holidaysAvailed: 2,
        role: 'FastAPI / Scraping Specialist'
      },
      {
        id: 'emp-shoaib',
        name: 'Sohib Akthar',
        displayName: 'Sohib',
        teamId: 'team-python',
        totalHours: 51.30,
        productiveHours: 45.00,
        nonProductiveHours: 6.30,
        tasksCompleted: 11,
        carryForward: 0,
        billableHours: 0.00,
        nonBillableHours: 51.30,
        holidaysAvailed: 0,
        role: 'Senior Python Lead'
      },
      {
        id: 'emp-gokulnath',
        name: 'Gokulnath Muthusamy',
        displayName: 'Gokulnath(6 days)',
        teamId: 'team-python',
        totalHours: 38.02,
        productiveHours: 34.49,
        nonProductiveHours: 3.53,
        tasksCompleted: 11,
        carryForward: 0,
        billableHours: 0.00,
        nonBillableHours: 38.02,
        holidaysAvailed: 1,
        role: 'Data Pipeline Engineer'
      },
      {
        id: 'emp-vasanth',
        name: 'Vasanth Kumar',
        displayName: 'Vasanth',
        teamId: 'team-python',
        totalHours: 34.81,
        productiveHours: 33.68,
        nonProductiveHours: 1.13,
        tasksCompleted: 7,
        carryForward: 0,
        billableHours: 0.00,
        nonBillableHours: 34.81,
        holidaysAvailed: 0,
        role: 'Automation Developer'
      }
    ]
  },
  {
    id: 'team-hr-dashboard',
    name: 'HR Dashboard Team',
    dateRange: calculateDynamicDateRange(),
    themeColor: '#00838f',
    leadName: 'Mohamed Yasin',
    members: [
      {
        id: 'emp-naveen',
        name: 'Naveenkumar P',
        displayName: 'Naveen',
        teamId: 'team-hr-dashboard',
        totalHours: 41.61,
        productiveHours: 41.61,
        nonProductiveHours: 0.00,
        tasksCompleted: 5,
        carryForward: 1,
        billableHours: 0.00,
        nonBillableHours: 41.61,
        holidaysAvailed: 0,
        role: 'Frontend UI/UX Dev'
      },
      {
        id: 'emp-sanjay-s',
        name: 'Sanjay S',
        displayName: 'Sanjay Shanmugam',
        teamId: 'team-hr-dashboard',
        totalHours: 52.44,
        productiveHours: 45.00,
        nonProductiveHours: 7.44,
        tasksCompleted: 8,
        carryForward: 0,
        billableHours: 0.00,
        nonBillableHours: 52.44,
        holidaysAvailed: 0,
        role: 'Full Stack Engineer'
      },
      {
        id: 'emp-yasin',
        name: 'Mohamed Yasin',
        displayName: 'Mohamed Yasin',
        teamId: 'team-hr-dashboard',
        totalHours: 57.95,
        productiveHours: 45.00,
        nonProductiveHours: 12.95,
        tasksCompleted: 9,
        carryForward: 0,
        billableHours: 0.00,
        nonBillableHours: 57.95,
        holidaysAvailed: 0,
        role: 'Tech Lead - HR Analytics'
      }
    ]
  },
  {
    id: 'team-westcoast',
    name: 'Westcoast Team',
    dateRange: calculateDynamicDateRange(),
    themeColor: '#0288d1',
    leadName: 'Sanjay Janakiraman',
    members: [
      {
        id: 'emp-kavya',
        name: 'Kavya Rajendran',
        displayName: 'Kavya',
        teamId: 'team-westcoast',
        totalHours: 45.20,
        productiveHours: 45.00,
        nonProductiveHours: 0.20,
        tasksCompleted: 2,
        carryForward: 0,
        billableHours: 45.20,
        nonBillableHours: 0.00,
        holidaysAvailed: 0,
        role: 'Senior Project Associate'
      },
      {
        id: 'emp-sanjay-j',
        name: 'Sanjay Janakiraman',
        displayName: 'Sanjay J',
        teamId: 'team-westcoast',
        totalHours: 58.41,
        productiveHours: 34.00,
        nonProductiveHours: 24.41,
        tasksCompleted: 0,
        carryForward: 1,
        billableHours: 58.41,
        nonBillableHours: 0.00,
        holidaysAvailed: 1,
        role: 'Client Solution Architect'
      },
      {
        id: 'emp-bharani',
        name: 'Bharani A',
        displayName: 'Bharani',
        teamId: 'team-westcoast',
        totalHours: 45.00,
        productiveHours: 45.00,
        nonProductiveHours: 0.00,
        tasksCompleted: 1,
        carryForward: 1,
        billableHours: 45.00,
        nonBillableHours: 0.00,
        holidaysAvailed: 0,
        role: 'Integration Specialist'
      },
      {
        id: 'emp-karthikeyan',
        name: 'Karthikeyan S',
        displayName: 'Karthikeyan',
        teamId: 'team-westcoast',
        totalHours: 45.56,
        productiveHours: 45.00,
        nonProductiveHours: 0.56,
        tasksCompleted: 0,
        carryForward: 1,
        billableHours: 0.00,
        nonBillableHours: 45.56,
        holidaysAvailed: 0,
        role: 'QA & Compliance'
      }
    ]
  },
  {
    id: 'team-core-mobile',
    name: 'Admin Team',
    dateRange: calculateDynamicDateRange(),
    themeColor: '#0f766e',
    leadName: 'Vignesh Raja S',
    members: [
      {
        id: 'emp-vignesh',
        name: 'Vignesh Raja S',
        displayName: 'Vignesh Raja',
        teamId: 'team-core-mobile',
        totalHours: 56.48,
        productiveHours: 43.18,
        nonProductiveHours: 13.30,
        tasksCompleted: 6,
        carryForward: 0,
        billableHours: 56.48,
        nonBillableHours: 0.00,
        holidaysAvailed: 0,
        role: 'Mobile Apps Lead'
      },
      {
        id: 'emp-meena',
        name: 'Meenakumari K',
        displayName: 'Meenakumari',
        teamId: 'team-core-mobile',
        totalHours: 46.38,
        productiveHours: 44.06,
        nonProductiveHours: 2.32,
        tasksCompleted: 8,
        carryForward: 0,
        billableHours: 46.38,
        nonBillableHours: 0.00,
        holidaysAvailed: 0,
        role: 'Cloud Infrastructure Dev'
      }
    ]
  }
];

export const INITIAL_SCHEDULE_CONFIG: BotScheduleConfig = {
  enabled: true,
  frequency: 'weekly',
  dayOfWeek: 'Monday',
  time: '08:30',
  timezone: 'Asia/Kolkata (IST)',
  managerEmail: import.meta.env.VITE_DEFAULT_MANAGER_EMAIL,
  ccEmails: (import.meta.env.VITE_DEFAULT_CC_EMAILS)
    .split(',')
    .map((e: string) => e.trim())
    .filter(Boolean),
  includePptxAttachment: true,
  includeAiSummary: true,
  teamsToInclude: ['team-python', 'team-hr-dashboard', 'team-westcoast', 'team-core-mobile'],
  lastRunTimestamp: '2026-08-17T08:30:00+05:30',
  nextRunTimestamp: '2026-08-24T08:30:00+05:30'
};

export const INITIAL_SUPABASE_CONFIG: SupabaseConfig = {
  projectUrl: import.meta.env.VITE_SUPABASE_URL,
  apiKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  connected: true,
  selectedTable: 'wsr_weekly_summary',
  lastSynced: '2026-08-20T05:15:00Z',
  mode: 'connected'
};
