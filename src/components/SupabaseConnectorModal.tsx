import React, { useState } from 'react';
import {
  Database,
  CheckCircle,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  X,
  Code2,
  Table
} from 'lucide-react';
import { SupabaseConfig } from '../types/wsr';
import {
  testSupabaseConnection,
  SUPABASE_SQL_SCHEMA_SCRIPT
} from '../services/supabaseClient';

interface SupabaseConnectorModalProps {
  config: SupabaseConfig;
  onUpdateConfig: (updated: SupabaseConfig) => void;
  onClose: () => void;
  onResetData: () => void;
}

export const SupabaseConnectorModal: React.FC<SupabaseConnectorModalProps> = ({
  config,
  onUpdateConfig,
  onClose,
  onResetData
}) => {
  const [projectUrl, setProjectUrl] = useState(config.projectUrl);
  const [apiKey, setApiKey] = useState(config.apiKey);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [activeTab, setActiveTab] = useState<'connection' | 'schema'>('connection');

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    const result = await testSupabaseConnection(projectUrl, apiKey);
    setIsTesting(false);
    setTestResult(result);
    if (result.success) {
      onUpdateConfig({
        ...config,
        projectUrl,
        apiKey,
        connected: true,
        lastSynced: new Date().toISOString()
      });
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA_SCRIPT);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#09090b]/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-hidden">
      <div className="bg-[#18181b] border border-[#27272a] rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Fixed Header */}
        <div className="flex items-center justify-between gap-4 border-b border-[#27272a] px-5 sm:px-6 py-4 shrink-0 bg-[#18181b]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-700/50 text-emerald-400 shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Supabase Database Sync
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-900/60 border border-emerald-700/40 text-emerald-300 font-mono">
                  ofzdvvjkqgnheogwfdnk
                </span>
              </h2>
              <p className="text-xs text-[#71717a] hidden sm:block">
                Connect your company HR & Timesheet tables to feed the AI WSR Bot
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

        {/* Tab switch bar */}
        <div className="flex items-center gap-2 border-b border-[#27272a] px-5 sm:px-6 pt-3 pb-2 bg-[#18181b] shrink-0">
          <button
            onClick={() => setActiveTab('connection')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'connection'
                ? 'bg-white text-black shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-[#27272a]'
            }`}
          >
            Connection & Credentials
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'schema'
                ? 'bg-white text-black shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-[#27272a]'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Supabase SQL Migration Script</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 space-y-6">

        {/* TAB 1: Connection */}
        {activeTab === 'connection' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Supabase Project URL *
              </label>
              <input
                type="text"
                value={projectUrl}
                onChange={(e) => setProjectUrl(e.target.value)}
                placeholder="https://ofzdvvjkqgnheogwfdnk.supabase.co"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Anon / Public API Key *
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:border-cyan-500"
              />
            </div>

            {/* Test Result Message */}
            {testResult && (
              <div
                className={`p-3.5 rounded-xl border flex items-center gap-3 text-xs ${
                  testResult.success
                    ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300'
                    : 'bg-red-950/30 border-red-800/40 text-red-300'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}

            {/* Table Mappings */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Table className="w-3.5 h-3.5 text-cyan-400" />
                Synchronized OfficeHub360 Tables
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['timesheets', 'tasks', 'employees', 'teams'].map((t) => (
                  <div
                    key={t}
                    className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-center"
                  >
                    <div className="font-mono text-xs font-semibold text-cyan-300">{t}</div>
                    <div className="text-[10px] text-emerald-400 mt-0.5">● Synced</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <a
                href="https://supabase.com/dashboard/project/ofzdvvjkqgnheogwfdnk"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300"
              >
                <span>Open Supabase Dashboard</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onResetData}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700"
                >
                  Reload Company Sample Data
                </button>
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                  <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SQL Script */}
        {activeTab === 'schema' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-400">
                Copy and run this in your Supabase SQL Editor to provision all tables:
              </p>
              <button
                onClick={handleCopySql}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs border border-slate-700"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? 'Copied to Clipboard!' : 'Copy SQL Script'}</span>
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-cyan-300/90 max-h-72 overflow-y-auto leading-relaxed">
              {SUPABASE_SQL_SCHEMA_SCRIPT}
            </pre>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};
