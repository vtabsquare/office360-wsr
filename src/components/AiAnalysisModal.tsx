import React, { useState } from 'react';
import {
  Sparkles,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Flame,
  Copy,
  Check,
  RefreshCw,
  X,
  Send,
  MessageSquare
} from 'lucide-react';
import { AiInsightReport, TeamWsrData } from '../types/wsr';

interface AiAnalysisModalProps {
  report: AiInsightReport | null;
  isLoading: boolean;
  onRefresh: () => void;
  onClose: () => void;
  onOpenChat: () => void;
}

export const AiAnalysisModal: React.FC<AiAnalysisModalProps> = ({
  report,
  isLoading,
  onRefresh,
  onClose,
  onOpenChat
}) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleCopy = (text: string, sectionKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionKey);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-teal-500/20 border border-cyan-500/30 text-cyan-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Gemini AI Executive WSR Intelligence
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-900/60 border border-cyan-600/40 text-cyan-300 font-mono">
                  gemini-3.7-flash
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Automated workload analysis, burnout detection, and standup talking points
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors disabled:opacity-50"
              title="Re-run AI Analysis"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="py-16 flex flex-col items-center justify-center space-y-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin" />
              <Sparkles className="w-6 h-6 text-cyan-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <div className="text-center">
              <h3 className="text-sm font-bold text-white">Analyzing Timesheet Records</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Evaluating billable hours, non-productive gaps, delivery velocity, and overtime anomalies...
              </p>
            </div>
          </div>
        )}

        {/* Content */}
        {!isLoading && report && (
          <div className="space-y-6">
            {/* 1. Executive Summary Box */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 relative group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4" />
                  Executive Summary
                </span>
                <button
                  onClick={() => handleCopy(report.executiveSummary, 'summary')}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs border border-slate-800"
                >
                  {copiedSection === 'summary' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSection === 'summary' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                {report.executiveSummary}
              </p>
            </div>

            {/* 2. Overtime & Burnout Alerts */}
            {report.overtimeAlerts && report.overtimeAlerts.length > 0 && (
              <div className="bg-amber-950/20 border border-amber-900/40 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-amber-400" />
                    Overtime & Workload Risk Alerts ({report.overtimeAlerts.length})
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-amber-900/50 text-amber-300 font-mono">
                    {report.burnoutRiskCount} High Risk
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {report.overtimeAlerts.map((alert, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-lg bg-slate-950/80 border border-amber-800/30 flex items-start gap-3"
                    >
                      <div
                        className={`p-1.5 rounded-lg mt-0.5 ${
                          alert.riskLevel === 'high'
                            ? 'bg-red-950 text-red-400 border border-red-800/50'
                            : 'bg-amber-950 text-amber-400 border border-amber-800/50'
                        }`}
                      >
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-slate-200 text-xs">{alert.employeeName}</strong>
                          <span className="text-[10px] text-slate-400 font-mono">({alert.teamName})</span>
                        </div>
                        <div className="text-xs font-bold text-amber-400 mt-0.5">
                          {alert.totalHours} Total Hours Logged
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                          {alert.reason}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Team Health & Velocity Grid */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-cyan-400" />
                Team Velocity & Health Ratings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {report.teamHighlights.map((team, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <strong className="text-white text-sm font-semibold">{team.teamName}</strong>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-400 uppercase">Productivity</span>
                        <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 text-xs font-bold font-mono">
                          {team.productivityScore}%
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{team.summary}</p>
                    <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80 flex items-center justify-between">
                      <span>
                        ⭐ Top Performer: <strong className="text-emerald-400">{team.topPerformer}</strong>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Monday Morning Standup Talking Points */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" />
                  Monday Morning Manager Talking Points
                </span>
                <button
                  onClick={() =>
                    handleCopy(report.standupTalkingPoints.join('\n• '), 'talkingPoints')
                  }
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs border border-slate-800"
                >
                  {copiedSection === 'talkingPoints' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedSection === 'talkingPoints' ? 'Copied' : 'Copy Notes'}</span>
                </button>
              </div>
              <ul className="space-y-2">
                {report.standupTalkingPoints.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                    <span className="text-cyan-400 font-bold mt-0.5">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 5. Resource Recommendations */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" />
                Strategic Recommendations
              </span>
              <ul className="space-y-2">
                {report.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                    <span className="text-purple-400 font-bold mt-0.5">→</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            onClick={() => {
              onClose();
              onOpenChat();
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700"
          >
            <MessageSquare className="w-4 h-4 text-cyan-400" />
            <span>Ask Custom Question in Chat</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-600/20"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
