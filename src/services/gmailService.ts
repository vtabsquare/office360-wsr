import { getAccessToken } from './googleAuthService';
import { TeamWsrData } from '../types/wsr';
import { calculateDynamicDateRange } from '../utils/dateUtils';
import { getWsrPptxBase64 } from './pptxGenerator';
import type { DispatchLog } from './dispatchLogger';

export interface SendWsrEmailOptions {
  toEmail: string;
  ccEmails?: string[];
  subject: string;
  htmlBody: string;
  htmlBodyNoApprove?: string;
  teams: TeamWsrData[];
  dateRange?: string;
  attachPptx?: boolean;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  threadId?: string;
  recipient: string;
  cc?: string[];
  sentAt: string;
  error?: string;
}

/**
 * Send real email via Backend SMTP Endpoint (bypassing Google OAuth)
 */
export async function sendWsrViaGmail(options: SendWsrEmailOptions): Promise<SendEmailResult> {
  let pptxBase64: string | undefined;
  const fileName = `OfficeHub360_WSR_Deck_${(options.dateRange || 'Weekly').replace(/\s+/g, '_')}.pptx`;

  if (options.attachPptx !== false) {
    try {
      pptxBase64 = await getWsrPptxBase64(
        options.teams,
        'Weekly Status Report (WSR)',
        options.dateRange || calculateDynamicDateRange()
      );
    } catch (e) {
      console.warn('Failed to compile PPTX attachment, sending HTML summary email only:', e);
    }
  }

  const response = await fetch('/api/bot/dispatch-now', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      toEmail: options.toEmail,
      ccEmails: options.ccEmails,
      subject: options.subject,
      htmlBody: options.htmlBody,
      htmlBodyNoApprove: options.htmlBodyNoApprove,
      pptxBase64: pptxBase64,
      pptxFileName: fileName
    })
  });

  if (!response.ok) {
    const errBody = await response.text();
    let errorMsg = `Backend Dispatch Error (${response.status}): ${response.statusText}`;
    try {
      const parsedErr = JSON.parse(errBody);
      if (parsedErr?.error) {
        errorMsg = parsedErr.error;
      }
    } catch {
      errorMsg = errBody;
    }
    throw new Error(errorMsg);
  }

  const resData = await response.json();

  return {
    success: true,
    messageId: resData.messageId || `smtp-${Date.now()}`,
    recipient: options.toEmail,
    cc: options.ccEmails,
    sentAt: resData.timestamp || new Date().toISOString()
  };
}

/**
 * Generate formatted HTML body for the WSR delivery email
 */
