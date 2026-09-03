import { supabase } from '@/lib/supabase';

export async function createPaymentIntent(
  amount: number,
  currency: string,
): Promise<{ clientSecret: string; paymentIntentId: string }> {
  const { data, error } = await supabase.functions.invoke('create-payment-intent', {
    body: { amount, currency: currency.toLowerCase() },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data as { clientSecret: string; paymentIntentId: string };
}
