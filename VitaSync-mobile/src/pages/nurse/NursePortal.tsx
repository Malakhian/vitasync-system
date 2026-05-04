// ============================================================
// VITASYNC — Mobile-First Nurse Portal
// ============================================================

import { useState } from 'react';
import { store } from '../../data/store';
import { checkSwapConstraints } from '../../solver/solver';
import { useAuth } from '../../context/AuthContext';
import type { LeaveRequest, SwapRequest } from '../../types';

function getNurse(userId: string) {
  return store.getNurses().find(n => n.user_id === userId);
}

export function MySchedulePage() {
  const { user } = useAuth();
  const nurse = getNurse(user?.id || '');
  if (!nurse) return <div className="mobile-card text-center py-12"><p className="text-gray-400">No nurse profile found</p></div>;

  const [month, setMonth] = useState(3);
  const [year] = useState(2026);
  const rosters = store.getRosters().filter(r => r.status === 'published');
  const roster = rosters.find(r => r.ward_id === nurse.ward_id && r.month === month && r.year === year);
  const assignments = roster ? store.getAssignmentsByRoster(roster.id).filter(a => a.nurse_id === nurse.id) : [];
  const shiftTypes = store.getShiftTypes();
  const days = new Date(year, month, 0).getDate();
  const first = new Date(year, month - 1, 1).getDay();
  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const monthName = new Date(year, month - 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

  const getShift = (day: number) => {
    const d = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const a = assignments.find(x => x.date === d);
    return a ? shiftTypes.find(s => s.id === a.shift_type_id) : null;
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-black text-gray-900">My Schedule</h1>
        <p className="text-xs text-gray-400">{monthName}</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="mobile-card text-center"><p className="text-2xl font-black text-primary-600">{assignments.length}</p><p className="text-[10px] text-gray-400 font-bold">TOTAL</p></div>
        <div className="mobile-card text-center"><p className="text-2xl font-black text-amber-500">{assignments.filter(a => shiftTypes.find(s => s.id === a.shift_type_id)?.name === 'Morning').length}</p><p className="text-[10px] text-gray-400 font-bold">MORNING</p></div>
        <div className="mobile-card text-center"><p className="text-2xl font-black text-indigo-500">{assignments.filter(a => shiftTypes.find(s => s.id === a.shift_type_id)?.name === 'Night').length}</p><p className="text-[10px] text-gray-400 font-bold">NIGHT</p></div>
      </div>

      <div className="flex items-center justify-between mobile-card !py-3">
        <button onClick={() => setMonth(m => m === 1 ? 12 : m - 1)} className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center font-bold active:scale-95">←</button>
        <span className="font-bold text-gray-900">{monthName}</span>
        <button onClick={() => setMonth(m => m === 12 ? 1 : m + 1)} className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center font-bold active:scale-95">→</button>
      </div>

      {!roster ? (
        <div className="mobile-card text-center py-12">
          <div className="text-5xl mb-3">📅</div>
          <p className="font-bold text-gray-800">No Schedule</p>
          <p className="text-xs text-gray-400 mt-1">Roster not yet published</p>
        </div>
      ) : (
        <div className="mobile-card !p-0 overflow-hidden">
          <div className="grid grid-cols-7 bg-gray-50 text-center text-[10px] font-bold text-gray-400 py-2">
            {dayNames.map((d, i) => <div key={i}>{d}</div>)}
          </div>
          <div className="grid grid-cols-7">
            {Array.from({ length: first }).map((_, i) => <div key={`e${i}`} className="border-b border-r border-gray-50 min-h-[60px] bg-gray-50/30" />)}
            {Array.from({ length: days }, (_, i) => i + 1).map(d => {
              const s = getShift(d);
              const dt = new Date(year, month - 1, d);
              const we = dt.getDay() === 0 || dt.getDay() === 6;
              const today = dt.toDateString() === new Date().toDateString();
              return (
                <div key={d} className={`border-b border-r border-gray-50 min-h-[60px] p-1 ${we ? 'bg-amber-50/20' : ''} ${today ? 'ring-2 ring-primary-500 ring-inset' : ''}`}>
                  <span className={`text-[10px] font-bold ${today ? 'bg-primary-600 text-white w-4 h-4 rounded-full flex items-center justify-center' : 'text-gray-400'}`}>{d}</span>
                  {s && (
                    <div className={`mt-1 px-1.5 py-1 rounded-lg text-[8px] font-bold text-center ${s.name === 'Morning' ? 'bg-amber-100 text-amber-700' : s.name === 'Afternoon' ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'}`}>
                      {s.name[0]}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function LeavePage() {
  const { user } = useAuth();
  const nurse = getNurse(user?.id || '');
  if (!nurse) return null;

  const [leaves, setLeaves] = useState<LeaveRequest[]>(store.getLeaveByNurse(nurse.id));
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ start_date: '', end_date: '', reason: '' });

  const submit = () => {
    if (!form.start_date || !form.end_date || !form.reason) { alert('Fill all fields'); return; }
    store.createLeaveRequest({ nurse_id: nurse.id, ...form });
    setShow(false);
    setForm({ start_date: '', end_date: '', reason: '' });
    setLeaves(store.getLeaveByNurse(nurse.id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-gray-900">Leave</h1>
          <p className="text-xs text-gray-400">Absence requests</p>
        </div>
        <button onClick={() => setShow(!show)} className="mobile-btn mobile-btn-primary !w-auto px-4 !py-2.5 text-sm">+ Request</button>
      </div>

      {show && (
        <div className="mobile-sheet lg:relative lg:shadow-sm lg:border lg:border-gray-100 space-y-3">
          <h3 className="font-bold text-gray-900">New Leave Request</h3>
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Start Date</label>
            <input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} className="mobile-input" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">End Date</label>
            <input type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} className="mobile-input" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Reason</label>
            <input value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} placeholder="Reason for leave" className="mobile-input" />
          </div>
          <div className="flex gap-2">
            <button onClick={submit} className="flex-1 mobile-btn mobile-btn-primary">Submit</button>
            <button onClick={() => setShow(false)} className="flex-1 mobile-btn mobile-btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      {leaves.length === 0 ? (
        <div className="mobile-card text-center py-12">
          <div className="text-5xl mb-3">🏖️</div>
          <p className="font-bold text-gray-800">No Leave History</p>
        </div>
      ) : (
        <div className="space-y-3">
          {leaves.map(l => (
            <div key={l.id} className="mobile-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-900 text-sm">{l.start_date} → {l.end_date}</p>
                  <p className="text-xs text-gray-400 mt-1">{l.reason}</p>
                </div>
                <span className={`mobile-chip ${l.status === 'approved' ? 'bg-accent-100 text-accent-700' : l.status === 'denied' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{l.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function SwapPage() {
  const { user } = useAuth();
  const nurse = getNurse(user?.id || '');
  if (!nurse) return null;

  const [swaps] = useState<SwapRequest[]>(store.getSwapsByNurse(nurse.id));
  const [show, setShow] = useState(false);
  const [err, setErr] = useState('');
  const [form, setForm] = useState({ roster_id: '', target_nurse_id: '', original_shift_date: '', original_shift_type_id: '', requested_shift_date: '', requested_shift_type_id: '' });

  const rosters = store.getRosters().filter(r => r.status === 'published' && r.ward_id === nurse.ward_id);
  const peers = store.getNursesByWard(nurse.ward_id).filter(n => n.id !== nurse.id);
  const st = store.getShiftTypes();
  const myAssignments = rosters.length > 0 ? store.getAssignmentsByRoster(rosters[0].id).filter(a => a.nurse_id === nurse.id) : [];

  const submit = () => {
    if (!form.target_nurse_id || !form.original_shift_date) { setErr('Fill all fields'); return; }
    const check = checkSwapConstraints(form.roster_id, nurse.id, form.target_nurse_id, form.original_shift_date, form.original_shift_type_id, form.requested_shift_date, form.requested_shift_type_id);
    if (!check.valid) { setErr(check.violations.join(' • ')); return; }
    store.createSwapRequest({ ...form, roster_id: form.roster_id || rosters[0]?.id, requesting_nurse_id: nurse.id });
    setShow(false);
    setForm({ roster_id: '', target_nurse_id: '', original_shift_date: '', original_shift_type_id: '', requested_shift_date: '', requested_shift_type_id: '' });
    setErr('');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-gray-900">Swaps</h1>
          <p className="text-xs text-gray-400">Shift trades</p>
        </div>
        <button onClick={() => setShow(!show)} className="mobile-btn mobile-btn-primary !w-auto px-4 !py-2.5 text-sm">+ New Swap</button>
      </div>

      {show && (
        <div className="mobile-sheet lg:relative lg:shadow-sm lg:border lg:border-gray-100 space-y-3">
          <h3 className="font-bold text-gray-900">Propose Swap</h3>
          {err && <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs font-bold">{err}</div>}
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Swap With</label>
            <select value={form.target_nurse_id} onChange={e => setForm({ ...form, target_nurse_id: e.target.value })} className="mobile-input">
              <option value="">Select nurse...</option>
              {peers.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Your Shift (Give Up)</label>
            <select value={form.original_shift_date + '|' + form.original_shift_type_id} onChange={e => { const [d, s] = e.target.value.split('|'); setForm({ ...form, original_shift_date: d, original_shift_type_id: s, roster_id: rosters[0]?.id || '' }); }} className="mobile-input">
              <option value="">Select shift...</option>
              {myAssignments.map(a => { const s = st.find(x => x.id === a.shift_type_id); return <option key={a.id} value={`${a.date}|${a.shift_type_id}`}>{a.date} — {s?.name}</option>; })}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Desired Date</label>
            <input type="date" value={form.requested_shift_date} onChange={e => setForm({ ...form, requested_shift_date: e.target.value })} className="mobile-input" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Desired Shift</label>
            <select value={form.requested_shift_type_id} onChange={e => setForm({ ...form, requested_shift_type_id: e.target.value })} className="mobile-input">
              <option value="">Select...</option>
              {st.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={submit} className="flex-1 mobile-btn mobile-btn-primary">Submit</button>
            <button onClick={() => { setShow(false); setErr(''); }} className="flex-1 mobile-btn mobile-btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      {swaps.length === 0 ? (
        <div className="mobile-card text-center py-12">
          <div className="text-5xl mb-3">🔄</div>
          <p className="font-bold text-gray-800">No Swaps</p>
        </div>
      ) : (
        <div className="space-y-3">
          {swaps.map(s => {
            const target = peers.find(p => p.id === s.target_nurse_id);
            const os = st.find(x => x.id === s.original_shift_type_id);
            return (
              <div key={s.id} className="mobile-card">
                <p className="font-bold text-gray-900 text-sm">Swap with {target?.full_name}</p>
                <p className="text-xs text-gray-400 mt-1">Giving: {s.original_shift_date} {os?.name} → Want: {s.requested_shift_date}</p>
                <div className="mt-3">
                  <span className={`mobile-chip ${s.status === 'approved' ? 'bg-accent-100 text-accent-700' : s.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{s.status}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
