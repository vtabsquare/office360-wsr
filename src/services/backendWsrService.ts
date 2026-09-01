import { createClient } from '@supabase/supabase-js';
import { getWsrPptxBase64 } from './pptxGenerator';
import nodemailer from 'nodemailer';
import { generateWsrEmailHtml, generateErrorEmailHtml } from './gmailService.js'; // reusing HTML generation
import { saveDispatchLog, getDispatchLogById, DispatchLog } from './dispatchLogger.js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Fetches real data from crc6f_table12s (Employees) and crc6f_hr_timesheetlogs (Timesheets)
 * and formats it into the TeamWsrData structure required by the PPTX and AI engines.
 */
export async function fetchLiveWsrData(): Promise<any[]> {
  // 1. Fetch all active employees
  const { data: employees, error: empError } = await supabase
    .from('crc6f_table12s')
    .select('*')
    .eq('crc6f_activeflag', true);

  if (empError) throw new Error('Error fetching employees: ' + empError.message);
  if (!employees || employees.length === 0) return [];

  // Calculate date range for the "last week" (Monday to Saturday)
  const today = new Date();
  const lastMonday = new Date(today);
  lastMonday.setDate(today.getDate() - (today.getDay() === 0 ? 6 : today.getDay() - 1) - 7);
  
  const lastSaturday = new Date(lastMonday);
  lastSaturday.setDate(lastMonday.getDate() + 5); // Monday + 5 days = Saturday

  const fromDate = lastMonday.toISOString().split('T')[0];
  const toDate = lastSaturday.toISOString().split('T')[0];

  const fmtDate = (d: Date) => {
    const day = d.getDate();
    const suf = (day > 3 && day < 21) ? 'th' : (day % 10 === 1 ? 'st' : day % 10 === 2 ? 'nd' : day % 10 === 3 ? 'rd' : 'th');
    return `${day}${suf} ${d.toLocaleDateString('en-US', { month: 'short' })}`;
  };
  const dynamicDateRange = `${fmtDate(lastMonday)} – ${fmtDate(lastSaturday)} ${lastSaturday.getFullYear()}`;

  const { data: timesheets, error: tsError } = await supabase
    .from('crc6f_hr_timesheetlogs')
    .select('*')
    .gte('crc6f_workdate', fromDate)
    .lte('crc6f_workdate', toDate);

  if (tsError) throw new Error('Error fetching timesheets: ' + tsError.message);

  // 3. Fetch all leave management data (approved leaves overlapping with the week)
  const { data: leaves, error: leaveError } = await supabase
    .from('crc6f_table14s')
    .select('*')
    .eq('crc6f_status', 'Approved')
    .gte('crc6f_enddate', fromDate)
    .lte('crc6f_startdate', toDate);
    
  if (leaveError) throw new Error('Error fetching leaves: ' + leaveError.message);

  // 4. Fetch task details to calculate carry forwards
  const { data: taskDetails, error: tasksError } = await supabase
    .from('crc6f_hr_taskdetailses')
    .select('*');

  if (tasksError) throw new Error('Error fetching task details: ' + tasksError.message);

  // 5. Fetch permissions data
  const { data: permissions, error: permError } = await supabase
    .from('crc6f_permissions')
    .select('*')
    .eq('crc6f_status', 'Approved')
    .gte('crc6f_date', fromDate)
    .lte('crc6f_date', toDate);

  if (permError) throw new Error('Error fetching permissions: ' + permError.message);
  // Custom Hardcoded Team Mapping by Employee ID
  const TEAM_MAPPING: Record<string, string> = {
    'EMP013': 'Python',
    'EMP014': 'Python',
    'EMP015': 'Python',
    'EMP018': 'Python',
    'EMP020': 'Python',
    'EMP005': 'HR Dashboard',
    'EMP012': 'HR Dashboard',
    'EMP011': 'HR Dashboard',
    'EMP003': 'Westcoast',
    'EMP004': 'Westcoast',
    'EMP006': 'Westcoast',
    'EMP007': 'Westcoast',
    'EMP002': 'Management & Admin',
    'EMP016': 'Management & Admin'
  };

  const RESIGNED_EMPLOYEES = ['1032', '1043'];

  // Group employees by custom teams
  const teamsMap = new Map<string, any>();
  
  // Pre-initialize teams to maintain desired slide order
  ['Python', 'HR Dashboard', 'Westcoast', 'Management & Admin'].forEach(tName => {
      teamsMap.set(tName, {
        id: `team-${tName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        name: tName + ' Team',
        dateRange: dynamicDateRange,
        themeColor: '#0097a7',
        leadName: 'Team Lead',
        members: []
      });
  });

  for (const emp of employees) {
    if (RESIGNED_EMPLOYEES.includes(emp.crc6f_employeeid)) {
      continue; // Skip resigned employees
    }
    
    const teamName = TEAM_MAPPING[emp.crc6f_employeeid] || 'Unassigned';
    
    if (!teamsMap.has(teamName)) {
      teamsMap.set(teamName, {
        id: `team-${teamName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        name: teamName + ' Team',
        dateRange: dynamicDateRange,
        themeColor: '#0097a7',
        leadName: 'Team Lead',
        members: []
      });
    }

    const team = teamsMap.get(teamName);

    // Filter timesheets for this employee
    const empTimesheets = (timesheets || []).filter(ts => ts.crc6f_employeeid === emp.crc6f_employeeid);
    
    let totalHours = 0;
    let tasksCompleted = 0;
    
    for (const ts of empTimesheets) {
      totalHours += (ts.crc6f_hoursworked || 0);
      if (ts.crc6f_taskid) tasksCompleted += 1;
    }

    // Calculate holidays availed within the week
    const empLeaves = (leaves || []).filter(l => l.crc6f_employeeid === emp.crc6f_employeeid);
    const holidaysAvailed = empLeaves.reduce((acc, l) => acc + (l.crc6f_totaldays || 0), 0);

    // Calculate productive and non-productive based on 9hr workday
    const standardWeekDays = 5;
    const expectedProductiveHours = Math.max(0, (standardWeekDays - holidaysAvailed) * 9);
    
    const productiveHours = Math.min(totalHours, expectedProductiveHours);
    const nonProductiveHours = Math.max(0, totalHours - expectedProductiveHours);

    const billableHours = empTimesheets.filter(ts => ts.crc6f_billingtype === 'Billable').reduce((acc, ts) => acc + (ts.crc6f_hoursworked || 0), 0);
    const nonBillableHours = totalHours - billableHours;

    // Calculate carry forward tasks
    const empTaskIds = [...new Set(empTimesheets.filter(ts => ts.crc6f_taskid).map(ts => ts.crc6f_taskid))];
    let carryForward = 0;
    for (const taskId of empTaskIds) {
      const tDetail = (taskDetails || []).find(td => td.crc6f_taskid === taskId);
      if (tDetail && tDetail.crc6f_taskstatus && tDetail.crc6f_taskstatus !== 'Completed') {
        carryForward += 1;
      }
    }

    // Handle duplicate first names by adding last name initial
    const firstName = emp.crc6f_firstname || '';
    const lastInitial = emp.crc6f_lastname ? ` ${emp.crc6f_lastname.charAt(0)}.` : '';
    const displayName = `${firstName}${lastInitial}`;

    // Calculate permission hours
    const empPermissions = (permissions || []).filter(p => p.crc6f_employeeid === emp.crc6f_employeeid);
    let permissionHours = 0;
    for (const p of empPermissions) {
       if (p.crc6f_starttime && p.crc6f_endtime) {
         const start = new Date(`1970-01-01T${p.crc6f_starttime}Z`);
         const end = new Date(`1970-01-01T${p.crc6f_endtime}Z`);
         const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
         if (hours > 0) permissionHours += hours;
       }
    }

    team.members.push({
      id: emp.crc6f_employeeid,
      name: `${emp.crc6f_firstname} ${emp.crc6f_lastname}`,
      displayName: displayName,
      teamId: team.id,
      totalHours,
      productiveHours,
      nonProductiveHours,
      tasksCompleted,
      carryForward: carryForward,
      billableHours,
      nonBillableHours,
      holidaysAvailed: holidaysAvailed,
      permissionHours: permissionHours,
      role: emp.crc6f_designation || 'Employee'
    });
  }

  return Array.from(teamsMap.values()).filter((t: any) => t.members.length > 0);
}

async function dispatchErrorEmail(errorMsg: string, dateRange: string, mailFlow?: DispatchLog) {
  const tlEmail = process.env.VITE_DEFAULT_TL_EMAIL;
  const smtpEmail = process.env.SMTP_EMAIL || process.env.VITE_GMAIL_SENDER_EMAIL;
  const brevoApiKey = process.env.BREVO_API_KEY;

  if (!tlEmail || !smtpEmail || !brevoApiKey) {
    console.warn('[WSR Cron] Missing config to send error email.');
    return;
  }

  const htmlContent = generateErrorEmailHtml(errorMsg, dateRange, mailFlow);

  const brevoPayload = {
    sender: { email: smtpEmail, name: "OfficeHub360 WSR Bot" },
    to: [{ email: tlEmail }],
    subject: `🚨 URGENT: WSR Dispatch Failed - ${dateRange}`,
    htmlContent: htmlContent,
  };

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': brevoApiKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify(brevoPayload)
    });
    if (!response.ok) {
      console.error(`[WSR Cron] Failed to send error email: ${await response.text()}`);
    } else {
      console.log(`[WSR Cron] Error email successfully dispatched to TL.`);
    }
  } catch (err) {
    console.error(`[WSR Cron] Exception while sending error email:`, err);
  }
}

