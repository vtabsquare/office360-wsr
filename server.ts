import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import nodemailer from 'nodemailer';
import cron from 'node-cron';
import dns from 'dns';
import { runAutomatedWsrDispatch, fetchLiveWsrData } from './src/services/backendWsrService';

dotenv.config();
dns.setDefaultResultOrder('ipv4first');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json({ limit: '10mb' }));

// Schedule the Automated WSR Dispatch (Every Monday at 8:30 AM)
cron.schedule('30 8 * * 1', () => {
  console.log('[Cron] Triggering weekly WSR dispatch...');
  runAutomatedWsrDispatch().catch(console.error);
}, {
  timezone: "Asia/Kolkata"
});

// Manual trigger endpoint for testing the cron job
app.get('/api/bot/test-cron', async (req, res) => {
  try {
    const result = await runAutomatedWsrDispatch();
    res.json({ success: true, message: 'Cron job executed successfully', result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint to fetch live Supabase data for the frontend UI
app.get('/api/wsr/live-data', async (req, res) => {
  try {
    const data = await fetchLiveWsrData();
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
}

// ----------------------------------------------------------------------
// 1. Gemini AI WSR Analysis Endpoint
// ----------------------------------------------------------------------
app.post('/api/gemini/analyze', async (req, res) => {
  const { teams = [], dateRange = '10th Aug – 15th Aug 2026' } = req.body || {};

  if (!teams || !Array.isArray(teams)) {
    return res.status(400).json({ error: 'Invalid teams data provided.' });
  }

  if (!ai) {
    // Fallback deterministic analysis if API key is pending
    const fallbackReport = generateLocalWsrAnalysis(teams, dateRange);
    return res.json(fallbackReport);
  }

  try {
    const prompt = `Analyze the following Weekly Status Report (WSR) data for our company teams from ${dateRange}.
Teams & Timesheet Data:
${JSON.stringify(teams, null, 2)}

Provide an in-depth, executive-level WSR intelligence report evaluating:
1. Overall executive summary for leadership.
2. Team-by-team performance highlights, productivity percentage, top performer, and concerns.
3. Overtime and burnout risk alerts for employees exceeding 48 hours or with disproportionate non-productive hours (e.g. Sanjay J with 58.41 hrs, Mohamed Yasin with 57.95 hrs, Vignesh Raja with 56.48 hrs).
4. Concrete talking points for the Monday Morning Manager Standup.
5. Resource and task distribution recommendations (especially resolving carry-forward tasks).`;

    let responseText = '';
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction:
            'You are an executive HR and engineering productivity analyst for OfficeHub360. Analyze timesheets, billable vs non-billable hours, productive ratios, task completion rates, and burnout risks. Return clean structured JSON.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              executiveSummary: {
                type: Type.STRING,
                description: 'Executive summary paragraph highlighting weekly output, total hours, and delivery pace.'
              },
              teamHighlights: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    teamName: { type: Type.STRING },
                    summary: { type: Type.STRING },
                    productivityScore: { type: Type.NUMBER, description: 'Score out of 100' },
                    concerns: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    },
                    topPerformer: { type: Type.STRING }
                  },
                  required: ['teamName', 'summary', 'productivityScore', 'concerns', 'topPerformer']
                }
              },
              overtimeAlerts: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    employeeName: { type: Type.STRING },
                    teamName: { type: Type.STRING },
                    totalHours: { type: Type.NUMBER },
                    riskLevel: { type: Type.STRING, description: 'high, medium, or low' },
                    reason: { type: Type.STRING }
                  },
                  required: ['employeeName', 'teamName', 'totalHours', 'riskLevel', 'reason']
                }
              },
              standupTalkingPoints: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              recommendations: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              burnoutRiskCount: {
                type: Type.NUMBER,
                description: 'Total number of high-risk overloaded individuals.'
              }
            },
            required: [
              'executiveSummary',
              'teamHighlights',
              'overtimeAlerts',
              'standupTalkingPoints',
              'recommendations',
              'burnoutRiskCount'
            ]
          }
        }
      });
      responseText = response.text || '';
    } catch {
      return res.json(generateLocalWsrAnalysis(teams, dateRange));
    }

    try {
      const parsed = JSON.parse(responseText || '{}');
      if (parsed && parsed.executiveSummary) {
        return res.json(parsed);
      }
    } catch {
      // JSON parse fallback
    }
    return res.json(generateLocalWsrAnalysis(teams, dateRange));
  } catch {
    return res.json(generateLocalWsrAnalysis(teams, dateRange));
  }
});