export function generateWsrEmailHtml(
  teams: TeamWsrData[],
  dateRange: string = calculateDynamicDateRange(),
  managerEmail: string = 'balamuraleee@gmail.com',
  isApprovalRequest: boolean = false,
  logId?: string,
  mailFlow?: DispatchLog
): string {
  let appUrl = 'http://localhost:5173';
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_APP_URL) {
    appUrl = import.meta.env.VITE_APP_URL;
  } else if (typeof process !== 'undefined' && process.env && process.env.APP_URL) {
    appUrl = process.env.APP_URL;
  } else if (typeof window !== 'undefined' && window.location) {
    appUrl = window.location.origin;
  }
  
  let approvalUrl = `${appUrl}/api/wsr/approve?managerEmail=${encodeURIComponent(managerEmail)}`;
  if (logId) {
    approvalUrl += `&logId=${encodeURIComponent(logId)}`;
  }
  const totalHours = teams.reduce((a, t) => a + t.members.reduce((b, m) => b + m.totalHours, 0), 0);
  const productiveHours = teams.reduce((a, t) => a + t.members.reduce((b, m) => b + m.productiveHours, 0), 0);
  const nonProductiveHours = teams.reduce((a, t) => a + t.members.reduce((b, m) => b + m.nonProductiveHours, 0), 0);
  const tasksCompleted = teams.reduce((a, t) => a + t.members.reduce((b, m) => b + m.tasksCompleted, 0), 0);
  const carryForward = teams.reduce((a, t) => a + t.members.reduce((b, m) => b + m.carryForward, 0), 0);
  const billableHours = teams.reduce((a, t) => a + t.members.reduce((b, m) => b + m.billableHours, 0), 0);
  const efficiency = totalHours > 0 ? ((productiveHours / totalHours) * 100).toFixed(1) : '100';

  const teamRowsHtml = teams
    .map((t, idx) => {
      const tTotal = t.members.reduce((a, m) => a + m.totalHours, 0);
      const tProd = t.members.reduce((a, m) => a + m.productiveHours, 0);
      const tTasks = t.members.reduce((a, m) => a + m.tasksCompleted, 0);
      const tCarry = t.members.reduce((a, m) => a + m.carryForward, 0);
      const tBill = t.members.reduce((a, m) => a + m.billableHours, 0);
      const bg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';

      return `
        <tr style="background-color: ${bg}; border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px 14px; font-weight: 600; color: #0f172a;">${t.name}</td>
          <td style="padding: 10px 14px; text-align: center; color: #475569;">${t.members.length}</td>
          <td style="padding: 10px 14px; text-align: right; font-family: monospace; font-weight: 600; color: #0f172a;">${tTotal.toFixed(1)}h</td>
          <td style="padding: 10px 14px; text-align: right; font-family: monospace; color: #16a34a; font-weight: 600;">${tProd.toFixed(1)}h</td>
          <td style="padding: 10px 14px; text-align: center; font-weight: bold; color: #0284c7;">${tTasks}</td>
          <td style="padding: 10px 14px; text-align: center; color: ${tCarry > 0 ? '#d97706' : '#64748b'}; font-weight: ${tCarry > 0 ? 'bold' : 'normal'};">${tCarry}</td>
          <td style="padding: 10px 14px; text-align: right; font-family: monospace; color: #0f766e;">${tBill.toFixed(1)}h</td>
        </tr>
      `;
    })
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Weekly Status Report (WSR)</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table width="680" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.08); border: 1px solid #e2e8f0;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #09090b 0%, #18181b 100%); padding: 30px 35px; border-bottom: 3px solid #00acc1;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="font-size: 11px; font-weight: bold; color: #00acc1; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 6px;">
                      OfficeHub360 • Automated Executive Dispatch
                    </div>
                    <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                      Weekly Status Report (WSR)
                    </h1>
                    <div style="font-size: 13px; color: #94a3b8; margin-top: 6px;">
                      Reporting Period: <strong style="color: #ffffff;">${dateRange}</strong>
                    </div>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; background-color: rgba(0, 172, 193, 0.15); border: 1px solid rgba(0, 172, 193, 0.4); color: #22d3ee; padding: 6px 12px; border-radius: 8px; font-size: 11px; font-weight: 600;">
                      16:9 PPTX Attached
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Summary Metric Cards -->
          <tr>
            <td style="padding: 25px 35px 15px 35px;">
              <table width="100%" border="0" cellspacing="8" cellpadding="0">
                <tr>
                  <td width="33%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; text-align: center;">
                    <div style="font-size: 10px; font-weight: bold; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">Total Logged</div>
                    <div style="font-size: 24px; font-weight: 800; color: #0f172a; margin-top: 4px; font-family: monospace;">${totalHours.toFixed(1)}h</div>
                    <div style="font-size: 11px; color: #64748b; margin-top: 2px;">${teams.reduce((a, t) => a + t.members.length, 0)} Engineers</div>
                  </td>
                  <td width="33%" style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 14px; text-align: center;">
                    <div style="font-size: 10px; font-weight: bold; color: #15803d; text-transform: uppercase; letter-spacing: 1px;">Productivity</div>
                    <div style="font-size: 24px; font-weight: 800; color: #16a34a; margin-top: 4px; font-family: monospace;">${efficiency}%</div>
                    <div style="font-size: 11px; color: #15803d; margin-top: 2px;">${productiveHours.toFixed(1)}h Productive</div>
                  </td>
                  <td width="33%" style="background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 12px; padding: 14px; text-align: center;">
                    <div style="font-size: 10px; font-weight: bold; color: #0369a1; text-transform: uppercase; letter-spacing: 1px;">Tasks Delivered</div>
                    <div style="font-size: 24px; font-weight: 800; color: #0284c7; margin-top: 4px; font-family: monospace;">${tasksCompleted}</div>
                    <div style="font-size: 11px; color: #0369a1; margin-top: 2px;">${carryForward} Carry Forward</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Team Breakdown Table -->
          <tr>
            <td style="padding: 10px 35px 25px 35px;">
              <h2 style="font-size: 14px; font-weight: 700; color: #0f172a; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.5px;">
                Departmental Timesheet Breakdown
              </h2>
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border: 1px solid #cbd5e1; border-radius: 10px; overflow: hidden; font-size: 12px;">
                <thead>
                  <tr style="background-color: #0f172a; color: #ffffff;">
                    <th style="padding: 10px 14px; text-align: left; font-weight: 700;">Team</th>
                    <th style="padding: 10px 14px; text-align: center; font-weight: 700;">Size</th>
                    <th style="padding: 10px 14px; text-align: right; font-weight: 700;">Total</th>
                    <th style="padding: 10px 14px; text-align: right; font-weight: 700;">Productive</th>
                    <th style="padding: 10px 14px; text-align: center; font-weight: 700;">Tasks</th>
                    <th style="padding: 10px 14px; text-align: center; font-weight: 700;">Carry</th>
                    <th style="padding: 10px 14px; text-align: right; font-weight: 700;">Billable</th>
                  </tr>
                </thead>
                <tbody>
                  ${teamRowsHtml}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Mail Flow Audit (Conditional) -->
          ${mailFlow ? `
          <tr>
            <td style="padding: 10px 35px 25px 35px;">
              <h2 style="font-size: 14px; font-weight: 700; color: #0f172a; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.5px;">
                Mail Flow Audit Trail
              </h2>
              <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; padding: 16px;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 12px; color: #334155;">
                  <tr>
                    <td style="padding: 4px 0;"><strong>Calculated At:</strong></td>
                    <td style="padding: 4px 0; font-family: monospace;">${new Date(mailFlow.calculatedAt).toLocaleString()}</td>
                  </tr>
                  ${mailFlow.sentToTlAt ? `
                  <tr>
                    <td style="padding: 4px 0;"><strong>Dispatched to TL:</strong></td>
                    <td style="padding: 4px 0; font-family: monospace;">${new Date(mailFlow.sentToTlAt).toLocaleString()}</td>
                  </tr>
                  ` : ''}
                  ${mailFlow.approvedByTlAt ? `
                  <tr>
                    <td style="padding: 4px 0; color: #16a34a;"><strong>Approved By TL:</strong></td>
                    <td style="padding: 4px 0; font-family: monospace; color: #16a34a;">${new Date(mailFlow.approvedByTlAt).toLocaleString()}</td>
                  </tr>
                  ` : ''}
                  ${mailFlow.reachedManagerAt ? `
                  <tr>
                    <td style="padding: 4px 0; color: #0284c7;"><strong>Reached Manager:</strong></td>
                    <td style="padding: 4px 0; font-family: monospace; color: #0284c7;">${new Date(mailFlow.reachedManagerAt).toLocaleString()}</td>
                  </tr>
                  ` : ''}
                </table>
              </div>
            </td>
          </tr>
          ` : ''}

          <!-- Approval Button (Conditional) -->
          ${isApprovalRequest ? `
          <tr>
            <td style="padding: 10px 35px 25px 35px; text-align: center;">
              <a href="${approvalUrl}" style="display: inline-block; background-color: #16a34a; color: #ffffff; padding: 14px 28px; font-size: 16px; font-weight: 700; text-decoration: none; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(22, 163, 74, 0.4);">
                ✅ Approve & Send to Manager
              </a>
              <div style="font-size: 12px; color: #64748b; margin-top: 12px;">
                Clicking this will automatically dispatch the final PPTX deck to <strong>${managerEmail}</strong>.
              </div>
            </td>
          </tr>
          ` : ''}

          <!-- Footer with Attachment notice -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 35px; text-align: center;">
              <div style="font-size: 12px; color: #64748b; line-height: 1.5;">
                📎 <strong>Attached:</strong> Complete widescreen presentation deck (<code style="background-color: #e2e8f0; padding: 2px 6px; border-radius: 4px;">.pptx</code>) formatted in company Black & Teal design standard.
              </div>
              <div style="font-size: 11px; color: #94a3b8; margin-top: 8px;">
                Dispatched automatically by OfficeHub360 WSR Intelligence Engine to ${managerEmail}.
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

