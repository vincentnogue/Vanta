import { supabase } from '@/lib/supabase';

export type AdminCustomer = {
  id: string;
  name: string;
  email: string;
  accountType: 'personal' | 'business';
  kycStatus: 'unverified' | 'pending' | 'verified';
  country: string | null;
  createdAt: string;
  transactionCount: number;
};

export type AdminKycCase = {
  submissionId: string;
  userId: string;
  name: string;
  email: string;
  docType: string;
  docNumber: string;
  submittedAt: string;
};

// These reads rely on the `profiles_select` / `kyc_select` RLS policies,
// which allow a superadmin to read across every tenant — not on any
// client-side trust. A non-admin calling this simply gets their own row.

export async function fetchCustomers(): Promise<AdminCustomer[]> {
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, account_type, kyc_status, country, created_at')
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) throw error;

  const { data: txCounts } = await supabase.from('transactions').select('user_id');
  const countByUser = new Map<string, number>();
  (txCounts ?? []).forEach((t) => countByUser.set(t.user_id, (countByUser.get(t.user_id) ?? 0) + 1));

  return (profiles ?? []).map((p) => ({
    id: p.id,
    name: p.full_name || p.email.split('@')[0],
    email: p.email,
    accountType: p.account_type,
    kycStatus: p.kyc_status,
    country: p.country,
    createdAt: p.created_at,
    transactionCount: countByUser.get(p.id) ?? 0,
  }));
}

export async function fetchPendingKyc(): Promise<AdminKycCase[]> {
  const { data: submissions, error } = await supabase
    .from('kyc_submissions')
    .select('id, user_id, doc_type, doc_number, submitted_at')
    .eq('status', 'pending')
    .order('submitted_at', { ascending: false });
  if (error) throw error;
  if (!submissions || submissions.length === 0) return [];

  const userIds = [...new Set(submissions.map((s) => s.user_id))];
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .in('id', userIds);
  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));

  return submissions.map((s) => {
    const profile = profileById.get(s.user_id);
    return {
      submissionId: s.id,
      userId: s.user_id,
      name: profile?.full_name || profile?.email?.split('@')[0] || 'Unknown',
      email: profile?.email ?? '',
      docType: s.doc_type,
      docNumber: s.doc_number,
      submittedAt: s.submitted_at,
    };
  });
}

export async function adminApproveKyc(userId: string, submissionId: string) {
  // Both writes are gated server-side: the guard_profile_update trigger and
  // the kyc_update RLS policy both require is_superadmin() — this call does
  // nothing if the acting session isn't actually a superadmin.
  await supabase.from('profiles').update({ kyc_status: 'verified' }).eq('id', userId);
  await supabase
    .from('kyc_submissions')
    .update({ status: 'verified', reviewed_at: new Date().toISOString() })
    .eq('id', submissionId);
}

export async function adminRejectKyc(userId: string, submissionId: string) {
  await supabase.from('profiles').update({ kyc_status: 'unverified' }).eq('id', userId);
  await supabase
    .from('kyc_submissions')
    .update({ status: 'rejected', reviewed_at: new Date().toISOString() })
    .eq('id', submissionId);
}
