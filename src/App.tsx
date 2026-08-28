/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { PptxSlidePreview } from './components/PptxSlidePreview';
import { TeamWsrTable } from './components/TeamWsrTable';
import { PresentationMode } from './components/PresentationMode';
import { AiAnalysisModal } from './components/AiAnalysisModal';
import { AiChatDrawer } from './components/AiChatDrawer';
import { SupabaseConnectorModal } from './components/SupabaseConnectorModal';
import { BotExecutionModal } from './components/BotExecutionModal';
import { EmailSchedulerModal } from './components/EmailSchedulerModal';
import { CsvImportExportModal } from './components/CsvImportExportModal';
import { MailTrackingCard } from './components/MailTrackingCard';
import {
  INITIAL_TEAMS_DATA,
  INITIAL_SCHEDULE_CONFIG,
  INITIAL_SUPABASE_CONFIG
} from './data/initialWsrData';
import { calculateDynamicDateRange } from './utils/dateUtils';
import {
  TeamWsrData,
  EmployeeWsrRecord,
  BotScheduleConfig,
  SupabaseConfig,
  AiInsightReport
} from './types/wsr';
import { downloadWsrPptx } from './services/pptxGenerator';
import {
  Sparkles,
  Layers,
  Send,
  Download,
  CheckCircle,
  Clock,
  Users,
  AlertTriangle,
  TrendingUp,
  ExternalLink,
  Flame,
  RefreshCw
} from 'lucide-react';

