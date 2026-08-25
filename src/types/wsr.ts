export interface EmployeeWsrRecord {
  id: string;
  name: string;
  displayName: string; // e.g. "Harish", "Aakash", "Gokulnath(6 days)"
  teamId: string;
  totalHours: number;
  productiveHours: number;
  nonProductiveHours: number;
  tasksCompleted: number;
  carryForward: number;
  billableHours: number;
  nonBillableHours: number;
  holidaysAvailed: number;
  notes?: string;
  avatar?: string;
  role?: string;
}

export interface TeamWsrData {
  id: string;
  name: string; // e.g. "Python Team", "HR Dashboard Team", "Westcoast Team"
  dateRange: string; // e.g. "10th Aug – 15th Aug 2026"
  members: EmployeeWsrRecord[];
  leadName?: string;
  themeColor?: string; // Hex color for slides
}

export interface BotScheduleConfig {
  enabled: boolean;
  frequency: 'weekly' | 'bi-weekly' | 'monthly';
  dayOfWeek: 'Monday' | 'Tuesday' | 'Friday' | 'Saturday' | 'Sunday';
  time: string; // "08:00"
  timezone: string; // "Asia/Kolkata" or "UTC"
  managerEmail: string; 
  ccEmails: string[];
  includePptxAttachment: boolean;
  includeAiSummary: boolean;
  teamsToInclude: string[]; // Team IDs
  lastRunTimestamp?: string;
  nextRunTimestamp?: string;
}

export interface SupabaseConfig {
  projectUrl: string;
  apiKey: string;
  connected: boolean;
  selectedTable: string;
  lastSynced?: string;
  mode: 'connected' | 'demo';
}

export interface AiInsightReport {
  executiveSummary: string;
  teamHighlights: {
    teamName: string;
    summary: string;
    productivityScore: number;
    concerns: string[];
    topPerformer: string;
  }[];
  overtimeAlerts: {
    employeeName: string;
    teamName: string;
    totalHours: number;
    riskLevel: 'high' | 'medium' | 'low';
    reason: string;
  }[];
  standupTalkingPoints: string[];
  recommendations: string[];
  burnoutRiskCount: number;
}

export interface BotRunLog {
  id: string;
  timestamp: string;
  status: 'success' | 'running' | 'failed';
  steps: {
    name: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    details?: string;
  }[];
  recipientEmail: string;
  pptxFileName: string;
  teamsIncluded: string[];
}
