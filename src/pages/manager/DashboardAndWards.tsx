// ============================================================
// VITASYNC — Manager Dashboard & Wards
// ============================================================

import { useMemo, useState } from 'react';
import { store } from '../../data/store';
import type { Ward } from '../../types';

function statColor(status: 'blue' | 'green' | 'amber' | 'violet') {
  switch (status) {
    case 'blue':
      return 'from-blue-500 to-blue-600 text-blue-600 bg-blue-50';
    case 'green':
      return 'from-emerald-500 to-emerald-600 text-emerald-600 bg-emerald-50';
    case 'amber':
      return 'from-amber-500 to-amber-600 text-amber-600 bg-amber-50';
    case 'violet':
      return 'from-violet-500 to-violet-600 text-violet-600 bg-violet-50';
  }
}

export function DashboardPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const wards = store.getWards();
  const nurses = store.getNurses();
  const rosters = store.getRosters();
  const leaves = store.getLeaveRequests();
  const swaps = store.getSwapRequests();
  const constraints = store.getConstraints();
  const notifications = store.getNotifications();

  const pendingLeaves = leaves.filter(l => l.status === 'pending');
  const pendingSwaps = swaps.filter(s => s.status === 'pending');
  const publishedRosters = rosters.filter(r => r.status === 'published');
  const latestRoster = [...rosters].sort((a, b) => new Date(b.generated_at).getTime() - new Date(a.generated_at).getTime())[0];

  const workloadHealth = useMemo(() => {
    if (publishedRosters.length === 0) return { score: 0, label: 'No published roster' };
    const avgObjective = publishedRosters.reduce((sum, roster) => sum + roster.objective_value, 0) / publishedRosters.length;
    if (avgObjective <= 20) return { score: 92, label: 'Excellent fairness' };
    if (avgObjective <= 40) return { score: 81, label: 'Healthy balance' };
    if (avgObjective <= 65) return { score: 68, label: 'Needs tuning' };
    return { score: 51, label: 'High penalty load' };
  }, [publishedRosters.length, refreshKey]);

  const moduleReadiness = [
    { name: 'Constraint Engine', value: `${constraints.filter(c => c.enabled).length}/${constraints.length}`, helper: 'Enabled rules' },
    { name: 'Roster Lifecycle', value: `${publishedRosters.length}`, helper: 'Published rosters' },
    { name: 'Swap Workflow', value: `${pendingSwaps.length}`, helper: 'Awaiting decisions' },
    { name: 'Notifications', value: `${notifications.length}`, helper: 'Messages logged' },
  ];

  const stats = [
    { label: 'Nurses', value: nurses.length, icon: '👩‍⚕️', tone: 'blue' as const },
    { label: 'Wards', value: wards.length, icon: '🏥', tone: 'green' as const },
    { label: 'Published Rosters', value: publishedRosters.length, icon: '📅', tone: 'violet' as const },
    { label: 'Pending Decisions', value: pendingLeaves.length + pendingSwaps.length, icon: '⏱️', tone: 'amber' as const },
  ];

  const leaveDecision = (id: string, status: 'approved' | 'denied') => {
    const leave = store.updateLeaveRequest(id, { status, processed_by: 'u1' });
    if (leave) {
      const nurse = nurses.find(n => n.id === leave.nurse_id);
      const user = nurse ? store.getUserById(nurse.user_id) : null;
      if (user) {
        store.createNotification({
          user_id: user.id,
          type: 'in-app',
          subject: `Leave request ${status}`,
          body: `${leave.start_date} to ${leave.end_date} has been ${status} by the ward manager.`,
          status: 'sent',
          reference_id: leave.id,
        });
      }
    }
    setRefreshKey(value => value + 1);
  };

  const recentRosters = [...rosters].sort((a, b) => new Date(b.generated_at).getTime() - new Date(a.generated_at).getTime()).slice(0, 6);
  const recentNotifications = [...notifications].sort((a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime()).slice(0, 5);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 text-white p-8 shadow-2xl overflow-hidden relative">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '28px 28px' }} />
        <div className="relative z-10 grid lg:grid-cols-[1.7fr_1fr] gap-6 items-start">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-primary-100 text-xs font-medium border border-white/10 mb-4">
              <span className="w-2 h-2 rounded-full bg-accent-400 animate-pulse-dot"></span>
              Metropolitan Hospital operations command center
            </div>
            <h1 className="text-3xl font-bold tracking-tight">VitaSync Manager Dashboard</h1>
            <p className="mt-3 text-primary-100 max-w-2xl text-sm leading-6">
              Monitor roster generation, approve leave and swaps, track fairness, and keep ward staffing compliant with rest,
              coverage, and night-shift policies.
            </p>
            <div className="mt-6 grid sm:grid-cols-3 gap-3 max-w-3xl">
              {moduleReadiness.map(item => (
                <div key={item.name} className="rounded-2xl bg-white/10 border border-white/10 p-4 backdrop-blur-sm">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-primary-200">{item.name}</p>
                  <p className="text-2xl font-bold mt-2">{item.value}</p>
                  <p className="text-xs text-primary-200 mt-1">{item.helper}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white/10 border border-white/10 rounded-3xl p-5 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-primary-200">System health</p>
            <div className="mt-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-5xl font-bold">{workloadHealth.score}%</p>
                <p className="text-sm text-primary-100 mt-1">{workloadHealth.label}</p>
              </div>
              <div className="w-24 h-24 rounded-full border-8 border-white/20 flex items-center justify-center text-lg font-semibold">
                OK
              </div>
            </div>
            <div className="mt-5 space-y-2 text-sm text-primary-100">
              <div className="flex items-center justify-between"><span>Latest solver run</span><span>{latestRoster ? `${latestRoster.solver_time_ms} ms` : '—'}</span></div>
              <div className="flex items-center justify-between"><span>Latest objective</span><span>{latestRoster ? latestRoster.objective_value : '—'}</span></div>
              <div className="flex items-center justify-between"><span>Pending approvals</span><span>{pendingLeaves.length + pendingSwaps.length}</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map(stat => {
          const tone = statColor(stat.tone);
          return (
            <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-gray-400">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-3">{stat.value}</p>
                </div>
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl ${tone.split(' ').slice(2).join(' ')}`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          );
        })}
      </section>

      <section className="grid lg:grid-cols-[1.3fr_1fr] gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">Action Queue</h2>
              <p className="text-sm text-gray-400">Leave and swap decisions that need manager intervention</p>
            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-amber-50 text-amber-700 font-medium">
              {pendingLeaves.length + pendingSwaps.length} items
            </span>
          </div>

          <div className="p-6 space-y-4">
            {pendingLeaves.length === 0 && pendingSwaps.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 p-10 text-center text-gray-400">
                <div className="text-4xl mb-3">✅</div>
                <p className="font-medium text-gray-600">All approvals are clear</p>
                <p className="text-sm mt-1">No leave or swap decisions are waiting.</p>
              </div>
            ) : (
              <>
                {pendingLeaves.map(leave => {
                  const nurse = nurses.find(n => n.id === leave.nurse_id);
                  return (
                    <div key={leave.id} className="rounded-2xl border border-amber-100 bg-amber-50/60 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-gray-900">Leave request — {nurse?.full_name}</p>
                          <p className="text-sm text-gray-500 mt-1">{leave.start_date} → {leave.end_date}</p>
                          <p className="text-sm text-gray-500 mt-1">Reason: {leave.reason}</p>
                        </div>
                        <span className="text-[11px] uppercase tracking-wide px-2 py-1 rounded-full bg-amber-100 text-amber-700 font-semibold">Pending</span>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <button onClick={() => leaveDecision(leave.id, 'approved')} className="px-4 py-2 rounded-xl bg-accent-600 text-white text-sm font-medium hover:bg-accent-700 transition-colors">Approve</button>
                        <button onClick={() => leaveDecision(leave.id, 'denied')} className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors">Deny</button>
                      </div>
                    </div>
                  );
                })}

                {pendingSwaps.map(swap => {
                  const requester = nurses.find(n => n.id === swap.requesting_nurse_id);
                  const target = nurses.find(n => n.id === swap.target_nurse_id);
                  return (
                    <div key={swap.id} className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-gray-900">Swap request — {requester?.full_name} ↔ {target?.full_name}</p>
                          <p className="text-sm text-gray-500 mt-1">Original: {swap.original_shift_date}</p>
                          <p className="text-sm text-gray-500 mt-1">Requested: {swap.requested_shift_date}</p>
                        </div>
                        <span className="text-[11px] uppercase tracking-wide px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-semibold">Pending</span>
                      </div>
                      <div className="mt-4 text-xs text-blue-700 bg-white/70 border border-blue-100 rounded-xl px-3 py-2">
                        Constraint validation happens again on final approval from the swap requests module.
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Recent Rosters</h2>
              <p className="text-sm text-gray-400">Generation history and publication status</p>
            </div>
            <div className="p-4 space-y-3">
              {recentRosters.length === 0 ? (
                <div className="p-6 text-center text-sm text-gray-400">No rosters generated yet.</div>
              ) : (
                recentRosters.map(roster => {
                  const ward = wards.find(w => w.id === roster.ward_id);
                  return (
                    <div key={roster.id} className="rounded-2xl border border-gray-100 p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-medium text-gray-900">{ward?.name}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(roster.year, roster.month - 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                        <span className={`text-[11px] px-2 py-1 rounded-full font-semibold uppercase tracking-wide ${
                          roster.status === 'published'
                            ? 'bg-blue-100 text-blue-700'
                            : roster.status === 'draft'
                              ? 'bg-gray-100 text-gray-700'
                              : 'bg-purple-100 text-purple-700'
                        }`}>
                          {roster.status}
                        </span>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-gray-500">
                        <div className="rounded-xl bg-gray-50 p-3">Solver: <span className="font-semibold text-gray-800">{roster.solver_time_ms}ms</span></div>
                        <div className="rounded-xl bg-gray-50 p-3">Objective: <span className="font-semibold text-gray-800">{roster.objective_value}</span></div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Notification Feed</h2>
              <p className="text-sm text-gray-400">Most recent system events</p>
            </div>
            <div className="p-4 space-y-3">
              {recentNotifications.map(item => (
                <div key={item.id} className="flex items-start gap-3 rounded-2xl border border-gray-100 p-3">
                  <div className={`w-9 h-9 rounded-2xl flex items-center justify-center text-sm ${
                    item.type === 'sms' ? 'bg-amber-100' : item.type === 'email' ? 'bg-blue-100' : 'bg-emerald-100'
                  }`}>
                    {item.type === 'sms' ? '💬' : item.type === 'email' ? '✉️' : '🔔'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900">{item.subject}</p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">Ward Coverage Overview</h2>
            <p className="text-sm text-gray-400">Default staffing minima and team composition by ward</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 p-6">
          {wards.map(ward => {
            const wardNurses = nurses.filter(n => n.ward_id === ward.id);
            const seniorityAvg = wardNurses.length > 0
              ? (wardNurses.reduce((sum, nurse) => sum + nurse.seniority, 0) / wardNurses.length).toFixed(1)
              : '0.0';
            return (
              <div key={ward.id} className="rounded-3xl border border-gray-100 bg-gradient-to-b from-white to-gray-50 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-900">{ward.name}</p>
                    <p className="text-xs text-gray-400 mt-1">{ward.location}</p>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-primary-50 text-primary-700 flex items-center justify-center">🏥</div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-2xl bg-amber-50 p-3">
                    <p className="text-lg font-bold text-amber-600">{ward.min_morning_staff}</p>
                    <p className="text-[11px] text-gray-500">Morning</p>
                  </div>
                  <div className="rounded-2xl bg-emerald-50 p-3">
                    <p className="text-lg font-bold text-emerald-600">{ward.min_afternoon_staff}</p>
                    <p className="text-[11px] text-gray-500">Afternoon</p>
                  </div>
                  <div className="rounded-2xl bg-indigo-50 p-3">
                    <p className="text-lg font-bold text-indigo-600">{ward.min_night_staff}</p>
                    <p className="text-[11px] text-gray-500">Night</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 text-sm text-gray-600">
                  <div className="flex items-center justify-between"><span>Assigned nurses</span><span className="font-semibold text-gray-900">{wardNurses.length}</span></div>
                  <div className="flex items-center justify-between"><span>Avg seniority</span><span className="font-semibold text-gray-900">{seniorityAvg} yrs</span></div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export function WardsPage() {
  const [wards, setWards] = useState<Ward[]>(store.getWards());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Ward>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({
    name: '',
    location: '',
    min_morning_staff: 4,
    min_afternoon_staff: 3,
    min_night_staff: 2,
  });

  const handleEdit = (ward: Ward) => {
    setEditingId(ward.id);
    setFormData({ ...ward });
  };

  const handleSave = () => {
    if (!editingId) return;
    store.updateWard(editingId, formData);
    setWards(store.getWards());
    setEditingId(null);
    setFormData({});
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Delete this ward?')) return;
    store.deleteWard(id);
    setWards(store.getWards());
  };

  const handleAdd = () => {
    if (!addForm.name.trim() || !addForm.location.trim()) return;
    store.createWard(addForm);
    setWards(store.getWards());
    setShowAddForm(false);
    setAddForm({ name: '', location: '', min_morning_staff: 4, min_afternoon_staff: 3, min_night_staff: 2 });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ward Configuration</h1>
          <p className="text-sm text-gray-400">Manage ward locations and default staffing minima for Metropolitan Hospital.</p>
        </div>
        <button
          onClick={() => setShowAddForm(value => !value)}
          className="px-4 py-2.5 rounded-2xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors"
        >
          + Add Ward
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-fade-in">
          <h2 className="font-semibold text-gray-900 mb-4">Create Ward</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
            <input value={addForm.name} onChange={e => setAddForm({ ...addForm, name: e.target.value })} placeholder="Ward name" className="px-4 py-3 rounded-2xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-primary-500" />
            <input value={addForm.location} onChange={e => setAddForm({ ...addForm, location: e.target.value })} placeholder="Location" className="px-4 py-3 rounded-2xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-primary-500" />
            <input type="number" value={addForm.min_morning_staff} onChange={e => setAddForm({ ...addForm, min_morning_staff: Number(e.target.value) })} placeholder="Morning" className="px-4 py-3 rounded-2xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-primary-500" />
            <input type="number" value={addForm.min_afternoon_staff} onChange={e => setAddForm({ ...addForm, min_afternoon_staff: Number(e.target.value) })} placeholder="Afternoon" className="px-4 py-3 rounded-2xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-primary-500" />
            <input type="number" value={addForm.min_night_staff} onChange={e => setAddForm({ ...addForm, min_night_staff: Number(e.target.value) })} placeholder="Night" className="px-4 py-3 rounded-2xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={handleAdd} className="px-4 py-2.5 rounded-2xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-700">Save ward</button>
            <button onClick={() => setShowAddForm(false)} className="px-4 py-2.5 rounded-2xl bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {wards.map(ward => (
          <div key={ward.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            {editingId === ward.id ? (
              <div className="space-y-4 animate-fade-in">
                <input value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-primary-500" />
                <input value={formData.location || ''} onChange={e => setFormData({ ...formData, location: e.target.value })} className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-primary-500" />
                <div className="grid grid-cols-3 gap-3">
                  <input type="number" value={Number(formData.min_morning_staff || 0)} onChange={e => setFormData({ ...formData, min_morning_staff: Number(e.target.value) })} className="px-4 py-3 rounded-2xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-primary-500" />
                  <input type="number" value={Number(formData.min_afternoon_staff || 0)} onChange={e => setFormData({ ...formData, min_afternoon_staff: Number(e.target.value) })} className="px-4 py-3 rounded-2xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-primary-500" />
                  <input type="number" value={Number(formData.min_night_staff || 0)} onChange={e => setFormData({ ...formData, min_night_staff: Number(e.target.value) })} className="px-4 py-3 rounded-2xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div className="flex gap-3">
                  <button onClick={handleSave} className="px-4 py-2.5 rounded-2xl bg-accent-600 text-white text-sm font-medium hover:bg-accent-700">Save</button>
                  <button onClick={() => { setEditingId(null); setFormData({}); }} className="px-4 py-2.5 rounded-2xl bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200">Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{ward.name}</h2>
                    <p className="text-sm text-gray-400 mt-1">{ward.location}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(ward)} className="px-3 py-2 rounded-xl border border-gray-200 text-sm hover:bg-gray-50">Edit</button>
                    <button onClick={() => handleDelete(ward.id)} className="px-3 py-2 rounded-xl border border-red-200 text-red-600 text-sm hover:bg-red-50">Delete</button>
                  </div>
                </div>
                <div className="mt-5 grid grid-cols-3 gap-3">
                  <div className="rounded-2xl bg-amber-50 p-4 text-center">
                    <p className="text-2xl font-bold text-amber-600">{ward.min_morning_staff}</p>
                    <p className="text-xs text-gray-500 mt-1">Morning minimum</p>
                  </div>
                  <div className="rounded-2xl bg-emerald-50 p-4 text-center">
                    <p className="text-2xl font-bold text-emerald-600">{ward.min_afternoon_staff}</p>
                    <p className="text-xs text-gray-500 mt-1">Afternoon minimum</p>
                  </div>
                  <div className="rounded-2xl bg-indigo-50 p-4 text-center">
                    <p className="text-2xl font-bold text-indigo-600">{ward.min_night_staff}</p>
                    <p className="text-xs text-gray-500 mt-1">Night minimum</p>
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
