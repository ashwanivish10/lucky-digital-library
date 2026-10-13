import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '../lib/api';

export interface StudentProfile {
  _id: string;
  studentCode: string;
  name: string;
  joiningDate: string;
  status: string;
  registrationStatus: string;
  seatNumber?: string;
}

export interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: 'admin' | 'student';
  studentId?: string;
  requiresPasswordChange?: boolean;
  studentProfile?: StudentProfile;
}

export interface LoginResult {
  requiresPasswordChange: boolean;
  user: User;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  isStudent: boolean;
  login: (identifier: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Try to restore session
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch { /* ignore */ }
    }

    // Verify with server
    authApi.me()
      .then((res) => {
        setUser(res.data.user);
        localStorage.setItem('user', JSON.stringify(res.data.user));
      })
      .catch(() => {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (identifier: string, password: string): Promise<LoginResult> => {
    const res = await authApi.login(identifier, password);
    const { user: u, token, requiresPasswordChange } = res.data;
    const userWithFlag: User = {
      ...u,
      requiresPasswordChange: Boolean(requiresPasswordChange ?? u?.requiresPasswordChange),
    };
    setUser(userWithFlag);
    localStorage.setItem('user', JSON.stringify(userWithFlag));
    if (token) localStorage.setItem('token', token);
    return {
      requiresPasswordChange: Boolean(userWithFlag.requiresPasswordChange),
      user: userWithFlag,
    };
  };

  const updateUser = (updates: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  };

  const logout = async () => {
    await authApi.logout().catch(() => {});
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAdmin: user?.role === 'admin',
        isStudent: user?.role === 'student',
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
