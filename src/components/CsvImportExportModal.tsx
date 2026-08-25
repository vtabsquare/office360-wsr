import React, { useState } from 'react';
import { Upload, Download, FileSpreadsheet, X, CheckCircle, AlertCircle } from 'lucide-react';
import { TeamWsrData } from '../types/wsr';

interface CsvImportExportModalProps {
  teams: TeamWsrData[];
  onImportCsv: (csvText: string) => void;
  onClose: () => void;
}

export const CsvImportExportModal: React.FC<CsvImportExportModalProps> = ({
  teams,
  onImportCsv,
  onClose
}) => {
  const [csvContent, setCsvContent] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  const handleExportAll = () => {
    let csv = 'Team,Name,DisplayName,Total Hours,Productive Hours,Non-Productive Hours,Tasks Completed,Carry Forward,Billable Hours,Non-Billable Hours,Holidays Availed\n';

    teams.forEach((t) => {
      t.members.forEach((m) => {
        csv += `"${t.name}","${m.name}","${m.displayName}",${m.totalHours},${m.productiveHours},${m.nonProductiveHours},${m.tasksCompleted},${m.carryForward},${m.billableHours},${m.nonBillableHours},${m.holidaysAvailed}\n`;
      });
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'OfficeHub360_WSR_Export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvContent(text);
    };
    reader.readAsText(file);
  };

  const handleApplyImport = () => {
    if (!csvContent.trim()) {
      setStatusMessage({ type: 'error', text: 'Please upload or paste CSV data first.' });
      return;
    }
    try {
      onImportCsv(csvContent);
      setStatusMessage({ type: 'success', text: 'CSV data successfully imported into teams!' });
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to parse CSV format.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-teal-950/80 border border-teal-700/50 text-teal-400">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">CSV Timesheet Import & Export</h2>
              <p className="text-xs text-slate-400">
                Bulk import employee records from OfficeHub360 or export current WSR metrics
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {statusMessage && (
          <div
            className={`p-3.5 rounded-xl border flex items-center gap-2 text-xs ${
              statusMessage.type === 'success'
                ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300'
                : 'bg-red-950/30 border-red-800/40 text-red-300'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <div className="space-y-4">
          {/* File Upload Box */}
          <div className="border-2 border-dashed border-slate-700 hover:border-cyan-500 rounded-xl p-6 text-center cursor-pointer transition-colors relative bg-slate-950/40">
            <input
              type="file"
              accept=".csv,.txt"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <Upload className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-200">
              Click to select CSV file from your computer or drag here
            </p>
            <p className="text-[11px] text-slate-500 mt-1">Supports standard OfficeHub360 timesheet columns</p>
          </div>

          {/* Paste CSV textarea */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Or Paste CSV Data Directly:
            </label>
            <textarea
              rows={6}
              value={csvContent}
              onChange={(e) => setCsvContent(e.target.value)}
              placeholder={`Name,Total Hours,Billable Hours,Non-Billable Hours,Productive Hours,Non-Productive Hours,Holidays Availed\n"Vasanth Kumar",34.81,0.00,34.81,33.68,1.13,0`}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-cyan-300/90 focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={handleExportAll}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export Current WSR CSV</span>
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
              type="button"
              onClick={handleApplyImport}
              className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-600/20"
            >
              Import Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