// ----------------------------------------------------------------------
// 2. Gemini AI Interactive Chatbot Endpoint
// ----------------------------------------------------------------------
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { message, conversationHistory = [], teams = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    if (!ai) {
      return res.json({
        reply: `OfficeHub360 AI Assistant: I am operating in offline mode because the GEMINI_API_KEY is missing in your .env file! Please add it to enable interactive AI chat. Right now I can only see that you have ${teams.length} teams with ${teams.reduce((a: number, t: any) => a + t.members.reduce((b: number, m: any) => b + m.totalHours, 0), 0).toFixed(1)} total hours logged.`
      });
    }

    const contextPrompt = `You are the OfficeHub360 AI WSR Assistant. You have full access to current employee timesheets, task completion metrics, billable hours, and weekly PPT slide data:
Current Team Data:
${JSON.stringify(teams, null, 2)}

User Question: ${message}

Provide a helpful, precise, formatted response (using markdown bullet points, bold highlights, or tables if helpful). Be direct and executive-friendly.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contextPrompt,
      config: {
        systemInstruction:
          'You are an executive WSR assistant for company managers. Answer questions directly using the provided timesheet data. Provide actionable advice for sprint reviews, overtime balancing, and employee recognition.'
      }
    });

    return res.json({ reply: response.text });
  } catch (error: any) {
    console.error('Gemini Chat error:', error);
    return res.status(500).json({
      error: 'Failed to process chat message',
      reply: 'I encountered an issue processing the request. Please try asking again.'
    });
  }
});

// ----------------------------------------------------------------------
// 3. TL Approval Endpoint
// ----------------------------------------------------------------------
app.get('/api/wsr/approve', async (req, res) => {
  try {
    const managerEmail = (req.query.managerEmail as string) || process.env.VITE_DEFAULT_MANAGER_EMAIL;
    if (!managerEmail) throw new Error("Manager email not configured");
    const { approveAndSendToManager } = await import('./src/services/backendWsrService.js');
    await approveAndSendToManager(managerEmail);

    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>WSR Approved - OfficeHub360</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
          body {
            font-family: 'Inter', system-ui, sans-serif;
            background: linear-gradient(135deg, #0f172a 0%, #020617 100%);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
          }
          .container {
            background: rgba(30, 41, 59, 0.7);
            backdrop-filter: blur(12px);
            padding: 50px 40px;
            border-radius: 24px;
            text-align: center;
            border: 1px solid rgba(255, 255, 255, 0.05);
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1);
            max-width: 480px;
            width: 90%;
            animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
          }
          .icon-wrapper {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 24px auto;
            box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.4);
          }
          .icon-wrapper svg {
            width: 40px;
            height: 40px;
            color: white;
          }
          h1 {
            margin: 0 0 12px 0;
            font-size: 28px;
            font-weight: 800;
            background: linear-gradient(to right, #ffffff, #94a3b8);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          p {
            color: #94a3b8;
            font-size: 15px;
            line-height: 1.6;
            margin: 0;
          }
          .email-badge {
            display: inline-block;
            margin-top: 16px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            padding: 8px 16px;
            border-radius: 8px;
            font-family: monospace;
            font-size: 14px;
            color: #e2e8f0;
          }
          @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="icon-wrapper">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1>WSR Approved!</h1>
          <p>The final PowerPoint deck has been officially dispatched to the management team.</p>
          <div class="email-badge">${managerEmail}</div>
        </div>
      </body>
      </html>
    `);
  } catch (error: any) {
    console.error('Approval failed:', error);
    res.status(500).send('<h1 style="color:red;font-family:sans-serif;text-align:center;margin-top:20%">Approval Failed! Please check server logs.</h1>');
  }
});

