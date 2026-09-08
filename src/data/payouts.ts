import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/data/auth';
import { refreshStore } from '@/data/store';

export type BankAccount = {
  id: string;
  accountHolder: string;
  bankName: string;
  accountNumber: string;
  currency: string;
  country: string | null;
  isDefault: boolean;
};

export type Payout = {
  id: string;
  amount: number;
  currency: string;
  status: 'requested' | 'processing' | 'paid' | 'failed' | 'cancelled';
  requestedAt: string;
  settledAt: string | null;
  bankAccountId: string;
};

export type AdminPayout = Payout & {
  userId: string;
  userName: string;
  userEmail: string;
  bankName: string;
  accountNumber: string;
};

function nextPayoutId(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(Math.random() * 900000000 + 100000000);
  return `PYT-${date}-${rand}`;
}

export async function listBankAccounts(): Promise<BankAccount[]> {
  const user = getCurrentUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from('bank_accounts')
    .select('id, account_holder, bank_name, account_number, currency, country, is_default')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((b) => ({
    id: b.id,
    accountHolder: b.account_holder,
    bankName: b.bank_name,
    accountNumber: b.account_number,
    currency: b.currency,
    country: b.country,
    isDefault: b.is_default,
  }));
}

function toRow(input: { accountHolder: string; bankName: string; accountNumber: string; currency: string; country?: string }) {
  return {
    account_holder: input.accountHolder,
    bank_name: input.bankName,
    account_number: input.accountNumber,
    currency: input.currency,
    country: input.country ?? null,
  };
}

export async function addBankAccount(input: {
  accountHolder: string;
  bankName: string;
  accountNumber: string;
  currency: string;
  country?: string;
}): Promise<BankAccount> {
  const user = getCurrentUser();
  if (!user) throw new Error('Not signed in');
  const { data: existing } = await supabase.from('bank_accounts').select('id').eq('user_id', user.id).limit(1);
  const isFirst = !existing || existing.length === 0;
  const { data, error } = await supabase
    .from('bank_accounts')
    .insert({ user_id: user.id, ...toRow(input), is_default: isFirst })
    .select('id, account_holder, bank_name, account_number, currency, country, is_default')
    .single();
  if (error) throw error;
  return {
    id: data.id,
    accountHolder: data.account_holder,
    bankName: data.bank_name,
    accountNumber: data.account_number,
    currency: data.currency,
    country: data.country,
    isDefault: data.is_default,
  };
}

export async function listPayouts(): Promise<Payout[]> {
  const user = getCurrentUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from('payouts')
    .select('id, amount, currency, status, requested_at, settled_at, bank_account_id')
    .eq('user_id', user.id)
    .order('requested_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((p) => ({
    id: p.id,
    amount: Number(p.amount),
    currency: p.currency,
    status: p.status,
    requestedAt: p.requested_at,
    settledAt: p.settled_at,
    bankAccountId: p.bank_account_id,
  }));
}

/** Requests a payout: moves the amount from available to pending right
 * away (real balance movement, not decoration) — it only truly leaves the
 * platform once a superadmin marks it paid after actually wiring the funds. */
export async function requestPayout(bankAccountId: string, amount: number, currency: string): Promise<{ ok: boolean; error?: string }> {
  const user = getCurrentUser();
  if (!user) return { ok: false, error: 'Not signed in' };

  const { data: balRow } = await supabase.from('balances').select('*').eq('user_id', user.id).eq('currency', currency).maybeSingle();
  if (!balRow || Number(balRow.available) < amount) {
    return { ok: false, error: 'insufficient' };
  }

  const id = nextPayoutId();
  const { error: payoutError } = await supabase.from('payouts').insert({
    id, user_id: user.id, bank_account_id: bankAccountId, amount, currency, status: 'requested',
  });
  if (payoutError) return { ok: false, error: payoutError.message };

  await supabase.from('balances').update({
    available: Number(balRow.available) - amount,
    pending: Number(balRow.pending) + amount,
  }).eq('user_id', user.id).eq('currency', currency);

  refreshStore();
  return { ok: true };
}

export async function cancelPayout(payout: Payout) {
  const user = getCurrentUser();
  if (!user || payout.status !== 'requested') return;
  await supabase.from('payouts').update({ status: 'cancelled' }).eq('id', payout.id).eq('user_id', user.id);

  const { data: balRow } = await supabase.from('balances').select('*').eq('user_id', user.id).eq('currency', payout.currency).maybeSingle();
  if (balRow) {
    await supabase.from('balances').update({
      available: Number(balRow.available) + payout.amount,
      pending: Math.max(0, Number(balRow.pending) - payout.amount),
    }).eq('user_id', user.id).eq('currency', payout.currency);
  }
  refreshStore();
}

// --- Admin: settlement queue across every merchant ---

export async function fetchPendingPayouts(): Promise<AdminPayout[]> {
  const { data: payouts, error } = await supabase
    .from('payouts')
    .select('id, amount, currency, status, requested_at, settled_at, bank_account_id, user_id')
    .in('status', ['requested', 'processing'])
    .order('requested_at', { ascending: true });
  if (error) throw error;
  if (!payouts || payouts.length === 0) return [];

  const userIds = [...new Set(payouts.map((p) => p.user_id))];
  const bankIds = [...new Set(payouts.map((p) => p.bank_account_id))];
  const [{ data: profiles }, { data: banks }] = await Promise.all([
    supabase.from('profiles').select('id, full_name, email').in('id', userIds),
    supabase.from('bank_accounts').select('id, bank_name, account_number').in('id', bankIds),
  ]);
  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));
  const bankById = new Map((banks ?? []).map((b) => [b.id, b]));

  return payouts.map((p) => {
    const profile = profileById.get(p.user_id);
    const bank = bankById.get(p.bank_account_id);
    return {
      id: p.id,
      amount: Number(p.amount),
      currency: p.currency,
      status: p.status,
      requestedAt: p.requested_at,
      settledAt: p.settled_at,
      bankAccountId: p.bank_account_id,
      userId: p.user_id,
      userName: profile?.full_name || profile?.email?.split('@')[0] || 'Unknown',
      userEmail: profile?.email ?? '',
      bankName: bank?.bank_name ?? '—',
      accountNumber: bank?.account_number ?? '—',
    };
  });
}

/** Marks a payout as actually settled — the money has truly left the
 * platform (wired manually or via a payout API once one is connected).
 * Removes it from the user's 'pending' bucket entirely. */
export async function markPayoutPaid(payout: AdminPayout) {
  await supabase.from('payouts').update({ status: 'paid', settled_at: new Date().toISOString() }).eq('id', payout.id);
  const { data: balRow } = await supabase.from('balances').select('*').eq('user_id', payout.userId).eq('currency', payout.currency).maybeSingle();
  if (balRow) {
    await supabase.from('balances').update({
      pending: Math.max(0, Number(balRow.pending) - payout.amount),
    }).eq('user_id', payout.userId).eq('currency', payout.currency);
  }
}

export async function markPayoutFailed(payout: AdminPayout, note: string) {
  await supabase.from('payouts').update({ status: 'failed', admin_note: note }).eq('id', payout.id);
  const { data: balRow } = await supabase.from('balances').select('*').eq('user_id', payout.userId).eq('currency', payout.currency).maybeSingle();
  if (balRow) {
    await supabase.from('balances').update({
      available: Number(balRow.available) + payout.amount,
      pending: Math.max(0, Number(balRow.pending) - payout.amount),
    }).eq('user_id', payout.userId).eq('currency', payout.currency);
  }
}
