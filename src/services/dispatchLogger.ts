import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOG_FILE = path.join(__dirname, '..', '..', 'dispatch_logs.json');

export type DispatchStatus = 'CALCULATING' | 'PENDING_APPROVAL' | 'COMPLETED' | 'FAILED';

export interface DispatchLog {
  id: string;
  week: string;
  calculatedAt: string;
  sentToTlAt?: string;
  approvedByTlAt?: string;
  reachedManagerAt?: string;
  status: DispatchStatus;
  error?: string;
}

export function getDispatchLogs(): DispatchLog[] {
  try {
    if (!fs.existsSync(LOG_FILE)) {
      return [];
    }
    const data = fs.readFileSync(LOG_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading dispatch logs:', error);
    return [];
  }
}

export function saveDispatchLog(log: DispatchLog): void {
  const logs = getDispatchLogs();
  const existingIndex = logs.findIndex(l => l.id === log.id);
  if (existingIndex >= 0) {
    logs[existingIndex] = log;
  } else {
    logs.unshift(log); // newest first
  }
  
  // Keep only the last 50 logs to prevent unbounded growth
  const trimmedLogs = logs.slice(0, 50);
  
  try {
    fs.writeFileSync(LOG_FILE, JSON.stringify(trimmedLogs, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving dispatch log:', error);
  }
}

export function getDispatchLogById(id: string): DispatchLog | undefined {
  return getDispatchLogs().find(l => l.id === id);
}