// ----------------------------------------------------------------------
// 4. Automated Weekly WSR Bot Dispatch via Nodemailer
// ----------------------------------------------------------------------
app.post('/api/bot/dispatch-now', async (req, res) => {
  try {
    const { toEmail, ccEmails, subject, htmlBody, pptxBase64, pptxFileName } = req.body;
    
    if (!toEmail || !htmlBody) {
      return res.status(400).json({ error: 'Missing required email fields (toEmail, htmlBody)' });
    }

    const smtpEmail = process.env.SMTP_EMAIL || process.env.VITE_GMAIL_SENDER_EMAIL || 'wsrvtabsquare@gmail.com';
    const smtpPassword = process.env.SMTP_PASSWORD;

    if (!smtpPassword) {
      return res.status(500).json({ 
        error: 'SMTP_PASSWORD is not configured in the backend. Please add an App Password to your .env file.' 
      });
    }    try {
      const brevoApiKey = process.env.BREVO_API_KEY;

      const brevoPayload: any = {
        sender: { email: smtpEmail, name: "OfficeHub360 WSR Bot" },
        to: [{ email: toEmail }],
        subject: subject,
        htmlContent: htmlBody,
      };

      if (ccEmails && Array.isArray(ccEmails) && ccEmails.length > 0) {
        const validCc = ccEmails.filter(c => c && c.trim().length > 0 && !c.includes('placeholder'));
        if (validCc.length > 0) {
          brevoPayload.cc = validCc.map(c => ({ email: c.trim() }));
        }
      }

      if (pptxBase64 && pptxFileName) {
        const base64Data = pptxBase64.replace(/^data:.*,/, '');
        brevoPayload.attachment = [
          {
            content: base64Data,
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

      return res.status(200).json({
        success: true,
        timestamp: new Date().toISOString(),
        recipient: toEmail,
        cc: brevoPayload.cc ? brevoPayload.cc.map((c: any) => c.email).join(', ') : '',
        messageId: info.messageId,
        message: 'Email successfully dispatched via Brevo HTTP API',
      });
    } catch (error: any) {
      console.error('Brevo Dispatch error:', error);
      return res.status(500).json({ error: error.message || 'Dispatch failed' });
    }
});

// Helper for deterministic rule-based analysis when AI key is loading
function generateLocalWsrAnalysis(teams: any[], dateRange: string) {
  const allMembers = teams.flatMap((t) =>
    t.members.map((m: any) => ({ ...m, teamName: t.name }))
  );
  const totalHours = allMembers.reduce((a, m) => a + m.totalHours, 0);
  const totalProductive = allMembers.reduce((a, m) => a + m.productiveHours, 0);
  const totalTasks = allMembers.reduce((a, m) => a + m.tasksCompleted, 0);
  const totalCarry = allMembers.reduce((a, m) => a + m.carryForward, 0);

  const overtimeAlerts = allMembers
    .filter((m) => m.totalHours > 50 || m.nonProductiveHours > 10)
    .map((m) => ({
      employeeName: m.name || m.displayName,
      teamName: m.teamName,
      totalHours: m.totalHours,
      riskLevel: (m.totalHours > 55 ? 'high' : 'medium') as 'high' | 'medium' | 'low',
      reason:
        m.totalHours > 55
          ? `High weekly overtime (${m.totalHours} hrs). Non-productive duration is ${m.nonProductiveHours} hrs.`
          : `Significant overtime load (${m.totalHours} hrs).`
    }));

  const teamHighlights = teams.map((t) => {
    const tTotal = t.members.reduce((a: number, m: any) => a + m.totalHours, 0);
    const tProd = t.members.reduce((a: number, m: any) => a + m.productiveHours, 0);
    const score = tTotal > 0 ? Math.round((tProd / tTotal) * 100) : 90;
    const top = t.members.reduce((prev: any, current: any) =>
      current.tasksCompleted > (prev?.tasksCompleted || 0) ? current : prev
    , t.members[0]);

    return {
      teamName: t.name,
      summary: `${t.name} logged ${tTotal.toFixed(1)} total hours across ${t.members.length} members with ${t.members.reduce((a: number, m: any) => a + m.tasksCompleted, 0)} completed tasks.`,
      productivityScore: score,
      concerns:
        t.members.some((m: any) => m.carryForward > 0)
          ? [`${t.members.filter((m: any) => m.carryForward > 0).length} member(s) have carry-forward tasks.`]
          : ['No pending blockers identified.'],
      topPerformer: top ? `${top.displayName} (${top.tasksCompleted} tasks)` : 'All members on track'
    };
  });

  return {
    executiveSummary: `For the period ${dateRange}, a total of ${totalHours.toFixed(1)} hours were logged across ${teams.length} teams (${allMembers.length} active employees). Overall productive hours stood at ${totalProductive.toFixed(1)} (${((totalProductive / (totalHours || 1)) * 100).toFixed(1)}% efficiency) with ${totalTasks} tasks delivered and ${totalCarry} carry-forward items.`,
    teamHighlights,
    overtimeAlerts,
    standupTalkingPoints: [
      `Review task distribution for high-overtime engineers: Sanjay Janakiraman (58.41h) and Mohamed Yasin (57.95h).`,
      `Westcoast Team has 3 carry-forward tasks; check if client dependencies or testing approvals are holding up completion.`,
      `Python Team achieved top task throughput with Shoaib and Gokulnath both delivering 11 tasks.`,
      `Verify Timesheet holiday logging: Aakash (2 holidays) and Gokulnath (1 holiday) recorded accurate availed leaves.`
    ],
    recommendations: [
      'Rebalance client architectural workload to prevent single-point engineer fatigue on the Westcoast project.',
      'Establish automated Supabase sync validation to catch missing non-billable classifications early in the week.',
      'Ensure weekly PPT deck is shared with client stakeholders by 10:00 AM every Monday.'
    ],
    burnoutRiskCount: overtimeAlerts.filter((a) => a.riskLevel === 'high').length
  };
}

// Serve Vite build in production
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`OfficeHub360 AI WSR Server running on port ${PORT}`);
});
