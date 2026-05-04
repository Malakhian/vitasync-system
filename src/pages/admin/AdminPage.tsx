// ============================================================
// VITASYNC — Advanced Admin Management Console
// Full control over system users, access, and audit traces
// ============================================================

import { useState } from 'react';
import { store } from '../../data/store';
import type { User, UserRole } from '../../types';
import { useAuth } from '../../context/AuthContext';

export function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>(store.getUsers());
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ email: '', full_name: '', phone: '', role: 'nurse' as UserRole });

  const refresh = () => {
    setUsers(store.getUsers());
  };

  const handleAdd = () => {
    if (!form.email || !form.full_name) {
      alert('Please fill in required fields.');
      return;
    }
    store.createUser({ ...form, is_active: true });
    setShowAdd(false);
    setForm({ email: '', full_name: '', phone: '', role: 'nurse' });
    refresh();
  };

  const toggleActive = (u: User) => {
    store.updateUser(u.id, { is_active: !u.is_active });
    refresh();
  };

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this user? This cannot be undone.')) return;
    store.deleteUser(id);
    refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Access Matrix</h1>
          <p className="text-sm text-gray-400">Add or manage credentials, change active statuses, and update permissions.</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="px-4 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors shadow-sm"
        >
          {showAdd ? 'Cancel Form' : '+ Add Workspace User'}
        </button>
      </div>

      {showAdd && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm animate-fade-in max-w-4xl space-y-4">
          <h3 className="font-bold text-gray-800 text-base">Register System Account</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
              className="px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500" />
            <input placeholder="Full Name" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })}
              className="px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500" />
            <input placeholder="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
              className="px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500" />
            <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value as UserRole })}
              className="px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none">
              <option value="nurse">Nurse</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleAdd} className="px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-bold shadow-sm">Save User</button>
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-100">
        {users.map(u => (
          <div key={u.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center text-sm font-bold text-primary-700 shrink-0">
                {u.full_name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <p className="font-bold text-gray-800 leading-tight">
                  {u.full_name} {u.id === currentUser?.id && <span className="text-xs text-primary-500 font-semibold">(Active Admin Session)</span>}
                </p>
                <p className="text-xs text-gray-400 mt-1">{u.email} • {u.phone}</p>
                <p className="text-[10px] text-gray-300 mt-0.5">Profile Key: {u.id}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end md:self-center">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                u.role === 'admin' ? 'bg-red-50 text-red-700 border border-red-200' :
                u.role === 'manager' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}>{u.role}</span>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                u.is_active ? 'bg-accent-50 text-accent-700 border border-accent-200' : 'bg-gray-100 text-gray-600 border border-gray-200'
              }`}>
                {u.is_active ? 'Active' : 'Deactivated'}
              </span>
              {u.id !== currentUser?.id && (
                <div className="flex gap-2">
                  <button onClick={() => toggleActive(u)} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    u.is_active ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-accent-600 text-white hover:bg-accent-700'
                  }`}>
                    {u.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button onClick={() => handleDelete(u.id)} className="px-3 py-1.5 rounded-xl border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-50 transition-colors">
                    🗑️
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminSettingsPage() {
  const [logs] = useState(store.getLogs());

  const exportBackup = () => {
    const data: Record<string, unknown> = {};
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('vitasync_')) {
        try {
          data[key] = JSON.parse(localStorage.getItem(key) || '');
        } catch {
          // ignore parsing error
        }
      }
    });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vitasync-data-backup.json';
    a.click();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Workforce Configuration</h1>
        <p className="text-sm text-gray-400">Audit telemetry traces, verify backups, and view server performance metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-gray-800 text-base mb-1">System Topology</h3>
            <p className="text-xs text-gray-400 mb-4">Underlying environment metadata</p>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Software Suite</span>
                <span className="font-bold text-gray-700">VitaSync Advanced Edition</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Organization</span>
                <span className="font-bold text-gray-700">Metropolitan Hospital</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Core Runtime</span>
                <span className="font-bold text-gray-700">React + TS Client</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Optimization Engine</span>
                <span className="font-bold text-gray-700">CP-SAT Graph/Backtracker</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-gray-800 text-base mb-1">Gateways & Integrations</h3>
            <p className="text-xs text-gray-400 mb-4">External transactional API bindings</p>
            <div className="space-y-3">
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">SMS Notifications</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-800">Africa's Talking SDK</span>
                  <span className="text-[10px] bg-accent-50 text-accent-700 border border-accent-200 px-2 py-0.5 rounded-full font-bold uppercase">Sandbox API Connected</span>
                </div>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Email Delivery</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-800">aiosmtplib (Async)</span>
                  <span className="text-[10px] bg-accent-50 text-accent-700 border border-accent-200 px-2 py-0.5 rounded-full font-bold uppercase">Transport Bound</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-gray-800 text-base mb-1">Administrative Utilities</h3>
            <p className="text-xs text-gray-400 mb-4">Operational data maintenance</p>
            <div className="space-y-2">
              <button
                onClick={exportBackup}
                className="w-full px-4 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors shadow-sm"
              >
                📥 Export Workstation Backup
              </button>
              <button
                onClick={() => { if (confirm('Purge all data from LocalStorage? The application will reset defaults.')) store.reset(); }}
                className="w-full px-4 py-2.5 border border-red-200 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-50 transition-colors"
              >
                🗑️ Clear Workspace Storage
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h3 className="font-bold text-gray-800 text-sm">Trace Logs Timeline</h3>
        </div>
        <div className="divide-y divide-gray-100 max-h-[360px] overflow-y-auto">
          {logs.length === 0 ? (
            <p className="text-center text-sm p-8 text-gray-400">No transactions recorded.</p>
          ) : (
            logs.map(lg => (
              <div key={lg.id} className="p-4 flex items-start gap-4 hover:bg-gray-50/40 transition-colors">
                <span className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${
                  lg.type === 'roster' ? 'bg-blue-500' :
                  lg.type === 'auth' ? 'bg-emerald-500' :
                  lg.type === 'swap' ? 'bg-purple-500' :
                  lg.type === 'leave' ? 'bg-amber-500' : 'bg-gray-400'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-gray-800 text-xs">{lg.event}</p>
                    <span className="text-[10px] text-gray-400">{new Date(lg.timestamp).toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{lg.details}</p>
                  <p className="text-[10px] text-gray-400 mt-1">Source context: <span className="font-semibold text-gray-600">{lg.user}</span></p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