export function generateErrorEmailHtml(
  errorMessage: string,
  dateRange: string,
  mailFlow?: DispatchLog,
  failedStepId?: string
): string {
  
  const steps = [
    { id: 'supabase-pull', title: 'Extract Supabase Timesheets', desc: 'Querying project ofzdvvjkqgnheogwfdnk for weekly worklogs & task logs...' },
    { id: 'wsr-calc', title: 'Compute WSR Team Metrics', desc: 'Aggregating members across teams...' },
    { id: 'ai-analysis', title: 'Run Gemini AI Intelligence', desc: 'Analyzing overtime anomalies, burnout indicators, and generating executive summary...' },
    { id: 'pptx-build', title: 'Compile PPTX Slide Deck', desc: 'Rendering 16:9 widescreen PowerPoint deck with Black & Cyan departmental slides...' },
    { id: 'email-dispatch', title: `Send via Gmail to ${process.env.VITE_DEFAULT_MANAGER_EMAIL || 'Manager'}`, desc: 'Sending authenticated RFC 2822 email with attached .pptx deck through Gmail API...' }
  ];

  // Determine which steps are done vs failed
  let hitFailed = false;
  if (!failedStepId) failedStepId = 'email-dispatch'; // fallback to last step if not provided

  const renderedSteps = steps.map(s => {
    let status = 'DELIVERED';
    if (s.id === failedStepId) {
      status = 'FAILED';
      hitFailed = true;
    } else if (hitFailed) {
      status = 'QUEUED';
    }

    let bgColor = status === 'FAILED' ? '#450a0a' : status === 'DELIVERED' ? '#022c22' : '#0f0f11';
    let borderColor = status === 'FAILED' ? '#7f1d1d' : status === 'DELIVERED' ? '#064e3b' : '#27272a';
    let iconColor = status === 'FAILED' ? '#ef4444' : status === 'DELIVERED' ? '#10b981' : '#71717a';
    let iconBg = status === 'FAILED' ? '#7f1d1d40' : status === 'DELIVERED' ? '#064e3b40' : '#27272a';
    let statusColor = status === 'FAILED' ? '#fca5a5' : status === 'DELIVERED' ? '#34d399' : '#a1a1aa';
    
    // Icon logic (using simple Unicode/SVG for email)
    const iconSvg = status === 'FAILED' 
      ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>'
      : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>';

    return `
      <div style="background-color: ${bgColor}; border: 1px solid ${borderColor}; border-radius: 12px; padding: 14px; margin-bottom: 12px;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td width="48" valign="top">
              <div style="width: 36px; height: 36px; border-radius: 8px; border: 1px solid ${iconColor}; display: flex; align-items: center; justify-content: center; color: ${iconColor}; margin-top: 2px;">
                ${iconSvg}
              </div>
            </td>
            <td valign="top">
              <div style="font-size: 14px; font-weight: 700; color: #fff; margin-bottom: 4px;">${s.title}</div>
              <div style="font-size: 11px; color: #a1a1aa; line-height: 1.4;">${s.desc}</div>
            </td>
            <td width="80" align="right" valign="top">
              <div style="font-size: 10px; font-weight: 700; font-family: monospace; letter-spacing: 0.5px; color: ${statusColor}; margin-top: 2px;">
                ${status}
              </div>
            </td>
          </tr>
        </table>
      </div>
    `;
  }).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>CRITICAL FAILURE: WSR Dispatch Error</title>
</head>
<body style="margin: 0; padding: 0; background-color: #09090b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #09090b; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #18181b; border: 1px solid #27272a; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 25px 35px; border-bottom: 1px solid #27272a; background-color: #18181b;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <h1 style="margin: 0; font-size: 20px; font-weight: 800; color: #ef4444; letter-spacing: -0.5px; display: flex; align-items: center;">
                      ⚠️ CRITICAL ALERT: WSR DISPATCH FAILED
                    </h1>
                    <div style="font-size: 12px; color: #a1a1aa; margin-top: 6px;">
                      Cycle: ${dateRange}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Error Details -->
          <tr>
            <td style="padding: 25px 35px 15px 35px;">
              <div style="background-color: #450a0a; border: 1px solid #7f1d1d; border-radius: 12px; padding: 16px;">
                <h2 style="font-size: 13px; font-weight: 700; color: #fca5a5; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.5px;">
                  Error Description
                </h2>
                <div style="font-family: monospace; font-size: 12px; color: #fecaca; line-height: 1.5; white-space: pre-wrap;">${errorMessage}</div>
              </div>
            </td>
          </tr>

          <!-- Mail Flow Audit -->
          ${mailFlow ? `
          <tr>
            <td style="padding: 10px 35px 25px 35px;">
              <h2 style="font-size: 13px; font-weight: 700; color: #e4e4e7; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.5px;">
                Mail Flow State at Failure
              </h2>
              <div style="background-color: #0f0f11; border: 1px solid #27272a; border-radius: 10px; padding: 16px;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 12px; color: #a1a1aa;">
                  <tr>
                    <td style="padding: 4px 0;"><strong>Calculated At:</strong></td>
                    <td style="padding: 4px 0; font-family: monospace;">${mailFlow.calculatedAt ? new Date(mailFlow.calculatedAt).toLocaleString() : 'N/A'}</td>
                  </tr>
                  ${mailFlow.sentToTlAt ? `
                  <tr>
                    <td style="padding: 4px 0;"><strong>Dispatched to TL:</strong></td>
                    <td style="padding: 4px 0; font-family: monospace;">${new Date(mailFlow.sentToTlAt).toLocaleString()}</td>
                  </tr>
                  ` : ''}
                  ${mailFlow.approvedByTlAt ? `
                  <tr>
                    <td style="padding: 4px 0;"><strong>Approved By TL:</strong></td>
                    <td style="padding: 4px 0; font-family: monospace;">${new Date(mailFlow.approvedByTlAt).toLocaleString()}</td>
                  </tr>
                  ` : ''}
                  <tr>
                    <td style="padding: 4px 0; color: #ef4444;"><strong>Failed At:</strong></td>
                    <td style="padding: 4px 0; font-family: monospace; color: #ef4444;">${new Date().toLocaleString()}</td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>
          ` : ''}

          <!-- Bot Execution Flow -->
          <tr>
            <td style="padding: 10px 35px 25px 35px;">
              <h2 style="font-size: 13px; font-weight: 700; color: #e4e4e7; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.5px;">
                Bot Execution Flow
              </h2>
              ${renderedSteps}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #09090b; border-top: 1px solid #27272a; padding: 20px 35px; text-align: center;">
              <div style="font-size: 12px; color: #71717a; line-height: 1.5;">
                Action Required: Please review backend server logs and resolve the issue. The automated cron will retry next week if not manually triggered.
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
