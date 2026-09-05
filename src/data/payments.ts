import { supabase } from '@/lib/supabase';

export async function createPaymentIntent(
  amount: number,
  currency: string,
  netAmount?: number,
  saveCard?: boolean,
): Promise<{ clientSecret: string; paymentIntentId: string; status: string }> {
  const { data, error } = await supabase.functions.invoke('create-payment-intent', {
    body: { amount, currency: currency.toLowerCase(), netAmount, saveCard },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data as { clientSecret: string; paymentIntentId: string; status: string };
}

export async function chargeSavedCard(
  amount: number,
  currency: string,
  netAmount: number,
  paymentMethodId: string,
): Promise<{ clientSecret: string; paymentIntentId: string; status: string }> {
  const { data, error } = await supabase.functions.invoke('create-payment-intent', {
    body: { amount, currency: currency.toLowerCase(), netAmount, paymentMethodId },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data as { clientSecret: string; paymentIntentId: string; status: string };
}

export async function createSetupIntent(): Promise<{ clientSecret: string; setupIntentId: string }> {
  const { data, error } = await supabase.functions.invoke('create-setup-intent', { body: {} });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data as { clientSecret: string; setupIntentId: string };
}

export async function confirmSavedCard(
  idOrParams: string | { setupIntentId?: string; paymentIntentId?: string },
): Promise<{ paymentMethodId: string; brand: string; last4: string; expMonth: number; expYear: number }> {
  const body = typeof idOrParams === 'string' ? { setupIntentId: idOrParams } : idOrParams;
  const { data, error } = await supabase.functions.invoke('confirm-saved-card', { body });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data as { paymentMethodId: string; brand: string; last4: string; expMonth: number; expYear: number };
}
