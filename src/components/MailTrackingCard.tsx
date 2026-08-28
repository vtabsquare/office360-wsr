import React, { useEffect, useState } from 'react';
import { Mail, CheckCircle, Clock, AlertTriangle, ArrowRight } from 'lucide-react';

import { BotScheduleConfig } from '../types/wsr';

interface MailFlowLog {
  id: string;
  week: string;
  calculatedAt: string;
  sentToTlAt?: string;
  approvedByTlAt?: string;
  reachedManagerAt?: string;
  status: 'CALCULATING' | 'PENDING_APPROVAL' | 'COMPLETED' | 'FAILED';
  error?: string;
}

interface MailTrackingCardProps {
  scheduleConfig: BotScheduleConfig;
}

export const MailTrackingCard: React.FC<MailTrackingCardProps> = ({ scheduleConfig }) => {
  const [logs, setLogs] = useState<MailFlowLog[]>([]);
  
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch('/api/wsr/dispatch-logs');
        if (res.ok) {
          const data = await res.json();
          setLogs(data);
        }
      } catch (err) {
        console.error('Failed to fetch dispatch logs', err);
      }
    };
    
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  const latestLog = logs.length > 0 ? logs[0] : null;

  return (
    <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-4 sm:p-5 flex-1 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <span className="text-xs font-semibold text-white uppercase tracking-wider">Mail Transfer Flow</span>
        {latestLog?.status === 'CALCULATING' || latestLog?.status === 'PENDING_APPROVAL' ? (
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
        ) : latestLog?.status === 'COMPLETED' ? (
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
        ) : latestLog?.status === 'FAILED' ? (
          <span className="w-2 h-2 rounded-full bg-red-500" />
        ) : (
          <span className="w-2 h-2 rounded-full bg-slate-600" />
        )}
      </div>

      {!latestLog ? (
        <div className="text-xs text-[#71717a] flex flex-col items-center justify-center h-full space-y-2 py-4">
          <Clock className="w-6 h-6 opacity-50 mb-1 text-slate-400" />
          <span className="text-center font-medium">
            No automated dispatches logged yet.<br/>
            Runs {scheduleConfig.dayOfWeek}s @ {
              (() => {
                const [h, m] = scheduleConfig.time.split(':');
                const hour24 = parseInt(h, 10);
                const ampm = hour24 >= 12 ? 'PM' : 'AM';
                const hour12 = hour24 % 12 || 12;
                return `${hour12.toString().padStart(2, '0')}:${m} ${ampm}`;
              })()
            }.
          </span>
        </div>
      ) : (
        <div className="space-y-3 my-1 relative">
          <div className="text-[11px] text-[#60a5fa] font-mono mb-2 flex items-center justify-between">
            <span>Cycle: {latestLog.week}</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[9px] uppercase">{latestLog.status.replace('_', ' ')}</span>
          </div>
          
          <div className="relative flex flex-col space-y-3">
            {/* Step 1: Calculated */}
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full border border-emerald-900 bg-emerald-950 text-emerald-400 flex items-center justify-center z-10 shrink-0">
                <CheckCircle className="w-3 h-3" />
              </div>
              <div className="flex-1 flex items-center justify-between bg-[#09090b]/60 border border-[#27272a] p-2 rounded-lg">
                <span className="text-[10px] font-bold text-slate-300">Calculated</span>
                <span className="text-[10px] font-mono text-slate-500">
                  {new Date(latestLog.calculatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
            </div>

            {/* Step 2: Sent to TL */}
            <div className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full border ${latestLog.sentToTlAt ? 'border-emerald-900 bg-emerald-950 text-emerald-400' : latestLog.status === 'FAILED' && !latestLog.sentToTlAt ? 'border-red-900 bg-red-950 text-red-500' : 'border-[#27272a] bg-[#18181b] text-[#71717a]'} flex items-center justify-center z-10 shrink-0`}>
                {latestLog.sentToTlAt ? <CheckCircle className="w-3 h-3" /> : latestLog.status === 'FAILED' && !latestLog.sentToTlAt ? <AlertTriangle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
              </div>
              <div className="flex-1 flex items-center justify-between bg-[#09090b]/60 border border-[#27272a] p-2 rounded-lg">
                <span className="text-[10px] font-bold text-slate-300">Sent to TL</span>
                <span className="text-[10px] font-mono text-slate-500">
                  {latestLog.sentToTlAt ? new Date(latestLog.sentToTlAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Pending'}
                </span>
              </div>
            </div>

            {/* Step 3: TL Approved */}
            <div className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full border ${latestLog.approvedByTlAt ? 'border-emerald-900 bg-emerald-950 text-emerald-400' : 'border-[#27272a] bg-[#18181b] text-[#71717a]'} flex items-center justify-center z-10 shrink-0`}>
                {latestLog.approvedByTlAt ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
              </div>
              <div className="flex-1 flex items-center justify-between bg-[#09090b]/60 border border-[#27272a] p-2 rounded-lg">
                <span className="text-[10px] font-bold text-slate-300">TL Approved</span>
                <span className="text-[10px] font-mono text-slate-500">
                  {latestLog.approvedByTlAt ? new Date(latestLog.approvedByTlAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Awaiting'}
                </span>
              </div>
            </div>

            {/* Step 4: Reached Manager */}
            <div className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full border ${latestLog.reachedManagerAt ? 'border-blue-900 bg-blue-950 text-blue-400' : latestLog.status === 'FAILED' && latestLog.sentToTlAt ? 'border-red-900 bg-red-950 text-red-500' : 'border-[#27272a] bg-[#18181b] text-[#71717a]'} flex items-center justify-center z-10 shrink-0`}>
                {latestLog.reachedManagerAt ? <CheckCircle className="w-3 h-3" /> : latestLog.status === 'FAILED' && latestLog.sentToTlAt ? <AlertTriangle className="w-3 h-3" /> : <Mail className="w-3 h-3" />}
              </div>
              <div className="flex-1 flex items-center justify-between bg-[#09090b]/60 border border-[#27272a] p-2 rounded-lg">
                <span className="text-[10px] font-bold text-slate-300">Manager Sent</span>
                <span className="text-[10px] font-mono text-slate-500">
                  {latestLog.reachedManagerAt ? new Date(latestLog.reachedManagerAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : (latestLog.status === 'FAILED' && latestLog.sentToTlAt) ? 'Failed' : 'Pending'}
                </span>
              </div>
            </div>

            {/* Connecting line */}
            <div className="absolute top-4 bottom-4 left-3 w-px bg-[#27272a] -z-0"></div>
          </div>
          
          {latestLog.status === 'FAILED' && latestLog.error && (
            <div className="mt-3 p-2.5 rounded-lg bg-red-950/40 border border-red-900/40 text-[10px] text-red-300 leading-tight">
              <span className="font-bold uppercase tracking-wider text-[9px] opacity-80 block mb-1">Error Trace:</span> {latestLog.error}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
