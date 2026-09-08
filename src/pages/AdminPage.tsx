import { useEffect, useState } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { type Route } from '@/router/RouterContext';
import {
  LayoutDashboard, ArrowLeftRight, Users, ShieldCheck, Network, Vault,
  FileCheck, LifeBuoy, TrendingUp, AlertTriangle, DollarSign, Activity, Check, Flag, X, Loader2,
  CheckCircle2, XCircle, ExternalLink,
} from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { StatusBadge } from '@/components/StatusBadge';
import { formatCurrency } from '@/data/mockData';
import { useStore } from '@/data/store';
import { fetchCustomers, fetchPendingKyc, adminApproveKyc, adminRejectKyc, type AdminCustomer, type AdminKycCase } from '@/data/admin';
import { fetchPspStatus, type PspConnector } from '@/data/pspStatus';
import { fetchPendingPayouts, markPayoutPaid, markPayoutFailed, type AdminPayout } from '@/data/payouts';
import { supabase } from '@/lib/supabase';

type Tab = 'overview' | 'transactions' | 'customers' | 'compliance' | 'providers' | 'treasury' | 'reconciliation' | 'support';

const providers = [
  { name: 'Gulf Bank Rail', type: 'Bank', success: 98.8, latency: '1.2s', cost: '1.1%', online: true },
  { name: 'Sahel Mobile Money', type: 'Mobile Money', success: 97.4, latency: '0.8s', cost: '0.8%', online: true },
  { name: 'AtlasFX', type: 'FX Provider', success: 99.6, latency: '0.3s', cost: '0.15%', online: true },
  { name: 'EuroPay SEPA', type: 'PSP', success: 94.2, latency: '2.1s', cost: '1.4%', online: false },
];

type ComplianceCase = { id: string; subject: string; reason: string; risk: 'review' | 'pending'; state: 'open' | 'approved' | 'flagged' };

const complianceSeed: ComplianceCase[] = [
  { id: 'CMP-2026-0812', subject: 'Aminata Diallo', reason: 'Velocity check', risk: 'review', state: 'open' },
  { id: 'CMP-2026-0811', subject: 'Nexus Trading LLC', reason: 'KYB document expired', risk: 'pending', state: 'open' },
  { id: 'CMP-2026-0809', subject: 'Jean-Paul Mbarga', reason: 'High-risk corridor', risk: 'pending', state: 'open' },
];

const exceptionsSeed = [
  { id: 'REC-5521', type: 'Amount mismatch', detail: 'Gulf Bank Rail · 1,000 AED vs 999.50 AED', resolved: false },
  { id: 'REC-5518', type: 'Missing transaction', detail: 'Sahel Mobile Money · VNT-20260822-000000031', resolved: false },
  { id: 'REC-5514', type: 'Status mismatch', detail: 'EuroPay SEPA · VNT-20260821-000000019', resolved: false },
];

const ticketsSeed = [
  { id: 'TKT-1042', subject: 'Transfer tracking — VNT-20260823', customer: 'Aminata Diallo', open: true },
  { id: 'TKT-1039', subject: 'Refund request — card funding', customer: 'Chioma Okafor', open: true },
  { id: 'TKT-0987', subject: 'KYC document re-upload', customer: 'Kwesi Mensah', open: false },
];

const liquidity = [
  { currency: 'USD', amount: '$4.2M', pct: 78 },
  { currency: 'EUR', amount: '€2.8M', pct: 64 },
  { currency: 'AED', amount: '11.6M AED', pct: 91 },
  { currency: 'XAF', amount: '890M XAF', pct: 42 },
  { currency: 'NGN', amount: '1.2B NGN', pct: 55 },
  { currency: 'KES', amount: '96M KES', pct: 70 },
];

