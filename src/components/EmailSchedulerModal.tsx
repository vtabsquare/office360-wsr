import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Mail,
  CheckCircle,
  FileText,
  Send,
  X,
  Code,
  Copy,
  Check,
  Bell
} from 'lucide-react';
import { BotScheduleConfig } from '../types/wsr';

interface EmailSchedulerModalProps {
  config: BotScheduleConfig;
  onSaveConfig: (updated: BotScheduleConfig) => void;
  onClose: () => void;
  onRunBotNow: () => void;
}

export const EmailSchedulerModal: React.FC<EmailSchedulerModalProps> = ({
  config,
  onSaveConfig,
  onClose,
  onRunBotNow
}) => {
  const [formData, setFormData] = useState<BotScheduleConfig>({ ...config });
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [newCcEmail, setNewCcEmail] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(formData);
    onClose();
  };

  const handleAddCc = () => {
    if (newCcEmail && !formData.ccEmails.includes(newCcEmail)) {
      setFormData({
        ...formData,
        ccEmails: [...formData.ccEmails, newCcEmail]
      });
      setNewCcEmail('');
    }
  };

  const handleRemoveCc = (emailToRemove: string) => {
    setFormData({
      ...formData,
      ccEmails: formData.ccEmails.filter((e) => e !== emailToRemove)
    });
  };

  const curlCommand = `curl -X POST https://officehub360.vtabsquare.com/api/bot/dispatch-now \\
  -H "Content-Type: application/json" \\
  -d '{"trigger": "weekly_cron_monday", "managerEmail": "${formData.managerEmail}"}'`;

  return (
    <div className="fixed inset-0 z-50 bg-[#09090b]/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-hidden">
      <div className="bg-[#18181b] border border-[#27272a] rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Fixed Header */}
        <div className="flex items-center justify-between gap-4 border-b border-[#27272a] px-5 sm:px-6 py-4 shrink-0 bg-[#18181b]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-950/80 border border-indigo-700/50 text-indigo-400 shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Automated Weekly WSR Scheduler
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-700/50 text-emerald-400 font-semibold">
                  Active
                </span>
              </h2>
              <p className="text-xs text-[#71717a] hidden sm:block">
                Dispatches last week’s WSR & PPTX presentation to manager’s inbox every week start
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

        {/* Scrollable Configuration Form */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 space-y-5">
          {/* Enable Switch */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div>
              <strong className="text-sm text-white font-semibold">Automated Weekly Bot Dispatch</strong>
              <p className="text-xs text-slate-400 mt-0.5">
                Automatically generate PPT deck and send email to manager every Monday morning
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.enabled}
                onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
            </label>
          </div>

          {/* Schedule Timing */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                Dispatch Day
              </label>
              <select
                value={formData.dayOfWeek}
                onChange={(e: any) => setFormData({ ...formData, dayOfWeek: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500"
              >
                <option value="Monday">Every Monday (Week Start)</option>
                <option value="Sunday">Every Sunday (Week End)</option>
                <option value="Friday">Every Friday (Sprint Wrap)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                Dispatch Time
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Timezone
              </label>
              <input
                type="text"
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Manager's Recipient Email */}
          <div className="opacity-70 cursor-not-allowed">
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-cyan-400" />
              Manager's Email (Configured via .env)
            </label>
            <input
              type="email"
              disabled
              value={import.meta.env.VITE_DEFAULT_MANAGER_EMAIL}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-500 font-mono focus:outline-none cursor-not-allowed"
            />
          </div>

          {/* CC Emails */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              CC Recipients (Management / Team Leads)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="email"
                value={newCcEmail}
                onChange={(e) => setNewCcEmail(e.target.value)}
                placeholder="add-lead@vtabsquare.com"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-cyan-500"
              />
              <button
                type="button"
                onClick={handleAddCc}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700"
              >
                Add CC
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.ccEmails.map((email) => (
                <span
                  key={email}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono"
                >
                  {email}
                  <button
                    type="button"
                    onClick={() => handleRemoveCc(email)}
                    className="text-slate-500 hover:text-red-400"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Attachment options */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
              <input
                type="checkbox"
                checked={formData.includePptxAttachment}
                onChange={(e) =>
                  setFormData({ ...formData, includePptxAttachment: e.target.checked })
                }
                className="rounded border-slate-700 bg-slate-900 text-cyan-600 focus:ring-0"
              />
              <span>
                Attach official PowerPoint presentation (<strong>.pptx</strong>) with separate team slides
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
              <input
                type="checkbox"
                checked={formData.includeAiSummary}
                onChange={(e) =>
                  setFormData({ ...formData, includeAiSummary: e.target.checked })
                }
                className="rounded border-slate-700 bg-slate-900 text-cyan-600 focus:ring-0"
              />
              <span>Include Gemini AI Executive Summary & Standup talking points in email body</span>
            </label>
          </div>

          {/* Webhook Endpoint for Cloud Cron Schedulers */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-cyan-400" />
                Cloud Scheduler / Supabase Webhook Command
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(curlCommand);
                  setCopiedCurl(true);
                  setTimeout(() => setCopiedCurl(false), 2000);
                }}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-cyan-300"
              >
                {copiedCurl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCurl ? 'Copied' : 'Copy cURL'}</span>
              </button>
            </div>
            <pre className="text-[11px] font-mono text-cyan-300/80 bg-slate-950 p-2.5 rounded-lg border border-slate-900 overflow-x-auto whitespace-pre-wrap">
              {curlCommand}
            </pre>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => {
                onClose();
                onRunBotNow();
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-medium border border-slate-700"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Test Bot & Send Email Now</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-cyan-600 text-white text-xs font-semibold hover:bg-cyan-500 shadow-md shadow-cyan-600/20"
              >
                Save Schedule
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
