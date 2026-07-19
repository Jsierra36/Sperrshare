import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import i18n from '@/i18n';

type User = {
  id: string;
  name: string;
  email: string;
};

type ProfileUpdate = {
  name: string;
  email: string;
};

type AuthContextValue = {
  user: User | null;
  isReady: boolean;
  login: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (update: ProfileUpdate) => Promise<void>;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

const AuthContext = createContext<AuthContextValue | null>(null);
const STORAGE_KEY = 'sperrshare.auth.user';

// Demo-only mock auth. Real auth (Supabase) is the next step — see docs/roadmap.md.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) setUser(JSON.parse(raw));
      setIsReady(true);
    });
  }, []);

  const login = async (name: string, email: string, password: string) => {
    // Client-side validation only — the real check (hashing, rate limiting, etc.)
    // happens server-side once Supabase Auth is wired in (see docs/roadmap.md).
    // The password itself is never stored anywhere, not even here.
    const trimmedName = name.trim().slice(0, 60);
    const trimmedEmail = email.trim().toLowerCase().slice(0, 120);
    if (!trimmedName) throw new Error(i18n.t('errors.name_required'));
    if (!EMAIL_RE.test(trimmedEmail)) throw new Error(i18n.t('errors.invalid_email'));
    if (password.length < MIN_PASSWORD_LENGTH) {
      throw new Error(i18n.t('errors.password_too_short', { count: MIN_PASSWORD_LENGTH }));
    }
    const newUser: User = { id: `user-${Date.now()}`, name: trimmedName, email: trimmedEmail };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    setUser(newUser);
  };

  const logout = async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  const updateProfile = async (update: ProfileUpdate) => {
    if (!user) return;
    const trimmedName = update.name.trim().slice(0, 60);
    const trimmedEmail = update.email.trim().toLowerCase().slice(0, 120);
    if (!trimmedName) throw new Error(i18n.t('errors.name_required'));
    if (!EMAIL_RE.test(trimmedEmail)) throw new Error(i18n.t('errors.invalid_email'));
    const updated: User = { ...user, name: trimmedName, email: trimmedEmail };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, isReady, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
