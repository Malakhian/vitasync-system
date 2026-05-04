// ============================================================
// VITASYNC — Mobile-First Login Page
// Responsive design for all screen sizes
// ============================================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { store } from '../data/store';

const DEMO_ACCOUNTS = [
  { email: 'manager@metrohospital.go.ke', label: 'Ward Manager', icon: '👩‍⚕️', color: 'bg-blue-50 border-blue-200' },
  { email: 'nurse1@metrohospital.go.ke', label: 'Staff Nurse', icon: '💉', color: 'bg-emerald-50 border-emerald-200' },
  { email: 'admin@metrohospital.go.ke', label: 'System Admin', icon: '🔐', color: 'bg-purple-50 border-purple-200' },
];

function getHomePath(email: string) {
  const account = store.getUserByEmail(email);
  if (!account) return '/login';
  switch (account.role) {
    case 'manager': return '/dashboard';
    case 'nurse': return '/my-schedule';
    case 'admin': return '/admin/users';
    default: return '/login';
  }
}

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsSubmitting(true);
    const success = await login(email, password);
    if (success) navigate(getHomePath(email));
    setIsSubmitting(false);
  };

  const quickLogin = (acctEmail: string) => {
    setEmail(acctEmail);
    setPassword('password123');
    setTimeout(() => {
      login(acctEmail, 'password123').then(success => {
        if (success) navigate(getHomePath(acctEmail));
      });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-950 flex flex-col safe-top safe-bottom">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }} />
      </div>

      {/* Mobile-first layout */}
      <div className="relative flex-1 flex flex-col justify-center p-4 sm:p-6 md:p-8 max-w-lg mx-auto w-full">
        {/* Logo & Branding */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-4 border border-white/20 shadow-2xl">
            <span className="text-3xl font-black text-white">VS</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">VitaSync</h1>
          <p className="text-primary-300 text-sm mt-1">Metropolitan Hospital</p>
          <p className="text-primary-400 text-xs mt-3">Nurse Scheduling & Workforce Management</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 animate-fade-in">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Welcome back</h2>
          <p className="text-sm text-gray-400 mb-6">Sign in to continue</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@metrohospital.go.ke"
                className="mobile-input"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="mobile-input"
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mobile-btn mobile-btn-primary mt-2"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin-slow">⏳</span> Signing in...
                </>
              ) : (
                <>Sign In</>
              )}
            </button>
          </form>

          {/* Quick Login - Demo Accounts */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider text-center">Quick Demo Access</p>
            <div className="space-y-2">
              {DEMO_ACCOUNTS.map(acct => (
                <button
                  key={acct.email}
                  onClick={() => quickLogin(acct.email)}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl border ${acct.color} hover:shadow-md transition-all active:scale-[0.98]`}
                >
                  <span className="text-xl">{acct.icon}</span>
                  <div className="text-left flex-1">
                    <p className="text-sm font-bold text-gray-800">{acct.label}</p>
                    <p className="text-[10px] text-gray-400">{acct.email}</p>
                  </div>
                  <span className="text-gray-300">→</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-primary-400 text-[10px] mt-6">
          VitaSync v2.0 • Metropolitan Hospital • Secure Access
        </p>
      </div>
    </div>
  );
}
