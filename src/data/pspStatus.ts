import { supabase } from '@/lib/supabase';

export type PspConnector = {
  id: string;
  name: string;
  configured: boolean;
  webhookConfigured: boolean;
  secrets: string[];
};

export async function fetchPspStatus(): Promise<PspConnector[]> {
  const { data, error } = await supabase.functions.invoke('psp-status', { body: {} });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return (data?.connectors ?? []) as PspConnector[];
}
