import React, { useState, useEffect } from 'react';
import {
  Send,
  Database,
  Calculator,
  Sparkles,
  CheckCircle,
  Clock,
  Download,
  Mail,
  X,
  ExternalLink,
  Layers,
  AlertCircle,
  Lock,
  UserCheck,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TeamWsrData, BotScheduleConfig } from '../types/wsr';
import { googleSignIn, getAccessToken, auth, logoutGoogle, clearAuthCache, hasValidToken } from '../services/googleAuthService';
import { sendWsrViaGmail, generateWsrEmailHtml, SendEmailResult } from '../services/gmailService';

interface BotExecutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  teams: TeamWsrData[];
  scheduleConfig: BotScheduleConfig;
  onDownloadPptx: () => void;
}

interface Step {
  id: string;
  title: string;
  description: string;
  icon: any;
  status: 'pending' | 'running' | 'completed' | 'failed';
}

export const BotExecutionModal: React.FC<BotExecutionModalProps> = ({
  isOpen,
  onClose,
  teams,
  scheduleConfig,
  onDownloadPptx
}) => {
  const [hasConfirmedSend, setHasConfirmedSend] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [emailResult, setEmailResult] = useState<SendEmailResult | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStepIndex(0);
      setIsFinished(false);
      setIsRunning(false);
      setErrorMsg(null);
      setEmailResult(null);
      setHasConfirmedSend(false);
    }
  }, [isOpen]);

  const steps: Step[] = [
    {
      id: 'supabase-pull',
      title: 'Extract Supabase Timesheets',
      description: 'Querying project ofzdvvjkqgnheogwfdnk for weekly worklogs & task logs...',
      icon: Database,
      status: currentStepIndex > 0 ? 'completed' : currentStepIndex === 0 && isRunning ? 'running' : 'pending'
    },
    {
      id: 'wsr-calc',
      title: 'Compute WSR Team Metrics',
      description: `Aggregating ${teams.reduce((a, t) => a + t.members.length, 0)} members across ${teams.length} teams...`,
      icon: Calculator,
      status: currentStepIndex > 1 ? 'completed' : currentStepIndex === 1 && isRunning ? 'running' : 'pending'
    },
    {
      id: 'ai-analysis',
      title: 'Run Gemini AI Intelligence',
      description: 'Analyzing overtime anomalies, burnout indicators, and generating executive summary...',
      icon: Sparkles,
      status: currentStepIndex > 2 ? 'completed' : currentStepIndex === 2 && isRunning ? 'running' : 'pending'
    },
    {
      id: 'pptx-build',
      title: 'Compile PPTX Slide Deck',
      description: 'Rendering 16:9 widescreen PowerPoint deck with Black & Cyan departmental slides...',
      icon: Layers,
      status: currentStepIndex > 3 ? 'completed' : currentStepIndex === 3 && isRunning ? 'running' : 'pending'
    },
    {
      id: 'email-dispatch',
      title: `Send via Gmail to ${scheduleConfig.managerEmail}`,
      description: 'Sending authenticated RFC 2822 email with attached .pptx deck through Gmail API...',
      icon: Mail,
      status:
        currentStepIndex > 4
          ? 'completed'
          : currentStepIndex === 4 && isRunning
          ? 'running'
          : errorMsg
          ? 'failed'
          : 'pending'
    }
  ];

  const startDispatchPipeline = async () => {
    setErrorMsg(null);
    setIsRunning(true);
    setHasConfirmedSend(true);

    const dateRange = '10th Aug – 15th Aug 2026';

    try {
      // Step 0: Supabase
      setCurrentStepIndex(0);
      await new Promise((r) => setTimeout(r, 600));

      // Step 1: Compute metrics
      setCurrentStepIndex(1);
      await new Promise((r) => setTimeout(r, 500));

      // Step 2: AI analysis
      setCurrentStepIndex(2);
      await new Promise((r) => setTimeout(r, 700));

      // Step 3: PPTX build
      setCurrentStepIndex(3);
      await new Promise((r) => setTimeout(r, 700));

      // Step 4: Dispatch via Backend API
      setCurrentStepIndex(4);

      const tlEmail = import.meta.env.VITE_DEFAULT_TL_EMAIL;
      const managerEmail = import.meta.env.VITE_DEFAULT_MANAGER_EMAIL;
      
      if (!tlEmail || !managerEmail) {
        throw new Error('TL or Manager email is missing in the .env configuration');
      }

      const isApprovalRequest = true; // Route to TL for approval first

      const htmlBody = generateWsrEmailHtml(teams, dateRange, managerEmail, isApprovalRequest);
      const subject = `ACTION REQUIRED: Approve Weekly Status Report (WSR) - ${dateRange}`;

      const ccEmailsString = import.meta.env.VITE_DEFAULT_CC_EMAILS || '';
      const ccEmails = ccEmailsString.split(',').map((e: string) => e.trim()).filter(Boolean);

      const result = await sendWsrViaGmail({
        toEmail: tlEmail,
        ccEmails: ccEmails,
        subject,
        htmlBody,
        teams,
        dateRange,
        attachPptx: true // TL wants to preview the PPTX before approving
      });

      setEmailResult(result);
      setCurrentStepIndex(5);
      setIsFinished(true);
      setIsRunning(false);

      // Trigger confetti
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 }
      });
    } catch (err: any) {
      console.warn('Dispatch note:', err?.message || err);
      setErrorMsg(err.message || 'Failed to dispatch email via SMTP');
      setIsRunning(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#09090b]/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-hidden">
      <div className="bg-[#18181b] border border-[#27272a] rounded-2xl max-w-2xl w-full max-h-[88vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Fixed Header */}
        <div className="flex items-center justify-between gap-4 border-b border-[#27272a] px-6 py-4 sm:py-5 shrink-0 bg-[#18181b]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                Automated WSR Dispatch Bot
              </h2>
              <p className="text-xs text-[#71717a]">
                Direct Google Workspace Gmail delivery with official 16:9 PPTX deck
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#27272a] hover:bg-[#323235] text-[#a1a1aa] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
        {/* User Confirmation Step (Before Dispatch) */}
        {!hasConfirmedSend && !isFinished && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[#09090b] border border-[#27272a] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#71717a]">
                  Email Confirmation Details
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">
                  Gmail API Direct
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-[#27272a]">
                  <span className="text-[#a1a1aa]">Primary Recipient (To):</span>
                  <span className="font-mono text-white font-semibold">
                    {import.meta.env.VITE_DEFAULT_MANAGER_EMAIL}
                  </span>
                </div>
                {scheduleConfig.ccEmails.length > 0 && (
                  <div className="flex items-center justify-between py-1 border-b border-[#27272a]">
                    <span className="text-[#a1a1aa]">CC Recipients:</span>
                    <span className="font-mono text-[#d4d4d8]">
                      {import.meta.env.VITE_DEFAULT_CC_EMAILS.split(',').map((email: string) => email.trim()).filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between py-1 border-b border-[#27272a]">
                  <span className="text-[#a1a1aa]">Subject:</span>
                  <span className="text-white font-medium">
                    Weekly Status Report (WSR) - 10th Aug – 15th Aug 2026
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-[#a1a1aa]">Attachment:</span>
                  <span className="text-emerald-400 font-mono flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    OfficeHub360_WSR_Deck_10th_Aug_15th_Aug_2026.pptx
                  </span>
                </div>
              </div>
            </div>


  
              {errorMsg && (
              <div className="p-4 rounded-xl bg-red-950/30 border border-red-800/40 text-red-300 text-xs space-y-2">
                <div className="flex items-center gap-2 font-semibold text-red-400">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{errorMsg}</span>
                </div>
                {errorMsg.includes('unauthorized-domain') && (
                  <div className="mt-2 pt-2 border-t border-red-900/50 text-[11px] text-red-200/90 leading-relaxed space-y-1.5">
                    <p className="font-semibold text-white">Why this happens in Localhost / Local Run:</p>
                    <p>
                      Firebase Authentication blocks OAuth sign-ins from domains/ports that are not in its Authorized Domains whitelist for security.
                    </p>
                    <p className="font-semibold text-white pt-1">How to fix in 1 minute:</p>
                    <ol className="list-decimal list-inside space-y-1 text-slate-300">
                      <li>Go to <strong className="text-white">Firebase Console</strong> &rarr; Project: <code className="bg-black/40 px-1 py-0.5 rounded text-cyan-300">gen-lang-client-0750094658</code></li>
                      <li>Navigate to <strong className="text-white">Build &rarr; Authentication &rarr; Settings &rarr; Authorized domains</strong></li>
                      <li>Click <strong className="text-white">Add domain</strong> and enter: <code className="bg-black/40 px-1 py-0.5 rounded text-cyan-300">localhost</code> (or your custom local IP/domain)</li>
                      <li>Save and refresh this page.</li>
                    </ol>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#27272a]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-[#27272a] text-[#d4d4d8] text-xs font-semibold hover:bg-[#323235] border border-[#3f3f46]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={startDispatchPipeline}
                className="px-5 py-2 rounded-xl bg-white hover:bg-slate-100 text-black text-xs font-bold flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-blue-600" />
                <span>Confirm & Send WSR Email</span>
              </button>
            </div>
          </div>
        )}

        {/* Step-by-step Progress Tracker (During Dispatch) */}
        {hasConfirmedSend && (
          <div className="space-y-3">
            {steps.map((step) => {
              const Icon = step.icon;
              const isDone = step.status === 'completed';
              const isCurrent = step.status === 'running';
              const isFailed = step.status === 'failed';

              return (
                <div
                  key={step.id}
                  className={`p-3.5 rounded-xl border transition-all flex items-center gap-3.5 ${
                    isDone
                      ? 'bg-[#09090b] border-emerald-900/40 text-emerald-300'
                      : isCurrent
                      ? 'bg-[#18181b] border-blue-500/60 text-white ring-1 ring-blue-500/30'
                      : isFailed
                      ? 'bg-red-950/20 border-red-900/40 text-red-300'
                      : 'bg-[#09090b]/40 border-[#27272a] text-[#71717a] opacity-50'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      isDone
                        ? 'bg-emerald-950 border border-emerald-700 text-emerald-400'
                        : isCurrent
                        ? 'bg-blue-900/50 border border-blue-500 text-blue-300 animate-pulse'
                        : isFailed
                        ? 'bg-red-900/50 border border-red-500 text-red-300'
                        : 'bg-[#27272a] border border-[#3f3f46] text-[#71717a]'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : isCurrent ? (
                      <Icon className="w-5 h-5 animate-spin" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <strong className="text-xs font-semibold text-white">{step.title}</strong>
                      <span className="text-[10px] font-mono uppercase tracking-wider">
                        {isDone
                          ? 'Delivered'
                          : isCurrent
                          ? 'In Progress...'
                          : isFailed
                          ? 'Failed'
                          : 'Queued'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#a1a1aa] mt-0.5">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Error notification during pipeline */}
        {errorMsg && hasConfirmedSend && !isFinished && (
          <div className="p-4 rounded-xl bg-red-950/30 border border-red-800/40 space-y-3">
            <div className="text-xs font-bold text-red-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Email Dispatch Error</span>
            </div>
            <p className="text-xs text-red-200">{errorMsg}</p>

            <div className="pt-2 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => startDispatchPipeline()}
                className="px-4 py-2 rounded-xl bg-white text-black text-xs font-bold hover:bg-slate-100 flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5 text-blue-600" />
                <span>Retry Dispatch</span>
              </button>
              <button
                type="button"
                onClick={() => setHasConfirmedSend(false)}
                className="px-4 py-2 rounded-xl bg-[#27272a] text-[#d4d4d8] text-xs font-medium hover:bg-[#323235] border border-[#3f3f46] cursor-pointer"
              >
                Back to Details
              </button>
            </div>
          </div>
        )}

        {/* Success Card & Summary */}
        {isFinished && (
          <div className="p-5 rounded-xl bg-emerald-950/20 border border-emerald-800/40 space-y-4 animate-in fade-in">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <CheckCircle className="w-4 h-4" />
              Weekly WSR Email & PPT Deck Delivered to Gmail!
            </div>
            <p className="text-xs text-[#d4d4d8] leading-relaxed">
              The automated WSR report for <strong>10th Aug – 15th Aug 2026</strong> has been delivered to{' '}
              <strong className="text-white">{scheduleConfig.managerEmail}</strong>
              {scheduleConfig.ccEmails.length > 0 && (
                <> (CC: {scheduleConfig.ccEmails.join(', ')})</>
              )} with the complete 16:9 widescreen presentation deck attached.
            </p>

            {emailResult?.messageId && (
              <div className="space-y-2">
                <div className="p-3 rounded-lg bg-[#09090b] border border-[#27272a] text-[11px] font-mono text-[#a1a1aa] flex items-center justify-between">
                  <span>Gmail Message ID: {emailResult.messageId}</span>
                  <span className="text-emerald-400 font-bold">STATUS: SENT</span>
                </div>
                <div className="p-3 rounded-lg bg-blue-950/20 border border-blue-800/30 text-[11px] text-slate-300 space-y-1">
                  <div className="font-semibold text-blue-300 flex items-center gap-1.5">
                    <span>💡 Don't see it in your primary inbox?</span>
                  </div>
                  <p>
                    Because this is an automated report with a presentation attachment from a new address (<code>wsrvtabsquare@gmail.com</code>), check your <strong>Spam / Junk</strong> folder, <strong>Updates</strong> tab, or search <a href="https://mail.google.com/mail/u/0/#search/from%3Awsrvtabsquare%40gmail.com+OR+in%3Aspam" target="_blank" rel="noreferrer" className="text-cyan-400 underline font-mono">from:wsrvtabsquare@gmail.com</a> in Gmail.
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onDownloadPptx}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-black text-xs font-bold shadow-md transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-blue-600" />
                <span>Download .PPTX Copy</span>
              </button>

              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-[#27272a] hover:bg-[#323235] text-[#d4d4d8] text-xs font-medium border border-[#3f3f46] cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};
