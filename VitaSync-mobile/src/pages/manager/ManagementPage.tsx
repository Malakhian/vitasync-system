// ============================================================
// VITASYNC — Mobile-First Swap Requests & Reports
// ============================================================

import { useState, useEffect } from 'react';
import { store } from '../../data/store';
import { approveSwap, rejectSwap } from '../../solver/solver';
import type { SwapRequest, FairnessMetrics } from '../../types';

function downloadFile(name: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}

export function SwapRequestsPage() {
  const [swaps, setSwaps] = useState<SwapRequest[]>(store.getSwapRequests());
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const nurses = store.getNurses();

  useEffect(() => { setSwaps(store.getSwapRequests()); }, []);

  const filtered = filter === 'all' ? swaps : swaps.filter(s => s.status === filter);
  const sorted = [...filtered].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col gap-3">
        <div>
          <h1 className="text-xl lg:text-2xl font-black text-gray-900">Swap Requests</h1>
          <p className="text-xs text-gray-400">Manage shift trades</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-xl overflow-x-auto">
          {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold capitalize whitespace-nowrap transition-all ${filter === f ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500'}`}>{f}</button>
          ))}
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="mobile-card text-center py-12">
          <div className="text-5xl mb-3">🔄</div>
          <p className="font-bold text-gray-800">No Swaps</p>
          <p className="text-xs text-gray-400 mt-1">No trades match this filter</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map(s => {
            const rn = nurses.find(n => n.id === s.requesting_nurse_id);
            const tn = nurses.find(n => n.id === s.target_nurse_id);
            const st = store.getShiftTypes();
            const os = st.find(x => x.id === s.original_shift_type_id);
            const rs = st.find(x => x.id === s.requested_shift_type_id);
            return (
              <div key={s.id} className="mobile-card">
                <div className="flex items-center gap-3">
                  <div className="mobile-avatar bg-primary-50 text-primary-700 text-xs">{rn?.full_name.split(' ').map(x => x[0]).join('')}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm">{rn?.full_name}</p>
                    <p className="text-[10px] text-gray-400">{s.original_shift_date} • {os?.name}</p>
                  </div>
                  <span className="text-gray-300">⇄</span>
                  <div className="mobile-avatar bg-accent-50 text-accent-700 text-xs">{tn?.full_name.split(' ').map(x => x[0]).join('')}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm">{tn?.full_name}</p>
                    <p className="text-[10px] text-gray-400">{s.requested_shift_date} • {rs?.name}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <span className={`mobile-chip ${s.status === 'pending' ? 'bg-amber-100 text-amber-700' : s.status === 'approved' ? 'bg-accent-100 text-accent-700' : 'bg-red-100 text-red-700'}`}>{s.status}</span>
                  {s.status === 'pending' && (
                    <div className="flex gap-2">
                      <button onClick={() => { const r = approveSwap(s.id); if (r.success) setSwaps(store.getSwapRequests()); else alert(r.message); }} className="px-4 py-2 rounded-xl bg-accent-600 text-white text-xs font-bold active:scale-[0.98]">Approve</button>
                      <button onClick={() => { const r = rejectSwap(s.id); if (r.success) setSwaps(store.getSwapRequests()); }} className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold active:scale-[0.98]">Reject</button>
                    </div>
                  )}
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
  const [sel, setSel] = useState('');
  const rosters = store.getRosters();
  const wards = store.getWards();
  const nurses = store.getNurses();
  const shiftTypes = store.getShiftTypes();
  const selected = rosters.find(r => r.id === sel);
  const assignments = sel ? store.getAssignmentsByRoster(sel) : [];

  const metrics: FairnessMetrics[] = nurses.map(n => {
    const na = assignments.filter(a => a.nurse_id === n.id);
    const all = nurses.map(x => assignments.filter(a => a.nurse_id === x.id).length);
    const mean = all.reduce((a, b) => a + b, 0) / all.length;
    const sorted = [...all].sort((a, b) => a - b);
    const gini = mean > 0 ? sorted.reduce((acc, v, i) => acc + (2 * (i + 1) - all.length - 1) * v, 0) / (all.length * all.length * mean) : 0;
    return {
      nurse_id: n.id, full_name: n.full_name, total_shifts: na.length,
      morning_shifts: na.filter(a => shiftTypes.find(s => s.id === a.shift_type_id)?.name === 'Morning').length,
      afternoon_shifts: na.filter(a => shiftTypes.find(s => s.id === a.shift_type_id)?.name === 'Afternoon').length,
      night_shifts: na.filter(a => shiftTypes.find(s => s.id === a.shift_type_id)?.name === 'Night').length,
      weekend_shifts: na.filter(a => { const d = new Date(a.date).getDay(); return d === 0 || d === 6; }).length,
      gini_coefficient: Math.abs(gini),
    };
  });

  const avg = metrics.length > 0 ? metrics.reduce((s, m) => s + m.total_shifts, 0) / metrics.length : 0;

  const exportCsv = () => {
    if (!selected) return;
    const rows = [['Nurse', 'Total', 'Morning', 'Afternoon', 'Night', 'Weekend', 'Gini'], ...metrics.map(m => [m.full_name, String(m.total_shifts), String(m.morning_shifts), String(m.afternoon_shifts), String(m.night_shifts), String(m.weekend_shifts), m.gini_coefficient.toFixed(3)])];
    downloadFile(`vitasync-${selected.year}-${selected.month}.csv`, rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n'), 'text/csv');
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col gap-3">
        <div>
          <h1 className="text-xl lg:text-2xl font-black text-gray-900">Reports</h1>
          <p className="text-xs text-gray-400">Fairness & compliance analytics</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCsv} disabled={!selected} className="flex-1 mobile-btn mobile-btn-primary !py-2.5 text-xs disabled:opacity-50">📥 Export CSV</button>
        </div>
      </div>

      <div className="mobile-card">
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Select Roster</label>
        <select value={sel} onChange={e => setSel(e.target.value)} className="mobile-input">
          <option value="">Choose roster...</option>
          {rosters.map(r => { const w = wards.find(x => x.id === r.ward_id); return <option key={r.id} value={r.id}>{w?.name} — {new Date(r.year, r.month - 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</option>; })}
        </select>
      </div>

      {!selected ? (
        <div className="mobile-card text-center py-12">
          <div className="text-5xl mb-3">📈</div>
          <p className="font-bold text-gray-800">Select a Roster</p>
          <p className="text-xs text-gray-400 mt-1">Pick a roster to view analytics</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="mobile-stat"><div className="mobile-stat-icon bg-primary-50"><span className="text-primary-600 font-black text-lg">{assignments.length}</span></div><div><p className="text-[10px] text-gray-400 font-bold">TOTAL</p></div></div>
            <div className="mobile-stat"><div className="mobile-stat-icon bg-emerald-50"><span className="text-emerald-600 font-black text-lg">{avg.toFixed(1)}</span></div><div><p className="text-[10px] text-gray-400 font-bold">AVG/NURSE</p></div></div>
            <div className="mobile-stat"><div className="mobile-stat-icon bg-purple-50"><span className="text-purple-600 font-black text-lg">{metrics.length > 0 ? Math.max(...metrics.map(m => m.gini_coefficient)).toFixed(2) : '0'}</span></div><div><p className="text-[10px] text-gray-400 font-bold">GINI</p></div></div>
            <div className="mobile-stat"><div className="mobile-stat-icon bg-amber-50"><span className="text-amber-600 font-black text-lg">{selected.objective_value}</span></div><div><p className="text-[10px] text-gray-400 font-bold">OBJECTIVE</p></div></div>
          </div>

          <div className="mobile-card overflow-x-auto -mx-4 px-4 lg:mx-0 lg:px-0">
            <p className="font-bold text-sm text-gray-900 mb-3">Fairness Distribution</p>
            <table className="w-full text-xs" style={{ minWidth: '500px' }}>
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-2 px-3 text-left font-bold text-gray-500">Nurse</th>
                  <th className="py-2 px-3 text-center font-bold text-gray-500">Total</th>
                  <th className="py-2 px-3 text-center font-bold text-amber-600">M</th>
                  <th className="py-2 px-3 text-center font-bold text-emerald-600">A</th>
                  <th className="py-2 px-3 text-center font-bold text-indigo-600">N</th>
                  <th className="py-2 px-3 text-center font-bold text-red-600">W</th>
                  <th className="py-2 px-3 text-center font-bold text-purple-600">Gini</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {metrics.map(m => (
                  <tr key={m.nurse_id}>
                    <td className="py-2.5 px-3 font-bold text-gray-800 whitespace-nowrap">{m.full_name}</td>
                    <td className="py-2.5 px-3 text-center font-black">{m.total_shifts}</td>
                    <td className="py-2.5 px-3 text-center">{m.morning_shifts}</td>
                    <td className="py-2.5 px-3 text-center">{m.afternoon_shifts}</td>
                    <td className="py-2.5 px-3 text-center">{m.night_shifts}</td>
                    <td className="py-2.5 px-3 text-center">{m.weekend_shifts}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-purple-700">{m.gini_coefficient.toFixed(3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
