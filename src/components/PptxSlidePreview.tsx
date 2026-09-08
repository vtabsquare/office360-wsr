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
        <div className="w-full max-w-5xl aspect-[16/9] bg-white rounded-xl shadow-2xl overflow-hidden relative flex flex-col justify-between select-text border border-slate-200">
          
          {/* SLIDE 0: Cover Slide — Dark Navy Theme */}
          {currentSlideIndex === 0 && (
            <div className="h-full flex flex-col" style={{background: 'linear-gradient(160deg, #0d1b2a 0%, #0f2238 55%, #0a1929 100%)'}}>
              {/* Top accent bar */}
              <div className="flex-shrink-0" style={{height: '4px', background: 'linear-gradient(90deg, #00c6d7, #0097a7, #006d7a)'}} />

              <div className="flex flex-col flex-1 justify-between px-8 sm:px-14 py-6 sm:py-10">
                {/* Top badge + title block */}
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-5" style={{background:'rgba(0,151,167,0.2)', border:'1px solid rgba(0,151,167,0.4)'}}>
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{background:'#00e5ff'}} />
                    <span className="text-[10px] font-bold uppercase tracking-widest" style={{color:'#67d5e3'}}>OfficeHub360 • Executive WSR</span>
                  </div>
                  <h1 className="font-black tracking-tight leading-none" style={{color:'#e8f4f8', fontSize:'clamp(1.8rem, 4vw, 3rem)', letterSpacing:'-0.03em'}}>
                    Weekly Status Report
                  </h1>
                  <p className="mt-2 font-medium" style={{color:'#4db6c9', fontSize:'clamp(0.75rem, 1.5vw, 1rem)'}}>
                    Team Performance, Timesheets &amp; Task Velocity Deck
                  </p>
                  <div className="mt-4" style={{width:'48px', height:'3px', background:'linear-gradient(90deg,#00c6d7,#0097a7)', borderRadius:'2px'}} />
                </div>

                {/* KPI metric cards */}
                <div className="grid grid-cols-3 gap-3">
                  {/* Period */}
                  <div className="rounded-xl p-4" style={{background:'rgba(0,151,167,0.12)', border:'1px solid rgba(0,151,167,0.3)'}}>
                    <div className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{color:'#4db6c9'}}>Period</div>
                    <div className="font-bold leading-tight" style={{color:'#cce9f0', fontSize:'clamp(0.65rem, 1.2vw, 0.85rem)'}}>{calculateDynamicDateRange()}</div>
                    <div className="text-[9px] mt-1" style={{color:'#2d8a99'}}>Current Reporting Cycle</div>
                  </div>
                  {/* Coverage */}
                  <div className="rounded-xl p-4" style={{background:'rgba(0,151,167,0.12)', border:'1px solid rgba(0,151,167,0.3)'}}>
                    <div className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{color:'#4db6c9'}}>Coverage</div>
                    <div className="font-bold leading-tight" style={{color:'#cce9f0', fontSize:'clamp(0.65rem, 1.2vw, 0.85rem)'}}>
                      {teams.length} Teams • {teams.reduce((a, t) => a + t.members.length, 0)} Engineers
                    </div>
                    <div className="text-[9px] mt-1 font-semibold" style={{color:'#00c6d7'}}>
                      {teams.reduce((a, t) => a + t.members.reduce((b, m) => b + m.totalHours, 0), 0).toFixed(1)} Total Hours
                    </div>
                  </div>
                  {/* Velocity */}
                  <div className="rounded-xl p-4" style={{background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.3)'}}>
                    <div className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{color:'#34d399'}}>Velocity</div>
                    <div className="font-bold leading-tight" style={{color:'#a7f3d0', fontSize:'clamp(0.65rem, 1.2vw, 0.85rem)'}}>
                      {teams.reduce((a, t) => a + t.members.reduce((b, m) => b + m.tasksCompleted, 0), 0)} Tasks Completed
                    </div>
                    <div className="text-[9px] mt-1" style={{color:'#059669'}}>Supabase Live Sync</div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center" style={{borderTop:'1px solid rgba(0,151,167,0.2)', paddingTop:'10px'}}>
                  <span className="text-[9px] font-semibold" style={{color:'#2d8a99'}}>Confidential • Prepared for Engineering Leadership</span>
                  <span className="text-[9px]" style={{color:'#2d8a99'}}>OfficeHub360 WSR Engine</span>
                </div>
              </div>
            </div>
          )}

          {/* SLIDES 1..N: Individual Team Slides — Redesigned Professional Dark Theme */}
          {currentTeam && (
            <div className="h-full flex flex-col" style={{background: 'linear-gradient(160deg, #0d1b2a 0%, #0f2238 55%, #0a1929 100%)'}}>
              {/* Top accent bar */}
              <div className="flex-shrink-0" style={{height: '4px', background: 'linear-gradient(90deg, #00c6d7, #0097a7, #006d7a)'}} />

              <div className="flex flex-col flex-1 px-6 sm:px-9 py-4 sm:py-5">
                {/* Slide Header */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-1 h-5 rounded-full" style={{background:'linear-gradient(180deg,#00e5ff,#0097a7)'}} />
                      <h2 className="text-lg sm:text-xl font-black tracking-tight" style={{color:'#e8f4f8', letterSpacing:'-0.02em'}}>
                        WSR – {currentTeam.name}
                      </h2>
                    </div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest ml-3" style={{color:'#4db6c9'}}>
                      Weekly Status Report • Confidential
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm sm:text-base font-bold" style={{color:'#cce9f0'}}>{currentTeam.dateRange}</div>
                    <div className="flex items-center justify-end gap-3 mt-1">
                      <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full" style={{background:'rgba(0,151,167,0.25)', color:'#67d5e3', border:'1px solid rgba(0,151,167,0.4)'}}>
                        ● LIVE DATA
                      </span>
                      <span className="text-[9px]" style={{color:'#4db6c9'}}>{currentTeam.members.length} Members</span>
                    </div>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-3 mb-2.5">
                  <span className="text-[9px] font-bold uppercase tracking-wider" style={{color:'#4db6c9'}}>Status Key:</span>
                  <span className="flex items-center gap-1 text-[9px] font-semibold" style={{color:'#10b981'}}>
                    <span className="w-2 h-2 rounded-full inline-block" style={{background:'#10b981'}} /> On Track
                  </span>
                  <span className="flex items-center gap-1 text-[9px] font-semibold" style={{color:'#f59e0b'}}>
                    <span className="w-2 h-2 rounded-full inline-block" style={{background:'#f59e0b'}} /> Near Target
                  </span>
                  <span className="flex items-center gap-1 text-[9px] font-semibold" style={{color:'#f87171'}}>
                    <span className="w-2 h-2 rounded-full inline-block" style={{background:'#f87171'}} /> Below Target
                  </span>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-hidden rounded-lg" style={{border:'1px solid rgba(0,151,167,0.3)'}}>
                  <table className="w-full border-collapse text-xs font-sans" style={{tableLayout:'fixed'}}>
                    <thead>
                      <tr style={{background:'linear-gradient(90deg,#0c2233,#0d2a3e)'}}>
                        <th className="py-2 px-2.5 text-left font-bold" style={{color:'#7dd3e0', borderRight:'1px solid rgba(0,151,167,0.25)', width:'30%', fontSize:'11px', letterSpacing:'0.03em'}}>
                          METRIC
                        </th>
                        {currentTeam.members.map((member) => (
                          <th key={member.id} className="py-2 px-2 text-left font-bold" style={{color:'#e0f5f9', borderRight:'1px solid rgba(0,151,167,0.2)', fontSize:'10px', letterSpacing:'0.02em'}}>
                            {member.displayName || member.name.split(' ')[0]}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {/* 1. Total Hours — prominent status row */}
                      <tr style={{background:'linear-gradient(90deg, rgba(0,151,167,0.35), rgba(0,151,167,0.2))', borderBottom:'1px solid rgba(0,151,167,0.35)'}}>
                        <td className="py-1.5 px-2.5 font-bold" style={{color:'#a5e4ef', borderRight:'1px solid rgba(0,151,167,0.25)', fontSize:'10px', letterSpacing:'0.02em'}}>
                          Total Hours
                        </td>
                        {currentTeam.members.map((m) => {
                          const daysWorked = Math.max(0, (m.shiftDays || 5) - m.holidaysAvailed);
                          const expected = daysWorked * 9;
                          const greenLimit = 9 * daysWorked;
                          const orangeLimit = 8.5 * daysWorked;
                          let badgeBg: string, badgeText: string, badgeBorder: string, dotColor: string;
                          if (m.totalHours >= greenLimit) {
                            badgeBg = 'rgba(16,185,129,0.18)'; badgeText = '#34d399'; badgeBorder = 'rgba(16,185,129,0.5)'; dotColor = '#10b981';
                          } else if (m.totalHours >= orangeLimit) {
                            badgeBg = 'rgba(245,158,11,0.18)'; badgeText = '#fbbf24'; badgeBorder = 'rgba(245,158,11,0.5)'; dotColor = '#f59e0b';
                          } else {
                            badgeBg = 'rgba(239,68,68,0.18)'; badgeText = '#f87171'; badgeBorder = 'rgba(239,68,68,0.5)'; dotColor = '#ef4444';
                          }
                          return (
                            <td key={m.id} className="py-1.5 px-2" style={{borderRight:'1px solid rgba(0,151,167,0.2)'}}>
                              {isEditing ? (
                                <input type="number" step="0.01" value={m.totalHours}
                                  onChange={(e) => {
                                    const total = parseFloat(e.target.value) || 0;
                                    onUpdateMember(currentTeam.id, m.id, { totalHours: total, nonProductiveHours: Math.max(0, +(total - m.productiveHours).toFixed(2)) });
                                  }}
                                  className="w-16 px-1.5 py-0.5 rounded text-xs border" style={{background:'rgba(0,151,167,0.25)', color:'white', borderColor:'rgba(0,151,167,0.6)'}}
                                />
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold text-[10px]" style={{background: badgeBg, color: badgeText, border:`1px solid ${badgeBorder}`}}>
                                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{background: dotColor}} />
                                  {m.totalHours.toFixed(2)} <span style={{opacity:0.7}}>({expected})</span>
                                </span>
                              )}
                            </td>
                          );
                        })}
                      </tr>

                      {/* 2. Productive Hours */}
                      <tr style={{background:'rgba(255,255,255,0.03)', borderBottom:'1px solid rgba(0,151,167,0.15)'}}>
                        <td className="py-1.5 px-2.5 font-semibold" style={{color:'#7dd3e0', borderRight:'1px solid rgba(0,151,167,0.2)', fontSize:'10px'}}>Productive Hours</td>
                        {currentTeam.members.map((m) => (
                          <td key={m.id} className="py-1.5 px-2 font-medium" style={{color:'#d4eef5', borderRight:'1px solid rgba(0,151,167,0.15)', fontSize:'10px'}}>
                            {isEditing ? (
                              <input type="number" step="0.01" value={m.productiveHours}
                                onChange={(e) => { const prod = parseFloat(e.target.value)||0; onUpdateMember(currentTeam.id,m.id,{productiveHours:prod,nonProductiveHours:Math.max(0,+(m.totalHours-prod).toFixed(2))}); }}
                                className="w-16 px-1.5 py-0.5 rounded text-xs border" style={{background:'rgba(0,151,167,0.25)',color:'white',borderColor:'rgba(0,151,167,0.6)'}}
                              />
                            ) : m.productiveHours.toFixed(2)}
                          </td>
                        ))}
                      </tr>

                      {/* 3. Non-Productive Hours */}
                      <tr style={{background:'rgba(0,151,167,0.08)', borderBottom:'1px solid rgba(0,151,167,0.15)'}}>
                        <td className="py-1.5 px-2.5 font-semibold" style={{color:'#7dd3e0', borderRight:'1px solid rgba(0,151,167,0.2)', fontSize:'10px'}}>Non – Productive Hours</td>
                        {currentTeam.members.map((m) => (
                          <td key={m.id} className="py-1.5 px-2 font-medium" style={{color:'#d4eef5', borderRight:'1px solid rgba(0,151,167,0.15)', fontSize:'10px'}}>{m.nonProductiveHours.toFixed(2)}</td>
                        ))}
                      </tr>

                      {/* 4. Tasks Completed */}
                      <tr style={{background:'rgba(255,255,255,0.03)', borderBottom:'1px solid rgba(0,151,167,0.15)'}}>
                        <td className="py-1.5 px-2.5 font-semibold" style={{color:'#7dd3e0', borderRight:'1px solid rgba(0,151,167,0.2)', fontSize:'10px'}}>Tasks Completed</td>
                        {currentTeam.members.map((m) => (
                          <td key={m.id} className="py-1.5 px-2 font-bold" style={{color:'#67d5e3', borderRight:'1px solid rgba(0,151,167,0.15)', fontSize:'10px'}}>
                            {isEditing ? (
                              <input type="number" value={m.tasksCompleted}
                                onChange={(e) => onUpdateMember(currentTeam.id,m.id,{tasksCompleted:parseInt(e.target.value)||0})}
                                className="w-16 px-1.5 py-0.5 rounded text-xs border" style={{background:'rgba(0,151,167,0.25)',color:'white',borderColor:'rgba(0,151,167,0.6)'}}
                              />
                            ) : m.tasksCompleted}
                          </td>
                        ))}
                      </tr>

                      {/* 5. Carry Forward */}
                      <tr style={{background:'rgba(0,151,167,0.08)', borderBottom:'1px solid rgba(0,151,167,0.15)'}}>
                        <td className="py-1.5 px-2.5 font-semibold" style={{color:'#7dd3e0', borderRight:'1px solid rgba(0,151,167,0.2)', fontSize:'10px'}}>Carry Forward</td>
                        {currentTeam.members.map((m) => (
                          <td key={m.id} className="py-1.5 px-2 font-medium" style={{color: m.carryForward > 0 ? '#fbbf24' : '#d4eef5', borderRight:'1px solid rgba(0,151,167,0.15)', fontSize:'10px'}}>
                            {isEditing ? (
                              <input type="number" value={m.carryForward}
                                onChange={(e) => onUpdateMember(currentTeam.id,m.id,{carryForward:parseInt(e.target.value)||0})}
                                className="w-16 px-1.5 py-0.5 rounded text-xs border" style={{background:'rgba(0,151,167,0.25)',color:'white',borderColor:'rgba(0,151,167,0.6)'}}
                              />
                            ) : m.carryForward}
                          </td>
                        ))}
                      </tr>

                      {/* 6. Billable Hours */}
                      <tr style={{background:'rgba(255,255,255,0.03)', borderBottom:'1px solid rgba(0,151,167,0.15)'}}>
                        <td className="py-1.5 px-2.5 font-semibold" style={{color:'#7dd3e0', borderRight:'1px solid rgba(0,151,167,0.2)', fontSize:'10px'}}>Billable Hours</td>
                        {currentTeam.members.map((m) => (
                          <td key={m.id} className="py-1.5 px-2 font-medium" style={{color:'#d4eef5', borderRight:'1px solid rgba(0,151,167,0.15)', fontSize:'10px'}}>
                            {isEditing ? (
                              <input type="number" step="0.01" value={m.billableHours}
                                onChange={(e) => { const b=parseFloat(e.target.value)||0; onUpdateMember(currentTeam.id,m.id,{billableHours:b,nonBillableHours:Math.max(0,+(m.totalHours-b).toFixed(2))}); }}
                                className="w-16 px-1.5 py-0.5 rounded text-xs border" style={{background:'rgba(0,151,167,0.25)',color:'white',borderColor:'rgba(0,151,167,0.6)'}}
                              />
                            ) : (m.billableHours > 0 ? m.billableHours.toFixed(2) : '0')}
                          </td>
                        ))}
                      </tr>

                      {/* 7. Non-Billable Hours */}
                      <tr style={{background:'rgba(0,151,167,0.08)', borderBottom:'1px solid rgba(0,151,167,0.15)'}}>
                        <td className="py-1.5 px-2.5 font-semibold" style={{color:'#7dd3e0', borderRight:'1px solid rgba(0,151,167,0.2)', fontSize:'10px'}}>Non – Billable Hours</td>
                        {currentTeam.members.map((m) => (
                          <td key={m.id} className="py-1.5 px-2 font-medium" style={{color:'#d4eef5', borderRight:'1px solid rgba(0,151,167,0.15)', fontSize:'10px'}}>
                            {m.nonBillableHours > 0 ? m.nonBillableHours.toFixed(2) : '0'}
                          </td>
                        ))}
                      </tr>

                      {/* 8. Holidays Availed */}
                      <tr style={{background:'rgba(255,255,255,0.03)', borderBottom:'1px solid rgba(0,151,167,0.15)'}}>
                        <td className="py-1.5 px-2.5 font-semibold" style={{color:'#7dd3e0', borderRight:'1px solid rgba(0,151,167,0.2)', fontSize:'10px'}}>Holidays Availed</td>
                        {currentTeam.members.map((m) => (
                          <td key={m.id} className="py-1.5 px-2 font-medium" style={{color:'#d4eef5', borderRight:'1px solid rgba(0,151,167,0.15)', fontSize:'10px'}}>
                            {isEditing ? (
                              <input type="number" value={m.holidaysAvailed}
                                onChange={(e) => onUpdateMember(currentTeam.id,m.id,{holidaysAvailed:parseInt(e.target.value)||0})}
                                className="w-16 px-1.5 py-0.5 rounded text-xs border" style={{background:'rgba(0,151,167,0.25)',color:'white',borderColor:'rgba(0,151,167,0.6)'}}
                              />
                            ) : m.holidaysAvailed}
                          </td>
                        ))}
                      </tr>

                      {/* 9. Permission Hours */}
                      <tr style={{background:'rgba(0,151,167,0.08)', borderBottom:'1px solid rgba(0,151,167,0.15)'}}>
                        <td className="py-1.5 px-2.5 font-semibold" style={{color:'#7dd3e0', borderRight:'1px solid rgba(0,151,167,0.2)', fontSize:'10px'}}>Permission Hours</td>
                        {currentTeam.members.map((m) => (
                          <td key={m.id} className="py-1.5 px-2 font-medium" style={{color:'#d4eef5', borderRight:'1px solid rgba(0,151,167,0.15)', fontSize:'10px'}}>
                            {isEditing ? (
                              <input type="text" value={m.permissionHours || '0'}
                                onChange={(e) => onUpdateMember(currentTeam.id,m.id,{permissionHours: e.target.value || '0'})}
                                className="w-20 px-1.5 py-0.5 rounded text-xs border" style={{background:'rgba(0,151,167,0.25)',color:'white',borderColor:'rgba(0,151,167,0.6)'}}
                              />
                            ) : (m.permissionHours || 0)}
                          </td>
                        ))}
                      </tr>

                      {/* 10. Compensated */}
                      <tr style={{background:'rgba(255,255,255,0.03)'}}>
                        <td className="py-1.5 px-2.5 font-semibold" style={{color:'#7dd3e0', borderRight:'1px solid rgba(0,151,167,0.2)', fontSize:'10px'}}>Compensated</td>
                        {currentTeam.members.map((m) => (
                          <td key={m.id} className="py-1.5 px-2 font-medium" style={{color:'#d4eef5', borderRight:'1px solid rgba(0,151,167,0.15)', fontSize:'10px'}}>
                            {isEditing ? (
                              <input type="text" value={m.permissionCompensated || '-'}
                                onChange={(e) => onUpdateMember(currentTeam.id,m.id,{permissionCompensated: e.target.value})}
                                className="w-20 px-1.5 py-0.5 rounded text-xs border" style={{background:'rgba(0,151,167,0.25)',color:'white',borderColor:'rgba(0,151,167,0.6)'}}
                              />
                            ) : (m.permissionCompensated || '-')}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bottom footer bar */}
              <div className="flex-shrink-0 flex justify-between items-center px-6 sm:px-9 py-2" style={{borderTop:'1px solid rgba(0,151,167,0.2)', background:'rgba(0,0,0,0.2)'}}>
                <span className="text-[9px] font-semibold" style={{color:'#4db6c9'}}>OfficeHub360 WSR Deck • {currentTeam.name}</span>
                <span className="text-[9px]" style={{color:'#2d8a99'}}>Confidential</span>
              </div>
            </div>
          )}

          {/* FINAL SLIDE: Aggregate Summary — Dark Navy Theme */}
          {currentSlideIndex === totalSlides - 1 && (
            <div className="h-full flex flex-col" style={{background: 'linear-gradient(160deg, #0d1b2a 0%, #0f2238 55%, #0a1929 100%)'}}>
              {/* Top accent bar */}
              <div className="flex-shrink-0" style={{height: '4px', background: 'linear-gradient(90deg, #00c6d7, #0097a7, #006d7a)'}} />

              <div className="flex flex-col flex-1 px-6 sm:px-9 py-4 sm:py-5">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-1 h-5 rounded-full" style={{background:'linear-gradient(180deg,#00e5ff,#0097a7)'}} />
                      <h2 className="text-lg sm:text-xl font-black tracking-tight" style={{color:'#e8f4f8', letterSpacing:'-0.02em'}}>
                        WSR – Executive Summary &amp; KPIs
                      </h2>
                    </div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest ml-3" style={{color:'#4db6c9'}}>
                      Cross-Team Performance Overview
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-[9px] font-semibold px-2 py-0.5 rounded-full" style={{background:'rgba(0,151,167,0.25)', color:'#67d5e3', border:'1px solid rgba(0,151,167,0.4)'}}>
                      ● ALL TEAMS
                    </div>
                  </div>
                </div>

                {/* Summary table */}
                <div className="flex-1 overflow-hidden rounded-lg" style={{border:'1px solid rgba(0,151,167,0.3)'}}>
                  <table className="w-full border-collapse text-xs font-sans">
                    <thead>
                      <tr style={{background:'linear-gradient(90deg,#0c2233,#0d2a3e)'}}>
                        <th className="py-2 px-3 text-left font-bold" style={{color:'#7dd3e0', borderRight:'1px solid rgba(0,151,167,0.25)', fontSize:'10px', letterSpacing:'0.03em'}}>TEAM</th>
                        <th className="py-2 px-2 text-center font-bold" style={{color:'#7dd3e0', borderRight:'1px solid rgba(0,151,167,0.25)', fontSize:'10px'}}>ENG</th>
                        <th className="py-2 px-2 text-right font-bold" style={{color:'#7dd3e0', borderRight:'1px solid rgba(0,151,167,0.25)', fontSize:'10px'}}>Total Hrs</th>
                        <th className="py-2 px-2 text-right font-bold" style={{color:'#7dd3e0', borderRight:'1px solid rgba(0,151,167,0.25)', fontSize:'10px'}}>Prod Hrs</th>
                        <th className="py-2 px-2 text-center font-bold" style={{color:'#7dd3e0', borderRight:'1px solid rgba(0,151,167,0.25)', fontSize:'10px'}}>Prod %</th>
                        <th className="py-2 px-2 text-center font-bold" style={{color:'#7dd3e0', borderRight:'1px solid rgba(0,151,167,0.25)', fontSize:'10px'}}>Tasks</th>
                        <th className="py-2 px-2 text-center font-bold" style={{color:'#7dd3e0', borderRight:'1px solid rgba(0,151,167,0.25)', fontSize:'10px'}}>Carry</th>
                        <th className="py-2 px-2 text-right font-bold" style={{color:'#7dd3e0', fontSize:'10px'}}>Billable</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teams.map((t, idx) => {
                        const tTotal = t.members.reduce((a, m) => a + m.totalHours, 0);
                        const tProd  = t.members.reduce((a, m) => a + m.productiveHours, 0);
                        const tTasks = t.members.reduce((a, m) => a + m.tasksCompleted, 0);
                        const tCarry = t.members.reduce((a, m) => a + m.carryForward, 0);
                        const tBill  = t.members.reduce((a, m) => a + m.billableHours, 0);
                        const tExp   = t.members.reduce((acc, m) => acc + Math.max(0, ((m.shiftDays || 5) - m.holidaysAvailed) * 9), 0);
                        const ratio  = tExp > 0 ? ((tProd / tExp) * 100).toFixed(1) : '0';
                        const ratioNum = parseFloat(ratio);
                        let ratioColor = '#34d399';
                        if (ratioNum < 80) ratioColor = '#f87171';
                        else if (ratioNum < 95) ratioColor = '#fbbf24';
                        const rowBg = idx % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'rgba(0,151,167,0.08)';
                        return (
                          <tr key={t.id} style={{background: rowBg, borderBottom:'1px solid rgba(0,151,167,0.15)'}}>
                            <td className="py-2 px-3 font-bold" style={{color:'#a5e4ef', borderRight:'1px solid rgba(0,151,167,0.2)', fontSize:'10px'}}>{t.name}</td>
                            <td className="py-2 px-2 text-center" style={{color:'#d4eef5', borderRight:'1px solid rgba(0,151,167,0.15)', fontSize:'10px'}}>{t.members.length}</td>
                            <td className="py-2 px-2 text-right" style={{color:'#d4eef5', borderRight:'1px solid rgba(0,151,167,0.15)', fontSize:'10px'}}>{tTotal.toFixed(2)}</td>
                            <td className="py-2 px-2 text-right" style={{color:'#d4eef5', borderRight:'1px solid rgba(0,151,167,0.15)', fontSize:'10px'}}>{tProd.toFixed(2)}</td>
                            <td className="py-2 px-2 text-center font-bold" style={{color: ratioColor, borderRight:'1px solid rgba(0,151,167,0.15)', fontSize:'10px'}}>{ratio}%</td>
                            <td className="py-2 px-2 text-center font-bold" style={{color:'#67d5e3', borderRight:'1px solid rgba(0,151,167,0.15)', fontSize:'10px'}}>{tTasks}</td>
                            <td className="py-2 px-2 text-center" style={{color: tCarry > 0 ? '#fbbf24' : '#d4eef5', borderRight:'1px solid rgba(0,151,167,0.15)', fontSize:'10px'}}>{tCarry}</td>
                            <td className="py-2 px-2 text-right" style={{color:'#d4eef5', fontSize:'10px'}}>{tBill.toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Footer */}
              <div className="flex-shrink-0 flex justify-between items-center px-6 sm:px-9 py-2" style={{borderTop:'1px solid rgba(0,151,167,0.2)', background:'rgba(0,0,0,0.2)'}}>
                <span className="text-[9px] font-semibold" style={{color:'#4db6c9'}}>Executive Summary • OfficeHub360</span>
                <span className="text-[9px]" style={{color:'#2d8a99'}}>Generated by AI WSR Bot</span>
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
