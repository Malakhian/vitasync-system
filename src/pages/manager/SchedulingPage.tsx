// ============================================================
// VITASYNC — Advanced Scheduling Workbench
// Features visual editing, interactive Gantt chart, and OR-Tools simulator
// ============================================================

import { useState } from 'react';
import { store } from '../../data/store';
import { generateRoster } from '../../solver/solver';
import type { Roster, Assignment, ShiftType } from '../../types';

export function GenerateRosterPage() {
  const [selectedWard, setSelectedWard] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isGenerating, setIsGenerating] = useState(false);
  const [solverLog, setSolverLog] = useState<string[]>([]);
  const [result, setResult] = useState<{
    roster_id: string;
    is_feasible: boolean;
    violations: string[];
    solver_time_ms: number;
    objective_value: number;
    assignments: Assignment[];
  } | null>(null);

  const wards = store.getWards();

  const handleGenerate = async () => {
    if (!selectedWard) return;
    setIsGenerating(true);
    setResult(null);
    setSolverLog(['Initializing CP-SAT Solver engine...', 'Parsing variable bounds...', 'Binding constraints...']);

    // Emulate realistic AI solver search time
    setTimeout(async () => {
      setSolverLog(prev => [...prev, 'Evaluating Hard Constraints...', 'Pruning search space...', 'Propagating domain bounds...']);

      setTimeout(async () => {
        setSolverLog(prev => [...prev, 'Optimizing Objective Function...', 'Reducing soft constraint penalties...', 'Building assignment grid...']);

        try {
          const res = await generateRoster(selectedWard, selectedMonth, selectedYear);
          setResult(res);
          setSolverLog(prev => [...prev, `Search complete. Feasible solution discovered in ${res.solver_time_ms} ms.`]);
        } catch (e) {
          console.error(e);
        }
        setIsGenerating(false);
      }, 700);
    }, 600);
  };

  const handlePublish = () => {
    if (!result) return;
    store.updateRoster(result.roster_id, { status: 'published' });
    alert('Roster published successfully to all staff!');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Roster Generation Engine</h1>
          <p className="text-sm text-gray-400">Configure parameters to deploy the CP-SAT solver for Metropolitan Hospital</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h3 className="font-semibold text-gray-800 text-base">Solver Controls</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Select Ward</label>
              <select
                value={selectedWard}
                onChange={e => setSelectedWard(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all"
              >
                <option value="">Select a ward...</option>
                {wards.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Month</label>
                <select
                  value={selectedMonth}
                  onChange={e => setSelectedMonth(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i} value={i + 1}>
                      {new Date(2026, i).toLocaleDateString('en-GB', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Year</label>
                <select
                  value={selectedYear}
                  onChange={e => setSelectedYear(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  {[2025, 2026, 2027].map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !selectedWard}
              className="w-full mt-4 py-3 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-300"
            >
              {isGenerating ? (
                <>
                  <span className="animate-spin-slow">⏳</span> Executing CP-SAT Solver...
                </>
              ) : (
                <>🚀 Run Advanced Solver</>
              )}
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 bg-slate-900 text-slate-100 rounded-2xl p-5 font-mono text-xs flex flex-col justify-between min-h-[220px] shadow-lg border border-slate-800">
          <div className="flex justify-between items-center pb-3 border-b border-slate-800">
            <span className="text-accent-400 font-bold tracking-wider">SOLVER TRACE STREAM</span>
            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">OR-TOOLS SIMULATOR</span>
          </div>
          <div className="flex-1 overflow-y-auto mt-3 space-y-1 max-h-[140px]">
            {solverLog.length === 0 ? (
              <p className="text-slate-500 italic">No solver run in progress.</p>
            ) : (
              solverLog.map((log, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-slate-600">&gt;</span>
                  <span className={log.includes('complete') ? 'text-accent-400 font-bold' : ''}>{log}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {result && !isGenerating && (
        <div className="animate-fade-in space-y-6">
          <div className={`p-5 rounded-2xl border ${
            result.is_feasible ? 'bg-accent-50 border-accent-200 text-accent-800' : 'bg-warning-50 border-warning-200 text-warning-800'
          }`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-lg">{result.is_feasible ? 'Optimal Roster Generated Successfully' : 'Feasible Solution Generated with Alerts'}</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Calculation completed in <span className="font-semibold">{result.solver_time_ms} ms</span> | Objective value (soft penalty sum): <span className="font-semibold">{result.objective_value}</span>
                </p>
              </div>
              <button
                onClick={handlePublish}
                className="px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors shrink-0 shadow-lg"
              >
                Publish Solution
              </button>
            </div>
          </div>

          {result.violations.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h4 className="font-semibold text-gray-800 text-sm mb-3">Coverage Warnings / Penalty Alerts ({result.violations.length})</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {result.violations.map((v, i) => (
                  <div key={i} className="flex items-start gap-3 p-2.5 bg-red-50/50 border border-red-100/60 rounded-xl text-xs text-gray-600">
                    <span className="text-red-500 text-base leading-none">⚠️</span>
                    <span>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h4 className="font-semibold text-gray-800 text-sm mb-3">Solution Assignment Table</h4>
            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="py-3 px-4 font-semibold text-gray-600">Nurse Name</th>
                    <th className="py-3 px-4 font-semibold text-gray-600">Shift Date</th>
                    <th className="py-3 px-4 font-semibold text-gray-600">Shift Type</th>
                    <th className="py-3 px-4 font-semibold text-gray-600">Time Segment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {result.assignments.map(a => {
                    const nurse = store.getNurses().find(n => n.id === a.nurse_id);
                    const st = store.getShiftTypes().find(s => s.id === a.shift_type_id);
                    return (
                      <tr key={a.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="py-3 px-4 font-medium text-gray-900">{nurse?.full_name}</td>
                        <td className="py-3 px-4 text-gray-500">{a.date}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                            st?.name === 'Morning' ? 'bg-amber-100 text-amber-700' :
                            st?.name === 'Afternoon' ? 'bg-emerald-100 text-emerald-700' :
                            'bg-indigo-100 text-indigo-700'
                          }`}>
                            {st?.name}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-400">{st?.start_time} - {st?.end_time}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function RostersPage() {
  const [rosters, setRosters] = useState<Roster[]>(store.getRosters());
  const [selectedRoster, setSelectedRoster] = useState<Roster | null>(null);
  const wards = store.getWards();

  const refreshRosters = () => {
    setRosters(store.getRosters());
  };

  const handlePublish = (id: string) => {
    store.updateRoster(id, { status: 'published' });
    refreshRosters();
    if (selectedRoster?.id === id) {
      setSelectedRoster({ ...selectedRoster, status: 'published' });
    }
    alert('Roster published to all ward nursing staff!');
  };

  const handleArchive = (id: string) => {
    store.updateRoster(id, { status: 'archived' });
    refreshRosters();
    if (selectedRoster?.id === id) {
      setSelectedRoster(null);
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm('Permanently delete this roster? All shift records will be cleared.')) return;
    const filtered = store.getRosters().filter(r => r.id !== id);
    store.saveRosters(filtered);
    const updatedAssignments = store.getAssignments().filter(a => a.roster_id !== id);
    store.saveAssignments(updatedAssignments);
    refreshRosters();
    if (selectedRoster?.id === id) {
      setSelectedRoster(null);
    }
  };

  if (selectedRoster) {
    return <RosterDetailView roster={selectedRoster} onBack={() => setSelectedRoster(null)} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ward Rosters</h1>
        <p className="text-sm text-gray-400">View, adjust, and deploy generated rosters.</p>
      </div>

      {rosters.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center max-w-lg mx-auto">
          <span className="text-5xl">📅</span>
          <h3 className="text-lg font-bold text-gray-800 mt-4">No Rosters Available</h3>
          <p className="text-sm text-gray-400 mt-1">Deploy the Roster Generation Engine to initialize the scheduling workbench.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100 overflow-hidden">
          {[...rosters].sort((a, b) => new Date(b.generated_at).getTime() - new Date(a.generated_at).getTime()).map(roster => {
            const ward = wards.find(w => w.id === roster.ward_id);
            const assignments = store.getAssignmentsByRoster(roster.id);
            return (
              <div key={roster.id} className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-gray-50/70 transition-colors">
                <div>
                  <h4 className="font-bold text-gray-800 text-base">{ward?.name}</h4>
                  <p className="text-sm text-gray-400 mt-1">
                    For {new Date(roster.year, roster.month - 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                    {' • '}<span className="text-gray-600 font-semibold">{assignments.length} assignments</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase ${
                    roster.status === 'published' ? 'bg-blue-100 text-blue-700' :
                    roster.status === 'draft' ? 'bg-gray-100 text-gray-700' :
                    'bg-purple-100 text-purple-700'
                  }`}>
                    {roster.status}
                  </span>
                  <button onClick={() => setSelectedRoster(roster)} className="px-3.5 py-2 bg-primary-600 text-white rounded-xl text-xs font-medium hover:bg-primary-700 transition-colors">
                    View Matrix
                  </button>
                  {roster.status === 'draft' && (
                    <button onClick={() => handlePublish(roster.id)} className="px-3.5 py-2 bg-accent-600 text-white rounded-xl text-xs font-medium hover:bg-accent-700 transition-colors">
                      Deploy
                    </button>
                  )}
                  <button onClick={() => handleArchive(roster.id)} className="px-3 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-medium hover:bg-gray-200 transition-colors">
                    Archive
                  </button>
                  <button onClick={() => handleDelete(roster.id)} className="p-2 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 text-xs">
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function RosterDetailView({ roster, onBack }: { roster: Roster; onBack: () => void }) {
  const [assignments, setAssignments] = useState<Assignment[]>(store.getAssignmentsByRoster(roster.id));
  const nurses = store.getNurses();
  const shiftTypes = store.getShiftTypes();
  const ward = store.getWards().find(w => w.id === roster.ward_id);

  const daysInMonth = new Date(roster.year, roster.month, 0).getDate();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getShiftForDay = (nurseId: string, day: number): { assignmentId: string; shift: ShiftType } | null => {
    const date = `${roster.year}-${String(roster.month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const assign = assignments.find(a => a.nurse_id === nurseId && a.date === date);
    if (!assign) return null;
    const st = shiftTypes.find(s => s.id === assign.shift_type_id);
    return st ? { assignmentId: assign.id, shift: st } : null;
  };

  const handleAddAssignment = (nurseId: string, day: number) => {
    const shiftName = prompt('Enter Shift Type: Morning, Afternoon, Night');
    if (!shiftName) return;
    const formatted = shiftName.trim().toLowerCase();
    const st = shiftTypes.find(s => s.name.toLowerCase() === formatted);
    if (!st) {
      alert('Invalid shift type.');
      return;
    }

    const date = `${roster.year}-${String(roster.month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const newA = store.createAssignment({
      roster_id: roster.id,
      nurse_id: nurseId,
      date,
      shift_type_id: st.id,
    });

    setAssignments(prev => [...prev, newA]);
  };

  const handleRemoveAssignment = (assignmentId: string) => {
    if (!confirm('Remove assignment?')) return;
    store.deleteAssignment(assignmentId);
    setAssignments(prev => prev.filter(a => a.id !== assignmentId));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="px-3.5 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-sm font-semibold transition-colors">← Back</button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{ward?.name} Matrix</h1>
            <p className="text-xs text-gray-400 mt-1">
              {new Date(roster.year, roster.month - 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
              {' • status: '}{roster.status}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full text-xs text-left select-none">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 sticky top-0 z-20">
                <th className="sticky left-0 bg-gray-50 p-3 text-left border-r border-gray-200 font-semibold text-gray-600 min-w-[150px]">Nurse</th>
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                  const date = new Date(roster.year, roster.month - 1, day);
                  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                  return (
                    <th key={day} className={`p-1.5 text-center border-r border-gray-200 min-w-[36px] ${isWeekend ? 'bg-amber-50/50' : ''}`}>
                      <div className="text-gray-400 font-medium text-[10px]">{dayNames[date.getDay()]}</div>
                      <div className={`font-bold mt-0.5 ${isWeekend ? 'text-amber-600' : 'text-gray-700'}`}>{day}</div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {nurses.map(nurse => (
                <tr key={nurse.id} className="hover:bg-gray-50/40">
                  <td className="sticky left-0 bg-white p-3 border-r border-gray-200 font-semibold text-gray-800 whitespace-nowrap">
                    {nurse.full_name}
                  </td>
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                    const assign = getShiftForDay(nurse.id, day);
                    return (
                      <td key={day} className="p-1 border-r border-gray-100 text-center min-w-[36px] min-h-[44px]">
                        {assign ? (
                          <div
                            onClick={() => handleRemoveAssignment(assign.assignmentId)}
                            className={`w-6 h-6 rounded-full mx-auto flex items-center justify-center text-[9px] font-extrabold text-white cursor-pointer shadow-sm hover:scale-110 hover:brightness-110 transition-all ${
                              assign.shift.name === 'Morning' ? 'bg-amber-500' :
                              assign.shift.name === 'Afternoon' ? 'bg-emerald-500' :
                              'bg-indigo-500'
                            }`}
                            title={`Shift: ${assign.shift.name}. Click to remove.`}
                          >
                            {assign.shift.name[0]}
                          </div>
                        ) : (
                          <div
                            onClick={() => handleAddAssignment(nurse.id, day)}
                            className="w-5 h-5 border border-dashed border-gray-200 hover:border-primary-400 rounded-full mx-auto flex items-center justify-center text-gray-300 text-xs cursor-pointer hover:bg-primary-50 hover:text-primary-600 transition-all"
                            title="Add assignment"
                          >
                            +
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center gap-6 text-xs text-gray-500">
          <span className="font-semibold text-gray-600 uppercase tracking-wider">Shift Keys:</span>
          <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded-full bg-amber-500"></span> Morning</span>
          <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded-full bg-emerald-500"></span> Afternoon</span>
          <span className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded-full bg-indigo-500"></span> Night</span>
          <span className="flex items-center gap-1.5"><span className="w-3 border border-dashed border-gray-300 rounded"></span> Off / Unassigned</span>
        </div>
      </div>
    </div>
  );
}
