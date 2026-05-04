// ============================================================
// VITASYNC — Auth Context
// ============================================================

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { User, AuthState, Toast } from '../types';
import { store } from '../data/store';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  addToast: (type: Toast['type'], message: string) => void;
  toasts: Toast[];
  removeToast: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const savedUser = localStorage.getItem('vitasync_current_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser) as User;
        const fresh = store.getUserById(parsed.id);
        if (fresh && fresh.is_active) {
          setUser(fresh);
        } else {
          localStorage.removeItem('vitasync_current_user');
        }
      } catch {
        localStorage.removeItem('vitasync_current_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, _password: string): Promise<boolean> => {
    const foundUser = store.getUserByEmail(email);
    if (foundUser && foundUser.is_active) {
      setUser(foundUser);
      localStorage.setItem('vitasync_current_user', JSON.stringify(foundUser));
      addToast('success', `Welcome back, ${foundUser.full_name}!`);
      return true;
    }
    addToast('error', 'Invalid credentials. Try manager@metrohospital.go.ke / any password');
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('vitasync_current_user');
    addToast('info', 'Logged out successfully');
  }, []);

  const addToast = useCallback((type: Toast['type'], message: string) => {
    const id = store.genId();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      addToast,
      toasts,
      removeToast,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
