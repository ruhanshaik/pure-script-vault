import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const VALID_CREDENTIALS = { email: 'Admin@gmail.com', password: 'GMI@0312' };
const AUTH_KEY = 'purerx_auth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>(() => {
    if (typeof window === 'undefined') return { user: null, isAuthenticated: false };
    const stored = localStorage.getItem(AUTH_KEY);
    if (stored) {
      try { return JSON.parse(stored); } catch { return { user: null, isAuthenticated: false }; }
    }
    return { user: null, isAuthenticated: false };
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
  }, [auth]);

  const login = useCallback((email: string, password: string): boolean => {
    if (email === VALID_CREDENTIALS.email && password === VALID_CREDENTIALS.password) {
      setAuth({
        user: { id: 'u1', name: 'Admin User', email, role: 'Admin', isActive: true },
        isAuthenticated: true,
      });
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setAuth({ user: null, isAuthenticated: false });
    localStorage.removeItem(AUTH_KEY);
  }, []);

  return (
    <AuthContext value={{ ...auth, login, logout }}>
      {children}
    </AuthContext>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
