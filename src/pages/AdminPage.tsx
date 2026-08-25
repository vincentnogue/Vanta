import { useState } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { type Route } from '@/router/RouterContext';
import {
  LayoutDashboard, ArrowLeftRight, Users, ShieldCheck, Network, Vault,
  FileCheck, LifeBuoy, TrendingUp, AlertTriangle, DollarSign, Activity, Check, Flag,
} from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { StatusBadge } from '@/components/StatusBadge';
import { formatCurrency } from '@/data/mockData';
import { useStore } from '@/data/store';

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

const customers = [
  { name: 'Aminata Diallo', country: '🇸🇳 Senegal', kyc: 'verified', volume: '18,400 AED', risk: 'Low' },
  { name: 'Nexus Trading LLC', country: '🇦🇪 UAE', kyc: 'verified', volume: '412,000 AED', risk: 'Low' },
  { name: 'Chioma Okafor', country: '🇳🇬 Nigeria', kyc: 'verified', volume: '96,200 AED', risk: 'Low' },
  { name: 'Kwesi Mensah', country: '🇬🇭 Ghana', kyc: 'review', volume: '12,800 AED', risk: 'Medium' },
  { name: 'James Mwangi', country: '🇰🇪 Kenya', kyc: 'verified', volume: '44,100 AED', risk: 'Low' },
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
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-ink-100 bg-ink-50/50">
                    <th className="text-left text-xs font-semibold text-ink-500 uppercase tracking-wider px-6 py-3">{t('admin.nav.customers')}</th>
                    <th className="text-left text-xs font-semibold text-ink-500 uppercase tracking-wider px-4 py-3 hidden sm:table-cell">KYC</th>
                    <th className="text-right text-xs font-semibold text-ink-500 uppercase tracking-wider px-4 py-3">{t('biz.overview.volume')}</th>
                    <th className="text-right text-xs font-semibold text-ink-500 uppercase tracking-wider px-6 py-3">Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c, i) => (
                    <tr key={i} className="border-b border-ink-50 hover:bg-ink-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-ink-900 text-sm">{c.name}</div>
                        <div className="text-xs text-ink-400">{c.country}</div>
                      </td>
                      <td className="px-4 py-4 hidden sm:table-cell">
                        <span className={`badge ${c.kyc === 'verified' ? 'bg-vanta-50 text-vanta-700' : 'bg-warning-50 text-warning-700'}`}>{c.kyc}</span>
                      </td>
                      <td className="px-4 py-4 text-right font-semibold text-ink-900 text-sm">{c.volume}</td>
                      <td className="px-6 py-4 text-right">
                        <span className={`badge ${c.risk === 'Low' ? 'bg-vanta-50 text-vanta-700' : 'bg-warning-50 text-warning-700'}`}>{c.risk}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'compliance' && (
          <div className="space-y-3">
            {cases.map((c) => (
              <div key={c.id} className="card p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-vanta-50 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-vanta-600" />
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
          <div className="card overflow-hidden">
            <div className="divide-y divide-ink-100">{providers.map(providerCard)}</div>
          </div>
        )}

        {tab === 'treasury' && (
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
        )}

        {tab === 'reconciliation' && (
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
