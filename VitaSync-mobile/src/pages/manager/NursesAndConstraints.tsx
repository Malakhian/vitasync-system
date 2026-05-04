// ============================================================
// VITASYNC — Mobile-First Nurses & Constraints
// ============================================================

import { useState } from 'react';
import { store } from '../../data/store';
import type { Ward, LeaveRequest, ConstraintConfig } from '../../types';

export function NursesPage() {
  const [nurses, setNurses] = useState(store.getNurses());
  const [wards] = useState<Ward[]>(store.getWards());
  const [leaves] = useState<LeaveRequest[]>(store.getLeaveRequests());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', ward_id: '', employee_id: '', seniority: 1, max_hours_per_week: 40, skills: '' });

  const handleCreate = () => {
    if (!form.full_name || !form.email || !form.ward_id) { alert('Fill required fields'); return; }
    const user = store.createUser({ full_name: form.full_name, email: form.email, phone: form.phone || '+254700000000', role: 'nurse', is_active: true });
    store.createNurse({ user_id: user.id, ward_id: form.ward_id, employee_id: form.employee_id || `MH-${Math.floor(100 + Math.random() * 899)}`, seniority: form.seniority, max_hours_per_week: form.max_hours_per_week, skills: form.skills.split(',').map(s => s.trim()).filter(Boolean), full_name: form.full_name, email: form.email, phone: form.phone || '+254700000000' });
    setNurses(store.getNurses());
    setShowAdd(false);
    setForm({ full_name: '', email: '', phone: '', ward_id: '', employee_id: '', seniority: 1, max_hours_per_week: 40, skills: '' });
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl lg:text-2xl font-black text-gray-900">Nurses</h1>
          <p className="text-xs text-gray-400">{nurses.length} registered</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="mobile-btn mobile-btn-primary !w-auto px-4 !py-2.5 text-sm">+ Add</button>
      </div>

      {showAdd && (
        <div className="mobile-sheet lg:relative lg:shadow-sm lg:border lg:border-gray-100 space-y-3">
          <h3 className="font-bold text-gray-900">Register Nurse</h3>
          <input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} placeholder="Full Name" className="mobile-input" />
          <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email" className="mobile-input" />
          <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Phone" className="mobile-input" />
          <select value={form.ward_id} onChange={e => setForm({ ...form, ward_id: e.target.value })} className="mobile-input">
            <option value="">Select Ward</option>
            {wards.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
          <div className="grid grid-cols-2 gap-3">
            <input type="number" value={form.seniority} onChange={e => setForm({ ...form, seniority: Number(e.target.value) })} placeholder="Seniority" className="mobile-input" />
            <input type="number" value={form.max_hours_per_week} onChange={e => setForm({ ...form, max_hours_per_week: Number(e.target.value) })} placeholder="Max Hrs" className="mobile-input" />
          </div>
          <input value={form.skills} onChange={e => setForm({ ...form, skills: e.target.value })} placeholder="Skills (comma separated)" className="mobile-input" />
          <div className="flex gap-2">
            <button onClick={handleCreate} className="flex-1 mobile-btn mobile-btn-primary">Save</button>
            <button onClick={() => setShowAdd(false)} className="flex-1 mobile-btn mobile-btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      <div className="mobile-grid">
        {nurses.map(n => {
          const ward = wards.find(w => w.id === n.ward_id);
          const nl = leaves.filter(l => l.nurse_id === n.id);
          const isOpen = selectedId === n.id;
          return (
            <div key={n.id} onClick={() => setSelectedId(isOpen ? null : n.id)} className={`mobile-card cursor-pointer transition-all ${isOpen ? 'ring-2 ring-primary-500' : ''}`}>
              <div className="flex items-start gap-3">
                <div className="mobile-avatar bg-primary-50 text-primary-700">{n.full_name.split(' ').map(x => x[0]).join('')}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-sm truncate">{n.full_name}</p>
                  <p className="text-[10px] text-gray-400">{n.employee_id}</p>
                  <span className="inline-block mt-1 text-[9px] bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full font-bold">{ward?.name}</span>
                </div>
                <button onClick={e => { e.stopPropagation(); if (confirm('Remove?')) { store.deleteNurse(n.id); setNurses(store.getNurses()); } }} className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-xs">🗑️</button>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-3 text-center text-xs">
                <div className="rounded-xl bg-gray-50 p-2">Seniority: <span className="font-bold">{n.seniority}yr</span></div>
                <div className="rounded-xl bg-gray-50 p-2">Max: <span className="font-bold">{n.max_hours_per_week}h</span></div>
              </div>
              {n.skills.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {n.skills.slice(0, 3).map(s => <span key={s} className="text-[9px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{s}</span>)}
                </div>
              )}
              {nl.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100 space-y-1">
                  {nl.map(l => (
                    <div key={l.id} className="flex justify-between text-xs">
                      <span className="text-gray-500">{l.start_date} → {l.end_date}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${l.status === 'approved' ? 'bg-accent-100 text-accent-700' : l.status === 'denied' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{l.status}</span>
                    </div>
                  ))}
                </div>
              )}
              {isOpen && (
                <div className="mt-3 pt-3 border-t border-gray-100 space-y-1 text-xs animate-fade-in">
                  <p className="text-gray-500">📧 {n.email}</p>
                  <p className="text-gray-500">📱 {n.phone}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ConstraintsPage() {
  const [hard, setHard] = useState<ConstraintConfig[]>(store.getHardConstraints());
  const [soft, setSoft] = useState<ConstraintConfig[]>(store.getSoftConstraints());
  const [editId, setEditId] = useState<string | null>(null);

  const update = (id: string, u: Partial<ConstraintConfig>) => {
    store.updateConstraint(id, u);
    setHard(store.getHardConstraints());
    setSoft(store.getSoftConstraints());
    setEditId(null);
  };

  const renderConstraint = (c: ConstraintConfig) => (
    <div key={c.id} className="mobile-card">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 text-sm">{c.name}</p>
          <p className="text-xs text-gray-400 mt-1">{c.description}</p>
        </div>
        <label className="flex items-center gap-2 shrink-0">
          <input type="checkbox" checked={c.enabled} onChange={e => update(c.id, { enabled: e.target.checked })} className="w-5 h-5 rounded" />
        </label>
      </div>
      <div className="flex items-center gap-3 mt-3">
        {c.severity === 'soft' && (
          <div className="flex-1">
            <input type="range" min="1" max="50" value={c.weight} onChange={e => update(c.id, { weight: Number(e.target.value) })} className="w-full accent-amber-500" />
            <p className="text-[10px] text-gray-400 mt-1">Weight: {c.weight}</p>
          </div>
        )}
        {editId === c.id ? (
          <div className="flex gap-2">
            <input type="number" value={typeof c.value === 'number' ? c.value : c.weight} onChange={e => update(c.id, c.severity === 'hard' ? { value: Number(e.target.value) } : { weight: Number(e.target.value) })} className="mobile-input !py-1.5 w-20 text-center" />
            <button onClick={() => setEditId(null)} className="text-xs text-primary-600 font-bold">Done</button>
          </div>
        ) : (
          <button onClick={() => setEditId(c.id)} className="text-xs text-gray-400 px-3 py-1.5 rounded-xl bg-gray-100">
            {c.severity === 'hard' ? `Val: ${c.value}` : `Wt: ${c.weight}`} ✏️
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-4 lg:space-y-6">
      <div>
        <h1 className="text-xl lg:text-2xl font-black text-gray-900">Constraints</h1>
        <p className="text-xs text-gray-400">Configure scheduling rules</p>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse-dot"></span>
          <h2 className="font-bold text-gray-900 text-sm">Hard Constraints</h2>
        </div>
        <div className="space-y-3">{hard.map(renderConstraint)}</div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2.5 h-2.5 bg-amber-500 rounded-full"></span>
          <h2 className="font-bold text-gray-900 text-sm">Soft Constraints</h2>
        </div>
        <div className="space-y-3">{soft.map(renderConstraint)}</div>
      </div>
    </div>
  );
}
