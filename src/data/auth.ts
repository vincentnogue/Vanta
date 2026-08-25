import { useSyncExternalStore } from 'react';

export type KycStatus = 'unverified' | 'pending' | 'verified';
export type UserRole = 'customer' | 'superadmin';

export type User = {
  name: string;
  email: string;
  role: UserRole;
  kycStatus: KycStatus;
};

type AuthState = {
  user: User | null;
  superAdminEmails: string[];
};

const STORAGE_KEY = 'vanta-auth-v1';

export const DEFAULT_SUPER_ADMINS = ['webdxb1@gmail.com', 'vincentnogue2@gmail.com'];

function load(): AuthState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AuthState;
      if (parsed && Array.isArray(parsed.superAdminEmails)) {
        return {
          user: parsed.user ?? null,
          superAdminEmails: Array.from(new Set([...DEFAULT_SUPER_ADMINS, ...parsed.superAdminEmails])),
        };
      }
    }
  } catch {
    // corrupted storage — fall back to defaults
  }
  return { user: null, superAdminEmails: [...DEFAULT_SUPER_ADMINS] };
}

let state: AuthState = load();
const listeners = new Set<() => void>();

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage unavailable — state still works in memory
  }
}

function emit() {
  persist();
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return state;
}

export function useAuth(): AuthState {
  return useSyncExternalStore(subscribe, getSnapshot);
}

export function isSuperAdminEmail(email: string): boolean {
  return state.superAdminEmails.includes(email.trim().toLowerCase());
}

export function signIn(email: string, name?: string) {
  const normalized = email.trim().toLowerCase();
  state = {
    ...state,
    user: {
      name: name?.trim() || normalized.split('@')[0],
      email: normalized,
      role: isSuperAdminEmail(normalized) ? 'superadmin' : 'customer',
      kycStatus: state.user?.email === normalized ? state.user.kycStatus : 'unverified',
    },
  };
  emit();
}

export function signOut() {
  state = { ...state, user: null };
  emit();
}

export function submitKyc() {
  if (!state.user) return;
  state = { ...state, user: { ...state.user, kycStatus: 'pending' } };
  emit();
}

export function approveKyc() {
  if (!state.user) return;
  state = { ...state, user: { ...state.user, kycStatus: 'verified' } };
  emit();
}

export function addSuperAdmin(email: string) {
  const normalized = email.trim().toLowerCase();
  if (!normalized || state.superAdminEmails.includes(normalized)) return;
  state = { ...state, superAdminEmails: [...state.superAdminEmails, normalized] };
  emit();
}

export function removeSuperAdmin(email: string) {
  const normalized = email.trim().toLowerCase();
  if (DEFAULT_SUPER_ADMINS.includes(normalized)) return;
  state = { ...state, superAdminEmails: state.superAdminEmails.filter((e) => e !== normalized) };
  emit();
}
