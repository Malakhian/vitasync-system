// ============================================================
// VITASYNC — Mobile-First Manager Dashboard & Wards
// ============================================================

import { useState } from 'react';
import { store } from '../../data/store';
import type { Ward } from '../../types';

export function DashboardPage() {
  const [, setRefreshKey] = useState(0);
  const wards = store.getWards();
  const nurses = store.getNurses();
  const rosters = store.getRosters();
  const leaves = store.getLeaveRequests();
  const swaps = store.getSwapRequests();
  const pendingLeaves = leaves.filter(l => l.status === 'pending');
  const pendingSwaps = swaps.filter(s => s.status === 'pending');
  const publishedRosters = rosters.filter(r => r.status === 'published');

  const stats = [
    { label: 'Nurses', value: nurses.length, icon: '👩‍⚕️', bg: 'bg-blue-50', text: 'text-blue-600' },
    { label: 'Wards', value: wards.length, icon: '🏥', bg: 'bg-emerald-50', text: 'text-emerald-600' },
    { label: 'Rosters', value: publishedRosters.length, icon: '📅', bg: 'bg-purple-50', text: 'text-purple-600' },
    { label: 'Pending', value: pendingLeaves.length + pendingSwaps.length, icon: '⏱️', bg: 'bg-amber-50', text: 'text-amber-600' },
  ];

  const leaveDecision = (id: string, status: 'approved' | 'denied') => {
    store.updateLeaveRequest(id, { status, processed_by: 'u1' });
    setRefreshKey(k => k + 1);
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Mobile Hero Card */}
      <div className="rounded-3xl bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 text-white p-5 lg:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '28px 28px' }} />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-primary-100 text-[10px] font-medium border border-white/10 mb-3">
            <span className="w-2 h-2 rounded-full bg-accent-400 animate-pulse-dot"></span>
            Operations Command Center
          </div>
          <h1 className="text-2xl lg:text-3xl font-black tracking-tight">VitaSync Dashboard</h1>
          <p className="text-primary-200 text-sm mt-2 max-w-lg">Monitor scheduling, approve requests, and track workforce fairness at Metropolitan Hospital.</p>
        </div>
      </div>

      {/* Stats Grid - Mobile optimized */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {stats.map(s => (
          <div key={s.label} className="mobile-card flex items-center gap-3">
            <div className={`mobile-stat-icon ${s.bg}`}>{s.icon}</div>
            <div>
              <p className={`text-2xl font-black ${s.text}`}>{s.value}</p>
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Action Queue */}
      <div className="mobile-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900 text-base">Action Queue</h2>
          <span className="mobile-chip bg-amber-100 text-amber-700">{pendingLeaves.length + pendingSwaps.length} pending</span>
        </div>

        {pendingLeaves.length === 0 && pendingSwaps.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <div className="text-4xl mb-3">✅</div>
            <p className="font-semibold text-gray-600">All clear</p>
            <p className="text-xs mt-1">No pending approvals</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingLeaves.map(l => {
              const nurse = nurses.find(n => n.id === l.nurse_id);
              return (
                <div key={l.id} className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-sm">Leave — {nurse?.full_name}</p>
                      <p className="text-xs text-gray-500 mt-1">{l.start_date} → {l.end_date}</p>
                      <p className="text-xs text-gray-500">{l.reason}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => leaveDecision(l.id, 'approved')} className="flex-1 py-2.5 rounded-xl bg-accent-600 text-white text-xs font-bold active:scale-[0.98] transition-transform">Approve</button>
                    <button onClick={() => leaveDecision(l.id, 'denied')} className="flex-1 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 text-xs font-bold active:scale-[0.98] transition-transform">Deny</button>
                  </div>
                </div>
              );
            })}
            {pendingSwaps.map(s => {
              const req = nurses.find(n => n.id === s.requesting_nurse_id);
              const tgt = nurses.find(n => n.id === s.target_nurse_id);
              return (
                <div key={s.id} className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100">
                  <p className="font-bold text-gray-900 text-sm">Swap — {req?.full_name} ↔ {tgt?.full_name}</p>
                  <p className="text-xs text-gray-500 mt-1">{s.original_shift_date} → {s.requested_shift_date}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Ward Overview - Mobile cards */}
      <div className="mobile-card">
        <h2 className="font-bold text-gray-900 text-base mb-4">Ward Coverage</h2>
        <div className="mobile-grid">
          {wards.map(w => {
            const wn = nurses.filter(n => n.ward_id === w.id);
            return (
              <div key={w.id} className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50">
                <p className="font-bold text-gray-900 text-sm">{w.name}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{w.location}</p>
                <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                  <div className="rounded-xl bg-amber-50 p-2">
                    <p className="text-lg font-black text-amber-600">{w.min_morning_staff}</p>
                    <p className="text-[9px] text-gray-400">M</p>
                  </div>
                  <div className="rounded-xl bg-emerald-50 p-2">
                    <p className="text-lg font-black text-emerald-600">{w.min_afternoon_staff}</p>
                    <p className="text-[9px] text-gray-400">A</p>
                  </div>
                  <div className="rounded-xl bg-indigo-50 p-2">
                    <p className="text-lg font-black text-indigo-600">{w.min_night_staff}</p>
                    <p className="text-[9px] text-gray-400">N</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-3"><span className="font-bold">{wn.length}</span> nurses assigned</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function WardsPage() {
  const [wards, setWards] = useState<Ward[]>(store.getWards());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Ward>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', location: '', min_morning_staff: 4, min_afternoon_staff: 3, min_night_staff: 2 });

  const handleSave = () => {
    if (!editingId) return;
    store.updateWard(editingId, formData);
    setWards(store.getWards());
    setEditingId(null);
  };

  const handleAdd = () => {
    if (!addForm.name.trim()) return;
    store.createWard(addForm);
    setWards(store.getWards());
    setShowAddForm(false);
    setAddForm({ name: '', location: '', min_morning_staff: 4, min_afternoon_staff: 3, min_night_staff: 2 });
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl lg:text-2xl font-black text-gray-900">Wards</h1>
          <p className="text-xs text-gray-400">Manage ward configurations</p>
        </div>
        <button onClick={() => setShowAddForm(!showAddForm)} className="mobile-btn mobile-btn-primary !w-auto px-4 !py-2.5 text-sm">
          + Add
        </button>
      </div>

      {showAddForm && (
        <div className="mobile-sheet lg:relative lg:shadow-sm lg:border lg:border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4">New Ward</h3>
          <div className="space-y-3">
            <input value={addForm.name} onChange={e => setAddForm({ ...addForm, name: e.target.value })} placeholder="Ward name" className="mobile-input" />
            <input value={addForm.location} onChange={e => setAddForm({ ...addForm, location: e.target.value })} placeholder="Location" className="mobile-input" />
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] text-gray-400 block mb-1">Morning</label>
                <input type="number" value={addForm.min_morning_staff} onChange={e => setAddForm({ ...addForm, min_morning_staff: Number(e.target.value) })} className="mobile-input" />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 block mb-1">Afternoon</label>
                <input type="number" value={addForm.min_afternoon_staff} onChange={e => setAddForm({ ...addForm, min_afternoon_staff: Number(e.target.value) })} className="mobile-input" />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 block mb-1">Night</label>
                <input type="number" value={addForm.min_night_staff} onChange={e => setAddForm({ ...addForm, min_night_staff: Number(e.target.value) })} className="mobile-input" />
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleAdd} className="flex-1 mobile-btn mobile-btn-primary">Save</button>
            <button onClick={() => setShowAddForm(false)} className="flex-1 mobile-btn mobile-btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {wards.map(w => (
          <div key={w.id} className="mobile-card">
            {editingId === w.id ? (
              <div className="space-y-3">
                <input value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} className="mobile-input" />
                <input value={formData.location || ''} onChange={e => setFormData({ ...formData, location: e.target.value })} className="mobile-input" />
                <div className="flex gap-2">
                  <button onClick={handleSave} className="flex-1 mobile-btn mobile-btn-primary">Save</button>
                  <button onClick={() => setEditingId(null)} className="flex-1 mobile-btn mobile-btn-secondary">Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900">{w.name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{w.location}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingId(w.id); setFormData({ ...w }); }} className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-sm">✏️</button>
                    <button onClick={() => { if (confirm('Delete?')) { store.deleteWard(w.id); setWards(store.getWards()); } }} className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center text-sm">🗑️</button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-4">
                  <div className="rounded-2xl bg-amber-50 p-3 text-center">
                    <p className="text-xl font-black text-amber-600">{w.min_morning_staff}</p>
                    <p className="text-[10px] text-gray-400">Morning</p>
                  </div>
                  <div className="rounded-2xl bg-emerald-50 p-3 text-center">
                    <p className="text-xl font-black text-emerald-600">{w.min_afternoon_staff}</p>
                    <p className="text-[10px] text-gray-400">Afternoon</p>
                  </div>
                  <div className="rounded-2xl bg-indigo-50 p-3 text-center">
                    <p className="text-xl font-black text-indigo-600">{w.min_night_staff}</p>
                    <p className="text-[10px] text-gray-400">Night</p>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
