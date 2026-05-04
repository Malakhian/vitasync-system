// ============================================================
// VITASYNC — Mobile-First Admin Console
// ============================================================

import { useState } from 'react';
import { store } from '../../data/store';
import type { User, UserRole } from '../../types';
import { useAuth } from '../../context/AuthContext';

export function AdminUsersPage() {
  const { user: cu } = useAuth();
  const [users, setUsers] = useState<User[]>(store.getUsers());
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ email: '', full_name: '', phone: '', role: 'nurse' as UserRole });

  const refresh = () => setUsers(store.getUsers());

  const add = () => {
    if (!form.email || !form.full_name) { alert('Required fields'); return; }
    store.createUser({ ...form, is_active: true });
    setShow(false);
    setForm({ email: '', full_name: '', phone: '', role: 'nurse' });
    refresh();
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl lg:text-2xl font-black text-gray-900">Users</h1>
          <p className="text-xs text-gray-400">{users.length} accounts</p>
        </div>
        <button onClick={() => setShow(!show)} className="mobile-btn mobile-btn-primary !w-auto px-4 !py-2.5 text-sm">+ Add</button>
      </div>

      {show && (
        <div className="mobile-sheet lg:relative lg:shadow-sm lg:border lg:border-gray-100 space-y-3">
          <h3 className="font-bold text-gray-900">New User</h3>
          <input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} placeholder="Full Name" className="mobile-input" />
          <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email" className="mobile-input" />
          <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Phone" className="mobile-input" />
          <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value as UserRole })} className="mobile-input">
            <option value="nurse">Nurse</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
          <div className="flex gap-2">
            <button onClick={add} className="flex-1 mobile-btn mobile-btn-primary">Create</button>
            <button onClick={() => setShow(false)} className="flex-1 mobile-btn mobile-btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {users.map(u => (
          <div key={u.id} className="mobile-card">
            <div className="flex items-start gap-3">
              <div className="mobile-avatar bg-primary-50 text-primary-700">{u.full_name.split(' ').map(x => x[0]).join('')}</div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 text-sm">{u.full_name} {u.id === cu?.id && <span className="text-primary-500 text-[10px]">(You)</span>}</p>
                <p className="text-[10px] text-gray-400 mt-0.5 truncate">{u.email}</p>
                <p className="text-[10px] text-gray-400">{u.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
              <span className={`mobile-chip ${u.role === 'admin' ? 'bg-red-100 text-red-700' : u.role === 'manager' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>{u.role}</span>
              <span className={`mobile-chip ${u.is_active ? 'bg-accent-100 text-accent-700' : 'bg-gray-100 text-gray-500'}`}>{u.is_active ? 'Active' : 'Off'}</span>
              {u.id !== cu?.id && (
                <div className="flex gap-2 ml-auto">
                  <button onClick={() => { store.updateUser(u.id, { is_active: !u.is_active }); refresh(); }} className="px-3 py-1.5 rounded-xl text-[10px] font-bold bg-amber-500 text-white active:scale-95">{u.is_active ? 'Disable' : 'Enable'}</button>
                  <button onClick={() => { if (confirm('Delete?')) { store.deleteUser(u.id); refresh(); } }} className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center text-xs">🗑️</button>
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

  const backup = () => {
    const data: Record<string, unknown> = {};
    Object.keys(localStorage).forEach(k => { if (k.startsWith('vitasync_')) { try { data[k] = JSON.parse(localStorage.getItem(k) || ''); } catch { /* ignore */ } } });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'vitasync-backup.json'; a.click();
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      <div>
        <h1 className="text-xl lg:text-2xl font-black text-gray-900">Settings</h1>
        <p className="text-xs text-gray-400">System configuration & audit</p>
      </div>

      <div className="mobile-grid">
        <div className="mobile-card">
          <h3 className="font-bold text-gray-900 text-sm mb-3">System Info</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-gray-400">Version</span><span className="font-bold">VitaSync 2.0</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Hospital</span><span className="font-bold">Metropolitan</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Engine</span><span className="font-bold">CP-SAT</span></div>
          </div>
        </div>

        <div className="mobile-card">
          <h3 className="font-bold text-gray-900 text-sm mb-3">Integrations</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center"><span className="text-gray-400">SMS</span><span className="mobile-chip bg-accent-100 text-accent-700 text-[9px]">Connected</span></div>
            <div className="flex justify-between items-center"><span className="text-gray-400">Email</span><span className="mobile-chip bg-accent-100 text-accent-700 text-[9px]">Active</span></div>
          </div>
        </div>

        <div className="mobile-card">
          <h3 className="font-bold text-gray-900 text-sm mb-3">Utilities</h3>
          <div className="space-y-2">
            <button onClick={backup} className="w-full mobile-btn mobile-btn-primary !py-2.5 text-xs">📥 Export Backup</button>
            <button onClick={() => { if (confirm('Reset all data?')) store.reset(); }} className="w-full mobile-btn !py-2.5 text-xs border border-red-200 text-red-600 rounded-xl font-bold">🗑️ Reset Data</button>
          </div>
        </div>
      </div>

      <div className="mobile-card">
        <h3 className="font-bold text-gray-900 text-sm mb-3">Audit Logs</h3>
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {logs.length === 0 ? (
            <p className="text-center text-xs text-gray-400 py-4">No logs</p>
          ) : (
            logs.map(l => (
              <div key={l.id} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                <span className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${l.type === 'roster' ? 'bg-blue-500' : l.type === 'auth' ? 'bg-emerald-500' : l.type === 'swap' ? 'bg-purple-500' : l.type === 'leave' ? 'bg-amber-500' : 'bg-gray-400'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-800">{l.event}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{l.details}</p>
                  <p className="text-[9px] text-gray-400 mt-1">{new Date(l.timestamp).toLocaleString()}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
