import cron from 'node-cron';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { BotScheduleConfig } from '../types/wsr.js';
import { runAutomatedWsrDispatch } from './backendWsrService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONFIG_PATH = path.join(__dirname, '..', '..', 'schedule_config.json');

let scheduledTask: cron.ScheduledTask | null = null;

const dayMap: Record<string, string> = {
  'Sunday': '0',
  'Monday': '1',
  'Tuesday': '2',
  'Wednesday': '3',
  'Thursday': '4',
  'Friday': '5',
  'Saturday': '6'
};

const DEFAULT_SCHEDULE_CONFIG: BotScheduleConfig = {
  enabled: true,
  frequency: 'weekly',
  dayOfWeek: 'Monday',
  time: '08:30',
  timezone: 'Asia/Kolkata (IST)',
  managerEmail: '',
  ccEmails: [],
  includePptxAttachment: true,
  includeAiSummary: true,
  teamsToInclude: []
};

function getConfig(): BotScheduleConfig {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const data = fs.readFileSync(CONFIG_PATH, 'utf-8');
      return JSON.parse(data) as BotScheduleConfig;
    }
  } catch (error) {
    console.error('[CronService] Error reading config, using fallback:', error);
  }
  return DEFAULT_SCHEDULE_CONFIG;
}

function saveConfig(config: BotScheduleConfig) {
  try {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
  } catch (error) {
    console.error('[CronService] Error saving config:', error);
  }
}

function getCronExpression(config: BotScheduleConfig): string {
  const day = dayMap[config.dayOfWeek] || '1';
  const [hour, minute] = (config.time || '08:30').split(':');
  return `${minute} ${hour} * * ${day}`;
}

export function initCron() {
  const config = getConfig();
  if (scheduledTask) {
    scheduledTask.stop();
  }

  if (config.enabled) {
    const cronExp = getCronExpression(config);
    const tz = (config.timezone || 'Asia/Kolkata').split(' ')[0];
    console.log(`[CronService] Starting cron job with expression: ${cronExp} (${tz})`);
    
    scheduledTask = cron.schedule(cronExp, () => {
      console.log(`[CronService] Triggering scheduled WSR dispatch...`);
      runAutomatedWsrDispatch().catch(console.error);
    }, {
      timezone: tz
    });
  } else {
    console.log('[CronService] Cron scheduler is disabled.');
  }
}

export function updateSchedule(newConfig: BotScheduleConfig) {
  saveConfig(newConfig);
  initCron();
}

export function getSchedule(): BotScheduleConfig {
  return getConfig();
}
