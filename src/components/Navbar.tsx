import React, { useState, useEffect } from 'react';
import {
  Presentation,
  Download,
  Send,
  Sparkles,
  Database,
  Calendar,
  MessageSquare,
  FileSpreadsheet,
  ExternalLink,
  Bot,
  Mail,
  UserCheck,
  Menu,
  X
} from 'lucide-react';
import { SupabaseConfig, BotScheduleConfig } from '../types/wsr';
import { auth, googleSignIn, logoutGoogle } from '../services/googleAuthService';
import { User } from 'firebase/auth';

interface NavbarProps {
  supabaseConfig: SupabaseConfig;
  scheduleConfig: BotScheduleConfig;
  activeTab: 'slides' | 'data' | 'insights';
  setActiveTab: (tab: 'slides' | 'data' | 'insights') => void;
  onOpenPresentation: () => void;
  onDownloadPptx: () => void;
  onRunBotNow: () => void;
  onOpenAiInsights: () => void;
  onOpenChat: () => void;
  onOpenSupabaseModal: () => void;
  onOpenScheduleModal: () => void;
  isDownloadingPptx?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  supabaseConfig,
  scheduleConfig,
  activeTab,
  setActiveTab,
  onOpenPresentation,
  onDownloadPptx,
  onRunBotNow,
  onOpenAiInsights,
  onOpenChat,
  onOpenSupabaseModal,
  onOpenScheduleModal,
  isDownloadingPptx = false
}) => {
  const [googleUser, setGoogleUser] = useState<User | null>(auth.currentUser);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      setGoogleUser(u);
    });
    return () => unsub();
  }, []);

  const handleGoogleClick = async () => {
    if (!googleUser) {
      try {
        const res = await googleSignIn();
        if (res?.user) setGoogleUser(res.user);
      } catch (err) {
        console.error('Google sign in error:', err);
      }
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#09090b]/95 backdrop-blur-md border-b border-[#27272a] text-[#fafafa]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Brand & App info in Bento Style */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#3b82f6] rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20 shrink-0">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="shrink-0">
              <div className="flex items-center gap-1.5 sm:gap-2 whitespace-nowrap">
                <h1 className="font-semibold text-sm sm:text-base lg:text-lg tracking-tight text-white">
                  OfficeHub360 <span className="text-[#71717a] font-normal text-xs sm:text-sm hidden xs:inline">AI Intel</span>
                </h1>
                <span className="bg-[#3b82f620] border border-[#3b82f640] text-[#60a5fa] text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full shrink-0">
                  WSR Bot
                </span>
              </div>
              <p className="text-[11px] text-[#71717a] hidden md:block whitespace-nowrap">
                Weekly Status Reports & Executive Deck Automation
              </p>
            </div>
          </div>

          {/* Action Buttons in Bento Palette */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Run Bot Now / Send to Manager */}
            <button
              onClick={onRunBotNow}
              className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-black text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer"
              title="Run Automated AI Bot & Send WSR Email with PPT Attachment"
            >
              <Send className="w-3.5 h-3.5 text-blue-600" />
              <span>Send Now</span>
            </button>

            {/* Always Visible Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-xl bg-[#18181b] hover:bg-[#27272a] text-slate-300 border border-[#27272a] cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Universal Navigation Drawer / Dropdown */}
        {mobileMenuOpen && (
          <div className="py-3 border-t border-[#27272a] space-y-3 bg-[#09090b]">
            <div className="grid grid-cols-3 gap-1.5 bg-[#18181b] p-1 rounded-xl border border-[#27272a]">
              <button
                onClick={() => {
                  setActiveTab('slides');
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'slides'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-[#a1a1aa] hover:text-white'
                }`}
              >
                <Presentation className="w-3.5 h-3.5" />
                PPT Deck
              </button>
              <button
                onClick={() => {
                  setActiveTab('data');
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'data'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-[#a1a1aa] hover:text-white'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                Timesheets
              </button>
              <button
                onClick={() => {
                  setActiveTab('insights');
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'insights'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-[#a1a1aa] hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                AI Intel
              </button>
            </div>

            {/* Utility Actions */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pt-1">
              <button
                onClick={() => {
                  onOpenChat();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-2 p-2 rounded-xl bg-[#18181b] border border-[#27272a] text-xs text-slate-300 hover:bg-[#27272a]"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#60a5fa]" />
                <span>Ask AI Bot</span>
              </button>
              <button
                onClick={() => {
                  onOpenScheduleModal();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-2 p-2 rounded-xl bg-[#18181b] border border-[#27272a] text-xs text-slate-300 hover:bg-[#27272a]"
              >
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                <span>Schedule</span>
              </button>
              <button
                onClick={() => {
                  onOpenSupabaseModal();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-2 p-2 rounded-xl bg-[#18181b] border border-[#27272a] text-xs text-slate-300 hover:bg-[#27272a]"
              >
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                <span>Supabase</span>
              </button>
              <button
                onClick={() => {
                  handleGoogleClick();
                  setMobileMenuOpen(false);
                }}
                title={googleUser ? `Signed in as ${googleUser.email}` : 'Sign in with Google'}
                className="flex items-center justify-center gap-2 p-2 rounded-xl bg-[#18181b] border border-[#27272a] text-xs text-slate-300 hover:bg-[#27272a]"
              >
                <Mail className={`w-3.5 h-3.5 ${googleUser ? 'text-emerald-400' : 'text-blue-400'}`} />
                <span>{googleUser ? 'Gmail Ready' : 'Gmail'}</span>
              </button>
              <button
                onClick={() => {
                  onDownloadPptx();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-2 p-2 rounded-xl bg-[#18181b] border border-[#27272a] text-xs text-slate-300 hover:bg-[#27272a]"
              >
                <Download className="w-3.5 h-3.5 text-blue-400" />
                <span>Download PPT</span>
              </button>
              <button
                onClick={() => {
                  onOpenPresentation();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-2 p-2 rounded-xl bg-[#18181b] border border-[#27272a] text-xs text-slate-300 hover:bg-[#27272a]"
              >
                <Presentation className="w-3.5 h-3.5 text-amber-400" />
                <span>Present</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
