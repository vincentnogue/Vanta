import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/data/auth';

export type ApiKey = {
  id: string;
  env: 'sandbox' | 'production';
  keyPrefix: string;
  createdAt: string;
  revokedAt: string | null;
};

function generateRawKey(env: 'sandbox' | 'production'): string {
  const bytes = new Uint8Array(18);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${env === 'production' ? 'vnt_live' : 'vnt_test'}_${hex}`;
}

async function hashKey(rawKey: string): Promise<string> {
  const data = new TextEncoder().encode(rawKey);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

export async function listApiKeys(): Promise<ApiKey[]> {
  const user = getCurrentUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from('api_keys')
    .select('id, env, key_prefix, created_at, revoked_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((k) => ({
    id: k.id,
    env: k.env,
    keyPrefix: k.key_prefix,
    createdAt: k.created_at,
    revokedAt: k.revoked_at,
  }));
}

/** Creates a new key and returns the RAW value exactly once — the caller
 * must show it to the user immediately, it can never be retrieved again
 * (only the hash is stored). Same pattern Stripe/GitHub use. */
export async function createApiKey(env: 'sandbox' | 'production'): Promise<{ key: ApiKey; rawKey: string }> {
  const user = getCurrentUser();
  if (!user) throw new Error('Not signed in');
  const rawKey = generateRawKey(env);
  const keyHash = await hashKey(rawKey);
  const keyPrefix = rawKey.slice(0, rawKey.indexOf('_', rawKey.indexOf('_') + 1) + 9);

  const { data, error } = await supabase
    .from('api_keys')
    .insert({ user_id: user.id, env, key_prefix: keyPrefix, key_hash: keyHash })
    .select('id, env, key_prefix, created_at, revoked_at')
    .single();
  if (error) throw error;

  return {
    key: { id: data.id, env: data.env, keyPrefix: data.key_prefix, createdAt: data.created_at, revokedAt: data.revoked_at },
    rawKey,
  };
}

export async function revokeApiKey(id: string) {
  const user = getCurrentUser();
  if (!user) return;
  await supabase.from('api_keys').update({ revoked_at: new Date().toISOString() }).eq('id', id).eq('user_id', user.id);
}
