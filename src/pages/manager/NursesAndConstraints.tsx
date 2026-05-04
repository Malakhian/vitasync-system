// ============================================================
// VITASYNC — Nurses & Constraints Management
// High-fidelity profile matrix & CP-SAT algorithm setup
// ============================================================

import { useState } from 'react';
import { store } from '../../data/store';
import type { Ward, LeaveRequest, ConstraintConfig } from '../../types';

export function NursesPage() {
  const [nurses, setNurses] = useState(store.getNurses());
  const [wards] = useState<Ward[]>(store.getWards());
  const [leaves] = useState<LeaveRequest[]>(store.getLeaveRequests());
  const [selectedNurseId, setSelectedNurseId] = useState<string | null>(null);

  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    ward_id: '',
    employee_id: '',
    seniority: 1,
    max_hours_per_week: 40,
    skills: '',
  });

  const getLeavesForNurse = (nurseId: string) => leaves.filter(l => l.nurse_id === nurseId);

  const handleCreateNurse = () => {
    if (!form.full_name || !form.email || !form.ward_id) {
      alert('Please fill in all mandatory nurse fields.');
      return;
    }

    const skillsList = form.skills.split(',').map(s => s.trim()).filter(Boolean);
    const user = store.createUser({
      full_name: form.full_name,
      email: form.email,
      phone: form.phone || '+254700000000',
      role: 'nurse',
      is_active: true,
    });

    store.createNurse({
      user_id: user.id,
      ward_id: form.ward_id,
      employee_id: form.employee_id || `MH-NRS-${Math.floor(100 + Math.random() * 899)}`,
      seniority: form.seniority,
      max_hours_per_week: form.max_hours_per_week,
      skills: skillsList,
      full_name: form.full_name,
      email: form.email,
      phone: form.phone || '+254700000000',
    });

    setNurses(store.getNurses());
    setShowAddForm(false);
    setForm({ full_name: '', email: '', phone: '', ward_id: '', employee_id: '', seniority: 1, max_hours_per_week: 40, skills: '' });
  };

  const handleDeleteNurse = (nurseId: string) => {
    if (!confirm('Are you sure you want to remove this nurse from Metropolitan Hospital?')) return;
    store.deleteNurse(nurseId);
    setNurses(store.getNurses());
    if (selectedNurseId === nurseId) setSelectedNurseId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nurse Registry</h1>
          <p className="text-sm text-gray-400">Add, configure, and inspect individual nurse profile settings</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors shadow-sm"
        >
          {showAddForm ? 'Cancel Form' : '+ Register Nurse'}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm animate-fade-in max-w-4xl space-y-4">
          <h3 className="font-bold text-gray-800 text-base">Register Staff Nurse</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-xs text-gray-400 block mb-1">Full Name</label>
              <input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })}
                placeholder="First Last" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Hospital Email</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="user@metrohospital.go.ke" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Phone Contact</label>
              <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                placeholder="+254..." className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Ward Assignment</label>
              <select value={form.ward_id} onChange={e => setForm({ ...form, ward_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none">
                <option value="">Select ward...</option>
                {wards.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Employee ID</label>
              <input value={form.employee_id} onChange={e => setForm({ ...form, employee_id: e.target.value })}
                placeholder="MH-NRS-..." className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Seniority (Years)</label>
              <input type="number" value={form.seniority} onChange={e => setForm({ ...form, seniority: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Max Hours / Week</label>
              <input type="number" value={form.max_hours_per_week} onChange={e => setForm({ ...form, max_hours_per_week: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Skills (comma separated)</label>
              <input value={form.skills} onChange={e => setForm({ ...form, skills: e.target.value })}
                placeholder="IV Therapy, Wound Care" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleCreateNurse} className="px-4 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-bold hover:bg-primary-700 transition-colors shadow-sm">Save Profile</button>
            <button onClick={() => setShowAddForm(false)} className="px-4 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition-colors">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {nurses.map(n => {
          const ward = wards.find(w => w.id === n.ward_id);
          const activeLeaves = getLeavesForNurse(n.id);
          const isSelected = selectedNurseId === n.id;

          return (
            <div
              key={n.id}
              onClick={() => setSelectedNurseId(isSelected ? null : n.id)}
              className={`bg-white rounded-2xl border transition-all cursor-pointer p-5 select-none ${
                isSelected ? 'border-primary-500 ring-4 ring-primary-50' : 'border-gray-100 hover:border-primary-200'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-700 flex items-center justify-center font-bold text-base shrink-0">
                  {n.full_name.split(' ').map(nm => nm[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-800 text-base leading-tight truncate">{n.full_name}</h3>
                  <p className="text-xs text-gray-400 mt-1">{n.employee_id}</p>
                  <span className="inline-block mt-1 text-[10px] bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    {ward?.name || 'Unassigned'}
                  </span>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); handleDeleteNurse(n.id); }}
                  className="p-1.5 hover:bg-red-50 text-red-500 rounded-xl transition-colors text-sm shrink-0"
                >
                  🗑️
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-center border-t border-gray-50 pt-3 text-xs text-gray-500">
                <div className="rounded-xl bg-gray-50 p-2">Seniority: <span className="font-bold text-gray-800">{n.seniority} yrs</span></div>
                <div className="rounded-xl bg-gray-50 p-2">Max Hours: <span className="font-bold text-gray-800">{n.max_hours_per_week}h</span></div>
              </div>

              {n.skills.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {n.skills.map(s => (
                    <span key={s} className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[9px] font-semibold rounded-full uppercase tracking-wider">{s}</span>
                  ))}
                </div>
              )}

              {activeLeaves.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100 space-y-1.5">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Leaves Recorded</p>
                  {activeLeaves.map(l => (
                    <div key={l.id} className="flex justify-between items-center text-xs text-gray-600 bg-amber-50/40 p-2 rounded-xl">
                      <span>{l.start_date} → {l.end_date}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                        l.status === 'approved' ? 'bg-accent-100 text-accent-700' :
                        l.status === 'denied' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                      }`}>{l.status}</span>
                    </div>
                  ))}
                </div>
              )}

              {isSelected && (
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 text-xs text-gray-600 animate-fade-in">
                  <p className="flex justify-between"><span>Email</span><span className="font-bold text-gray-800">{n.email}</span></p>
                  <p className="flex justify-between"><span>Phone</span><span className="font-bold text-gray-800">{n.phone}</span></p>
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
  const [hardConstraints, setHardConstraints] = useState<ConstraintConfig[]>(store.getHardConstraints());
  const [softConstraints, setSoftConstraints] = useState<ConstraintConfig[]>(store.getSoftConstraints());
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleUpdate = (id: string, updates: Partial<ConstraintConfig>) => {
    store.updateConstraint(id, updates);
    setHardConstraints(store.getHardConstraints());
    setSoftConstraints(store.getSoftConstraints());
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Constraint Configuration</h1>
          <p className="text-sm text-gray-400">Hard constraints are enforced; soft constraints minimize total penalty costs.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-red-50/30">
          <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse-dot shrink-0"></span>
            Hard Constraint Configuration (Fully Enforced)
          </h3>
        </div>
        <div className="divide-y divide-gray-100">
          {hardConstraints.map(c => (
            <div key={c.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors">
              <div className="flex-1">
                <h4 className="font-bold text-gray-800 text-sm">{c.name}</h4>
                <p className="text-xs text-gray-400 mt-1 max-w-2xl">{c.description}</p>
              </div>
              <div className="flex items-center gap-4 shrink-0 self-end md:self-center">
                {editingId === c.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={typeof c.value === 'number' ? c.value : 0}
                      onChange={e => handleUpdate(c.id, { value: Number(e.target.value) })}
                      className="w-24 px-3 py-1.5 border border-gray-200 rounded-xl text-center text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                    <button onClick={() => setEditingId(null)} className="text-xs text-primary-600 font-bold hover:underline">Apply</button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-base font-extrabold text-gray-700">{c.value}</span>
                    <button onClick={() => setEditingId(c.id)} className="text-xs text-gray-400 hover:text-gray-600">✏️</button>
                  </div>
                )}
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={c.enabled}
                    onChange={e => handleUpdate(c.id, { enabled: e.target.checked })}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-xs text-gray-400 font-medium">Enabled</span>
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-amber-50/30">
          <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-amber-500 rounded-full shrink-0"></span>
            Soft Constraint Optimizations (Weight-Based Penalties)
          </h3>
        </div>
        <div className="divide-y divide-gray-100">
          {softConstraints.map(c => (
            <div key={c.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors">
              <div className="flex-1">
                <h4 className="font-bold text-gray-800 text-sm">{c.name}</h4>
                <p className="text-xs text-gray-400 mt-1 max-w-2xl">{c.description}</p>
              </div>
              <div className="flex items-center gap-4 shrink-0 self-end md:self-center">
                {editingId === c.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={c.weight}
                      onChange={e => handleUpdate(c.id, { weight: Number(e.target.value) })}
                      className="w-24 px-3 py-1.5 border border-gray-200 rounded-xl text-center text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                    <button onClick={() => setEditingId(null)} className="text-xs text-primary-600 font-bold hover:underline">Apply</button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-xl">Weight: {c.weight}</span>
                    <button onClick={() => setEditingId(c.id)} className="text-xs text-gray-400 hover:text-gray-600">✏️</button>
                  </div>
                )}
                <div className="w-32 hidden sm:block">
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={c.weight}
                    onChange={e => handleUpdate(c.id, { weight: Number(e.target.value) })}
                    className="w-full accent-amber-500 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={c.enabled}
                    onChange={e => handleUpdate(c.id, { enabled: e.target.checked })}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-xs text-gray-400 font-medium">Enabled</span>
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
