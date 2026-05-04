// ============================================================
// VITASYNC — Responsive Layout
// Mobile-first design with bottom nav (mobile) and sidebar (desktop)
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
  { label: 'Dashboard', icon: '📊', path: '/dashboard', roles: ['manager'] },
  { label: 'Wards', icon: '🏥', path: '/wards', roles: ['manager'] },
  { label: 'Nurses', icon: '👩‍⚕️', path: '/nurses', roles: ['manager'] },
  { label: 'Constraints', icon: '⚙️', path: '/constraints', roles: ['manager'] },
  { label: 'Generate', icon: '📅', path: '/generate', roles: ['manager'] },
  { label: 'Rosters', icon: '📋', path: '/rosters', roles: ['manager'] },
  { label: 'Swaps', icon: '🔄', path: '/swap-requests', roles: ['manager'] },
  { label: 'Reports', icon: '📈', path: '/reports', roles: ['manager'] },
  { label: 'Schedule', icon: '📅', path: '/my-schedule', roles: ['nurse'] },
  { label: 'Leave', icon: '🏖️', path: '/leave', roles: ['nurse'] },
  { label: 'Swap', icon: '🔄', path: '/swap', roles: ['nurse'] },
  { label: 'Users', icon: '👥', path: '/admin/users', roles: ['admin'] },
  { label: 'Settings', icon: '🔧', path: '/admin/settings', roles: ['admin'] },
];

export function Layout({ children }: LayoutProps) {
  const { user, logout, toasts, removeToast } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null;

  const filteredNav = NAV_ITEMS.filter(item => item.roles.includes(user.role));
  
  // Bottom nav shows first 4-5 items on mobile
  const bottomNavItems = filteredNav.slice(0, 5);
  const moreNavItems = filteredNav.slice(5);

  const notifications = useMemo(
    () => store.getNotificationsByUser(user.id).sort((a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime()).slice(0, 10),
    [user.id, toasts]
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar - Hidden on mobile */}
      <aside className={`hidden lg:flex lg:flex-col fixed left-0 top-0 h-screen bg-gradient-to-b from-primary-900 to-primary-950 text-white transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'} shadow-xl z-30`}>
        <div className="flex items-center gap-3 px-4 py-5 border-b border-primary-800">
          <div className="w-10 h-10 bg-accent-500 rounded-xl flex items-center justify-center font-bold text-sm shrink-0">VS</div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <h1 className="text-lg font-bold tracking-tight">VitaSync</h1>
              <p className="text-[10px] text-primary-300 -mt-0.5">Metropolitan Hospital</p>
            </div>
          )}
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          {filteredNav.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-xl transition-all text-sm ${
                location.pathname === item.path
                  ? 'bg-primary-700 text-white shadow-lg'
                  : 'text-primary-200 hover:bg-primary-800 hover:text-white'
              }`}
            >
              <span className="text-lg shrink-0">{item.icon}</span>
              {sidebarOpen && <span className="truncate">{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="border-t border-primary-800 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-700 rounded-xl flex items-center justify-center text-xs font-bold shrink-0">
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
            <button onClick={handleLogout} className="w-full mt-3 flex items-center justify-center gap-2 px-3 py-2.5 bg-primary-800 hover:bg-primary-700 rounded-xl text-sm transition-colors">
              🚪 Logout
            </button>
          )}
        </div>
      </aside>

      {/* Mobile Header - Shown only on mobile */}
      <header className="lg:hidden mobile-header safe-top">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-xs">VS</div>
            <div>
              <h1 className="text-base font-bold text-gray-900 leading-tight">VitaSync</h1>
              <p className="text-[10px] text-gray-400">Metropolitan Hospital</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center"
            >
              🔔
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-danger-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold">
                  {Math.min(notifications.length, 9)}
                </span>
              )}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center"
            >
              <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-xs font-bold text-primary-700">
                {user.full_name.split(' ').map(n => n[0]).join('')}
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Notifications Dropdown */}
        {notificationsOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 mx-4 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-fade-in z-50 max-h-[60vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <h3 className="font-bold text-sm text-gray-900">Notifications</h3>
            </div>
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-400">No notifications</div>
            ) : (
              notifications.map(n => (
                <div key={n.id} className="p-4 border-b border-gray-50">
                  <p className="text-sm font-semibold text-gray-800">{n.subject}</p>
                  <p className="text-xs text-gray-500 mt-1">{n.body}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{new Date(n.sent_at).toLocaleDateString()}</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* Mobile User Menu */}
        {mobileMenuOpen && (
          <div className="absolute top-full right-0 mt-2 mr-4 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-fade-in z-50 w-64">
            <div className="p-4 border-b border-gray-100 bg-primary-50">
              <p className="font-bold text-sm text-gray-900">{user.full_name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
              <p className="text-[10px] text-primary-600 font-semibold uppercase mt-1">{user.role}</p>
            </div>
            {moreNavItems.length > 0 && (
              <div className="p-2 border-b border-gray-100">
                {moreNavItems.map(item => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm ${
                      location.pathname === item.path ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-gray-600'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            )}
            <div className="p-2">
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50">
                <span>🚪</span>
                <span className="font-semibold">Logout</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Desktop Header */}
      <div className="hidden lg:flex lg:fixed lg:top-0 lg:right-0 lg:left-20 bg-white border-b border-gray-200 px-6 py-3 items-center justify-between shadow-sm z-20">
        <div className="flex items-center gap-4">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
            {sidebarOpen ? '◀' : '▶'}
          </button>
          <div>
            <h2 className="text-base font-semibold text-gray-800">Metropolitan Hospital — VitaSync</h2>
            <p className="text-xs text-gray-400">Nurse Scheduling & Roster Management</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2 rounded-xl border border-gray-200 hover:bg-gray-50"
          >
            🔔
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-danger-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold">
                {Math.min(notifications.length, 9)}
              </span>
            )}
          </button>
          <span className="text-xs text-gray-400">
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>

        {notificationsOpen && (
          <div className="absolute top-full right-4 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-fade-in z-50 max-h-[500px] overflow-y-auto">
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <h3 className="font-bold text-sm text-gray-900">Notifications</h3>
            </div>
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-400">No notifications</div>
            ) : (
              notifications.map(n => (
                <div key={n.id} className="p-4 border-b border-gray-50 hover:bg-gray-50">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{n.subject}</p>
                      <p className="text-xs text-gray-500 mt-1">{n.body}</p>
                    </div>
                    <span className="text-[10px] text-gray-400 shrink-0">{new Date(n.sent_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <main className="lg:ml-20 lg:pt-16 min-h-screen">
        <div className="mobile-page lg:p-6">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden mobile-nav safe-bottom">
        <div className="flex items-center justify-around px-2">
          {bottomNavItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`mobile-nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="nav-icon text-xl transition-transform">{item.icon}</span>
              <span className="truncate max-w-[60px]">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg text-sm animate-fade-in ${
              toast.type === 'success' ? 'bg-accent-600 text-white' :
              toast.type === 'error' ? 'bg-danger-500 text-white' :
              toast.type === 'warning' ? 'bg-warning-500 text-white' :
              'bg-gray-800 text-white'
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

      {/* Mobile overlay for menus */}
      {(mobileMenuOpen || notificationsOpen) && (
        <div
          className="lg:hidden fixed inset-0 bg-black/20 z-40"
          onClick={() => { setMobileMenuOpen(false); setNotificationsOpen(false); }}
        />
      )}
    </div>
  );
}
