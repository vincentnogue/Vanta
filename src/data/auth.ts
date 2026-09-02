import { useSyncExternalStore } from 'react';
import { supabase } from '@/lib/supabase';

export type KycStatus = 'unverified' | 'pending' | 'verified';
export type UserRole = 'customer' | 'superadmin';
export type AccountType = 'personal' | 'business';

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  kycStatus: KycStatus;
  accountType: AccountType;
};

type AuthState = {
  user: User | null;
  loading: boolean;
  superAdminEmails: string[];
};

export const DEFAULT_SUPER_ADMINS = ['webdxb1@gmail.com', 'vincentnogue2@gmail.com'];

let state: AuthState = { user: null, loading: true, superAdminEmails: [...DEFAULT_SUPER_ADMINS] };
const listeners = new Set<() => void>();

function emit() {
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

export function getCurrentUser(): User | null {
  return state.user;
}

export function onAuthChange(listener: () => void): () => void {
  return subscribe(listener);
}

async function loadProfile(userId: string, fallbackEmail: string): Promise<User> {
  const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  if (!data) {
    return { id: userId, name: fallbackEmail.split('@')[0], email: fallbackEmail, role: 'customer', kycStatus: 'unverified', accountType: 'personal' };
  }
  return {
    id: data.id,
    name: data.full_name || fallbackEmail.split('@')[0],
    email: data.email,
    role: data.role as UserRole,
    kycStatus: data.kyc_status as KycStatus,
    accountType: data.account_type as AccountType,
  };
}

async function refreshSuperAdmins() {
  const { data } = await supabase.from('superadmins').select('email');
  if (data) {
    state = { ...state, superAdminEmails: Array.from(new Set([...DEFAULT_SUPER_ADMINS, ...data.map((d) => d.email as string)])) };
    emit();
  }
}

async function applySession(userId: string | undefined, email: string | undefined) {
  if (userId) {
    const user = await loadProfile(userId, email ?? '');
    state = { ...state, user, loading: false };
    emit();
    if (user.role === 'superadmin') refreshSuperAdmins();
  } else {
    state = { ...state, user: null, loading: false };
    emit();
  }
}

// Resolve the initial session once on load.
supabase.auth.getSession().then(({ data: { session } }) => {
  applySession(session?.user?.id, session?.user?.email);
});

// Keep in sync with sign-in / sign-out / token refresh, including from other tabs.
supabase.auth.onAuthStateChange((_event, session) => {
  applySession(session?.user?.id, session?.user?.email);
});

export async function signUp(email: string, password: string, fullName: string, accountType: AccountType) {
  const { error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: { data: { full_name: fullName.trim(), account_type: accountType } },
  });
  if (error) throw error;
}

export async function signIn(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
  if (error) throw error;
}

export async function signOut() {
  await supabase.auth.signOut();
}

export async function submitKyc() {
  if (!state.user) return;
  const { error } = await supabase.from('profiles').update({ kyc_status: 'pending' }).eq('id', state.user.id);
  if (error) return;
  state = { ...state, user: { ...state.user, kycStatus: 'pending' } };
  emit();
}

export async function approveKyc() {
  if (!state.user) return;
  const { error } = await supabase.from('profiles').update({ kyc_status: 'verified' }).eq('id', state.user.id);
  if (error) return;
  state = { ...state, user: { ...state.user, kycStatus: 'verified' } };
  emit();
}

export function isSuperAdminEmail(email: string): boolean {
  return state.superAdminEmails.includes(email.trim().toLowerCase());
}

export async function addSuperAdmin(email: string) {
  const normalized = email.trim().toLowerCase();
  if (!normalized || state.superAdminEmails.includes(normalized)) return;
  await supabase.from('superadmins').insert({ email: normalized });
  await supabase.from('profiles').update({ role: 'superadmin' }).eq('email', normalized);
  await refreshSuperAdmins();
}

export async function removeSuperAdmin(email: string) {
  const normalized = email.trim().toLowerCase();
  if (DEFAULT_SUPER_ADMINS.includes(normalized)) return;
  await supabase.from('superadmins').delete().eq('email', normalized);
  await supabase.from('profiles').update({ role: 'customer' }).eq('email', normalized);
  await refreshSuperAdmins();
}
