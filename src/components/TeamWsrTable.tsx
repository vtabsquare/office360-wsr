import React, { useState } from 'react';
import {
  Users,
  Plus,
  Trash2,
  Edit2,
  Clock,
  CheckCircle,
  AlertTriangle,
  Calendar,
  DollarSign,
  Coffee,
  Search,
  ArrowUpDown,
  Download,
  Upload
} from 'lucide-react';
import { TeamWsrData, EmployeeWsrRecord } from '../types/wsr';

interface TeamWsrTableProps {
  teams: TeamWsrData[];
  onUpdateMember: (teamId: string, memberId: string, updates: Partial<EmployeeWsrRecord>) => void;
  onAddMember: (teamId: string, newMember: Omit<EmployeeWsrRecord, 'id' | 'teamId'>) => void;
  onDeleteMember: (teamId: string, memberId: string) => void;
  onUpdateTeamDateRange: (teamId: string, dateRange: string) => void;
  onAddTeam: (name: string, dateRange: string) => void;
  onOpenCsvModal: () => void;
}

export const TeamWsrTable: React.FC<TeamWsrTableProps> = ({
  teams,
  onUpdateMember,
  onAddMember,
  onDeleteMember,
  onUpdateTeamDateRange,
  onAddTeam,
  onOpenCsvModal
}) => {
  const [selectedTeamId, setSelectedTeamId] = useState<string>(teams[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showAddTeamModal, setShowAddTeamModal] = useState(false);

  // New member state
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberDisplayName, setNewMemberDisplayName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('');
  const [newMemberTotalHours, setNewMemberTotalHours] = useState(45.0);
  const [newMemberProductiveHours, setNewMemberProductiveHours] = useState(45.0);
  const [newMemberTasks, setNewMemberTasks] = useState(5);
  const [newMemberCarry, setNewMemberCarry] = useState(0);
  const [newMemberBillable, setNewMemberBillable] = useState(0);
  const [newMemberHolidays, setNewMemberHolidays] = useState(0);

  // New team state
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDateRange, setNewTeamDateRange] = useState('10th Aug – 15th Aug 2026');

  const currentTeam = teams.find((t) => t.id === selectedTeamId) || teams[0];

  if (!currentTeam) {
    return <div className="p-8 text-center text-slate-400">No teams found.</div>;
  }

  // Filter members by search
  const filteredMembers = currentTeam.members.filter((m) =>
    (m.name + m.displayName + (m.role || '')).toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Team Aggregates
  const totalHours = currentTeam.members.reduce((acc, m) => acc + m.totalHours, 0);
  const productiveHours = currentTeam.members.reduce((acc, m) => acc + m.productiveHours, 0);
  const nonProductiveHours = currentTeam.members.reduce((acc, m) => acc + m.nonProductiveHours, 0);
  const tasksCompleted = currentTeam.members.reduce((acc, m) => acc + m.tasksCompleted, 0);
  const carryForward = currentTeam.members.reduce((acc, m) => acc + m.carryForward, 0);
  const billableHours = currentTeam.members.reduce((acc, m) => acc + m.billableHours, 0);
  const prodRatio = totalHours > 0 ? ((productiveHours / totalHours) * 100).toFixed(1) : '0';

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName) return;

    const nonProd = Math.max(0, +(newMemberTotalHours - newMemberProductiveHours).toFixed(2));
    const nonBill = Math.max(0, +(newMemberTotalHours - newMemberBillable).toFixed(2));

    onAddMember(currentTeam.id, {
      name: newMemberName,
      displayName: newMemberDisplayName || newMemberName.split(' ')[0],
      totalHours: Number(newMemberTotalHours),
      productiveHours: Number(newMemberProductiveHours),
      nonProductiveHours: nonProd,
      tasksCompleted: Number(newMemberTasks),
      carryForward: Number(newMemberCarry),
      billableHours: Number(newMemberBillable),
      nonBillableHours: nonBill,
      holidaysAvailed: Number(newMemberHolidays),
      role: newMemberRole || 'Software Engineer'
    });

    setNewMemberName('');
    setNewMemberDisplayName('');
    setNewMemberRole('');
    setShowAddMemberModal(false);
  };

  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName) return;
    onAddTeam(newTeamName, newTeamDateRange);
    setNewTeamName('');
    setShowAddTeamModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Team Tabs and Global Actions - Bento Header Card */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Team switcher tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          {teams.map((team) => (
            <button
              key={team.id}
              onClick={() => setSelectedTeamId(team.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedTeamId === team.id
                  ? 'bg-white text-black shadow-sm'
                  : 'bg-[#09090b]/60 text-[#a1a1aa] hover:bg-[#27272a] hover:text-white border border-[#27272a]'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{team.name}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                selectedTeamId === team.id ? 'bg-slate-200 text-slate-800' : 'bg-[#18181b] text-[#71717a]'
              }`}>
                {team.members.length}
              </span>
            </button>
          ))}

          {/* Add Team Button */}
          <button
            onClick={() => setShowAddTeamModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[#18181b] hover:bg-[#27272a] text-[#a1a1aa] border border-dashed border-[#3f3f46] transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-[#60a5fa]" />
            <span>Add Team</span>
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCsvModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#27272a] hover:bg-[#323235] text-[#d4d4d8] text-xs font-medium border border-[#3f3f46] transition-all"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-400" />
            <span>Import / Export CSV</span>
          </button>
          <button
            onClick={() => setShowAddMemberModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-black text-xs font-bold shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-blue-600" />
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      {/* KPI Cards for the Active Team - Bento Grid 6-Col */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
        <div className="bg-[#18181b] border border-[#27272a] p-3 sm:p-4 rounded-xl">
          <div className="flex items-center gap-1.5 sm:gap-2 text-[#71717a] text-[11px] sm:text-xs font-bold uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5 text-[#60a5fa] shrink-0" />
            <span className="truncate">Total Hours</span>
          </div>
          <div className="text-lg sm:text-xl font-bold text-white mt-1 sm:mt-1.5 font-mono">{totalHours.toFixed(2)}</div>
          <div className="text-[10px] sm:text-[11px] text-[#71717a] mt-0.5">{currentTeam.members.length} engineers</div>
        </div>

        <div className="bg-[#18181b] border border-[#27272a] p-3 sm:p-4 rounded-xl">
          <div className="flex items-center gap-1.5 sm:gap-2 text-[#71717a] text-[11px] sm:text-xs font-bold uppercase tracking-wider">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">Productive</span>
          </div>
          <div className="text-lg sm:text-xl font-bold text-emerald-400 mt-1 sm:mt-1.5 font-mono">{productiveHours.toFixed(2)}</div>
          <div className="text-[10px] sm:text-[11px] text-emerald-400/80 mt-0.5">{prodRatio}% efficiency</div>
        </div>

        <div className="bg-[#18181b] border border-[#27272a] p-3 sm:p-4 rounded-xl">
          <div className="flex items-center gap-1.5 sm:gap-2 text-[#71717a] text-[11px] sm:text-xs font-bold uppercase tracking-wider">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">Non-Prod</span>
          </div>
          <div className="text-lg sm:text-xl font-bold text-amber-400 mt-1 sm:mt-1.5 font-mono">{nonProductiveHours.toFixed(2)}</div>
          <div className="text-[10px] sm:text-[11px] text-[#71717a] mt-0.5">Buffer / idle</div>
        </div>

        <div className="bg-[#18181b] border border-[#27272a] p-3 sm:p-4 rounded-xl">
          <div className="flex items-center gap-1.5 sm:gap-2 text-[#71717a] text-[11px] sm:text-xs font-bold uppercase tracking-wider">
            <CheckCircle className="w-3.5 h-3.5 text-[#60a5fa] shrink-0" />
            <span className="truncate">Tasks Done</span>
          </div>
          <div className="text-lg sm:text-xl font-bold text-white mt-1 sm:mt-1.5 font-mono">{tasksCompleted}</div>
          <div className="text-[10px] sm:text-[11px] text-emerald-400 font-medium mt-0.5">Completed</div>
        </div>

        <div className="bg-[#18181b] border border-[#27272a] p-3 sm:p-4 rounded-xl">
          <div className="flex items-center gap-1.5 sm:gap-2 text-[#71717a] text-[11px] sm:text-xs font-bold uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <span className="truncate">Carry Fwd</span>
          </div>
          <div className={`text-lg sm:text-xl font-bold font-mono mt-1 sm:mt-1.5 ${carryForward > 0 ? 'text-amber-400' : 'text-[#71717a]'}`}>
            {carryForward}
          </div>
          <div className="text-[10px] sm:text-[11px] text-[#71717a] mt-0.5">Next sprint</div>
        </div>

        <div className="bg-[#18181b] border border-[#27272a] p-3 sm:p-4 rounded-xl">
          <div className="flex items-center gap-1.5 sm:gap-2 text-[#71717a] text-[11px] sm:text-xs font-bold uppercase tracking-wider">
            <DollarSign className="w-3.5 h-3.5 text-teal-400 shrink-0" />
            <span className="truncate">Billable</span>
          </div>
          <div className="text-lg sm:text-xl font-bold text-teal-400 mt-1 sm:mt-1.5 font-mono">{billableHours.toFixed(2)}</div>
          <div className="text-[10px] sm:text-[11px] text-[#71717a] mt-0.5">Chargeable</div>
        </div>
      </div>

      {/* Team Header Config & Search - Bento Box */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#3b82f620] border border-[#3b82f640] flex items-center justify-center text-[#60a5fa] font-bold">
              {currentTeam.name[0]}
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">{currentTeam.name}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-[#71717a]" />
                <input
                  type="text"
                  value={currentTeam.dateRange}
                  onChange={(e) => onUpdateTeamDateRange(currentTeam.id, e.target.value)}
                  className="text-xs text-[#d4d4d8] bg-[#09090b] px-2.5 py-0.5 rounded-lg border border-[#27272a] focus:outline-none focus:border-[#3b82f6] w-52 font-mono"
                  placeholder="e.g. 10th Aug – 15th Aug 2026"
                />
              </div>
            </div>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-[#71717a] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search employee or role..."
              className="pl-9 pr-3 py-1.5 bg-[#09090b] border border-[#27272a] rounded-xl text-xs text-[#fafafa] placeholder-[#71717a] focus:outline-none focus:border-[#3b82f6] w-full sm:w-64 font-sans"
            />
          </div>
        </div>

        {/* Detailed Timesheet Grid */}
        <div className="overflow-x-auto rounded-xl border border-[#27272a]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#09090b] text-[#71717a] border-b border-[#27272a]">
                <th className="py-3 px-4 font-bold uppercase tracking-wider text-[10px]">Employee</th>
                <th className="py-3 px-4 font-bold uppercase tracking-wider text-[10px]">Role / Title</th>
                <th className="py-3 px-3 font-bold uppercase tracking-wider text-[10px] text-right">Total Hrs</th>
                <th className="py-3 px-3 font-bold uppercase tracking-wider text-[10px] text-right">Productive</th>
                <th className="py-3 px-3 font-bold uppercase tracking-wider text-[10px] text-right">Non-Prod</th>
                <th className="py-3 px-3 font-bold uppercase tracking-wider text-[10px] text-center">Tasks</th>
                <th className="py-3 px-3 font-bold uppercase tracking-wider text-[10px] text-center">Carry</th>
                <th className="py-3 px-3 font-bold uppercase tracking-wider text-[10px] text-right">Billable</th>
                <th className="py-3 px-3 font-bold uppercase tracking-wider text-[10px] text-right">Non-Bill</th>
                <th className="py-3 px-3 font-bold uppercase tracking-wider text-[10px] text-center">Holidays</th>
                <th className="py-3 px-3 font-bold uppercase tracking-wider text-[10px] text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272a] bg-[#18181b]">
              {filteredMembers.map((member) => {
                const isOvertime = member.totalHours > 50;
                return (
                  <tr
                    key={member.id}
                    className={`hover:bg-[#27272a]/50 transition-colors ${
                      isOvertime ? 'bg-amber-950/10' : ''
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="font-medium text-white flex items-center gap-2">
                        {member.name}
                        {isOvertime && (
                          <span
                            title="Over 50 total hours logged"
                            className="px-1.5 py-0.2 rounded bg-amber-950/60 text-amber-300 text-[10px] font-mono border border-amber-800/40"
                          >
                            OT
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#71717a]">
                        Slide display: <strong className="text-[#60a5fa]">{member.displayName}</strong>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-[#a1a1aa]">
                      <input
                        type="text"
                        value={member.role || ''}
                        onChange={(e) =>
                          onUpdateMember(currentTeam.id, member.id, { role: e.target.value })
                        }
                        className="bg-transparent border-b border-transparent hover:border-[#3f3f46] focus:border-[#3b82f6] focus:bg-[#09090b] px-1 py-0.5 rounded text-xs text-[#d4d4d8] w-36"
                      />
                    </td>

                    <td className="py-3 px-3 text-right">
                      <input
                        type="number"
                        step="0.01"
                        value={member.totalHours}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          const nonProd = Math.max(0, +(val - member.productiveHours).toFixed(2));
                          const nonBill = Math.max(0, +(val - member.billableHours).toFixed(2));
                          onUpdateMember(currentTeam.id, member.id, {
                            totalHours: val,
                            nonProductiveHours: nonProd,
                            nonBillableHours: nonBill
                          });
                        }}
                        className="w-18 text-right bg-[#09090b] border border-[#27272a] rounded-lg px-1.5 py-1 text-white font-mono focus:border-[#3b82f6]"
                      />
                    </td>

                    <td className="py-3 px-3 text-right">
                      <input
                        type="number"
                        step="0.01"
                        value={member.productiveHours}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          const nonProd = Math.max(0, +(member.totalHours - val).toFixed(2));
                          onUpdateMember(currentTeam.id, member.id, {
                            productiveHours: val,
                            nonProductiveHours: nonProd
                          });
                        }}
                        className="w-18 text-right bg-[#09090b] border border-[#27272a] rounded-lg px-1.5 py-1 text-emerald-400 font-mono focus:border-[#3b82f6]"
                      />
                    </td>

                    <td className="py-3 px-3 text-right font-mono text-[#71717a]">
                      {member.nonProductiveHours.toFixed(2)}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <input
                        type="number"
                        value={member.tasksCompleted}
                        onChange={(e) =>
                          onUpdateMember(currentTeam.id, member.id, {
                            tasksCompleted: parseInt(e.target.value) || 0
                          })
                        }
                        className="w-14 text-center bg-[#09090b] border border-[#27272a] rounded-lg px-1 py-1 text-white font-mono focus:border-[#3b82f6]"
                      />
                    </td>

                    <td className="py-3 px-3 text-center">
                      <input
                        type="number"
                        value={member.carryForward}
                        onChange={(e) =>
                          onUpdateMember(currentTeam.id, member.id, {
                            carryForward: parseInt(e.target.value) || 0
                          })
                        }
                        className={`w-14 text-center bg-[#09090b] border border-[#27272a] rounded-lg px-1 py-1 font-mono focus:border-[#3b82f6] ${
                          member.carryForward > 0 ? 'text-amber-400 font-bold' : 'text-[#71717a]'
                        }`}
                      />
                    </td>

                    <td className="py-3 px-3 text-right">
                      <input
                        type="number"
                        step="0.01"
                        value={member.billableHours}
                        onChange={(e) => {
                          const billable = parseFloat(e.target.value) || 0;
                          const nonBill = Math.max(0, +(member.totalHours - billable).toFixed(2));
                          onUpdateMember(currentTeam.id, member.id, {
                            billableHours: billable,
                            nonBillableHours: nonBill
                          });
                        }}
                        className="w-18 text-right bg-[#09090b] border border-[#27272a] rounded-lg px-1.5 py-1 text-teal-400 font-mono focus:border-[#3b82f6]"
                      />
                    </td>

                    <td className="py-3 px-3 text-right font-mono text-[#71717a]">
                      {member.nonBillableHours.toFixed(2)}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <input
                        type="number"
                        value={member.holidaysAvailed}
                        onChange={(e) =>
                          onUpdateMember(currentTeam.id, member.id, {
                            holidaysAvailed: parseInt(e.target.value) || 0
                          })
                        }
                        className="w-14 text-center bg-[#09090b] border border-[#27272a] rounded-lg px-1 py-1 text-[#d4d4d8] font-mono focus:border-[#3b82f6]"
                      />
                    </td>

                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => onDeleteMember(currentTeam.id, member.id)}
                        className="p-1 text-[#71717a] hover:text-red-400 transition-colors cursor-pointer"
                        title="Delete member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Employee */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-50 bg-[#09090b]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#18181b] border border-[#27272a] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-[#60a5fa]" />
              Add Employee to {currentTeam.name}
            </h3>

            <form onSubmit={handleCreateMember} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#71717a] mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newMemberName}
                    onChange={(e) => {
                      setNewMemberName(e.target.value);
                      if (!newMemberDisplayName) {
                        setNewMemberDisplayName(e.target.value.split(' ')[0]);
                      }
                    }}
                    placeholder="e.g. Ramesh Babu"
                    className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2 text-xs text-white focus:border-[#3b82f6]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#71717a] mb-1">Slide Display Name</label>
                  <input
                    type="text"
                    value={newMemberDisplayName}
                    onChange={(e) => setNewMemberDisplayName(e.target.value)}
                    placeholder="e.g. Ramesh"
                    className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2 text-xs text-white focus:border-[#3b82f6]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-[#71717a] mb-1">Role / Specialization</label>
                <input
                  type="text"
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value)}
                  placeholder="e.g. Python Developer"
                  className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2 text-xs text-white focus:border-[#3b82f6]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#71717a] mb-1">Total Hours</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newMemberTotalHours}
                    onChange={(e) => setNewMemberTotalHours(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2 text-xs text-white focus:border-[#3b82f6] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#71717a] mb-1">Productive Hrs</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newMemberProductiveHours}
                    onChange={(e) => setNewMemberProductiveHours(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2 text-xs text-white focus:border-[#3b82f6] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#71717a] mb-1">Billable Hrs</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newMemberBillable}
                    onChange={(e) => setNewMemberBillable(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2 text-xs text-white focus:border-[#3b82f6] font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#71717a] mb-1">Tasks Done</label>
                  <input
                    type="number"
                    value={newMemberTasks}
                    onChange={(e) => setNewMemberTasks(parseInt(e.target.value) || 0)}
                    className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2 text-xs text-white focus:border-[#3b82f6] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#71717a] mb-1">Carry Forward</label>
                  <input
                    type="number"
                    value={newMemberCarry}
                    onChange={(e) => setNewMemberCarry(parseInt(e.target.value) || 0)}
                    className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2 text-xs text-white focus:border-[#3b82f6] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#71717a] mb-1">Holidays Availed</label>
                  <input
                    type="number"
                    value={newMemberHolidays}
                    onChange={(e) => setNewMemberHolidays(parseInt(e.target.value) || 0)}
                    className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2 text-xs text-white focus:border-[#3b82f6] font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#27272a]">
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#27272a] text-[#d4d4d8] text-xs font-semibold hover:bg-[#323235] border border-[#3f3f46]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-white text-black text-xs font-bold hover:bg-slate-100 shadow-md"
                >
                  Add to Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Team */}
      {showAddTeamModal && (
        <div className="fixed inset-0 z-50 bg-[#09090b]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#18181b] border border-[#27272a] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#60a5fa]" />
              Create New Engineering Team
            </h3>

            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-[#71717a] mb-1">Team Name *</label>
                <input
                  type="text"
                  required
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="e.g. DevOps & Platform Team"
                  className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2 text-xs text-white focus:border-[#3b82f6]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-[#71717a] mb-1">Reporting Date Range</label>
                <input
                  type="text"
                  value={newTeamDateRange}
                  onChange={(e) => setNewTeamDateRange(e.target.value)}
                  placeholder="e.g. 10th Aug – 15th Aug 2026"
                  className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-3 py-2 text-xs text-white focus:border-[#3b82f6]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#27272a]">
                <button
                  type="button"
                  onClick={() => setShowAddTeamModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#27272a] text-[#d4d4d8] text-xs font-semibold hover:bg-[#323235] border border-[#3f3f46]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-white text-black text-xs font-bold hover:bg-slate-100 shadow-md"
                >
                  Create Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