/**
 * Automates the entire dispatch pipeline:
 * Fetch Data -> Gen HTML -> Gen PPTX -> Send via SMTP
 */
export async function runAutomatedWsrDispatch() {
  console.log('[WSR Cron] Starting automated WSR dispatch pipeline...');
  let dateRange: string;
  let mailFlow: DispatchLog;

  try {
    const teams = await fetchLiveWsrData();
    if (!teams || teams.length === 0) {
      console.log('[WSR Cron] No active team data found. Skipping dispatch.');
      return;
    }

    // Determine current date range for the email
    const today = new Date();
    const lastMonday = new Date(today);
    lastMonday.setDate(today.getDate() - (today.getDay() === 0 ? 6 : today.getDay() - 1) - 7);
    const lastSaturday = new Date(lastMonday);
    lastSaturday.setDate(lastMonday.getDate() + 5);
    
    const fmtDate = (d: Date) => {
      const day = d.getDate();
      const suf = (day > 3 && day < 21) ? 'th' : (day % 10 === 1 ? 'st' : day % 10 === 2 ? 'nd' : day % 10 === 3 ? 'rd' : 'th');
      return `${day}${suf} ${d.toLocaleDateString('en-US', { month: 'short' })}`;
    };
    dateRange = `${fmtDate(lastMonday)} – ${fmtDate(lastSaturday)} ${lastSaturday.getFullYear()}`;

    const logId = `dispatch-${Date.now()}`;
    mailFlow = {
      id: logId,
      week: dateRange,
      calculatedAt: new Date().toISOString(),
      status: 'CALCULATING'
    };
    saveDispatchLog(mailFlow);

    // TEAM LEAD APPROVAL WORKFLOW
    // 1. Initially route to TL without PPTX
    const tlEmail = process.env.VITE_DEFAULT_TL_EMAIL;
    const managerEmail = process.env.VITE_DEFAULT_MANAGER_EMAIL;
    
    if (!tlEmail || !managerEmail) {
      throw new Error("TL or Manager email is not configured in .env");
    }
    const ccEmails = (process.env.VITE_DEFAULT_CC_EMAILS || '').split(',').map(e => e.trim()).filter(Boolean);
    const subject = `ACTION REQUIRED: Approve Weekly Status Report (WSR) - ${dateRange}`;

    mailFlow.sentToTlAt = new Date().toISOString();
    // Pass isApprovalRequest = true to generate the button
    const htmlBody = generateWsrEmailHtml(teams, dateRange, managerEmail, true, logId, mailFlow);

    const smtpEmail = process.env.SMTP_EMAIL || process.env.VITE_GMAIL_SENDER_EMAIL;
    if (!smtpEmail) throw new Error("SMTP_EMAIL is not configured");
    try {
      const brevoApiKey = process.env.BREVO_API_KEY;

      const brevoPayload: any = {
        sender: { email: smtpEmail, name: "OfficeHub360 WSR Bot" },
        to: [{ email: tlEmail }],
        subject: `ACTION REQUIRED: Approve Weekly Status Report (WSR) - ${dateRange}`,
        htmlContent: htmlBody,
      };

      let validCc: string[] = [];
      if (ccEmails && Array.isArray(ccEmails) && ccEmails.length > 0) {
        validCc = ccEmails.filter(c => c && c.trim().length > 0 && !c.includes('placeholder'));
      }

      const pptxBase64 = await getWsrPptxBase64(teams, 'Weekly Status Report (WSR)', dateRange);
      if (pptxBase64) {
        const base64Data = pptxBase64.replace(/^data:.*,/, '');
        brevoPayload.attachment = [
          {
            content: base64Data,
            name: `OfficeHub360_WSR_Deck_${dateRange.replace(/\s+/g, '_')}.pptx`
          }
        ];
      }

      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': brevoApiKey,
          'content-type': 'application/json'
        },
        body: JSON.stringify(brevoPayload)
      });

      if (!response.ok) {
        const errBody = await response.text();
        throw new Error(`Brevo API Error (${response.status}): ${errBody}`);
      }

      const info = await response.json();
      console.log(`[WSR Cron] Approval email dispatched to TL with ID: ${info.messageId}`);
      
      // Dispatch FYI email to CC recipients without the approve button
      if (validCc.length > 0) {
        const htmlBodyNoApprove = generateWsrEmailHtml(teams, dateRange, managerEmail, false, logId, mailFlow);
        const ccPayload = {
          ...brevoPayload,
          to: validCc.map(c => ({ email: c.trim() })),
          subject: `FYI: Weekly Status Report (WSR) - ${dateRange}`,
          htmlContent: htmlBodyNoApprove
        };
        
        const ccResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'api-key': brevoApiKey,
            'content-type': 'application/json'
          },
          body: JSON.stringify(ccPayload)
        });
        
        if (ccResponse.ok) {
          const ccInfo = await ccResponse.json();
          console.log(`[WSR Cron] FYI email dispatched to CCs with ID: ${ccInfo.messageId}`);
        } else {
          console.warn(`[WSR Cron] Failed to send FYI email to CCs: ${await ccResponse.text()}`);
        }
      }
      
      mailFlow.status = 'PENDING_APPROVAL';
      saveDispatchLog(mailFlow);
      
      return { success: true, messageId: info.messageId, status: 'pending_approval' };
    } catch (error: any) {
      console.error('Brevo Automated Dispatch Error:', error);
      mailFlow.status = 'FAILED';
      mailFlow.error = error.message;
      saveDispatchLog(mailFlow);
      await dispatchErrorEmail(error.message, dateRange, mailFlow);
      throw error;
    }
  } catch (error: any) {
    console.error('[WSR Cron] Dispatch failed:', error.message);
    if (typeof dateRange !== 'undefined' && mailFlow) {
      await dispatchErrorEmail(error.message, dateRange, mailFlow);
    }
    throw error;
  }
}

