// ============================================================
// VITASYNC — Main Layout with Sidebar & Header
// ============================================================

import { useMemo, useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { store } from '../data/store';

interface LayoutProps {
  children: ReactNode;
}

interface NavItem {
  label: string;
  icon: string;
  path: string;
  roles: string[];
}

const NAV_ITEMS: NavItem[] = [
  // Manager
  { label: 'Dashboard', icon: '📊', path: '/dashboard', roles: ['manager'] },
  { label: 'Wards', icon: '🏥', path: '/wards', roles: ['manager'] },
  { label: 'Nurses', icon: '👩‍⚕️', path: '/nurses', roles: ['manager'] },
  { label: 'Constraints', icon: '⚙️', path: '/constraints', roles: ['manager'] },
  { label: 'Generate Roster', icon: '📅', path: '/generate', roles: ['manager'] },
  { label: 'Rosters', icon: '📋', path: '/rosters', roles: ['manager'] },
  { label: 'Swap Requests', icon: '🔄', path: '/swap-requests', roles: ['manager'] },
  { label: 'Reports', icon: '📈', path: '/reports', roles: ['manager'] },
  // Nurse
  { label: 'My Schedule', icon: '📅', path: '/my-schedule', roles: ['nurse'] },
  { label: 'Leave Requests', icon: '🏖️', path: '/leave', roles: ['nurse'] },
  { label: 'Shift Swap', icon: '🔄', path: '/swap', roles: ['nurse'] },
  // Admin
  { label: 'User Management', icon: '👥', path: '/admin/users', roles: ['admin'] },
  { label: 'System Settings', icon: '🔧', path: '/admin/settings', roles: ['admin'] },
];

export function Layout({ children }: LayoutProps) {
  const { user, logout, toasts, removeToast } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null;

  const filteredNav = NAV_ITEMS.filter(item => item.roles.includes(user.role));
  const notifications = useMemo(
    () => store.getNotificationsByUser(user.id).sort((a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime()),
    [user.id, toasts]
  );
  const unreadCount = notifications.filter(n => n.status !== 'failed').length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`bg-gradient-to-b from-primary-900 to-primary-950 text-white transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-16'
        } flex flex-col shadow-xl z-20`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-primary-800">
          <div className="w-8 h-8 bg-accent-500 rounded-lg flex items-center justify-center font-bold text-sm shrink-0">
            VS
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <h1 className="text-lg font-bold tracking-tight">VitaSync</h1>
              <p className="text-[10px] text-primary-300 -mt-0.5">Metropolitan Hospital</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {filteredNav.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg transition-all text-sm ${
                location.pathname === item.path
                  ? 'bg-primary-700 text-white shadow-lg shadow-primary-900/30'
                  : 'text-primary-200 hover:bg-primary-800 hover:text-white'
              }`}
            >
              <span className="text-lg shrink-0">{item.icon}</span>
              {sidebarOpen && <span className="truncate">{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* User section */}
        <div className="border-t border-primary-800 p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
              {user.full_name.split(' ').map(n => n[0]).join('')}
            </div>
            {sidebarOpen && (
              <div className="overflow-hidden flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.full_name}</p>
                <p className="text-[10px] text-primary-400 capitalize">{user.role}</p>
              </div>
            )}
          </div>
          {sidebarOpen && (
            <button
              onClick={handleLogout}
              className="w-full mt-3 flex items-center justify-center gap-2 px-3 py-2 bg-primary-800 hover:bg-primary-700 rounded-lg text-sm transition-colors"
            >
              <span>🚪</span> Logout
            </button>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
            >
              {sidebarOpen ? '◀' : '▶'}
            </button>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Metropolitan Hospital — VitaSync
              </h2>
              <p className="text-xs text-gray-400">Nurse Scheduling & Roster Management</p>
            </div>
          </div>
          <div className="flex items-center gap-4 relative">
            <button
              onClick={() => setNotificationsOpen(open => !open)}
              className="relative p-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
              aria-label="Notifications"
            >
              <span className="text-base">🔔</span>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-danger-500 text-white text-[10px] flex items-center justify-center font-semibold">
                  {Math.min(unreadCount, 9)}+
                </span>
              )}
            </button>
            <span className="text-xs text-gray-400">
              {new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>

            {notificationsOpen && (
              <div className="absolute top-12 right-0 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-fade-in z-40">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-800 text-sm">Notifications</h3>
                    <p className="text-[11px] text-gray-400">SMS, email, and in-app delivery history</p>
                  </div>
                  <span className="text-[11px] px-2 py-1 rounded-full bg-primary-50 text-primary-700 font-medium">
                    {notifications.length} items
                  </span>
                </div>
                <div className="max-h-96 overflow-y-auto divide-y divide-gray-100">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-sm text-gray-400">No notifications yet.</div>
                  ) : (
                    notifications.map(notification => (
                      <div key={notification.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide ${
                                notification.type === 'sms'
                                  ? 'bg-amber-100 text-amber-700'
                                  : notification.type === 'email'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-emerald-100 text-emerald-700'
                              }`}>
                                {notification.type}
                              </span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                notification.status === 'sent'
                                  ? 'bg-accent-100 text-accent-700'
                                  : notification.status === 'failed'
                                    ? 'bg-danger-100 text-danger-700'
                                    : 'bg-gray-100 text-gray-600'
                              }`}>
                                {notification.status}
                              </span>
                            </div>
                            <p className="text-sm font-medium text-gray-800">{notification.subject}</p>
                            <p className="text-xs text-gray-500 mt-1 leading-relaxed">{notification.body}</p>
                          </div>
                          <span className="text-[10px] text-gray-400 shrink-0">
                            {new Date(notification.sent_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>

      {/* Toasts */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-sm animate-fade-in max-w-sm ${
              toast.type === 'success' ? 'bg-accent-600 text-white' :
              toast.type === 'error' ? 'bg-danger-500 text-white' :
              toast.type === 'warning' ? 'bg-warning-500 text-white' :
              'bg-gray-700 text-white'
            }`}
          >
            <span className="text-base">
              {toast.type === 'success' ? '✓' : toast.type === 'error' ? '✗' : toast.type === 'warning' ? '⚠' : 'ℹ'}
            </span>
            <span className="flex-1">{toast.message}</span>
            <button onClick={() => removeToast(toast.id)} className="opacity-70 hover:opacity-100">✕</button>
          </div>
        ))}
      </div>
    </div>
  );
}
