import React, { useState } from 'react';
import { X, Calendar, Download, RefreshCw, Clock, CheckCircle, Layers, AlertTriangle } from 'lucide-react';
import { TeamWsrData } from '../types/wsr';
import { INITIAL_TEAMS_DATA } from '../data/initialWsrData';
import { useFocusTrap } from '../hooks/useFocusTrap';

interface CustomTimelineModalProps {
  onClose: () => void;
}

export const CustomTimelineModal: React.FC<CustomTimelineModalProps> = ({ onClose }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [scaledTeams, setScaledTeams] = useState<TeamWsrData[] | null>(null);
  const [dateLabel, setDateLabel] = useState('');

  const modalRef = useFocusTrap(onClose);

  const handleGenerate = async () => {
    if (!startDate || !endDate) return;
    setIsGenerating(true);
    
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      const response = await fetch(`/api/wsr/live-data?fromDate=${startDate}&toDate=${endDate}`);
      if (!response.ok) throw new Error('Failed to fetch custom timeline data');
      
      const newTeams = await response.json();
      
      setScaledTeams(newTeams);
      setDateLabel(`${start.toLocaleDateString()} - ${end.toLocaleDateString()}`);
    } catch (err) {
      console.error(err);
      alert('Failed to generate report for selected dates.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPdf = async () => {
    const element = document.getElementById('report-content');
    if (!element) return;
    
    try {
      const { toPng } = await import('html-to-image');
      const { jsPDF } = await import('jspdf');
      
      const dataUrl = await toPng(element, { 
        backgroundColor: '#0f0f12',
        pixelRatio: 2
      });
      
      const pdf = new jsPDF({
        orientation: 'portrait', // portrait since it's a long scrollable report
        unit: 'px',
        format: [element.offsetWidth, element.offsetHeight]
      });
      
      pdf.addImage(dataUrl, 'PNG', 0, 0, element.offsetWidth, element.offsetHeight);
      pdf.save(`wsr_timeline_${startDate}_${endDate}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div 
        ref={modalRef}
        className="relative w-full max-w-5xl max-h-[90vh] flex flex-col bg-[#09090b] border border-[#27272a] rounded-2xl shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#27272a] bg-[#18181b] shrink-0">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-semibold text-white">Custom Timeline WSR Report</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 transition-colors rounded-lg hover:bg-gray-800 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6 shrink-0">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-300 mb-1">Start Date</label>
              <input 
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-[#18181b] border border-[#27272a] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 [color-scheme:dark]"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-300 mb-1">End Date</label>
              <input 
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-[#18181b] border border-[#27272a] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 [color-scheme:dark]"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleGenerate}
                disabled={!startDate || !endDate || isGenerating}
                className="h-[42px] px-6 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                {isGenerating ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Layers className="w-4 h-4" />
                )}
                Generate
              </button>
            </div>
          </div>

          {scaledTeams && (
            <div className="bg-[#0f0f12] rounded-xl border border-[#27272a] mb-4 p-8" id="report-content">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-black tracking-tight" style={{ color: '#e8f4f8' }}>OfficeHub360 Custom Timeline WSR</h1>
                <p className="mt-2 text-sm font-semibold tracking-widest uppercase" style={{ color: '#4db6c9' }}>
                  {dateLabel}
                </p>
                <div className="mt-4 mx-auto w-16 h-1 rounded-full" style={{ background: 'linear-gradient(90deg, #00c6d7, #0097a7)' }} />
              </div>

              <div className="space-y-8">
                {scaledTeams.map(team => (
                  <div key={team.id} className="border border-[#0097a7]/30 rounded-xl overflow-hidden shadow-lg">
                    <div className="bg-gradient-to-r from-[#0c2233] to-[#0d2a3e] px-5 py-4 border-b border-[#0097a7]/30 flex justify-between items-center">
                      <h3 className="text-[#e8f4f8] font-bold text-xl flex items-center gap-2">
                        <div className="w-1 h-5 rounded-full bg-gradient-to-b from-[#00e5ff] to-[#0097a7]" />
                        WSR – {team.name}
                      </h3>
                      <span className="text-[#4db6c9] text-xs font-semibold px-2 py-1 bg-[#0097a7]/20 rounded-full border border-[#0097a7]/40">
                        {team.members.length} Members
                      </span>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-[#081f33] text-[#7dd3e0]">
                          <tr>
                            <th className="px-5 py-3 font-semibold border-b border-[#0097a7]/30 border-r border-[#0097a7]/20 w-[20%] uppercase tracking-wider text-xs">METRIC</th>
                            {team.members.map(m => (
                              <th key={m.id} className="px-5 py-3 font-semibold border-b border-[#0097a7]/30 border-r border-[#0097a7]/20 text-[#e0f5f9]">
                                {m.displayName || m.name.split(' ')[0]}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#0097a7]/20">
                          <tr className="bg-[#0c2233]">
                            <td className="px-5 py-3 font-bold text-[#a5e4ef] border-r border-[#0097a7]/20">Total Hours</td>
                            {team.members.map(m => (
                              <td key={m.id} className="px-5 py-3 font-bold text-white border-r border-[#0097a7]/20 text-[15px]">
                                {typeof m.totalHours === 'number' ? Number(m.totalHours.toFixed(2)) : m.totalHours}
                              </td>
                            ))}
                          </tr>
                          <tr className="bg-[#081f33]">
                            <td className="px-5 py-3 font-medium text-[#7dd3e0] border-r border-[#0097a7]/20">Productive Hours</td>
                            {team.members.map(m => (
                              <td key={m.id} className="px-5 py-3 text-[#d4eef5] border-r border-[#0097a7]/20">
                                {typeof m.productiveHours === 'number' ? Number(m.productiveHours.toFixed(2)) : m.productiveHours}
                              </td>
                            ))}
                          </tr>
                          <tr className="bg-[#0c2233]">
                            <td className="px-5 py-3 font-medium text-[#7dd3e0] border-r border-[#0097a7]/20">Non-Productive</td>
                            {team.members.map(m => (
                              <td key={m.id} className="px-5 py-3 text-[#d4eef5] border-r border-[#0097a7]/20">
                                {typeof m.nonProductiveHours === 'number' ? Number(m.nonProductiveHours.toFixed(2)) : m.nonProductiveHours}
                              </td>
                            ))}
                          </tr>
                          <tr className="bg-[#081f33]">
                            <td className="px-5 py-3 font-bold text-[#7dd3e0] border-r border-[#0097a7]/20">Tasks Completed</td>
                            {team.members.map(m => (
                              <td key={m.id} className="px-5 py-3 font-bold text-[#67d5e3] border-r border-[#0097a7]/20">
                                {m.tasksCompleted}
                              </td>
                            ))}
                          </tr>
                          <tr className="bg-[#0c2233]">
                            <td className="px-5 py-3 font-medium text-[#7dd3e0] border-r border-[#0097a7]/20">Carry Forward</td>
                            {team.members.map(m => (
                              <td key={m.id} className={`px-5 py-3 border-r border-[#0097a7]/20 ${m.carryForward > 0 ? 'text-amber-400 font-bold' : 'text-[#d4eef5]'}`}>
                                {m.carryForward > 0 ? m.carryForward : '0'}
                              </td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {scaledTeams && (
            <div className="flex justify-end sticky bottom-0 pt-4 bg-[#09090b] border-t border-[#27272a]">
              <button
                onClick={handleDownloadPdf}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 shadow-lg"
              >
                <Download className="w-4 h-4" />
                Download Full PDF Report
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
