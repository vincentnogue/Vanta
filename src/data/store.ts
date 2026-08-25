import { useSyncExternalStore } from 'react';
import {
  mockBalances, mockTransactions, mockRecipients, getFxRate,
  type Balance, type Transaction, type Recipient,
} from './mockData';

export type StoreState = {
  balances: Balance[];
  transactions: Transaction[];
  recipients: Recipient[];
};

const STORAGE_KEY = 'vanta-store-v1';

function seed(): StoreState {
  return {
    balances: mockBalances.map((b) => ({ ...b })),
    transactions: mockTransactions.map((t) => ({ ...t })),
    recipients: mockRecipients.map((r) => ({ ...r })),
  };
}

function load(): StoreState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as StoreState;
  } catch {
    // corrupted storage — fall back to seed
  }
  return seed();
}

let state: StoreState = load();
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

export function useStore(): StoreState {
  return useSyncExternalStore(subscribe, getSnapshot);
}

let txCounter = 100;

export function nextTxId(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  return `VNT-${date}-${String(txCounter++).padStart(9, '0')}`;
}

export function createTransfer(tx: Transaction) {
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
}

export function addRecipient(recipient: Recipient) {
  state = { ...state, recipients: [recipient, ...state.recipients] };
  emit();
}

export function addMoney(currency: string, amount: number, method: Transaction['method'] = 'bank') {
  const depositTx: Transaction = {
    id: nextTxId(),
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
  state = {
    ...state,
    transactions: [depositTx, ...state.transactions],
    balances: state.balances.map((b) =>
      b.currency === currency ? { ...b, available: b.available + amount } : b,
    ),
  };
  emit();
}

export function exchangeMoney(from: string, to: string, amount: number, rate: number) {
  if (from === to || amount <= 0) return false;
  const hasFrom = state.balances.some((b) => b.currency === from);
  if (!hasFrom) return false;
  const source = state.balances.find((b) => b.currency === from);
  if (!source || source.available < amount) return false;

  const debitTx: Transaction = {
    id: nextTxId(),
    recipientName: 'Currency exchange',
    recipientCountry: 'Vanta exchange',
    recipientFlag: '🔁',
    amount,
    currency: from,
    payoutAmount: Math.round(amount * rate * 100) / 100,
    payoutCurrency: to,
    status: 'completed',
    date: new Date().toISOString(),
    method: 'wallet',
  };

  const withoutFrom = state.balances.map((b) =>
    b.currency === from ? { ...b, available: b.available - amount } : b,
  );

  if (state.balances.some((b) => b.currency === to)) {
    state = {
      ...state,
      transactions: [debitTx, ...state.transactions],
      balances: withoutFrom.map((b) =>
        b.currency === to ? { ...b, available: b.available + amount * rate } : b,
      ),
    };
  } else {
    // Convert through AED for currencies not yet held
    const hasAed = state.balances.some((b) => b.currency === 'AED');
    if (!hasAed) return false;
    const aedNeeded = amount * rate * getFxRate(to, 'AED');
    const aed = state.balances.find((b) => b.currency === 'AED');
    if (!aed || aed.available < aedNeeded) return false;
    state = {
      ...state,
      transactions: [debitTx, ...state.transactions],
      balances: withoutFrom.map((b) =>
        b.currency === 'AED' ? { ...b, available: b.available - aedNeeded } : b,
      ),
    };
  }
  emit();
  return true;
}
