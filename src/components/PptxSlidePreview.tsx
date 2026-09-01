import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Download,
  Layers,
  Sparkles,
  Edit3,
  Check,
  RotateCcw,
  Eye,
  Info
} from 'lucide-react';
import { TeamWsrData, EmployeeWsrRecord } from '../types/wsr';
import { calculateDynamicDateRange } from '../utils/dateUtils';

interface PptxSlidePreviewProps {
  teams: TeamWsrData[];
  onUpdateMember: (teamId: string, memberId: string, updates: Partial<EmployeeWsrRecord>) => void;
  onOpenPresentation: () => void;
  onDownloadPptx: () => void;
}

export const PptxSlidePreview: React.FC<PptxSlidePreviewProps> = ({
  teams,
  onUpdateMember,
  onOpenPresentation,
  onDownloadPptx
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Total slides: Cover slide (0) + Team slides (1..N) + Executive Summary slide (N+1)
  const totalSlides = teams.length + 2;

  const handlePrev = () => {
    setCurrentSlideIndex((prev) => (prev > 0 ? prev - 1 : totalSlides - 1));
  };

  const handleNext = () => {
    setCurrentSlideIndex((prev) => (prev < totalSlides - 1 ? prev + 1 : 0));
  };

  const currentTeam =
    currentSlideIndex > 0 && currentSlideIndex <= teams.length
      ? teams[currentSlideIndex - 1]
      : null;

  return (
    <div className="space-y-4">
      {/* Top Controls Bar - Bento Card */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#3b82f620] border border-[#3b82f640] text-[#60a5fa]">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              PowerPoint WSR Deck Canvas
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#3b82f620] text-[#60a5fa] border border-[#3b82f640] uppercase tracking-wider">
                16:9 Widescreen Template
              </span>
            </h2>
            <p className="text-xs text-[#71717a]">
              Company standard slide format (Black Header & Cyan/Teal Team Metrics)
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
              isEditing
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                : 'bg-[#27272a] border-[#3f3f46] text-[#d4d4d8] hover:bg-[#323235]'
            }`}
          >
            {isEditing ? <Check className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
            <span>{isEditing ? 'Done Editing' : 'Edit Slide Cells'}</span>
          </button>

          <button
            onClick={onOpenPresentation}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#27272a] hover:bg-[#323235] border border-[#3f3f46] text-white text-xs font-medium transition-all"
          >
            <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Fullscreen Mode</span>
          </button>

          <button
            onClick={onDownloadPptx}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-black text-xs font-bold shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>Download .PPTX</span>
          </button>
        </div>
      </div>

      {/* Main Slide Stage (16:9 Aspect Ratio Container) */}
      <div className="relative bg-[#18181b] p-4 sm:p-6 rounded-2xl border border-[#27272a] shadow-xl flex flex-col items-center">
        {/* Navigation Floating Buttons */}
        <button
          onClick={handlePrev}
          aria-label="Previous slide"
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-[#09090b]/90 hover:bg-[#27272a] text-white border border-[#27272a] shadow-xl backdrop-blur transition-all active:scale-95 cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={handleNext}
          aria-label="Next slide"
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-[#09090b]/90 hover:bg-[#27272a] text-white border border-[#27272a] shadow-xl backdrop-blur transition-all active:scale-95 cursor-pointer"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* 16:9 Slide Canvas */}
        <div className="w-full max-w-5xl aspect-[16/9] bg-white rounded-lg shadow-2xl overflow-hidden relative flex flex-col justify-between select-text border border-slate-300">
          
          {/* SLIDE 0: Cover Slide */}
          {currentSlideIndex === 0 && (
            <div className="h-full flex flex-col justify-between p-8 sm:p-12 bg-gradient-to-br from-slate-50 via-white to-cyan-50">
              <div className="h-2 w-full bg-cyan-600 -mt-8 sm:-mt-12 -mx-8 sm:-mx-12 mb-6" />
              
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-cyan-100 text-cyan-800 font-semibold text-xs tracking-wider uppercase mb-4">
                  OfficeHub360 • Executive WSR
                </div>
                <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
                  Weekly Status Report
                </h1>
                <p className="text-lg sm:text-xl text-slate-600 mt-2 font-medium">
                  Team Performance, Timesheets & Task Velocity Deck
                </p>
                <div className="w-24 h-1 bg-cyan-600 mt-4" />
              </div>

              <div className="grid grid-cols-3 gap-4 my-auto">
                <div className="p-4 rounded-xl bg-slate-100/90 border border-slate-200">
                  <div className="text-[11px] font-bold text-slate-500 uppercase">Period</div>
                  <div className="text-lg font-bold text-slate-800 mt-1">{calculateDynamicDateRange()}</div>
                  <div className="text-xs text-slate-500 mt-0.5">Week 33 Report</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-100/90 border border-slate-200">
                  <div className="text-[11px] font-bold text-slate-500 uppercase">Coverage</div>
                  <div className="text-lg font-bold text-slate-800 mt-1">
                    {teams.length} Teams • {teams.reduce((a, t) => a + t.members.length, 0)} Engineers
                  </div>
                  <div className="text-xs text-cyan-700 font-medium mt-0.5">
                    {teams.reduce((a, t) => a + t.members.reduce((b, m) => b + m.totalHours, 0), 0).toFixed(1)} Total Hours
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-slate-100/90 border border-slate-200">
                  <div className="text-[11px] font-bold text-slate-500 uppercase">Velocity</div>
                  <div className="text-lg font-bold text-emerald-700 mt-1">
                    {teams.reduce((a, t) => a + t.members.reduce((b, m) => b + m.tasksCompleted, 0), 0)} Tasks Completed
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">Supabase Synced</div>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs text-slate-400 border-t border-slate-200 pt-4">
                <span>Confidential • Prepared for Engineering Leadership</span>
                <span>OfficeHub360 WSR Engine</span>
              </div>
            </div>
          )}

          {/* SLIDES 1..N: Individual Team Slides matching images */}
          {currentTeam && (
            <div className="h-full flex flex-col justify-between p-6 sm:p-10 bg-white">
              <div>
                {/* Header matching exact uploaded image: Left Title, Right Date */}
                <div className="flex items-baseline justify-between">
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                    WSR – {currentTeam.name}
                  </h2>
                  <span className="text-xl sm:text-2xl font-bold text-slate-950 font-sans">
                    {currentTeam.dateRange}
                  </span>
                </div>

                {/* Accent Divider Line */}
                <div className="w-full h-1 bg-cyan-700 mt-2 mb-6" />

                {/* The Exact Table Layout from Uploaded PPT Images */}
                <div className="w-full overflow-x-auto rounded-none border border-cyan-900/40">
                  <table className="w-full border-collapse text-left text-xs sm:text-sm font-sans">
                    <thead>
                      <tr className="bg-black text-white">
                        <th className="py-1.5 px-3 font-bold border-r border-slate-800 w-44 sm:w-52">
                          Name
                        </th>
                        {currentTeam.members.map((member) => (
                          <th
                            key={member.id}
                            className="py-1.5 px-3 font-bold border-r border-slate-800 last:border-r-0"
                          >
                            {member.displayName || member.name.split(' ')[0]}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {/* 1. Total Hours */}
                      <tr className="bg-[#0097a7] text-white border-b border-cyan-800/40">
                        <td className="py-1 px-3 font-semibold border-r border-cyan-800/40">
                          Total Hours
                        </td>
                        {currentTeam.members.map((m) => (
                          <td key={m.id} className="py-1 px-3 border-r border-cyan-800/40 last:border-r-0 font-medium">
                            {isEditing ? (
                              <input
                                type="number"
                                step="0.01"
                                value={m.totalHours}
                                onChange={(e) => {
                                  const total = parseFloat(e.target.value) || 0;
                                  const nonProd = Math.max(0, +(total - m.productiveHours).toFixed(2));
                                  onUpdateMember(currentTeam.id, m.id, {
                                    totalHours: total,
                                    nonProductiveHours: nonProd
                                  });
                                }}
                                className="w-16 px-1.5 py-0.5 bg-cyan-950/70 text-white rounded text-xs border border-cyan-300"
                              />
                            ) : (
                              m.totalHours.toFixed(2)
                            )}
                          </td>
                        ))}
                      </tr>

                      {/* 2. Productive Hours */}
                      <tr className="bg-[#00838f] text-white border-b border-cyan-800/40">
                        <td className="py-1 px-3 font-semibold border-r border-cyan-800/40">
                          Productive Hours
                        </td>
                        {currentTeam.members.map((m) => (
                          <td key={m.id} className="py-1 px-3 border-r border-cyan-800/40 last:border-r-0 font-medium">
                            {isEditing ? (
                              <input
                                type="number"
                                step="0.01"
                                value={m.productiveHours}
                                onChange={(e) => {
                                  const prod = parseFloat(e.target.value) || 0;
                                  const nonProd = Math.max(0, +(m.totalHours - prod).toFixed(2));
                                  onUpdateMember(currentTeam.id, m.id, {
                                    productiveHours: prod,
                                    nonProductiveHours: nonProd
                                  });
                                }}
                                className="w-16 px-1.5 py-0.5 bg-cyan-950/70 text-white rounded text-xs border border-cyan-300"
                              />
                            ) : (
                              m.productiveHours.toFixed(2)
                            )}
                          </td>
                        ))}
                      </tr>

                      {/* 3. Non – Productive Hours */}
                      <tr className="bg-[#0097a7] text-white border-b border-cyan-800/40">
                        <td className="py-1 px-3 font-semibold border-r border-cyan-800/40">
                          Non – Productive Hours
                        </td>
                        {currentTeam.members.map((m) => (
                          <td key={m.id} className="py-1 px-3 border-r border-cyan-800/40 last:border-r-0 font-medium">
                            {m.nonProductiveHours.toFixed(2)}
                          </td>
                        ))}
                      </tr>

                      {/* 4. Tasks Completed */}
                      <tr className="bg-[#00838f] text-white border-b border-cyan-800/40">
                        <td className="py-1 px-3 font-semibold border-r border-cyan-800/40">
                          Tasks Completed
                        </td>
                        {currentTeam.members.map((m) => (
                          <td key={m.id} className="py-1 px-3 border-r border-cyan-800/40 last:border-r-0 font-medium">
                            {isEditing ? (
                              <input
                                type="number"
                                value={m.tasksCompleted}
                                onChange={(e) =>
                                  onUpdateMember(currentTeam.id, m.id, {
                                    tasksCompleted: parseInt(e.target.value) || 0
                                  })
                                }
                                className="w-16 px-1.5 py-0.5 bg-cyan-950/70 text-white rounded text-xs border border-cyan-300"
                              />
                            ) : (
                              m.tasksCompleted
                            )}
                          </td>
                        ))}
                      </tr>

                      {/* 5. Carry Forward */}
                      <tr className="bg-[#0097a7] text-white border-b border-cyan-800/40">
                        <td className="py-1 px-3 font-semibold border-r border-cyan-800/40">
                          Carry Forward
                        </td>
                        {currentTeam.members.map((m) => (
                          <td key={m.id} className="py-1 px-3 border-r border-cyan-800/40 last:border-r-0 font-medium">
                            {isEditing ? (
                              <input
                                type="number"
                                value={m.carryForward}
                                onChange={(e) =>
                                  onUpdateMember(currentTeam.id, m.id, {
                                    carryForward: parseInt(e.target.value) || 0
                                  })
                                }
                                className="w-16 px-1.5 py-0.5 bg-cyan-950/70 text-white rounded text-xs border border-cyan-300"
                              />
                            ) : (
                              m.carryForward
                            )}
                          </td>
                        ))}
                      </tr>

                      {/* 6. Billable Hours */}
                      <tr className="bg-[#00838f] text-white border-b border-cyan-800/40">
                        <td className="py-1 px-3 font-semibold border-r border-cyan-800/40">
                          Billable Hours
                        </td>
                        {currentTeam.members.map((m) => (
                          <td key={m.id} className="py-1 px-3 border-r border-cyan-800/40 last:border-r-0 font-medium">
                            {isEditing ? (
                              <input
                                type="number"
                                step="0.01"
                                value={m.billableHours}
                                onChange={(e) => {
                                  const billable = parseFloat(e.target.value) || 0;
                                  onUpdateMember(currentTeam.id, m.id, {
                                    billableHours: billable,
                                    nonBillableHours: Math.max(0, +(m.totalHours - billable).toFixed(2))
                                  });
                                }}
                                className="w-16 px-1.5 py-0.5 bg-cyan-950/70 text-white rounded text-xs border border-cyan-300"
                              />
                            ) : (
                              m.billableHours > 0 ? m.billableHours.toFixed(2) : '0'
                            )}
                          </td>
                        ))}
                      </tr>

                      {/* 7. Non – Billable Hours */}
                      <tr className="bg-[#0097a7] text-white border-b border-cyan-800/40">
                        <td className="py-1 px-3 font-semibold border-r border-cyan-800/40">
                          Non – Billable Hours
                        </td>
                        {currentTeam.members.map((m) => (
                          <td key={m.id} className="py-1 px-3 border-r border-cyan-800/40 last:border-r-0 font-medium">
                            {m.nonBillableHours > 0 ? m.nonBillableHours.toFixed(2) : '0'}
                          </td>
                        ))}
                      </tr>

                      {/* 8. Holidays Availed */}
                      <tr className="bg-[#00838f] text-white border-b border-cyan-800/40">
                        <td className="py-1 px-3 font-semibold border-r border-cyan-800/40">
                          Holidays Availed
                        </td>
                        {currentTeam.members.map((m) => (
                          <td key={m.id} className="py-1 px-3 border-r border-cyan-800/40 last:border-r-0 font-medium">
                            {isEditing ? (
                              <input
                                type="number"
                                value={m.holidaysAvailed}
                                onChange={(e) =>
                                  onUpdateMember(currentTeam.id, m.id, {
                                    holidaysAvailed: parseInt(e.target.value) || 0
                                  })
                                }
                                className="w-16 px-1.5 py-0.5 bg-cyan-950/70 text-white rounded text-xs border border-cyan-300"
                              />
                            ) : (
                              m.holidaysAvailed
                            )}
                          </td>
                        ))}
                      </tr>

                      {/* 9. Permission Hours */}
                      <tr className="bg-[#0097a7] text-white">
                        <td className="py-1 px-3 font-semibold border-r border-cyan-800/40">
                          Permission Hours
                        </td>
                        {currentTeam.members.map((m) => (
                          <td key={m.id} className="py-1 px-3 border-r border-cyan-800/40 last:border-r-0 font-medium">
                            {isEditing ? (
                              <input
                                type="number"
                                value={m.permissionHours || 0}
                                onChange={(e) =>
                                  onUpdateMember(currentTeam.id, m.id, {
                                    permissionHours: parseFloat(e.target.value) || 0
                                  })
                                }
                                className="w-16 px-1.5 py-0.5 bg-cyan-950/70 text-white rounded text-xs border border-cyan-300"
                              />
                            ) : (
                              m.permissionHours || 0
                            )}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bottom slide footer */}
              <div className="flex justify-between items-center text-[10px] text-slate-400 mt-4 border-t border-slate-100 pt-2">
                <span>OfficeHub360 WSR Deck • {currentTeam.name}</span>
                <span>Confidential</span>
              </div>
            </div>
          )}

          {/* FINAL SLIDE: Aggregate Summary & Comparison */}
          {currentSlideIndex === totalSlides - 1 && (
            <div className="h-full flex flex-col justify-between p-6 sm:p-10 bg-white">
              <div>
                <div className="flex items-baseline justify-between">
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                    WSR – Executive Summary & KPIs
                  </h2>
                  <span className="text-xl sm:text-2xl font-bold text-slate-950 font-sans">
                    Cross-Team Overview
                  </span>
                </div>
                <div className="w-full h-1 bg-cyan-700 mt-2 mb-6" />

                {/* Team Summary Table */}
                <div className="w-full overflow-x-auto border border-cyan-900/40">
                  <table className="w-full border-collapse text-left text-xs sm:text-sm font-sans">
                    <thead>
                      <tr className="bg-black text-white">
                        <th className="py-2.5 px-3 font-bold">Team Name</th>
                        <th className="py-2.5 px-3 font-bold text-center">Engineers</th>
                        <th className="py-2.5 px-3 font-bold text-right">Total Hours</th>
                        <th className="py-2.5 px-3 font-bold text-right">Productive Hrs</th>
                        <th className="py-2.5 px-3 font-bold text-center">Productivity %</th>
                        <th className="py-2.5 px-3 font-bold text-center">Tasks Done</th>
                        <th className="py-2.5 px-3 font-bold text-center">Carry Fwd</th>
                        <th className="py-2.5 px-3 font-bold text-right">Billable Hrs</th>
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
                            <td className="py-2.5 px-3 font-bold">{t.name}</td>
                            <td className="py-2.5 px-3 text-center">{t.members.length}</td>
                            <td className="py-2.5 px-3 text-right">{tTotal.toFixed(2)}</td>
                            <td className="py-2.5 px-3 text-right">{tProd.toFixed(2)}</td>
                            <td className="py-2.5 px-3 text-center font-bold">{prodRatio}%</td>
                            <td className="py-2.5 px-3 text-center font-bold">{tTasks}</td>
                            <td className="py-2.5 px-3 text-center">{tCarry}</td>
                            <td className="py-2.5 px-3 text-right">{tBill.toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-between items-center text-[10px] text-slate-400 mt-4 border-t border-slate-100 pt-2">
                <span>Executive Summary • OfficeHub360</span>
                <span>Generated by AI WSR Bot</span>
              </div>
            </div>
          )}
        </div>

        {/* Slide Counter & Thumbnail Strip */}
        <div className="w-full max-w-5xl mt-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#71717a]">
              Slide {currentSlideIndex + 1} of {totalSlides}
            </span>
            <span className="text-xs text-[#27272a]">•</span>
            <span className="text-xs text-[#60a5fa] font-medium">
              {currentSlideIndex === 0
                ? 'Cover Slide'
                : currentSlideIndex === totalSlides - 1
                ? 'Cross-Team Summary'
                : teams[currentSlideIndex - 1]?.name}
            </span>
          </div>

          {/* Slide Switcher Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-md py-1 bg-[#09090b]/80 p-1.5 rounded-xl border border-[#27272a]">
            <button
              onClick={() => setCurrentSlideIndex(0)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                currentSlideIndex === 0
                  ? 'bg-white text-black shadow-sm'
                  : 'text-[#71717a] hover:text-white hover:bg-[#18181b]'
              }`}
            >
              Cover
            </button>
            {teams.map((t, idx) => (
              <button
                key={t.id}
                onClick={() => setCurrentSlideIndex(idx + 1)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  currentSlideIndex === idx + 1
                    ? 'bg-white text-black shadow-sm'
                    : 'text-[#71717a] hover:text-white hover:bg-[#18181b]'
                }`}
              >
                {t.name.replace(' Team', '')}
              </button>
            ))}
            <button
              onClick={() => setCurrentSlideIndex(totalSlides - 1)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                currentSlideIndex === totalSlides - 1
                  ? 'bg-white text-black shadow-sm'
                  : 'text-[#71717a] hover:text-white hover:bg-[#18181b]'
              }`}
            >
              Summary
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
