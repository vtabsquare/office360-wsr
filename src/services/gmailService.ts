import { getAccessToken } from './googleAuthService';
import { TeamWsrData } from '../types/wsr';
import { getWsrPptxBase64 } from './pptxGenerator';

export interface SendWsrEmailOptions {
  toEmail: string;
  ccEmails?: string[];
  subject: string;
  htmlBody: string;
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
        options.dateRange || '10th Aug – 15th Aug 2026'
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
  dateRange: string = '10th Aug – 15th Aug 2026',
  managerEmail: string = 'balamuraleee@gmail.com',
  isApprovalRequest: boolean = false
): string {
  let appUrl = 'http://localhost:5173';
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_APP_URL) {
    appUrl = import.meta.env.VITE_APP_URL;
  } else if (typeof process !== 'undefined' && process.env && process.env.APP_URL) {
    appUrl = process.env.APP_URL;
  } else if (typeof window !== 'undefined' && window.location) {
    appUrl = window.location.origin;
  }
  
  const approvalUrl = `${appUrl}/api/wsr/approve?managerEmail=${encodeURIComponent(managerEmail)}`;
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
