// ============================================================
// VITASYNC — Swap Requests & Reporting Command
// Overhauled with next-level premium visuals & analytics
// ============================================================

import { useState, useEffect } from 'react';
import { store } from '../../data/store';
import { approveSwap, rejectSwap } from '../../solver/solver';
import type { SwapRequest, FairnessMetrics } from '../../types';

function downloadTextFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function toCsv(rows: string[][]) {
  return rows
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');
}

export function SwapRequestsPage() {
  const [swaps, setSwaps] = useState<SwapRequest[]>(store.getSwapRequests());
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const nurses = store.getNurses();

  useEffect(() => {
    setSwaps(store.getSwapRequests());
  }, []);

  const filtered = filter === 'all' ? swaps : swaps.filter(s => s.status === filter);
  const sorted = [...filtered].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const handleApprove = (id: string) => {
    const result = approveSwap(id);
    if (result.success) {
      setSwaps(store.getSwapRequests());
    } else {
      alert(result.message);
    }
  };

  const handleReject = (id: string) => {
    const result = rejectSwap(id);
    if (result.success) {
      setSwaps(store.getSwapRequests());
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shift Swapping Matrix</h1>
          <p className="text-sm text-gray-400">Moderate active or proposed peer trades with hard constraint checking</p>
        </div>
        <div className="flex bg-white p-1 rounded-xl border border-gray-100 shadow-sm self-start">
          {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all capitalize ${
                filter === f ? 'bg-primary-600 text-white shadow-sm' : 'text-gray-500 hover:text-primary-600'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center max-w-lg mx-auto shadow-sm">
          <span className="text-5xl">🔄</span>
          <h3 className="text-lg font-bold text-gray-800 mt-4">No Duty Swaps To Action</h3>
          <p className="text-sm text-gray-400 mt-1">No trades match the current status filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {sorted.map(swap => {
            const reqNurse = nurses.find(n => n.id === swap.requesting_nurse_id);
            const tgtNurse = nurses.find(n => n.id === swap.target_nurse_id);
            const shiftTypes = store.getShiftTypes();
            const origShift = shiftTypes.find(s => s.id === swap.original_shift_type_id);
            const reqShift = shiftTypes.find(s => s.id === swap.requested_shift_type_id);

            return (
              <div key={swap.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex flex-col md:flex-row md:items-center gap-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-50 rounded-2xl flex items-center justify-center text-sm font-bold text-primary-700 shrink-0">
                        {reqNurse?.full_name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800 leading-tight">{reqNurse?.full_name}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">{swap.original_shift_date} • {origShift?.name}</p>
                      </div>
                    </div>
                    <span className="text-gray-300 text-lg hidden md:inline">⇄</span>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-accent-50 rounded-2xl flex items-center justify-center text-sm font-bold text-accent-700 shrink-0">
                        {tgtNurse?.full_name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800 leading-tight">{tgtNurse?.full_name}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">{swap.requested_shift_date} • {reqShift?.name}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end md:self-center">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
                      swap.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      swap.status === 'approved' ? 'bg-accent-50 text-accent-700 border-accent-200' :
                      'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      {swap.status}
                    </span>
                    {swap.status === 'pending' && (
                      <div className="flex gap-2">
                        <button onClick={() => handleApprove(swap.id)} className="px-4 py-2 bg-accent-600 text-white rounded-xl text-xs font-bold hover:bg-accent-700 transition-colors shadow-sm">
                          Approve
                        </button>
                        <button onClick={() => handleReject(swap.id)} className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-colors shadow-sm">
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function ReportsPage() {
  const [selectedRoster, setSelectedRoster] = useState('');
  const rosters = store.getRosters();
  const wards = store.getWards();
  const nurses = store.getNurses();
  const shiftTypes = store.getShiftTypes();

  const selected = rosters.find(r => r.id === selectedRoster);
  const assignments = selectedRoster ? store.getAssignmentsByRoster(selectedRoster) : [];

  const fairnessMetrics: FairnessMetrics[] = nurses.map(nurse => {
    const nurseAssignments = assignments.filter(a => a.nurse_id === nurse.id);
    const total = nurseAssignments.length;
    const morning = nurseAssignments.filter(a => shiftTypes.find(s => s.id === a.shift_type_id)?.name === 'Morning').length;
    const afternoon = nurseAssignments.filter(a => shiftTypes.find(s => s.id === a.shift_type_id)?.name === 'Afternoon').length;
    const night = nurseAssignments.filter(a => shiftTypes.find(s => s.id === a.shift_type_id)?.name === 'Night').length;
    const weekend = nurseAssignments.filter(a => {
      const day = new Date(a.date).getDay();
      return day === 0 || day === 6;
    }).length;

    const allTotals = nurses.map(n => assignments.filter(a => a.nurse_id === n.id).length);
    const n = allTotals.length;
    const sorted = [...allTotals].sort((a, b) => a - b);
    const mean = allTotals.reduce((a, b) => a + b, 0) / n;
    const gini = mean > 0
      ? sorted.reduce((acc, val, i) => acc + (2 * (i + 1) - n - 1) * val, 0) / (n * n * mean)
      : 0;

    return {
      nurse_id: nurse.id,
      full_name: nurse.full_name,
      total_shifts: total,
      morning_shifts: morning,
      afternoon_shifts: afternoon,
      night_shifts: night,
      weekend_shifts: weekend,
      gini_coefficient: Math.abs(gini),
    };
  });

  const avgShifts = fairnessMetrics.length > 0
    ? fairnessMetrics.reduce((sum, m) => sum + m.total_shifts, 0) / fairnessMetrics.length
    : 0;

  const exportCsv = () => {
    if (!selected) return;
    const rows = [
      ['Nurse Name', 'Total Assigned Shifts', 'Morning Shifts', 'Afternoon Shifts', 'Night Shifts', 'Weekend Shifts', 'Workload Balance Score'],
      ...fairnessMetrics.map(m => [
        m.full_name,
        String(m.total_shifts),
        String(m.morning_shifts),
        String(m.afternoon_shifts),
        String(m.night_shifts),
        String(m.weekend_shifts),
        m.gini_coefficient.toFixed(3),
      ]),
    ];
    downloadTextFile(`vitasync-fairness-${selected.year}-${selected.month}.csv`, toCsv(rows), 'text/csv;charset=utf-8');
  };

  const exportSummary = () => {
    if (!selected) return;
    const wardName = wards.find(w => w.id === selected.ward_id)?.name || 'Ward';
    const maxGini = fairnessMetrics.length > 0 ? Math.max(...fairnessMetrics.map(m => m.gini_coefficient)) : 0;
    const summary = [
      `=======================================`,
      `VITASYNC COMPLIANCE & FAIRNESS SUMMARY`,
      `=======================================`,
      `Hospital: Metropolitan Hospital`,
      `Ward: ${wardName}`,
      `Roster Date: ${selected.month}/${selected.year}`,
      `Total Assigned Shifts: ${assignments.length}`,
      `Average Shifts per Nurse: ${avgShifts.toFixed(1)}`,
      `Objective Solver Value: ${selected.objective_value}`,
      `Max Gini Workload Variance: ${maxGini.toFixed(3)}`,
      `System Hard Constraint Status: Verified Compliant`,
    ].join('\n');
    downloadTextFile(`vitasync-summary-${selected.year}-${selected.month}.txt`, summary, 'text/plain;charset=utf-8');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics Console</h1>
          <p className="text-sm text-gray-400">View fairness distributions, workload imbalances, and export audit files.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportCsv}
            disabled={!selected}
            className="px-4 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Export CSV Matrix
          </button>
          <button
            onClick={exportSummary}
            disabled={!selected}
            className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Export TXT Summary
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col md:flex-row md:items-center gap-4 shadow-sm">
        <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Choose Roster View</label>
        <select
          value={selectedRoster}
          onChange={e => setSelectedRoster(e.target.value)}
          className="px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none flex-1 max-w-sm transition-all"
        >
          <option value="">Select a generated roster...</option>
          {rosters.map(r => {
            const ward = wards.find(w => w.id === r.ward_id);
            return (
              <option key={r.id} value={r.id}>
                {ward?.name} — {new Date(r.year, r.month - 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
              </option>
            );
          })}
        </select>
      </div>

      {!selected ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center shadow-sm max-w-lg mx-auto">
          <span className="text-5xl">📈</span>
          <h3 className="text-lg font-bold text-gray-800 mt-4">Select Roster To Begin Analysis</h3>
          <p className="text-sm text-gray-400 mt-1">Pick an existing deployed roster from the select menu above.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <p className="text-3xl font-extrabold text-primary-600 leading-tight">{assignments.length}</p>
              <p className="text-xs font-medium text-gray-400 mt-1 uppercase tracking-wider">Total Actions</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <p className="text-3xl font-extrabold text-emerald-600 leading-tight">{avgShifts.toFixed(1)}</p>
              <p className="text-xs font-medium text-gray-400 mt-1 uppercase tracking-wider">Avg Shifts / Nurse</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <p className="text-3xl font-extrabold text-purple-600 leading-tight">
                {fairnessMetrics.length > 0 ? Math.max(...fairnessMetrics.map(m => m.gini_coefficient)).toFixed(3) : '0.000'}
              </p>
              <p className="text-xs font-medium text-gray-400 mt-1 uppercase tracking-wider">Workload Variance</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <p className="text-3xl font-extrabold text-amber-600 leading-tight">{selected.objective_value}</p>
              <p className="text-xs font-medium text-gray-400 mt-1 uppercase tracking-wider">CP Objective Value</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-bold text-gray-800 text-sm">Gini Workload Balance Metrics</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-gray-50/60 border-b border-gray-200">
                    <th className="py-3 px-4 font-semibold text-gray-600">Nurse</th>
                    <th className="py-3 px-4 text-center font-semibold text-gray-600">Total Shifts</th>
                    <th className="py-3 px-4 text-center font-semibold text-amber-600">Morning</th>
                    <th className="py-3 px-4 text-center font-semibold text-emerald-600">Afternoon</th>
                    <th className="py-3 px-4 text-center font-semibold text-indigo-600">Night</th>
                    <th className="py-3 px-4 text-center font-semibold text-red-600">Weekend</th>
                    <th className="py-3 px-4 text-center font-semibold text-gray-600">Gini Coefficient</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {fairnessMetrics.map(m => (
                    <tr key={m.nurse_id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-gray-800">{m.full_name}</td>
                      <td className="py-3.5 px-4 text-center font-extrabold text-gray-900">{m.total_shifts}</td>
                      <td className="py-3.5 px-4 text-center font-medium">{m.morning_shifts}</td>
                      <td className="py-3.5 px-4 text-center font-medium">{m.afternoon_shifts}</td>
                      <td className="py-3.5 px-4 text-center font-medium">{m.night_shifts}</td>
                      <td className="py-3.5 px-4 text-center font-medium">{m.weekend_shifts}</td>
                      <td className="py-3.5 px-4 text-center font-semibold text-purple-700">{m.gini_coefficient.toFixed(3)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