/**
 * Handles the click from the TL's email button.
 * Fetches latest data, generates the PPTX, and sends the final email to the manager.
 */
export async function approveAndSendToManager(managerEmail: string, logId?: string) {
  console.log('[WSR Approval] TL Approved. Generating final deck and sending to manager...');
  
  let mailFlow = logId ? getDispatchLogById(logId) : undefined;
  if (mailFlow) {
    mailFlow.approvedByTlAt = new Date().toISOString();
    saveDispatchLog(mailFlow);
  }

  try {
    const teams = await fetchLiveWsrData();
    
    // Determine date range
    const today = new Date();
    const lastMonday = new Date(today);
    lastMonday.setDate(today.getDate() - (today.getDay() === 0 ? 6 : today.getDay() - 1) - 7);
    const lastSaturday = new Date(lastMonday);
    lastSaturday.setDate(lastMonday.getDate() + 5);
    const fmtDate = (d: Date) => {
      const day = d.getDate();
      const suf = (day > 3 && day < 21) ? 'th' : (day % 10 === 1 ? 'st' : day % 10 === 2 ? 'nd' : day % 10 === 3 ? 'rd' : 'th');
      return `${day}${suf} ${d.toLocaleDateString('en-US', { month: 'short' })}`;
    };
    const dateRange = `${fmtDate(lastMonday)} – ${fmtDate(lastSaturday)} ${lastSaturday.getFullYear()}`;

    const finalHtml = generateWsrEmailHtml(teams, dateRange, managerEmail, false, undefined, mailFlow);
    const pptxBase64 = await getWsrPptxBase64(teams, 'Weekly Status Report (WSR)', dateRange);
    const pptxFileName = `OfficeHub360_WSR_Deck_${dateRange.replace(/\s+/g, '_')}.pptx`;
    
    const smtpEmail = process.env.SMTP_EMAIL || process.env.VITE_GMAIL_SENDER_EMAIL;
    if (!smtpEmail) throw new Error("SMTP_EMAIL is not configured");

    const brevoApiKey = process.env.BREVO_API_KEY;

    const brevoPayload: any = {
      sender: { email: smtpEmail, name: "OfficeHub360 WSR Bot" },
      to: [{ email: managerEmail }],
      subject: `Weekly Status Report (WSR) - ${dateRange} [Presentation Deck Attached]`,
      htmlContent: finalHtml,
    };

    const ccEmails = (process.env.VITE_DEFAULT_CC_EMAILS || '').split(',').map(e => e.trim()).filter(Boolean);
    if (ccEmails.length > 0) {
      brevoPayload.cc = ccEmails.map(c => ({ email: c }));
    }

    if (pptxBase64 && pptxFileName) {
      brevoPayload.attachment = [
        {
          content: pptxBase64.replace(/^data:.*,/, ''),
          name: pptxFileName
        }
      ];
    }

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': brevoApiKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify(brevoPayload)
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Brevo API Error (${response.status}): ${errBody}`);
    }

    const info = await response.json();
    console.log(`[WSR Approval] Success! Final email sent to manager: ${info.messageId}`);
    
    if (mailFlow) {
      mailFlow.reachedManagerAt = new Date().toISOString();
      mailFlow.status = 'COMPLETED';
      saveDispatchLog(mailFlow);
    }
    
    return { success: true };
  } catch (error: any) {
    console.error('[WSR Approval] Dispatch to manager failed:', error);
    if (mailFlow) {
      mailFlow.status = 'FAILED';
      mailFlow.error = error.message;
      saveDispatchLog(mailFlow);
      await dispatchErrorEmail(`Approval Dispatch Failed: ${error.message}`, mailFlow.week, mailFlow);
    }
    throw error;
  }
}

export async function testErrorDispatch() {
  console.log('[WSR Cron] Simulating WSR dispatch failure for testing...');
  let mailFlow: DispatchLog = {
    id: `dispatch-errortest-${Date.now()}`,
    week: 'Test Cycle',
    calculatedAt: new Date().toISOString(),
    status: 'CALCULATING'
  };
  saveDispatchLog(mailFlow);

  try {
    throw new Error("Simulated backend failure: Timeout waiting for database connection.");
  } catch (error: any) {
    mailFlow.status = 'FAILED';
    mailFlow.error = error.message;
    saveDispatchLog(mailFlow);
    await dispatchErrorEmail(error.message, mailFlow.week, mailFlow);
    throw error;
  }
}
