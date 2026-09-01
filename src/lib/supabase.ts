import { createClient } from '@supabase/supabase-js';

// These are PUBLIC values by design: the project URL and the anon/publishable
// key are meant to be embedded in client-side code. Every table they can
// reach is protected by Row Level Security policies in Postgres — the real
// access control lives there, not in keeping this URL/key secret.
const SUPABASE_URL = 'https://vtfmfuzewrzumsmuoqwt.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_R9QsXKaaYB9On_9xlSliMw_j9RHbAas';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
