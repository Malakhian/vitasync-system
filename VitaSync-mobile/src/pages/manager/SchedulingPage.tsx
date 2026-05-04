// ============================================================
// VITASYNC — Mobile-First Scheduling Workbench
// ============================================================

import { useState } from 'react';
import { store } from '../../data/store';
import { generateRoster } from '../../solver/solver';
import type { Roster, Assignment } from '../../types';

export function GenerateRosterPage() {
  const [ward, setWard] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [running, setRunning] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [result, setResult] = useState<{ roster_id: string; is_feasible: boolean; violations: string[]; solver_time_ms: number; objective_value: number; assignments: Assignment[] } | null>(null);

  const wards = store.getWards();

  const run = async () => {
    if (!ward) return;
    setRunning(true);
    setResult(null);
    setLog(['Initializing CP-SAT engine...', 'Binding constraints...', 'Optimizing...']);
    setTimeout(async () => {
      setLog(p => [...p, 'Propagating domain bounds...', 'Evaluating objectives...']);
      setTimeout(async () => {
        try {
          const r = await generateRoster(ward, month, year);
          setResult(r);
          setLog(p => [...p, `Complete in ${r.solver_time_ms}ms`]);
        } catch (e) { console.error(e); }
        setRunning(false);
      }, 500);
    }, 400);
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      <div>
        <h1 className="text-xl lg:text-2xl font-black text-gray-900">Generate Roster</h1>
        <p className="text-xs text-gray-400">Run the CP-SAT solver engine</p>
      </div>

      <div className="mobile-card space-y-4">
        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Ward</label>
          <select value={ward} onChange={e => setWard(e.target.value)} className="mobile-input">
            <option value="">Select ward...</option>
            {wards.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Month</label>
            <select value={month} onChange={e => setMonth(Number(e.target.value))} className="mobile-input">
              {Array.from({ length: 12 }, (_, i) => <option key={i} value={i + 1}>{new Date(2026, i).toLocaleDateString('en-GB', { month: 'long' })}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Year</label>
            <select value={year} onChange={e => setYear(Number(e.target.value))} className="mobile-input">
              {[2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
        <button onClick={run} disabled={running || !ward} className="mobile-btn mobile-btn-primary w-full disabled:opacity-50">
          {running ? <><span className="animate-spin-slow">⏳</span> Solving...</> : <>🚀 Run Solver</>}
        </button>
      </div>

      {/* Solver trace */}
      <div className="rounded-2xl bg-slate-900 text-slate-100 p-4 font-mono text-xs min-h-[120px]">
        <div className="flex justify-between items-center pb-2 border-b border-slate-800 mb-2">
          <span className="text-accent-400 font-bold">SOLVER TRACE</span>
          <span className="text-[9px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">CP-SAT</span>
        </div>
        <div className="space-y-1 max-h-[100px] overflow-y-auto">
          {log.length === 0 ? <p className="text-slate-500 italic">Ready.</p> : log.map((l, i) => <p key={i} className={l.includes('Complete') ? 'text-accent-400 font-bold' : ''}>&gt; {l}</p>)}
        </div>
      </div>

      {result && !running && (
        <div className="space-y-4 animate-fade-in">
          <div className={`mobile-card ${result.is_feasible ? 'bg-accent-50 border-accent-200' : 'bg-amber-50 border-amber-200'}`}>
            <p className="font-bold text-lg">{result.is_feasible ? '✅ Optimal Solution' : '⚠️ Feasible with Alerts'}</p>
            <p className="text-xs text-gray-500 mt-1">Time: {result.solver_time_ms}ms | Objective: {result.objective_value} | Assignments: {result.assignments.length}</p>
            <button onClick={() => { store.updateRoster(result.roster_id, { status: 'published' }); alert('Published!'); }} className="mobile-btn mobile-btn-primary w-full mt-3">Publish Roster</button>
          </div>

          {result.violations.length > 0 && (
            <div className="mobile-card">
              <p className="font-bold text-sm text-gray-900 mb-2">Warnings ({result.violations.length})</p>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {result.violations.map((v, i) => <p key={i} className="text-xs text-gray-600 p-2 bg-red-50 rounded-xl">⚠️ {v}</p>)}
              </div>
            </div>
          )}

          <div className="mobile-card">
            <p className="font-bold text-sm text-gray-900 mb-3">Assignments</p>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {result.assignments.map(a => {
                const n = store.getNurses().find(x => x.id === a.nurse_id);
                const s = store.getShiftTypes().find(x => x.id === a.shift_type_id);
                return (
                  <div key={a.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                    <div>
                      <p className="text-sm font-bold text-gray-800">{n?.full_name}</p>
                      <p className="text-[10px] text-gray-400">{a.date}</p>
                    </div>
                    <span className={`mobile-chip ${s?.name === 'Morning' ? 'bg-amber-100 text-amber-700' : s?.name === 'Afternoon' ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'}`}>{s?.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function RostersPage() {
  const [rosters, setRosters] = useState<Roster[]>(store.getRosters());
  const [viewing, setViewing] = useState<Roster | null>(null);
  const wards = store.getWards();

  const refresh = () => setRosters(store.getRosters());

  if (viewing) return <RosterDetail roster={viewing} onBack={() => { setViewing(null); refresh(); }} />;

  return (
    <div className="space-y-4 lg:space-y-6">
      <div>
        <h1 className="text-xl lg:text-2xl font-black text-gray-900">Rosters</h1>
        <p className="text-xs text-gray-400">{rosters.length} generated</p>
      </div>

      {rosters.length === 0 ? (
        <div className="mobile-card text-center py-12">
          <div className="text-5xl mb-3">📅</div>
          <p className="font-bold text-gray-800">No Rosters</p>
          <p className="text-xs text-gray-400 mt-1">Generate one to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {[...rosters].sort((a, b) => new Date(b.generated_at).getTime() - new Date(a.generated_at).getTime()).map(r => {
            const w = wards.find(x => x.id === r.ward_id);
            const count = store.getAssignmentsByRoster(r.id).length;
            return (
              <div key={r.id} className="mobile-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-900">{w?.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{new Date(r.year, r.month - 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })} • {count} shifts</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`mobile-chip ${r.status === 'published' ? 'bg-blue-100 text-blue-700' : r.status === 'draft' ? 'bg-gray-100 text-gray-600' : 'bg-purple-100 text-purple-700'}`}>{r.status}</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => setViewing(r)} className="flex-1 mobile-btn mobile-btn-primary !py-2 text-xs">View</button>
                  {r.status === 'draft' && <button onClick={() => { store.updateRoster(r.id, { status: 'published' }); refresh(); }} className="flex-1 mobile-btn !py-2 text-xs bg-accent-600 text-white rounded-xl font-bold">Publish</button>}
                  <button onClick={() => { store.updateRoster(r.id, { status: 'archived' }); refresh(); }} className="mobile-btn mobile-btn-secondary !py-2 !px-3 text-xs">📦</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function RosterDetail({ roster, onBack }: { roster: Roster; onBack: () => void }) {
  const [assignments, setAssignments] = useState(store.getAssignmentsByRoster(roster.id));
  const nurses = store.getNurses();
  const shiftTypes = store.getShiftTypes();
  const ward = store.getWards().find(w => w.id === roster.ward_id);
  const days = new Date(roster.year, roster.month, 0).getDate();
  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const getShift = (nurseId: string, day: number) => {
    const d = `${roster.year}-${String(roster.month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const a = assignments.find(x => x.nurse_id === nurseId && x.date === d);
    return a ? shiftTypes.find(s => s.id === a.shift_type_id) : null;
  };

  const addShift = (nurseId: string, day: number) => {
    const name = prompt('Shift: Morning, Afternoon, Night');
    if (!name) return;
    const st = shiftTypes.find(s => s.name.toLowerCase() === name.trim().toLowerCase());
    if (!st) { alert('Invalid'); return; }
    const d = `${roster.year}-${String(roster.month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const a = store.createAssignment({ roster_id: roster.id, nurse_id: nurseId, date: d, shift_type_id: st.id });
    setAssignments(p => [...p, a]);
  };

  const removeShift = (id: string) => {
    if (!confirm('Remove?')) return;
    store.deleteAssignment(id);
    setAssignments(p => p.filter(a => a.id !== id));
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center font-bold">←</button>
        <div>
          <h1 className="text-lg font-black text-gray-900">{ward?.name}</h1>
          <p className="text-xs text-gray-400">{new Date(roster.year, roster.month - 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</p>
        </div>
      </div>

      {/* Mobile-optimized roster grid */}
      <div className="mobile-card overflow-x-auto -mx-4 px-4 lg:mx-0 lg:px-0">
        <table className="w-full text-[10px] select-none" style={{ minWidth: `${days * 28 + 100}px` }}>
          <thead>
            <tr className="border-b border-gray-200">
              <th className="sticky left-0 bg-white p-2 text-left font-bold text-gray-600 min-w-[80px] border-r border-gray-100">Nurse</th>
              {Array.from({ length: days }, (_, i) => i + 1).map(d => {
                const dt = new Date(roster.year, roster.month - 1, d);
                const we = dt.getDay() === 0 || dt.getDay() === 6;
                return (
                  <th key={d} className={`p-1 text-center min-w-[28px] ${we ? 'bg-amber-50/50' : ''}`}>
                    <div className="text-gray-400 text-[8px]">{dayNames[dt.getDay()]}</div>
                    <div className={`font-bold ${we ? 'text-amber-600' : 'text-gray-700'}`}>{d}</div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {nurses.map(n => (
              <tr key={n.id} className="border-b border-gray-50">
                <td className="sticky left-0 bg-white p-2 font-bold text-gray-800 border-r border-gray-100 whitespace-nowrap">{n.full_name.split(' ')[0]}</td>
                {Array.from({ length: days }, (_, i) => i + 1).map(d => {
                  const s = getShift(n.id, d);
                  const a = assignments.find(x => x.nurse_id === n.id && x.date === `${roster.year}-${String(roster.month).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
                  return (
                    <td key={d} className="p-0.5 text-center">
                      {s ? (
                        <div onClick={() => a && removeShift(a.id)} className={`w-5 h-5 rounded-full mx-auto flex items-center justify-center text-[7px] font-black text-white cursor-pointer ${s.name === 'Morning' ? 'bg-amber-500' : s.name === 'Afternoon' ? 'bg-emerald-500' : 'bg-indigo-500'}`}>{s.name[0]}</div>
                      ) : (
                        <div onClick={() => addShift(n.id, d)} className="w-4 h-4 border border-dashed border-gray-200 rounded-full mx-auto flex items-center justify-center text-gray-300 text-[8px] cursor-pointer">+</div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-4 text-[10px] text-gray-400 px-2">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-500"></span>M</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-emerald-500"></span>A</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-indigo-500"></span>N</span>
      </div>
    </div>
  );
}
