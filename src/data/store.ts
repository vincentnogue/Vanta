import { useSyncExternalStore } from 'react';
import { supabase } from '@/lib/supabase';
import { onAuthChange, getCurrentUser } from './auth';
import {
  currencies, flagEmoji,
  type Balance, type Transaction, type Recipient, type PaymentMethod,
} from './mockData';

export type StoreState = {
  balances: Balance[];
  transactions: Transaction[];
  recipients: Recipient[];
  paymentMethods: PaymentMethod[];
  loading: boolean;
};

let state: StoreState = { balances: [], transactions: [], recipients: [], paymentMethods: [], loading: true };
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

export function useStore(): StoreState {
  return useSyncExternalStore(subscribe, getSnapshot);
}

function symbolFor(code: string): string {
  return currencies.find((c) => c.code === code)?.symbol ?? '';
}

function flagFor(code: string): string {
  return currencies.find((c) => c.code === code)?.flag ?? '🏳️';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapBalance(row: any): Balance {
  return {
    currency: row.currency,
    symbol: symbolFor(row.currency),
    available: Number(row.available),
    pending: Number(row.pending),
    flag: flagFor(row.currency),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapTransaction(row: any): Transaction {
  return {
    id: row.id,
    recipientName: row.recipient_name,
    recipientCountry: row.recipient_country,
    recipientFlag: row.recipient_flag,
    amount: Number(row.amount),
    currency: row.currency,
    payoutAmount: Number(row.payout_amount),
    payoutCurrency: row.payout_currency,
    status: row.status,
    date: row.created_at,
    method: row.method,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRecipient(row: any): Recipient {
  return {
    id: row.id,
    name: row.name,
    country: row.country,
    countryCode: row.country_code,
    flag: row.country_code ? flagEmoji(row.country_code) : '🌍',
    method: row.method,
    methodDetail: row.detail ?? '',
    lastUsed: row.last_used,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapPaymentMethod(row: any): PaymentMethod {
  return {
    id: row.id,
    brand: row.brand,
    last4: row.last4,
    expMonth: String(row.exp_month).padStart(2, '0'),
    expYear: String(row.exp_year).slice(-2).padStart(2, '0'),
    holder: row.holder_name,
    isDefault: row.is_default,
  };
}

let currentUserId: string | null = null;

async function loadForUser(userId: string) {
  const [balRes, txRes, recRes, pmRes] = await Promise.all([
    supabase.from('balances').select('*').eq('user_id', userId),
    supabase.from('transactions').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    supabase.from('recipients').select('*').eq('user_id', userId).order('last_used', { ascending: false, nullsFirst: false }),
    supabase.from('payment_methods').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
  ]);
  state = {
    balances: (balRes.data ?? []).map(mapBalance),
    transactions: (txRes.data ?? []).map(mapTransaction),
    recipients: (recRes.data ?? []).map(mapRecipient),
    paymentMethods: (pmRes.data ?? []).map(mapPaymentMethod),
    loading: false,
  };
  emit();
}

function clearForSignedOut() {
  state = { balances: [], transactions: [], recipients: [], paymentMethods: [], loading: false };
  emit();
}

onAuthChange(() => {
  const user = getCurrentUser();
  const uid = user?.id ?? null;
  if (uid !== currentUserId) {
    currentUserId = uid;
    if (uid) loadForUser(uid);
    else clearForSignedOut();
  }
});

const initialUser = getCurrentUser();
if (initialUser) {
  currentUserId = initialUser.id;
  loadForUser(initialUser.id);
} else {
  state = { ...state, loading: false };
}

export function nextTxId(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(Math.random() * 900000000 + 100000000);
  return `VNT-${date}-${rand}`;
}

export function createTransfer(tx: Transaction) {
  const uid = currentUserId;
  state = {
    ...state,
    transactions: [tx, ...state.transactions],
    balances: state.balances.map((b) =>
      b.currency === tx.currency
        ? { ...b, available: Math.max(0, b.available - tx.amount), pending: b.pending + tx.amount }
        : b,
    ),
  };
  emit();
  if (!uid) return;
  supabase.from('transactions').insert({
    id: tx.id, user_id: uid, kind: 'send',
    recipient_name: tx.recipientName, recipient_country: tx.recipientCountry, recipient_flag: tx.recipientFlag,
    amount: tx.amount, currency: tx.currency, payout_amount: tx.payoutAmount, payout_currency: tx.payoutCurrency,
    status: tx.status, method: tx.method,
  }).then();
  const bal = state.balances.find((b) => b.currency === tx.currency);
  if (bal) {
    supabase.from('balances')
      .upsert({ user_id: uid, currency: tx.currency, available: bal.available, pending: bal.pending }, { onConflict: 'user_id,currency' })
      .then();
  }
}

export function addRecipient(recipient: Recipient) {
  const uid = currentUserId;
  state = { ...state, recipients: [recipient, ...state.recipients] };
  emit();
  if (!uid) return;
  supabase.from('recipients').insert({
    id: recipient.id, user_id: uid, name: recipient.name, country: recipient.country,
    country_code: recipient.countryCode, method: recipient.method, detail: recipient.methodDetail,
    last_used: recipient.lastUsed ?? new Date().toISOString(),
  }).then();
}

export function addPaymentMethod(method: PaymentMethod) {
  const uid = currentUserId;
  const isFirst = state.paymentMethods.length === 0;
  const shouldBeDefault = method.isDefault || isFirst;
  const withDefault = shouldBeDefault
    ? state.paymentMethods.map((p) => ({ ...p, isDefault: false }))
    : state.paymentMethods;
  const finalMethod = { ...method, isDefault: shouldBeDefault };
  state = { ...state, paymentMethods: [finalMethod, ...withDefault] };
  emit();
  if (!uid) return;
  const persist = async () => {
    if (shouldBeDefault) {
      await supabase.from('payment_methods').update({ is_default: false }).eq('user_id', uid);
    }
    await supabase.from('payment_methods').insert({
      id: finalMethod.id, user_id: uid, brand: finalMethod.brand, last4: finalMethod.last4,
      exp_month: Number(finalMethod.expMonth), exp_year: 2000 + Number(finalMethod.expYear),
      holder_name: finalMethod.holder, is_default: finalMethod.isDefault,
    });
  };
  persist();
}

export function removePaymentMethod(id: string) {
  const uid = currentUserId;
  const remaining = state.paymentMethods.filter((p) => p.id !== id);
  if (remaining.length > 0 && !remaining.some((p) => p.isDefault)) {
    remaining[0] = { ...remaining[0], isDefault: true };
  }
  state = { ...state, paymentMethods: remaining };
  emit();
  if (!uid) return;
  const persist = async () => {
    await supabase.from('payment_methods').delete().eq('id', id).eq('user_id', uid);
    if (remaining.length > 0 && remaining[0].isDefault) {
      await supabase.from('payment_methods').update({ is_default: true }).eq('id', remaining[0].id).eq('user_id', uid);
    }
  };
  persist();
}

export function setDefaultPaymentMethod(id: string) {
  const uid = currentUserId;
  state = {
    ...state,
    paymentMethods: state.paymentMethods.map((p) => ({ ...p, isDefault: p.id === id })),
  };
  emit();
  if (!uid) return;
  const persist = async () => {
    await supabase.from('payment_methods').update({ is_default: false }).eq('user_id', uid);
    await supabase.from('payment_methods').update({ is_default: true }).eq('id', id).eq('user_id', uid);
  };
  persist();
}

export function addMoney(currency: string, amount: number, method: Transaction['method'] = 'bank') {
  const uid = currentUserId;
  const id = nextTxId();
  const depositTx: Transaction = {
    id,
    recipientName: 'Top-up',
    recipientCountry: 'Vanta account',
    recipientFlag: '💳',
    amount,
    currency,
    payoutAmount: amount,
    payoutCurrency: currency,
    status: 'completed',
    date: new Date().toISOString(),
    method,
  };
  const existing = state.balances.find((b) => b.currency === currency);
  const newAvailable = (existing?.available ?? 0) + amount;
  state = {
    ...state,
    transactions: [depositTx, ...state.transactions],
    balances: existing
      ? state.balances.map((b) => (b.currency === currency ? { ...b, available: newAvailable } : b))
      : [...state.balances, { currency, symbol: symbolFor(currency), available: amount, pending: 0, flag: flagFor(currency) }],
  };
  emit();
  if (!uid) return;
  supabase.from('transactions').insert({
    id, user_id: uid, kind: 'topup',
    recipient_name: depositTx.recipientName, recipient_country: depositTx.recipientCountry, recipient_flag: depositTx.recipientFlag,
    amount, currency, payout_amount: amount, payout_currency: currency, status: 'completed', method,
  }).then();
  supabase.from('balances')
    .upsert({ user_id: uid, currency, available: newAvailable, pending: existing?.pending ?? 0 }, { onConflict: 'user_id,currency' })
    .then();
}

export function exchangeMoney(from: string, to: string, amount: number, rate: number): boolean {
  const uid = currentUserId;
  if (from === to || amount <= 0) return false;
  const source = state.balances.find((b) => b.currency === from);
  if (!source || source.available < amount) return false;

  const id = nextTxId();
  const payoutAmount = Math.round(amount * rate * 100) / 100;
  const debitTx: Transaction = {
    id,
    recipientName: 'Currency exchange',
    recipientCountry: 'Vanta exchange',
    recipientFlag: '🔁',
    amount,
    currency: from,
    payoutAmount,
    payoutCurrency: to,
    status: 'completed',
    date: new Date().toISOString(),
    method: 'wallet',
  };

  const target = state.balances.find((b) => b.currency === to);
  const newFromAvailable = source.available - amount;
  const newToAvailable = (target?.available ?? 0) + payoutAmount;

  state = {
    ...state,
    transactions: [debitTx, ...state.transactions],
    balances: target
      ? state.balances.map((b) => {
          if (b.currency === from) return { ...b, available: newFromAvailable };
          if (b.currency === to) return { ...b, available: newToAvailable };
          return b;
        })
      : [
          ...state.balances.map((b) => (b.currency === from ? { ...b, available: newFromAvailable } : b)),
          { currency: to, symbol: symbolFor(to), available: newToAvailable, pending: 0, flag: flagFor(to) },
        ],
  };
  emit();

  if (uid) {
    supabase.from('balances').upsert(
      [
        { user_id: uid, currency: from, available: newFromAvailable, pending: source.pending },
        { user_id: uid, currency: to, available: newToAvailable, pending: target?.pending ?? 0 },
      ],
      { onConflict: 'user_id,currency' },
    ).then();
    supabase.from('transactions').insert({
      id, user_id: uid, kind: 'exchange',
      recipient_name: debitTx.recipientName, recipient_country: debitTx.recipientCountry, recipient_flag: debitTx.recipientFlag,
      amount, currency: from, payout_amount: payoutAmount, payout_currency: to, status: 'completed', method: 'wallet',
    }).then();
  }
  return true;
}
