// ============================================================
// VITASYNC — Login Page
// ============================================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { store } from '../data/store';

const DEMO_ACCOUNTS = [
  { email: 'manager@metrohospital.go.ke', label: 'Ward Manager', role: 'manager' },
  { email: 'nurse1@metrohospital.go.ke', label: 'Staff Nurse (James)', role: 'nurse' },
  { email: 'nurse5@metrohospital.go.ke', label: 'Staff Nurse (David)', role: 'nurse' },
  { email: 'admin@metrohospital.go.ke', label: 'System Admin', role: 'admin' },
];

function getHomePath(email: string) {
  const account = store.getUserByEmail(email);
  if (!account) return '/login';

  switch (account.role) {
    case 'manager':
      return '/dashboard';
    case 'nurse':
      return '/my-schedule';
    case 'admin':
      return '/admin/users';
    default:
      return '/login';
  }
}

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsSubmitting(true);
    const success = await login(email, password);
    if (success) {
      navigate(getHomePath(email));
    }
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
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-950 flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }} />
      </div>

      <div className="relative w-full max-w-4xl flex bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
        {/* Left panel - branding */}
        <div className="hidden lg:flex flex-col items-center justify-center w-1/2 bg-gradient-to-br from-primary-800 to-primary-900 text-white p-12">
          <div className="w-20 h-20 bg-accent-500 rounded-2xl flex items-center justify-center text-3xl font-bold mb-6 shadow-lg">
            VS
          </div>
          <h1 className="text-4xl font-bold mb-2">VitaSync</h1>
          <p className="text-primary-300 text-lg mb-6">Metropolitan Hospital</p>
          <div className="space-y-4 w-full max-w-xs">
            <div className="flex items-center gap-3 text-sm text-primary-200">
              <span className="text-lg">📅</span> Automated Roster Generation
            </div>
            <div className="flex items-center gap-3 text-sm text-primary-200">
              <span className="text-lg">⚙️</span> Constraint-Based Scheduling
            </div>
            <div className="flex items-center gap-3 text-sm text-primary-200">
              <span className="text-lg">📊</span> Fairness Analytics
            </div>
            <div className="flex items-center gap-3 text-sm text-primary-200">
              <span className="text-lg">🔄</span> Shift Swap Management
            </div>
          </div>
        </div>

        {/* Right panel - login form */}
        <div className="w-full lg:w-1/2 p-8 lg:p-12">
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center text-2xl font-bold text-white mx-auto mb-3">
              VS
            </div>
            <h1 className="text-2xl font-bold text-gray-800">VitaSync</h1>
            <p className="text-sm text-gray-400">Metropolitan Hospital</p>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-1">Welcome back</h2>
          <p className="text-sm text-gray-400 mb-8">Sign in to your VitaSync account</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@metrohospital.go.ke"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all text-sm pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-medium rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin-slow">⏳</span> Signing in...
                </>
              ) : 'Sign In'}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-400 mb-3 uppercase tracking-wider">Demo Accounts</p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map(acct => (
                <button
                  key={acct.email}
                  onClick={() => quickLogin(acct.email)}
                  className="px-3 py-2 bg-gray-50 hover:bg-primary-50 border border-gray-200 hover:border-primary-200 rounded-lg text-left transition-all group"
                >
                  <p className="text-xs font-medium text-gray-700 group-hover:text-primary-700 truncate">{acct.label}</p>
                  <p className="text-[10px] text-gray-400 truncate">{acct.email}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
