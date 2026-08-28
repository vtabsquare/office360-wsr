import React, { useState, useEffect } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Maximize,
  Minimize,
  Download,
  Clock,
  Send
} from 'lucide-react';
import { TeamWsrData } from '../types/wsr';
import { calculateDynamicDateRange } from '../utils/dateUtils';

interface PresentationModeProps {
  teams: TeamWsrData[];
  onClose: () => void;
  onDownloadPptx: () => void;
  onRunBotNow: () => void;
}

export const PresentationMode: React.FC<PresentationModeProps> = ({
  teams,
  onClose,
  onDownloadPptx,
  onRunBotNow
}) => {
  const [slideIndex, setSlideIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const totalSlides = teams.length + 2;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        setSlideIndex((prev) => (prev < totalSlides - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        setSlideIndex((prev) => (prev > 0 ? prev - 1 : totalSlides - 1));
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [totalSlides, onClose]);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentTeam =
    slideIndex > 0 && slideIndex <= teams.length ? teams[slideIndex - 1] : null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col justify-between p-4 sm:p-8 select-none">
      {/* Top Bar */}
      <div className="flex items-center justify-between text-slate-400 text-xs sm:text-sm px-2">
        <div className="flex items-center gap-3">
          <span className="font-bold text-white text-base">OfficeHub360 WSR Presenter</span>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-cyan-400">
            <Clock className="w-3.5 h-3.5" />
            <span className="font-mono">{formatTimer(elapsedSeconds)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onDownloadPptx}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-600 text-white text-xs font-semibold"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .PPTX</span>
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
            title="Exit Presenter Mode (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Center Slide Canvas */}
      <div className="flex-1 flex items-center justify-center my-4">
        <div className="w-full max-w-6xl aspect-[16/9] bg-white rounded-xl shadow-2xl overflow-hidden relative flex flex-col justify-between border border-slate-300">
          
          {/* SLIDE 0: Cover */}
          {slideIndex === 0 && (
            <div className="h-full flex flex-col justify-between p-10 sm:p-14 bg-gradient-to-br from-slate-50 via-white to-cyan-50">
              <div className="h-3 w-full bg-cyan-600 -mt-10 sm:-mt-14 -mx-10 sm:-mx-14 mb-8" />
              <div>
                <div className="inline-block px-3 py-1 rounded bg-cyan-100 text-cyan-900 font-bold text-xs uppercase tracking-wider mb-4">
                  OfficeHub360 • Weekly Status Report
                </div>
                <h1 className="text-4xl sm:text-6xl font-black text-slate-950">
                  Weekly Status Report
                </h1>
                <p className="text-xl sm:text-2xl text-slate-600 mt-3 font-medium">
                  Team Performance, Timesheets & Task Velocity Deck
                </p>
                <div className="w-28 h-1.5 bg-cyan-600 mt-6" />
              </div>

              <div className="grid grid-cols-3 gap-6 my-auto">
                <div className="p-5 rounded-2xl bg-white shadow-sm border border-slate-200">
                  <div className="text-xs font-bold text-slate-400 uppercase">Period</div>
                  <div className="text-2xl font-bold text-slate-900 mt-1">{calculateDynamicDateRange()}</div>
                  <div className="text-sm text-slate-500 mt-1">WSR Cycle 33</div>
                </div>
                <div className="p-5 rounded-2xl bg-white shadow-sm border border-slate-200">
                  <div className="text-xs font-bold text-slate-400 uppercase">Total Logged Hours</div>
                  <div className="text-2xl font-bold text-cyan-600 mt-1">
                    {teams.reduce((a, t) => a + t.members.reduce((b, m) => b + m.totalHours, 0), 0).toFixed(1)} hrs
                  </div>
                  <div className="text-sm text-slate-500 mt-1">{teams.length} Engineering Teams</div>
                </div>
                <div className="p-5 rounded-2xl bg-white shadow-sm border border-slate-200">
                  <div className="text-xs font-bold text-slate-400 uppercase">Velocity</div>
                  <div className="text-2xl font-bold text-emerald-600 mt-1">
                    {teams.reduce((a, t) => a + t.members.reduce((b, m) => b + m.tasksCompleted, 0), 0)} Delivered
                  </div>
                  <div className="text-sm text-slate-500 mt-1">Supabase ofzdvvjkqgnheogwfdnk</div>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs text-slate-400 border-t border-slate-200 pt-4">
                <span>Confidential • Prepared for Executive Leadership</span>
                <span>OfficeHub360</span>
              </div>
            </div>
          )}

          {/* SLIDES 1..N: Individual Team Slides */}
          {currentTeam && (
            <div className="h-full flex flex-col justify-between p-8 sm:p-12 bg-white">
              <div>
                <div className="flex items-baseline justify-between">
                  <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
                    WSR – {currentTeam.name}
                  </h2>
                  <span className="text-2xl sm:text-3xl font-bold text-slate-950 font-sans">
                    {currentTeam.dateRange}
                  </span>
                </div>

                <div className="w-full h-1 bg-cyan-700 mt-3 mb-8" />

                <div className="w-full overflow-x-auto border border-cyan-900/40">
                  <table className="w-full border-collapse text-left text-xs sm:text-sm font-sans">
                    <thead>
                      <tr className="bg-black text-white">
                        <th className="py-2 px-4 font-bold border-r border-slate-800 w-56">Name</th>
                        {currentTeam.members.map((m) => (
                          <th key={m.id} className="py-2 px-4 font-bold border-r border-slate-800 last:border-r-0">
                            {m.displayName || m.name.split(' ')[0]}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-[#0097a7] text-white border-b border-cyan-800/40">
                        <td className="py-1.5 px-4 font-semibold border-r border-cyan-800/40">Total Hours</td>
                        {currentTeam.members.map((m) => (
                          <td key={m.id} className="py-1.5 px-4 border-r border-cyan-800/40 last:border-r-0 font-medium">
                            {m.totalHours.toFixed(2)}
                          </td>
                        ))}
                      </tr>
                      <tr className="bg-[#00838f] text-white border-b border-cyan-800/40">
                        <td className="py-1.5 px-4 font-semibold border-r border-cyan-800/40">Productive Hours</td>
                        {currentTeam.members.map((m) => (
                          <td key={m.id} className="py-1.5 px-4 border-r border-cyan-800/40 last:border-r-0 font-medium">
                            {m.productiveHours.toFixed(2)}
                          </td>
                        ))}
                      </tr>
                      <tr className="bg-[#0097a7] text-white border-b border-cyan-800/40">
                        <td className="py-1.5 px-4 font-semibold border-r border-cyan-800/40">Non – Productive Hours</td>
                        {currentTeam.members.map((m) => (
                          <td key={m.id} className="py-1.5 px-4 border-r border-cyan-800/40 last:border-r-0 font-medium">
                            {m.nonProductiveHours.toFixed(2)}
                          </td>
                        ))}
                      </tr>
                      <tr className="bg-[#00838f] text-white border-b border-cyan-800/40">
                        <td className="py-1.5 px-4 font-semibold border-r border-cyan-800/40">Tasks Completed</td>
                        {currentTeam.members.map((m) => (
                          <td key={m.id} className="py-1.5 px-4 border-r border-cyan-800/40 last:border-r-0 font-medium">
                            {m.tasksCompleted}
                          </td>
                        ))}
                      </tr>
                      <tr className="bg-[#0097a7] text-white border-b border-cyan-800/40">
                        <td className="py-1.5 px-4 font-semibold border-r border-cyan-800/40">Carry Forward</td>
                        {currentTeam.members.map((m) => (
                          <td key={m.id} className="py-1.5 px-4 border-r border-cyan-800/40 last:border-r-0 font-medium">
                            {m.carryForward}
                          </td>
                        ))}
                      </tr>
                      <tr className="bg-[#00838f] text-white border-b border-cyan-800/40">
                        <td className="py-1.5 px-4 font-semibold border-r border-cyan-800/40">Billable Hours</td>
                        {currentTeam.members.map((m) => (
                          <td key={m.id} className="py-1.5 px-4 border-r border-cyan-800/40 last:border-r-0 font-medium">
                            {m.billableHours > 0 ? m.billableHours.toFixed(2) : '0'}
                          </td>
                        ))}
                      </tr>
                      <tr className="bg-[#0097a7] text-white border-b border-cyan-800/40">
                        <td className="py-1.5 px-4 font-semibold border-r border-cyan-800/40">Non – Billable Hours</td>
                        {currentTeam.members.map((m) => (
                          <td key={m.id} className="py-1.5 px-4 border-r border-cyan-800/40 last:border-r-0 font-medium">
                            {m.nonBillableHours > 0 ? m.nonBillableHours.toFixed(2) : '0'}
                          </td>
                        ))}
                      </tr>
                      <tr className="bg-[#00838f] text-white">
                        <td className="py-1.5 px-4 font-semibold border-r border-cyan-800/40">Holidays Availed</td>
                        {currentTeam.members.map((m) => (
                          <td key={m.id} className="py-1.5 px-4 border-r border-cyan-800/40 last:border-r-0 font-medium">
                            {m.holidaysAvailed}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs text-slate-400 border-t border-slate-100 pt-3">
                <span>OfficeHub360 • {currentTeam.name}</span>
                <span>Page {slideIndex + 1} of {totalSlides}</span>
              </div>
            </div>
          )}

          {/* FINAL SLIDE: Summary */}
          {slideIndex === totalSlides - 1 && (
            <div className="h-full flex flex-col justify-between p-8 sm:p-12 bg-white">
              <div>
                <div className="flex items-baseline justify-between">
                  <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
                    WSR – Executive Summary & Cross-Team KPIs
                  </h2>
                  <span className="text-2xl sm:text-3xl font-bold text-slate-950">
                    Overview
                  </span>
                </div>
                <div className="w-full h-1 bg-cyan-700 mt-3 mb-8" />

                <div className="w-full overflow-x-auto border border-cyan-900/40">
                  <table className="w-full border-collapse text-left text-sm font-sans">
                    <thead>
                      <tr className="bg-black text-white">
                        <th className="py-3 px-4 font-bold">Team Name</th>
                        <th className="py-3 px-4 font-bold text-center">Engineers</th>
                        <th className="py-3 px-4 font-bold text-right">Total Hours</th>
                        <th className="py-3 px-4 font-bold text-right">Productive Hrs</th>
                        <th className="py-3 px-4 font-bold text-center">Productivity %</th>
                        <th className="py-3 px-4 font-bold text-center">Tasks Done</th>
                        <th className="py-3 px-4 font-bold text-center">Carry Fwd</th>
                        <th className="py-3 px-4 font-bold text-right">Billable Hrs</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teams.map((t, idx) => {
                        const tTotal = t.members.reduce((a, m) => a + m.totalHours, 0);
                        const tProd = t.members.reduce((a, m) => a + m.productiveHours, 0);
                        const tTasks = t.members.reduce((a, m) => a + m.tasksCompleted, 0);
                        const tCarry = t.members.reduce((a, m) => a + m.carryForward, 0);
                        const tBill = t.members.reduce((a, m) => a + m.billableHours, 0);
                        const prodRatio = tTotal > 0 ? ((tProd / tTotal) * 100).toFixed(1) : '0';
                        const rowBg = idx % 2 === 0 ? 'bg-[#0097a7]' : 'bg-[#00838f]';

                        return (
                          <tr key={t.id} className={`${rowBg} text-white border-b border-cyan-800/40 font-medium`}>
                            <td className="py-3 px-4 font-bold">{t.name}</td>
                            <td className="py-3 px-4 text-center">{t.members.length}</td>
                            <td className="py-3 px-4 text-right">{tTotal.toFixed(2)}</td>
                            <td className="py-3 px-4 text-right">{tProd.toFixed(2)}</td>
                            <td className="py-3 px-4 text-center font-bold">{prodRatio}%</td>
                            <td className="py-3 px-4 text-center font-bold">{tTasks}</td>
                            <td className="py-3 px-4 text-center">{tCarry}</td>
                            <td className="py-3 px-4 text-right">{tBill.toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs text-slate-400 border-t border-slate-100 pt-3">
                <span>Executive Summary • OfficeHub360 WSR</span>
                <span>Page {slideIndex + 1} of {totalSlides}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Presenter Controls */}
      <div className="flex items-center justify-between px-4">
        <div className="text-xs text-slate-500 hidden sm:block">
          Use <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">←</kbd> <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">→</kbd> or Space to change slides. Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">Esc</kbd> to exit.
        </div>

        <div className="flex items-center gap-3 mx-auto sm:mx-0">
          <button
            onClick={() => setSlideIndex((prev) => (prev > 0 ? prev - 1 : totalSlides - 1))}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white border border-slate-800"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-semibold text-white font-mono">
            {slideIndex + 1} / {totalSlides}
          </span>
          <button
            onClick={() => setSlideIndex((prev) => (prev < totalSlides - 1 ? prev + 1 : 0))}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white border border-slate-800"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