export function AdminPage() {
  const { t } = useI18n();
  const [tab, setTab] = useState<Tab>('overview');
  const { transactions } = useStore();
  const [cases, setCases] = useState(complianceSeed);
  const [exceptions, setExceptions] = useState(exceptionsSeed);
  const [tickets, setTickets] = useState(ticketsSeed);

  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [customersLoading, setCustomersLoading] = useState(true);
  const [kycQueue, setKycQueue] = useState<AdminKycCase[]>([]);
  const [kycLoading, setKycLoading] = useState(true);
  const [kycActingOn, setKycActingOn] = useState<string | null>(null);

  const [connectors, setConnectors] = useState<PspConnector[]>([]);
  const [connectorsLoading, setConnectorsLoading] = useState(true);
  const [platformRevenue, setPlatformRevenue] = useState<{ currency: string; total: number }[]>([]);
  const [revenueLoading, setRevenueLoading] = useState(true);

  const [pendingPayouts, setPendingPayouts] = useState<AdminPayout[]>([]);
  const [payoutsLoading, setPayoutsLoading] = useState(true);
  const [payoutActingOn, setPayoutActingOn] = useState<string | null>(null);

  useEffect(() => {
    if (tab === 'reconciliation') {
      setPayoutsLoading(true);
      fetchPendingPayouts().then(setPendingPayouts).catch(() => setPendingPayouts([])).finally(() => setPayoutsLoading(false));
    }
  }, [tab]);

  const handleMarkPaid = async (p: AdminPayout) => {
    setPayoutActingOn(p.id);
    await markPayoutPaid(p);
    setPendingPayouts((ps) => ps.filter((x) => x.id !== p.id));
    setPayoutActingOn(null);
  };

  const handleMarkFailed = async (p: AdminPayout) => {
    setPayoutActingOn(p.id);
    await markPayoutFailed(p, 'Marked failed by admin');
    setPendingPayouts((ps) => ps.filter((x) => x.id !== p.id));
    setPayoutActingOn(null);
  };

  useEffect(() => {
    if (tab === 'providers') {
      setConnectorsLoading(true);
      fetchPspStatus().then(setConnectors).catch(() => setConnectors([])).finally(() => setConnectorsLoading(false));
    }
    if (tab === 'treasury') {
      setRevenueLoading(true);
      (async () => {
        const { data } = await supabase.from('platform_revenue').select('amount, currency');
        const totals = new Map<string, number>();
        (data ?? []).forEach((r) => totals.set(r.currency, (totals.get(r.currency) ?? 0) + Number(r.amount)));
        setPlatformRevenue([...totals.entries()].map(([currency, total]) => ({ currency, total })));
        setRevenueLoading(false);
      })();
    }
  }, [tab]);

  useEffect(() => {
    if (tab === 'customers') {
      setCustomersLoading(true);
      fetchCustomers().then(setCustomers).catch(() => setCustomers([])).finally(() => setCustomersLoading(false));
    }
    if (tab === 'compliance') {
      setKycLoading(true);
      fetchPendingKyc().then(setKycQueue).catch(() => setKycQueue([])).finally(() => setKycLoading(false));
    }
  }, [tab]);

  const approveKycCase = async (c: AdminKycCase) => {
    setKycActingOn(c.submissionId);
    await adminApproveKyc(c.userId, c.submissionId);
    setKycQueue((q) => q.filter((x) => x.submissionId !== c.submissionId));
    setKycActingOn(null);
  };

  const rejectKycCase = async (c: AdminKycCase) => {
    setKycActingOn(c.submissionId);
    await adminRejectKyc(c.userId, c.submissionId);
    setKycQueue((q) => q.filter((x) => x.submissionId !== c.submissionId));
    setKycActingOn(null);
  };

  const tabLabels: Record<Tab, string> = {
    overview: t('admin.nav.overview'),
    transactions: t('admin.nav.transactions'),
    customers: t('admin.nav.customers'),
    compliance: t('admin.nav.compliance'),
    providers: t('admin.nav.providers'),
    treasury: t('admin.nav.treasury'),
    reconciliation: t('admin.nav.reconciliation'),
    support: t('admin.nav.support'),
  };

  const navItems = ([
    ['overview', LayoutDashboard],
    ['transactions', ArrowLeftRight],
    ['customers', Users],
    ['compliance', ShieldCheck],
    ['providers', Network],
    ['treasury', Vault],
    ['reconciliation', FileCheck],
    ['support', LifeBuoy],
  ] as [Tab, typeof LayoutDashboard][]).map(([key, icon]) => ({
    route: 'admin' as Route, label: tabLabels[key], icon, tabKey: key, onSelect: () => setTab(key),
  }));

  const kpis = [
    { label: t('admin.ov.volume'), value: '$48.2M', icon: TrendingUp, tone: 'text-vanta-600 bg-vanta-50 border-vanta-100' },
    { label: t('admin.ov.transactions'), value: '128,430', icon: Activity, tone: 'text-vanta-600 bg-vanta-50 border-vanta-100' },
    { label: t('admin.ov.success'), value: '98.4%', icon: ShieldCheck, tone: 'text-vanta-600 bg-vanta-50 border-vanta-100' },
    { label: t('admin.ov.revenue'), value: '$412,800', icon: DollarSign, tone: 'text-vanta-600 bg-vanta-50 border-vanta-100' },
    { label: t('admin.ov.fx'), value: '$186,200', icon: ArrowLeftRight, tone: 'text-vanta-600 bg-vanta-50 border-vanta-100' },
    { label: t('admin.ov.compliance'), value: '23', icon: FileCheck, tone: 'text-warning-600 bg-warning-50 border-warning-500/20' },
    { label: t('admin.ov.fraud'), value: '4', icon: AlertTriangle, tone: 'text-danger-600 bg-danger-50 border-danger-500/20' },
    { label: t('admin.ov.liquidity'), value: '2', icon: Vault, tone: 'text-warning-600 bg-warning-50 border-warning-500/20' },
  ];

  const providerCard = (p: (typeof providers)[number], i: number) => (
    <div key={i} className="px-6 py-4 flex items-center justify-between gap-4">
      <div className="min-w-0">
        <div className="text-sm font-semibold text-black truncate">{p.name}</div>
        <div className="text-xs text-ink-400">{p.type}</div>
      </div>
      <div className="flex items-center gap-4 text-xs text-ink-500">
        <span>{t('admin.prov.success')} <b className="text-black">{p.success}%</b></span>
        <span className="hidden sm:inline">{t('admin.prov.latency')} <b className="text-black">{p.latency}</b></span>
        <span className="hidden md:inline">{t('admin.prov.cost')} <b className="text-black">{p.cost}</b></span>
        <span className={`badge ${p.online ? 'bg-vanta-50 text-vanta-700' : 'bg-warning-50 text-warning-600'}`}>
          {p.online ? t('admin.prov.online') : t('admin.prov.degraded')}
        </span>
      </div>
    </div>
  );

  return (
    <DashboardLayout navItems={navItems} activeRoute={tab}>
      <div className="space-y-8 animate-fade-in" key={tab}>
        <h1 className="font-display text-2xl font-bold text-black">{tabLabels[tab]}</h1>

        {tab === 'overview' && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {kpis.map((kpi, i) => (
                <div key={i} className="card p-5 animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
                  <div className={`w-9 h-9 rounded-lg border flex items-center justify-center mb-3 ${kpi.tone}`}>
                    <kpi.icon className="w-4.5 h-4.5" />
                  </div>
                  <div className="font-display text-xl font-bold text-black">{kpi.value}</div>
                  <div className="text-xs text-ink-500 mt-1">{kpi.label}</div>
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <div className="card overflow-hidden">
                <div className="px-6 py-4 border-b border-ink-100 flex items-center justify-between">
                  <h2 className="font-display font-bold text-black">{t('admin.prov.title')}</h2>
                  <Network className="w-4 h-4 text-ink-400" />
                </div>
                <div className="divide-y divide-ink-100">{providers.map(providerCard)}</div>
              </div>

              <div className="card overflow-hidden">
                <div className="px-6 py-4 border-b border-ink-100 flex items-center justify-between">
                  <h2 className="font-display font-bold text-black">{t('admin.comp.title')}</h2>
                  <span className="text-xs text-ink-500">{cases.filter((c) => c.state === 'open').length} {t('admin.comp.queue')}</span>
                </div>
                <div className="divide-y divide-ink-100">
                  {cases.map((c) => (
                    <div key={c.id} className="px-6 py-4 flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-black truncate">{c.subject}</div>
                        <div className="text-xs text-ink-400 font-mono">{c.id} — {c.reason}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {c.state === 'open' ? (
                          <>
                            <StatusBadge status={c.risk} />
                            <button onClick={() => setCases(cases.map((x) => x.id === c.id ? { ...x, state: 'approved' as const } : x))} className="text-xs font-semibold text-vanta-600 hover:text-vanta-700">
                              {t('admin.comp.approve')}
                            </button>
                          </>
                        ) : (
                          <span className="badge bg-vanta-500 text-white"><Check className="w-3 h-3" /> {t('admin.comp.approve')}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {tab === 'transactions' && (
          <div className="card overflow-hidden">
            <div className="px-6 py-4 border-b border-ink-100 flex items-center justify-between">
              <h2 className="font-display font-bold text-black">{t('admin.nav.transactions')}</h2>
              <span className="text-xs text-ink-500">{t('admin.rec.matched')}: 1,248 · {t('admin.rec.exceptions')}: {exceptions.filter((e) => !e.resolved).length}</span>
            </div>
            <div className="divide-y divide-ink-100">
              {transactions.map((tx, i) => (
                <div key={tx.id} className="px-6 py-4 flex items-center justify-between gap-4 animate-fade-up" style={{ animationDelay: `${i * 40}ms` }}>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-black truncate">{tx.recipientFlag} {tx.recipientName}</div>
                    <div className="text-xs text-ink-400 font-mono">{tx.id}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-semibold text-black">{formatCurrency(tx.amount, tx.currency)}</div>
                      <div className="text-xs text-ink-400">→ {formatCurrency(tx.payoutAmount, tx.payoutCurrency)}</div>
                    </div>
                    <StatusBadge status={tx.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'customers' && (
          <div className="card overflow-hidden">
            {customersLoading ? (
              <div className="p-10 flex items-center justify-center text-ink-400">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            ) : customers.length === 0 ? (
              <div className="p-10 text-center text-sm text-ink-400">{t('admin.noCustomers')}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-ink-100 bg-ink-50/50">
                      <th className="text-left text-xs font-semibold text-ink-500 uppercase tracking-wider px-6 py-3">{t('admin.nav.customers')}</th>
                      <th className="text-left text-xs font-semibold text-ink-500 uppercase tracking-wider px-4 py-3 hidden sm:table-cell">KYC</th>
                      <th className="text-left text-xs font-semibold text-ink-500 uppercase tracking-wider px-4 py-3 hidden md:table-cell">{t('admin.customers.type')}</th>
                      <th className="text-right text-xs font-semibold text-ink-500 uppercase tracking-wider px-6 py-3">{t('admin.customers.txCount')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((c) => (
                      <tr key={c.id} className="border-b border-ink-50 hover:bg-ink-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-ink-900 text-sm">{c.name}</div>
                          <div className="text-xs text-ink-400">{c.email}</div>
                        </td>
                        <td className="px-4 py-4 hidden sm:table-cell">
                          <span className={`badge ${c.kycStatus === 'verified' ? 'bg-vanta-50 text-vanta-700' : c.kycStatus === 'pending' ? 'bg-warning-50 text-warning-700' : 'bg-ink-100 text-ink-500'}`}>
                            {c.kycStatus}
                          </span>
                        </td>
                        <td className="px-4 py-4 hidden md:table-cell text-sm text-ink-600 capitalize">{c.accountType}</td>
                        <td className="px-6 py-4 text-right font-semibold text-ink-900 text-sm">{c.transactionCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tab === 'compliance' && (
          <div className="space-y-3">
            {kycLoading ? (
              <div className="p-10 flex items-center justify-center text-ink-400">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            ) : kycQueue.length === 0 ? (
              <div className="card p-10 text-center text-sm text-ink-400">{t('admin.noPendingKyc')}</div>
            ) : (
              kycQueue.map((c) => (
                <div key={c.submissionId} className="card p-5 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-vanta-50 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5 text-vanta-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-ink-900 text-sm">{c.name} <span className="text-ink-400 font-normal">· {c.email}</span></div>
                    <div className="text-xs text-ink-400 font-mono">{c.docType} · {c.docNumber}</div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => approveKycCase(c)}
                      disabled={kycActingOn === c.submissionId}
                      className="btn-primary text-xs px-3 py-2 disabled:opacity-50"
                    >
                      {kycActingOn === c.submissionId ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      {t('admin.comp.approve')}
                    </button>
                    <button
                      onClick={() => rejectKycCase(c)}
                      disabled={kycActingOn === c.submissionId}
                      className="btn-outline text-xs px-3 py-2 disabled:opacity-50"
                    >
                      <X className="w-3.5 h-3.5" /> {t('admin.comp.flag')}
                    </button>
                  </div>
                </div>
              ))
            )}

            {/* Legacy simulated risk cases — not yet backed by a real detection system */}
            {cases.map((c) => (
              <div key={c.id} className="card p-5 flex items-center gap-4 opacity-70">
                <div className="w-10 h-10 rounded-xl bg-ink-100 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-ink-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-ink-900 text-sm">{c.subject}</div>
                  <div className="text-xs text-ink-400 font-mono">{c.id} — {c.reason}</div>
                </div>
                {c.state === 'open' ? (
                  <div className="flex gap-2">
                    <button onClick={() => setCases(cases.map((x) => x.id === c.id ? { ...x, state: 'approved' as const } : x))} className="btn-primary text-xs px-3 py-2">
                      <Check className="w-3.5 h-3.5" /> {t('admin.comp.approve')}
                    </button>
                    <button onClick={() => setCases(cases.map((x) => x.id === c.id ? { ...x, state: 'flagged' as const } : x))} className="btn-outline text-xs px-3 py-2">
                      <Flag className="w-3.5 h-3.5" /> {t('admin.comp.flag')}
                    </button>
                  </div>
                ) : (
                  <span className={`badge ${c.state === 'approved' ? 'bg-vanta-500 text-white' : 'bg-danger-50 text-danger-600 border border-danger-200'}`}>
                    {c.state === 'approved' ? t('admin.comp.approve') : t('admin.comp.flag')}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === 'providers' && (
          <div className="space-y-3">
            {connectorsLoading ? (
              <div className="p-10 flex items-center justify-center text-ink-400"><Loader2 className="w-5 h-5 animate-spin" /></div>
            ) : (
              connectors.map((c) => (
                <div key={c.id} className="card p-5 flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.configured ? 'bg-vanta-50' : 'bg-ink-100'}`}>
                    {c.configured ? <CheckCircle2 className="w-5 h-5 text-vanta-600" /> : <XCircle className="w-5 h-5 text-ink-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-ink-900 text-sm">{c.name}</div>
                    <div className="text-xs text-ink-400">
                      {c.configured ? t('admin.providers.connected') : t('admin.providers.notConnected')}
                      {c.configured && !c.webhookConfigured && ` · ${t('admin.providers.noWebhook')}`}
                    </div>
                  </div>
                  <span className={`badge ${c.configured ? 'bg-vanta-50 text-vanta-700' : 'bg-ink-100 text-ink-500'}`}>
                    {c.configured ? t('admin.providers.connected') : t('admin.providers.notConnected')}
                  </span>
                </div>
              ))
            )}
            <a
              href="https://supabase.com/dashboard/project/vtfmfuzewrzumsmuoqwt/settings/functions"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline text-sm inline-flex"
            >
              <ExternalLink className="w-4 h-4" /> {t('admin.providers.manageSecrets')}
            </a>
          </div>
        )}

        {tab === 'treasury' && (
          <div className="space-y-6">
            <div>
              <h3 className="font-display text-sm font-bold text-ink-500 uppercase tracking-wider mb-3">{t('admin.treasury.platformRevenue')}</h3>
              {revenueLoading ? (
                <div className="p-6 flex items-center justify-center text-ink-400"><Loader2 className="w-5 h-5 animate-spin" /></div>
              ) : platformRevenue.length === 0 ? (
                <div className="card p-6 text-sm text-ink-400">{t('admin.treasury.noRevenue')}</div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {platformRevenue.map((r) => (
                    <div key={r.currency} className="card p-5">
                      <div className="text-xs text-ink-400 mb-1">{t('admin.treasury.commissionEarned')}</div>
                      <div className="font-display text-2xl font-bold text-vanta-900">{formatCurrency(r.total, r.currency)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="font-display text-sm font-bold text-ink-500 uppercase tracking-wider mb-3">{t('admin.ov.liquidity')}</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {liquidity.map((l, i) => (
                  <div key={l.currency} className="card p-5 animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-display font-bold text-black">{l.currency}</span>
                      <span className="text-sm font-semibold text-ink-600">{l.amount}</span>
                    </div>
                    <div className="h-2 bg-ink-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-1000 ${l.pct > 60 ? 'bg-vanta-500' : l.pct > 45 ? 'bg-warning-500' : 'bg-danger-500'}`} style={{ width: `${l.pct}%` }} />
                    </div>
                    <div className="text-xs text-ink-400 mt-2">{l.pct}% {t('admin.ov.liquidity').toLowerCase()}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'reconciliation' && (
          <div className="space-y-6">
            <div>
              <h3 className="font-display text-sm font-bold text-ink-500 uppercase tracking-wider mb-3">{t('admin.payouts.title')}</h3>
              {payoutsLoading ? (
                <div className="p-6 flex items-center justify-center text-ink-400"><Loader2 className="w-5 h-5 animate-spin" /></div>
              ) : pendingPayouts.length === 0 ? (
                <div className="card p-6 text-sm text-ink-400">{t('admin.payouts.empty')}</div>
              ) : (
                <div className="space-y-3">
                  {pendingPayouts.map((p) => (
                    <div key={p.id} className="card p-5 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-vanta-50 flex items-center justify-center shrink-0">
                        <DollarSign className="w-5 h-5 text-vanta-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-ink-900 text-sm">
                          {formatCurrency(p.amount, p.currency)} <span className="text-ink-400 font-normal">{t('admin.payouts.to')} {p.userName}</span>
                        </div>
                        <div className="text-xs text-ink-400 font-mono">{p.id} · {p.bankName} •••{p.accountNumber.slice(-4)}</div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => handleMarkPaid(p)} disabled={payoutActingOn === p.id} className="btn-primary text-xs px-3 py-2 disabled:opacity-50">
                          {payoutActingOn === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                          {t('admin.payouts.markPaid')}
                        </button>
                        <button onClick={() => handleMarkFailed(p)} disabled={payoutActingOn === p.id} className="btn-outline text-xs px-3 py-2 disabled:opacity-50">
                          <X className="w-3.5 h-3.5" /> {t('admin.payouts.markFailed')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="font-display text-sm font-bold text-ink-500 uppercase tracking-wider mb-3">{t('admin.nav.reconciliation')}</h3>
              <div className="space-y-3">
                {exceptions.map((e) => (
                  <div key={e.id} className="card p-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-warning-50 flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-warning-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-ink-900 text-sm">{e.type}</div>
                      <div className="text-xs text-ink-400 font-mono">{e.id} · {e.detail}</div>
                    </div>
                    {e.resolved ? (
                      <span className="badge bg-vanta-500 text-white"><Check className="w-3 h-3" /> {t('sup.resolved')}</span>
                    ) : (
                      <button onClick={() => setExceptions(exceptions.map((x) => x.id === e.id ? { ...x, resolved: true } : x))} className="btn-primary text-xs px-3 py-2">
                        {t('admin.comp.review')}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'support' && (
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="card p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-vanta-50 flex items-center justify-center">
                  <LifeBuoy className="w-5 h-5 text-vanta-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-ink-900 text-sm truncate">{ticket.subject}</div>
                  <div className="text-xs text-ink-400 font-mono">{ticket.id} · {ticket.customer}</div>
                </div>
                {ticket.open ? (
                  <button onClick={() => setTickets(tickets.map((x) => x.id === ticket.id ? { ...x, open: false } : x))} className="btn-outline text-xs px-3 py-2">
                    {t('sup.resolved')}
                  </button>
                ) : (
                  <span className="badge bg-vanta-50 text-vanta-700 border border-vanta-200">{t('sup.resolved')}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
