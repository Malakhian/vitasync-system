// ============================================================
// VITASYNC — Nurse Portal
// Complete visual dashboard for scheduling, leave, and shift swapping
// ============================================================

import { useState } from 'react';
import { store } from '../../data/store';
import { checkSwapConstraints } from '../../solver/solver';
import { useAuth } from '../../context/AuthContext';
import type { LeaveRequest, SwapRequest } from '../../types';

function getNurseFromUser(userId: string) {
  const nurses = store.getNurses();
  return nurses.find(n => n.user_id === userId);
}

export function MySchedulePage() {
  const { user } = useAuth();
  const nurse = getNurseFromUser(user?.id || '');
  if (!nurse) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm max-w-md mx-auto">
        <span className="text-4xl">❌</span>
        <h3 className="font-bold text-gray-800 text-lg mt-3">No Nurse Identity Detected</h3>
        <p className="text-sm text-gray-400 mt-1">Please ensure your account role is set as Staff Nurse.</p>
      </div>
    );
  }

  const rosters = store.getRosters().filter(r => r.status === 'published');
  const [selectedMonth, setSelectedMonth] = useState(3); // March
  const [selectedYear, setSelectedYear] = useState(2026);

  const roster = rosters.find(r => r.ward_id === nurse.ward_id && r.month === selectedMonth && r.year === selectedYear);
  const assignments = roster ? store.getAssignmentsByRoster(roster.id).filter(a => a.nurse_id === nurse.id) : [];
  const shiftTypes = store.getShiftTypes();

  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const firstDayOfWeek = new Date(selectedYear, selectedMonth - 1, 1).getDay();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getShiftForDay = (day: number) => {
    const date = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const assign = assignments.find(a => a.date === date);
    if (!assign) return null;
    return shiftTypes.find(s => s.id === assign.shift_type_id);
  };

  const monthName = new Date(selectedYear, selectedMonth - 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Personal Duty Schedule</h1>
          <p className="text-sm text-gray-400">Published shift logs and workload distribution for {monthName}.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Total Assigned Shifts</p>
          <p className="text-3xl font-extrabold text-primary-600 mt-2">{assignments.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Morning & Day Coverage</p>
          <p className="text-3xl font-extrabold text-amber-500 mt-2">
            {assignments.filter(a => {
              const st = shiftTypes.find(s => s.id === a.shift_type_id);
              return st?.name === 'Morning' || st?.name === 'Afternoon';
            }).length}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Night Duty Blocks</p>
          <p className="text-3xl font-extrabold text-indigo-600 mt-2">
            {assignments.filter(a => shiftTypes.find(s => s.id === a.shift_type_id)?.name === 'Night').length}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <button
          onClick={() => {
            if (selectedMonth === 1) {
              setSelectedMonth(12);
              setSelectedYear(selectedYear - 1);
            } else {
              setSelectedMonth(selectedMonth - 1);
            }
          }}
          className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-bold transition-all"
        >
          ← Previous
        </button>
        <span className="text-lg font-bold text-gray-800">{monthName}</span>
        <button
          onClick={() => {
            if (selectedMonth === 12) {
              setSelectedMonth(1);
              setSelectedYear(selectedYear + 1);
            } else {
              setSelectedMonth(selectedMonth + 1);
            }
          }}
          className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-bold transition-all"
        >
          Next →
        </button>
      </div>

      {!roster ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm max-w-lg mx-auto">
          <span className="text-5xl">📅</span>
          <h3 className="text-lg font-bold text-gray-800 mt-4">Roster Not Yet Released</h3>
          <p className="text-sm text-gray-400 mt-1">Check back later or contact the ward manager for deployment updates.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50 text-center font-bold text-gray-500 text-xs py-3">
            {dayNames.map(d => (
              <div key={d}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 text-xs select-none">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="border-b border-r border-gray-100 min-h-[95px] bg-gray-50/40" />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
              const shift = getShiftForDay(day);
              const date = new Date(selectedYear, selectedMonth - 1, day);
              const isWeekend = date.getDay() === 0 || date.getDay() === 6;
              const isToday = date.toDateString() === new Date().toDateString();

              return (
                <div
                  key={day}
                  className={`border-b border-r border-gray-100 min-h-[95px] p-2 hover:bg-gray-50/60 transition-colors flex flex-col justify-between ${
                    isWeekend ? 'bg-amber-50/10' : ''
                  } ${isToday ? 'ring-2 ring-primary-500 ring-inset bg-primary-50/10' : ''}`}
                >
                  <span className={`text-[11px] font-bold ${
                    isToday ? 'bg-primary-600 text-white w-5 h-5 rounded-full flex items-center justify-center shadow-sm' : 'text-gray-400'
                  }`}>
                    {day}
                  </span>
                  {shift && (
                    <div className={`mt-1.5 p-1.5 rounded-xl text-[10px] font-bold text-center border shadow-sm ${
                      shift.name === 'Morning' ? 'bg-amber-100/90 text-amber-800 border-amber-200' :
                      shift.name === 'Afternoon' ? 'bg-emerald-100/90 text-emerald-800 border-emerald-200' :
                      'bg-indigo-100/90 text-indigo-800 border-indigo-200'
                    }`}>
                      {shift.name}
                      <p className="text-[9px] text-gray-500/70 font-normal mt-0.5">{shift.start_time}-{shift.end_time}</p>
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
  const nurse = getNurseFromUser(user?.id || '');
  if (!nurse) return null;

  const [leaves, setLeaves] = useState<LeaveRequest[]>(store.getLeaveByNurse(nurse.id));
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ start_date: '', end_date: '', reason: '' });

  const refresh = () => {
    setLeaves(store.getLeaveByNurse(nurse.id));
  };

  const handleSubmit = () => {
    if (!form.start_date || !form.end_date || !form.reason.trim()) {
      alert('Please enter all required dates and the reason.');
      return;
    }
    store.createLeaveRequest({ nurse_id: nurse.id, ...form });
    setShowForm(false);
    setForm({ start_date: '', end_date: '', reason: '' });
    refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Absence & Leave Registry</h1>
          <p className="text-sm text-gray-400">Request future absences or view historical leaves.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors shadow-sm"
        >
          + Request Absence
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm animate-fade-in max-w-3xl">
          <h3 className="font-bold text-gray-800 mb-4">Request Absence Period</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-gray-400 block mb-1 font-semibold uppercase tracking-wider">Start Date</label>
              <input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1 font-semibold uppercase tracking-wider">End Date</label>
              <input type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1 font-semibold uppercase tracking-wider">Reason</label>
              <input type="text" value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })}
                placeholder="e.g., Annual vacation block"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
          </div>
          <div className="flex gap-2 mt-5">
            <button onClick={handleSubmit} className="px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700">Submit Request</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200">Cancel</button>
          </div>
        </div>
      )}

      {leaves.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center max-w-lg mx-auto shadow-sm">
          <span className="text-5xl">🏖️</span>
          <h3 className="text-lg font-bold text-gray-800 mt-4">No Registered Leave Requests</h3>
          <p className="text-sm text-gray-400 mt-1">Submit your first leave using the controls above.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-100">
          {leaves.map(l => (
            <div key={l.id} className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
              <div>
                <p className="font-bold text-gray-800 text-sm leading-none">{l.start_date} → {l.end_date}</p>
                <p className="text-xs text-gray-400 mt-1.5">{l.reason}</p>
                <p className="text-[10px] text-gray-300 mt-1">Requested: {new Date(l.requested_at).toLocaleDateString()}</p>
              </div>
              <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                l.status === 'approved' ? 'bg-accent-100 text-accent-700 border border-accent-200' :
                l.status === 'denied' ? 'bg-red-100 text-red-700 border border-red-200' :
                'bg-amber-100 text-amber-700 border border-amber-200'
              }`}>
                {l.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function SwapPage() {
  const { user } = useAuth();
  const nurse = getNurseFromUser(user?.id || '');
  if (!nurse) return null;

  const [swaps] = useState<SwapRequest[]>(store.getSwapsByNurse(nurse.id));
  const [showForm, setShowForm] = useState(false);
  const [swapError, setSwapError] = useState('');
  const [form, setForm] = useState({
    roster_id: '',
    target_nurse_id: '',
    original_shift_date: '',
    original_shift_type_id: '',
    requested_shift_date: '',
    requested_shift_type_id: '',
  });

  const rosters = store.getRosters().filter(r => r.status === 'published' && r.ward_id === nurse.ward_id);
  const wardNurses = store.getNursesByWard(nurse.ward_id).filter(n => n.id !== nurse.id);
  const shiftTypes = store.getShiftTypes();

  const assignments = rosters.length > 0 ? store.getAssignmentsByRoster(rosters[0].id).filter(a => a.nurse_id === nurse.id) : [];

  const handleCreateSwap = () => {
    if (!form.roster_id || !form.target_nurse_id || !form.original_shift_date || !form.requested_shift_date) {
      setSwapError('Please complete all swap parameters.');
      return;
    }

    const check = checkSwapConstraints(
      form.roster_id,
      nurse.id,
      form.target_nurse_id,
      form.original_shift_date,
      form.original_shift_type_id,
      form.requested_shift_date,
      form.requested_shift_type_id
    );

    if (!check.valid) {
      setSwapError(check.violations.join(' • '));
      return;
    }

    store.createSwapRequest({
      roster_id: form.roster_id,
      requesting_nurse_id: nurse.id,
      target_nurse_id: form.target_nurse_id,
      original_shift_date: form.original_shift_date,
      original_shift_type_id: form.original_shift_type_id,
      requested_shift_date: form.requested_shift_date,
      requested_shift_type_id: form.requested_shift_type_id,
    });

    setShowForm(false);
    setForm({ roster_id: '', target_nurse_id: '', original_shift_date: '', original_shift_type_id: '', requested_shift_date: '', requested_shift_type_id: '' });
    setSwapError('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Duty Swapping Dashboard</h1>
          <p className="text-sm text-gray-400">View current trades or pitch shift changes.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors shadow-sm"
        >
          + Request Duty Swap
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm animate-fade-in max-w-4xl space-y-4">
          <h3 className="font-bold text-gray-800 text-base">Trade Shift with Colleague</h3>
          {swapError && <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs font-semibold text-red-700">{swapError}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 block mb-1 font-semibold uppercase tracking-wider">With Nurse</label>
              <select value={form.target_nurse_id} onChange={e => setForm({ ...form, target_nurse_id: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500">
                <option value="">Select nurse...</option>
                {wardNurses.map(n => <option key={n.id} value={n.id}>{n.full_name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1 font-semibold uppercase tracking-wider">Your Duty (To Give Up)</label>
              <select value={form.original_shift_date + '|' + form.original_shift_type_id}
                onChange={e => {
                  const [date, shiftId] = e.target.value.split('|');
                  setForm({ ...form, original_shift_date: date, original_shift_type_id: shiftId, roster_id: rosters[0]?.id || '' });
                }}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500">
                <option value="">Select shift from roster...</option>
                {assignments.map(a => {
                  const st = shiftTypes.find(s => s.id === a.shift_type_id);
                  return <option key={a.id} value={`${a.date}|${a.shift_type_id}`}>{a.date} — {st?.name}</option>;
                })}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1 font-semibold uppercase tracking-wider">Desired Date</label>
              <input type="date" value={form.requested_shift_date} onChange={e => setForm({ ...form, requested_shift_date: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1 font-semibold uppercase tracking-wider">Desired Shift</label>
              <select value={form.requested_shift_type_id} onChange={e => setForm({ ...form, requested_shift_type_id: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500">
                <option value="">Select shift...</option>
                {shiftTypes.map(s => <option key={s.id} value={s.id}>{s.name} ({s.start_time}-{s.end_time})</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2 mt-5">
            <button onClick={handleCreateSwap} className="px-4 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-bold transition-all shadow-sm">Propose Trade</button>
            <button onClick={() => { setShowForm(false); setSwapError(''); }} className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold transition-all">Cancel</button>
          </div>
        </div>
      )}

      {swaps.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center max-w-lg mx-auto shadow-sm">
          <span className="text-5xl">🔄</span>
          <h3 className="text-lg font-bold text-gray-800 mt-4">No Duty Swaps Active</h3>
          <p className="text-sm text-gray-400 mt-1">Initiate a trade request using the button above.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-100">
          {swaps.map(s => {
            const target = wardNurses.find(n => n.id === s.target_nurse_id);
            const origShift = shiftTypes.find(st => st.id === s.original_shift_type_id);
            return (
              <div key={s.id} className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                <div>
                  <p className="font-bold text-gray-800 text-sm">Shift Trade with {target?.full_name}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Giving up: {s.original_shift_date} {origShift?.name} • Seeking: {s.requested_shift_date}
                  </p>
                  <p className="text-[10px] text-gray-300 mt-1">Created: {new Date(s.created_at).toLocaleDateString()}</p>
                </div>
                <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  s.status === 'approved' ? 'bg-accent-100 text-accent-700 border border-accent-200' :
                  s.status === 'rejected' ? 'bg-red-100 text-red-700 border border-red-200' :
                  'bg-amber-100 text-amber-700 border border-amber-200'
                }`}>
                  {s.status}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