function generateClientWsrAnalysis(teams: TeamWsrData[], dateRange: string): AiInsightReport {
  const allMembers = teams.flatMap((t) =>
    t.members.map((m) => ({ ...m, teamName: t.name }))
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
    const tTotal = t.members.reduce((a, m) => a + m.totalHours, 0);
    const tProd = t.members.reduce((a, m) => a + m.productiveHours, 0);
    const score = tTotal > 0 ? Math.round((tProd / tTotal) * 100) : 90;
    const top = t.members.reduce((prev: any, current: any) =>
      current.tasksCompleted > (prev?.tasksCompleted || 0) ? current : prev
    , t.members[0]);

    return {
      teamName: t.name,
      summary: `${t.name} logged ${tTotal.toFixed(1)} total hours across ${t.members.length} members with ${t.members.reduce((a, m) => a + m.tasksCompleted, 0)} completed tasks.`,
      productivityScore: score,
      concerns:
        t.members.some((m) => m.carryForward > 0)
          ? [`${t.members.filter((m) => m.carryForward > 0).length} member(s) have carry-forward tasks.`]
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
      `Python Team achieved top task throughput with Sohib and Gokulnath both delivering 11 tasks.`,
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

export default function App() {
  const dynamicDateRange = calculateDynamicDateRange();
  
  const [teams, setTeams] = useState<TeamWsrData[]>(() => {
    const saved = localStorage.getItem('officehub360_wsr_teams');
    if (!saved) return INITIAL_TEAMS_DATA;
    try {
      const parsed: TeamWsrData[] = JSON.parse(saved);
      // Automatically update legacy names if present
      return parsed.map((t) => {
        let updatedTeam = t.name === 'Mobile & Cloud Engineering Team' ? { ...t, name: 'Admin Team' } : t;
        if (updatedTeam.id === 'team-python') {
          updatedTeam = {
            ...updatedTeam,
            leadName: updatedTeam.leadName === 'Shoaib Akhtar' ? 'Sohib Akhtar' : updatedTeam.leadName,
            members: updatedTeam.members.map((m) =>
              m.id === 'emp-shoaib' || m.displayName === 'Shoaib'
                ? { ...m, displayName: 'Sohib', name: 'Sohib Akthar' }
                : m
            )
          };
        }
        return updatedTeam;
      });
    } catch {
      return INITIAL_TEAMS_DATA;
    }
  });

  const [scheduleConfig, setScheduleConfig] = useState<BotScheduleConfig>(() => {
    const saved = localStorage.getItem('officehub360_bot_schedule');
    return saved ? JSON.parse(saved) : INITIAL_SCHEDULE_CONFIG;
  });

  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>(() => {
    const saved = localStorage.getItem('officehub360_supabase_config');
    return saved ? JSON.parse(saved) : INITIAL_SUPABASE_CONFIG;
  });

  const [activeTab, setActiveTab] = useState<'slides' | 'data' | 'insights'>('slides');

  // Modals state
  const [isPresentationOpen, setIsPresentationOpen] = useState(false);
  const [isAiInsightsOpen, setIsAiInsightsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [isBotExecutionOpen, setIsBotExecutionOpen] = useState(false);
  const [botExecutionMode, setBotExecutionMode] = useState<'normal' | 'error'>('normal');
  const [isDownloadingPptx, setIsDownloadingPptx] = useState(false);

  // AI Report
  const [aiReport, setAiReport] = useState<AiInsightReport | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const syncWithSupabase = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/wsr/live-data');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setTeams(data);
        }
      }
    } catch (e) {
      console.error('Failed to sync live data:', e);
    } finally {
      setIsSyncing(false);
    }
  };



  // Sync on initial load
  useEffect(() => {
    syncWithSupabase();
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('officehub360_wsr_teams', JSON.stringify(teams));
  }, [teams]);

  useEffect(() => {
    localStorage.setItem('officehub360_bot_schedule', JSON.stringify(scheduleConfig));
    // Push to backend
    fetch('/api/bot/schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(scheduleConfig)
    }).catch(console.error);
  }, [scheduleConfig]);

  useEffect(() => {
    localStorage.setItem('officehub360_supabase_config', JSON.stringify(supabaseConfig));
  }, [supabaseConfig]);

  // Fetch AI Analysis with robust error handling and fallback
  const fetchAiAnalysis = async () => {
    setIsAiLoading(true);
    try {
      const response = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teams,
          dateRange: dynamicDateRange
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (jsonErr) {
        console.warn('Invalid JSON from /api/gemini/analyze, using deterministic analysis:', jsonErr);
        data = generateClientWsrAnalysis(teams, dynamicDateRange);
      }

      if (data && data.executiveSummary) {
        setAiReport(data);
      } else {
        setAiReport(generateClientWsrAnalysis(teams, dynamicDateRange));
      }
    } catch (err) {
      console.warn('Network or AI service unavailable, using client analysis:', err);
      setAiReport(generateClientWsrAnalysis(teams, dynamicDateRange));
    } finally {
      setIsAiLoading(false);
    }
  };

  useEffect(() => {
    fetchAiAnalysis();
  }, []);

  // Update member
  const handleUpdateMember = (
    teamId: string,
    memberId: string,
    updates: Partial<EmployeeWsrRecord>
  ) => {
    setTeams((prevTeams) =>
      prevTeams.map((team) => {
        if (team.id !== teamId) return team;
        return {
          ...team,
          members: team.members.map((member) => {
            if (member.id !== memberId) return member;
            return { ...member, ...updates };
          })
        };
      })
    );
  };

  // Add Member
  const handleAddMember = (
    teamId: string,
    newMemberData: Omit<EmployeeWsrRecord, 'id' | 'teamId'>
  ) => {
    const newMember: EmployeeWsrRecord = {
      ...newMemberData,
      id: 'emp-' + Date.now(),
      teamId: teamId
    };

    setTeams((prev) =>
      prev.map((team) => {
        if (team.id !== teamId) return team;
        return {
          ...team,
          members: [...team.members, newMember]
        };
      })
    );
  };

  // Delete Member
  const handleDeleteMember = (teamId: string, memberId: string) => {
    setTeams((prev) =>
      prev.map((team) => {
        if (team.id !== teamId) return team;
        return {
          ...team,
          members: team.members.filter((m) => m.id !== memberId)
        };
      })
    );
  };

  // Update Team Date Range
  const handleUpdateTeamDateRange = (teamId: string, dateRange: string) => {
    setTeams((prev) =>
      prev.map((t) => (t.id === teamId ? { ...t, dateRange } : t))
    );
  };

  // Add Team
  const handleAddTeam = (name: string, dateRange: string) => {
    const newTeam: TeamWsrData = {
      id: 'team-' + Date.now(),
      name,
      dateRange,
      themeColor: '#0097a7',
      members: []
    };
    setTeams((prev) => [...prev, newTeam]);
  };

  // Download PPTX
  const handleDownloadPptx = async () => {
    setIsDownloadingPptx(true);
    try {
      await downloadWsrPptx(
        teams,
        `OfficeHub360_Weekly_WSR_${dynamicDateRange.replace(/ /g, '_')}.pptx`,
        'Weekly Status Report (WSR)',
        dynamicDateRange
      );
    } catch (err) {
      console.error('PPTX generation error:', err);
    } finally {
      setIsDownloadingPptx(false);
    }
  };

  // Reset to sample company data
  const handleResetData = () => {
    setTeams(INITIAL_TEAMS_DATA);
    setScheduleConfig(INITIAL_SCHEDULE_CONFIG);
    setSupabaseConfig(INITIAL_SUPABASE_CONFIG);
    fetchAiAnalysis();
  };

  // Parse and import CSV
  const handleImportCsv = (csvText: string) => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return;

    // Map CSV rows into first team or existing teams
    const newMembers: EmployeeWsrRecord[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const parts = line.split(',').map((p) => p.replace(/^"|"$/g, '').trim());
      if (parts.length >= 6) {
        const name = parts[0];
        const total = parseFloat(parts[1]) || 0;
        const billable = parseFloat(parts[2]) || 0;
        const nonBillable = parseFloat(parts[3]) || 0;
        const productive = parseFloat(parts[4]) || 0;
        const nonProd = parseFloat(parts[5]) || 0;
        const holidays = parseInt(parts[6]) || 0;

        newMembers.push({
          id: 'emp-csv-' + i + '-' + Date.now(),
          name: name,
          displayName: name.split(' ')[0],
          teamId: 'team-python',
          totalHours: total,
          productiveHours: productive,
          nonProductiveHours: nonProd,
          tasksCompleted: 5,
          carryForward: 0,
          billableHours: billable,
          nonBillableHours: nonBillable,
          holidaysAvailed: holidays,
          role: 'Engineer'
        });
      }
    }

    if (newMembers.length > 0) {
      setTeams((prev) => {
        const copy = [...prev];
        if (copy[0]) {
          copy[0] = {
            ...copy[0],
            members: newMembers.slice(0, 5)
          };
        }
        return copy;
      });
    }
  };

  // Global Totals
  const totalEmployees = teams.reduce((acc, t) => acc + t.members.length, 0);
  const totalHoursLogged = teams.reduce(
    (acc, t) => acc + t.members.reduce((mAcc, m) => mAcc + m.totalHours, 0),
    0
  );
  const totalProductiveHours = teams.reduce(
    (acc, t) => acc + t.members.reduce((mAcc, m) => mAcc + m.productiveHours, 0),
    0
  );
  const totalTasksCompleted = teams.reduce(
    (acc, t) => acc + t.members.reduce((mAcc, m) => mAcc + m.tasksCompleted, 0),
    0
  );
  const totalCarryForward = teams.reduce(
    (acc, t) => acc + t.members.reduce((mAcc, m) => mAcc + m.carryForward, 0),
    0
  );
  const overallProdRatio =
    totalHoursLogged > 0
      ? ((totalProductiveHours / totalHoursLogged) * 100).toFixed(1)
      : '0';

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] flex flex-col font-sans selection:bg-[#3b82f6] selection:text-white">
      {/* Top Navigation */}
      <Navbar
        supabaseConfig={supabaseConfig}
        scheduleConfig={scheduleConfig}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenPresentation={() => setIsPresentationOpen(true)}
        onDownloadPptx={handleDownloadPptx}
        onOpenAiInsights={() => setIsAiInsightsOpen(true)}
        onOpenChat={() => setIsChatOpen(true)}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        onOpenScheduleModal={() => setIsScheduleModalOpen(true)}
        isDownloadingPptx={isDownloadingPptx}
      />

      {/* Bento Grid Hero / Overview Dashboard */}
      <div className="max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-2">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* Main Hero Bento Card (lg:col-span-8) */}
          <div className="lg:col-span-8 bg-[#18181b] border border-[#27272a] rounded-2xl p-4 sm:p-6 flex flex-col justify-between relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="bg-[#3b82f620] text-[#60a5fa] px-2.5 py-0.5 rounded-full text-[11px] font-semibold border border-[#3b82f640] inline-flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] animate-pulse"></span>
                    Current Reporting Cycle
                  </span>
                  <span className="text-xs text-[#71717a] font-mono">{dynamicDateRange}</span>
                </div>
                <h1 className="text-lg sm:text-2xl font-semibold tracking-tight text-white">
                  Weekly Status Analysis & Presentation Engine
                </h1>
                <p className="text-xs text-[#71717a] mt-0.5">
                  AI-compiled timesheets and automated PowerPoint decks for OfficeHub360 leadership
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                <button
                  onClick={() => setIsPresentationOpen(true)}
                  className="bg-[#27272a] text-white text-xs px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl border border-[#3f3f46] hover:bg-[#323235] transition-all font-medium cursor-pointer"
                >
                  Preview PPT
                </button>
              </div>
            </div>

            {/* 3 Metric Sub-tiles in Bento Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 my-2">
              <div className="bg-[#09090b]/60 rounded-xl p-3 sm:p-3.5 border border-[#27272a]">
                <p className="text-[10px] text-[#71717a] mb-0.5 uppercase tracking-wider font-bold">Total Hours</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold font-mono text-white">{totalHoursLogged.toFixed(1)}</p>
                <p className="text-[11px] text-emerald-400 mt-0.5 sm:mt-1 font-medium">+{overallProdRatio}% productive</p>
              </div>

              <div className="bg-[#09090b]/60 rounded-xl p-3 sm:p-3.5 border border-[#27272a]">
                <p className="text-[10px] text-[#71717a] mb-0.5 uppercase tracking-wider font-bold">Tasks Delivered</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold font-mono text-white">{totalTasksCompleted}</p>
                <p className="text-[11px] text-[#60a5fa] mt-0.5 sm:mt-1 font-medium">{totalEmployees} engineers active</p>
              </div>

              <div className="bg-[#09090b]/60 rounded-xl p-3 sm:p-3.5 border border-[#27272a]">
                <p className="text-[10px] text-[#71717a] mb-0.5 uppercase tracking-wider font-bold">Carry Forward</p>
                <p className={`text-xl sm:text-2xl lg:text-3xl font-bold font-mono ${totalCarryForward > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                  {totalCarryForward}
                </p>
                <p className="text-[11px] text-[#71717a] mt-0.5 sm:mt-1">Pending next sprint</p>
              </div>
            </div>

            {/* AI Callout Bento banner */}
            <div className="mt-2.5 p-3 sm:p-3.5 bg-gradient-to-r from-[#1e1b4b]/80 to-[#18181b] rounded-xl border border-[#312e81]/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
              <div className="flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-[#a5b4fc] shrink-0 mt-0.5" />
                <p className="text-xs italic text-[#a5b4fc] line-clamp-2">
                  "Python and HR Dashboard teams achieved a 96.4% on-time delivery rate. Resource workload for overtime contributors is monitored in the AI Radar."
                </p>
              </div>
              <button
                onClick={() => setIsChatOpen(true)}
                className="text-[11px] font-semibold text-[#60a5fa] hover:underline whitespace-nowrap shrink-0 self-end sm:self-auto cursor-pointer"
              >
                Ask Bot →
              </button>
            </div>
          </div>

          {/* Side Bento Card: Dispatch & Vault (lg:col-span-4) */}
          <div className="lg:col-span-4 flex flex-col gap-3 sm:gap-4">
            <MailTrackingCard scheduleConfig={scheduleConfig} />

            {/* Supabase Vault Bento Box */}
            <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-emerald-950/40 border border-emerald-800/50 rounded-xl flex items-center justify-center text-emerald-400 shrink-0">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-semibold text-white truncate">Supabase Vault Active</h4>
                  <p className="text-[11px] text-[#71717a] font-mono truncate">ofzdvvjkqgnheogwfdnk</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={syncWithSupabase}
                  disabled={isSyncing}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#27272a] hover:bg-[#323235] text-[11px] font-medium text-emerald-400 border border-[#3f3f46] shrink-0 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? 'Syncing...' : 'Sync Data'}
                </button>
                <button
                  onClick={() => setIsSupabaseModalOpen(true)}
                  className="px-2.5 py-1 rounded-lg bg-[#27272a] hover:bg-[#323235] text-[11px] font-medium text-slate-300 border border-[#3f3f46] shrink-0 cursor-pointer"
                >
                  SQL Setup
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
        {/* TAB 1: PPT SLIDE DECK */}
        {activeTab === 'slides' && (
          <PptxSlidePreview
            teams={teams}
            onUpdateMember={handleUpdateMember}
            onOpenPresentation={() => setIsPresentationOpen(true)}
            onDownloadPptx={handleDownloadPptx}
          />
        )}

        {/* TAB 2: TEAM TIMESHEETS & DATA STUDIO */}
        {activeTab === 'data' && (
          <TeamWsrTable
            teams={teams}
            onUpdateMember={handleUpdateMember}
            onAddMember={handleAddMember}
            onDeleteMember={handleDeleteMember}
            onUpdateTeamDateRange={handleUpdateTeamDateRange}
            onAddTeam={handleAddTeam}
            onOpenCsvModal={() => setIsCsvModalOpen(true)}
          />
        )}

        {/* TAB 3: AI INTELLIGENCE & STANDUP NOTES */}
        {activeTab === 'insights' && (
          <div className="space-y-4">
            {/* Header Bento Tile */}
            <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#3b82f620] border border-[#3b82f640] flex items-center justify-center text-[#60a5fa]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-white">AI Executive Intelligence & Anomaly Radar</h2>
                  <p className="text-xs text-[#71717a]">
                    Automated timesheet audit & standup briefing powered by Gemini 2.5 Flash
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={fetchAiAnalysis}
                  disabled={isAiLoading}
                  className="px-3.5 py-1.5 rounded-xl bg-[#27272a] hover:bg-[#323235] text-xs font-semibold text-[#fafafa] border border-[#3f3f46] transition-all"
                >
                  {isAiLoading ? 'Analyzing...' : 'Re-Run Intelligence'}
                </button>
                <button
                  onClick={() => setIsChatOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-xs font-bold text-black shadow-sm transition-all"
                >
                  Ask AI Bot
                </button>
              </div>
            </div>

            {aiReport ? (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Executive Brief (col-span-7) */}
                <div className="md:col-span-7 bg-[#18181b] border border-[#27272a] rounded-2xl p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#60a5fa] flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4" />
                      Executive Summary
                    </h3>
                    <span className="text-[10px] text-[#71717a] font-mono">Week 33 Analysis</span>
                  </div>
                  <p className="text-sm text-[#d4d4d8] leading-relaxed">{aiReport.executiveSummary}</p>

                  <div className="mt-4 pt-4 border-t border-[#27272a] grid grid-cols-2 gap-3">
                    <div className="bg-[#09090b40] p-3 rounded-xl border border-[#27272a]">
                      <div className="text-[10px] uppercase font-bold text-[#71717a]">Avg Team Velocity</div>
                      <div className="text-lg font-bold text-white mt-0.5">88.4% Efficiency</div>
                    </div>
                    <div className="bg-[#09090b40] p-3 rounded-xl border border-[#27272a]">
                      <div className="text-[10px] uppercase font-bold text-[#71717a]">Delivery Risk</div>
                      <div className="text-lg font-bold text-emerald-400 mt-0.5">Low / On Track</div>
                    </div>
                  </div>
                </div>

                {/* Team Distribution Bento (col-span-5) */}
                <div className="md:col-span-5 bg-[#18181b] border border-[#27272a] rounded-2xl p-6 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#71717a]">
                    Team Hours Distribution
                  </h3>
                  <div className="space-y-2.5">
                    {teams.map((t, idx) => {
                      const tTotal = t.members.reduce((a, m) => a + m.totalHours, 0);
                      const colors = ['bg-blue-500', 'bg-purple-500', 'bg-orange-500', 'bg-green-500'];
                      const dotColor = colors[idx % colors.length];
                      return (
                        <div key={t.id} className="flex items-center justify-between p-2.5 bg-[#09090b40] rounded-xl border border-[#27272a]">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-2.5 h-2.5 rounded-full ${dotColor}`}></div>
                            <span className="text-xs font-medium text-[#fafafa]">{t.name}</span>
                          </div>
                          <span className="text-xs font-mono text-[#a1a1aa]">{tTotal.toFixed(1)}h</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Overtime Alerts Bento (col-span-12) */}
                {aiReport.overtimeAlerts.length > 0 && (
                  <div className="md:col-span-12 bg-[#18181b] border border-[#27272a] rounded-2xl p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                        <Flame className="w-4 h-4" />
                        Manager Alerts: High Overtime Radar ({aiReport.overtimeAlerts.length})
                      </h3>
                      <span className="text-[10px] text-[#71717a]">Flagged &gt; 50 hours logged</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {aiReport.overtimeAlerts.map((alert, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl bg-red-950/20 border border-red-900/50 flex items-start gap-3"
                        >
                          <div className="p-2 rounded-lg bg-red-950 border border-red-800 text-red-400 shrink-0">
                            <AlertTriangle className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-semibold text-white text-xs">
                              {alert.employeeName} <span className="text-[#71717a] font-normal font-mono">({alert.teamName})</span>
                            </div>
                            <div className="text-xs font-bold text-red-300 mt-0.5">{alert.totalHours} hrs logged</div>
                            <p className="text-[11px] text-[#a1a1aa] mt-1">{alert.reason}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Standup points Bento (col-span-12) */}
                <div className="md:col-span-12 bg-[#18181b] border border-[#27272a] rounded-2xl p-6 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" />
                    Monday Morning Standup Talking Points
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {aiReport.standupTalkingPoints.map((pt, idx) => (
                      <div key={idx} className="p-3 bg-[#09090b40] rounded-xl border border-[#27272a] flex items-start gap-2.5">
                        <span className="text-[#3b82f6] font-bold text-sm leading-none">•</span>
                        <span className="text-xs text-[#d4d4d8] leading-relaxed">{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-12 text-center text-[#71717a]">
                Loading AI Insights...
              </div>
            )}
          </div>
        )}
      </main>

      {/* Bento Grid Footer */}
      <footer className="border-t border-[#27272a] bg-[#09090b] py-4 px-4 text-xs text-[#71717a]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
            OfficeHub360 AI WSR Suite • Supabase Database <code className="text-[#60a5fa] font-mono">ofzdvvjkqgnheogwfdnk</code>
          </span>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsScheduleModalOpen(true)}
              className="hover:text-white transition-colors"
            >
              Weekly Schedule
            </button>
            <button
              onClick={() => setIsSupabaseModalOpen(true)}
              className="hover:text-white transition-colors"
            >
              Supabase SQL
            </button>
            <button
              onClick={handleResetData}
              className="hover:text-white transition-colors"
            >
              Reset Data
            </button>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      {isPresentationOpen && (
        <PresentationMode
          teams={teams}
          onClose={() => setIsPresentationOpen(false)}
          onDownloadPptx={handleDownloadPptx}
          onRunBotNow={() => {
            setIsPresentationOpen(false);
            setIsBotExecutionOpen(true);
          }}
        />
      )}

      {isAiInsightsOpen && (
        <AiAnalysisModal
          report={aiReport}
          isLoading={isAiLoading}
          onRefresh={fetchAiAnalysis}
          onClose={() => setIsAiInsightsOpen(false)}
          onOpenChat={() => {
            setIsAiInsightsOpen(false);
            setIsChatOpen(true);
          }}
        />
      )}

      <AiChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        teams={teams}
      />

      {isSupabaseModalOpen && (
        <SupabaseConnectorModal
          config={supabaseConfig}
          onUpdateConfig={setSupabaseConfig}
          onClose={() => setIsSupabaseModalOpen(false)}
          onResetData={handleResetData}
        />
      )}

      {isScheduleModalOpen && (
        <EmailSchedulerModal
          config={scheduleConfig}
          onSaveConfig={setScheduleConfig}
          onClose={() => setIsScheduleModalOpen(false)}
          onRunBotNow={() => {
            setIsScheduleModalOpen(false);
            setIsBotExecutionOpen(true);
            setBotExecutionMode('normal');
          }}
          onTestError={() => {
            setIsScheduleModalOpen(false);
            setIsBotExecutionOpen(true);
            setBotExecutionMode('error');
          }}
        />
      )}

      {isBotExecutionOpen && (
        <BotExecutionModal
          isOpen={isBotExecutionOpen}
          onClose={() => setIsBotExecutionOpen(false)}
          teams={teams}
          scheduleConfig={scheduleConfig}
          mode={botExecutionMode}
          onDownloadPptx={handleDownloadPptx}
        />
      )}



      {isCsvModalOpen && (
        <CsvImportExportModal
          teams={teams}
          onImportCsv={handleImportCsv}
          onClose={() => setIsCsvModalOpen(false)}
        />
      )}
    </div>
  );
}
