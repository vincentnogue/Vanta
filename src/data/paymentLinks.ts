import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/data/auth';

export type PaymentLink = {
  id: string;
  amount: number;
  currency: string;
  description: string;
  status: 'active' | 'archived';
  createdAt: string;
};

export type PublicPaymentLink = {
  id: string;
  amount: number;
  currency: string;
  description: string;
  status: 'active' | 'archived';
  businessName: string;
};

function nextLinkId(): string {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `plnk_${hex}`;
}

export async function listPaymentLinks(): Promise<PaymentLink[]> {
  const user = getCurrentUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from('payment_links')
    .select('id, amount, currency, description, status, created_at')
    .eq('business_user_id', user.id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((l) => ({
    id: l.id,
    amount: Number(l.amount),
    currency: l.currency,
    description: l.description,
    status: l.status,
    createdAt: l.created_at,
  }));
}

export async function createPaymentLink(amount: number, currency: string, description: string): Promise<PaymentLink> {
  const user = getCurrentUser();
  if (!user) throw new Error('Not signed in');
  const id = nextLinkId();
  const { error } = await supabase.from('payment_links').insert({
    id,
    business_user_id: user.id,
    amount,
    currency,
    description,
  });
  if (error) throw error;
  return { id, amount, currency, description, status: 'active', createdAt: new Date().toISOString() };
}

export async function archivePaymentLink(id: string) {
  const user = getCurrentUser();
  if (!user) return;
  await supabase.from('payment_links').update({ status: 'archived' }).eq('id', id).eq('business_user_id', user.id);
}

// Public read — no auth required, used by the pay page anyone can open.
// Goes through get_payment_link_public() so an anonymous payer never
// queries the profiles table directly.
export async function fetchPublicPaymentLink(id: string): Promise<PublicPaymentLink | null> {
  const { data, error } = await supabase.rpc('get_payment_link_public', { p_link_id: id });
  if (error || !data || data.length === 0) return null;
  const row = data[0];
  return {
    id: row.id,
    amount: Number(row.amount),
    currency: row.currency,
    description: row.description,
    status: row.status,
    businessName: row.business_name,
  };
}

export async function createPaymentLinkIntent(linkId: string): Promise<{ clientSecret: string; amount: number; currency: string }> {
  const { data, error } = await supabase.functions.invoke('create-payment-link-intent', {
    body: { linkId },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data as { clientSecret: string; amount: number; currency: string };
}
