import { useState } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { type Route } from '@/router/RouterContext';
import { DashboardLayout } from '@/components/DashboardLayout';
import { StatusBadge } from '@/components/StatusBadge';
import {
  LayoutDashboard, CreditCard, ArrowLeftRight, Users, Wallet, Repeat,
  Landmark, Users2, Shield, FileBarChart, Settings,
  Upload, Building, TrendingUp, Clock, CheckCircle2, Check, Plus, KeyRound,
  DollarSign, Activity, Globe, Zap, ArrowUpRight, ArrowDownRight, Smartphone,
} from 'lucide-react';
import { formatCurrency, getCurrencyByCode, currencies as allCurrencies, getFxRate } from '@/data/mockData';
import { useStore } from '@/data/store';

type Tab = 'overview' | 'payments' | 'transfers' | 'recipients' | 'balances' | 'fx' | 'treasury' | 'payroll' | 'team' | 'compliance' | 'reports' | 'settings';

const payrollSeed = [
  { id: 'e1', name: 'Sarah Chen', role: 'Engineering', country: '🇦🇪 UAE', salary: 18500, currency: 'AED', paid: false },
  { id: 'e2', name: 'David Osei', role: 'Design', country: '🇬🇭 Ghana', salary: 12400, currency: 'GHS', paid: false },
  { id: 'e3', name: 'Marie Dupont', role: 'Finance', country: '🇫🇷 France', salary: 4200, currency: 'EUR', paid: false },
  { id: 'e4', name: 'Ibrahim Keita', role: 'Operations', country: '🇸🇳 Senegal', salary: 980000, currency: 'XOF', paid: false },
];

const teamSeed = [
  { name: 'Vincent Nogue', role: 'Owner', email: 'vincent@acme.co' },
  { name: 'Sarah Chen', role: 'Finance Manager', email: 'sarah@acme.co' },
  { name: 'Omar Al Farsi', role: 'Compliance Officer', email: 'omar@acme.co' },
  { name: 'Lena Petrova', role: 'Developer', email: 'lena@acme.co' },
];

const complianceSeed = [
  { id: 'KYB-301', entity: 'Acme Trading LLC', type: 'KYB renewal', risk: 'Low', done: false },
  { id: 'AML-118', entity: 'Bulk payout #44', type: 'Velocity check', risk: 'Medium', done: false },
  { id: 'KYC-942', entity: 'New contractor', type: 'Identity', risk: 'Low', done: false },
];

const months = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
const volumes = [1.1, 1.4, 1.2, 1.8, 2.1, 2.4];

const paymentMethods = [
  { method: 'Bank transfer', icon: Landmark, volume: 1280000, pct: 53, color: 'bg-vanta-500' },
  { method: 'Mobile money', icon: Smartphone, volume: 640000, pct: 27, color: 'bg-accent-500' },
  { method: 'Card', icon: CreditCard, volume: 320000, pct: 13, color: 'bg-success-500' },
  { method: 'Wallet', icon: Wallet, volume: 160000, pct: 7, color: 'bg-warning-500' },
];

const paymentFlow = [
  { stage: 'Initiated', count: 1847, color: 'text-vanta-600' },
  { stage: 'Compliance check', count: 1847, color: 'text-vanta-600' },
  { stage: 'FX routed', count: 1839, color: 'text-accent-600' },
  { stage: 'Payout sent', count: 1832, color: 'text-accent-600' },
  { stage: 'Completed', count: 1832, color: 'text-success-600' },
];

const recentPayouts = [
  { id: 'po_8842', merchant: 'Acme Trading LLC', amount: 45000, currency: 'AED', method: 'Bank transfer', status: 'completed', flag: '🇦🇪', time: '2 min ago' },
  { id: 'po_8841', merchant: 'Cloud Services Ltd', amount: 12800, currency: 'GHS', method: 'Mobile money', status: 'completed', flag: '🇬🇭', time: '8 min ago' },
  { id: 'po_8840', merchant: 'Design Studio Co', amount: 3200, currency: 'EUR', method: 'SEPA', status: 'processing', flag: '🇫🇷', time: '15 min ago' },
  { id: 'po_8839', merchant: 'Sahel Imports', amount: 890000, currency: 'XOF', method: 'Mobile money', status: 'completed', flag: '🇸🇳', time: '22 min ago' },
  { id: 'po_8838', merchant: 'Nordic Tech AB', amount: 18500, currency: 'EUR', method: 'Bank transfer', status: 'completed', flag: '🇸🇪', time: '34 min ago' },
];

const corridorStats = [
  { route: 'UAE → Senegal', volume: '$890K', txs: 412, success: 99.3, flag: '🇦🇪→🇸🇳' },
  { route: 'EU → Ghana', volume: '$640K', txs: 318, success: 98.8, flag: '🇪🇺→🇬🇭' },
  { route: 'UK → Nigeria', volume: '$520K', txs: 289, success: 97.9, flag: '🇬🇧→🇳🇬' },
  { route: 'UAE → Kenya', volume: '$390K', txs: 204, success: 99.5, flag: '🇦🇪→🇰🇪' },
];

export function BusinessDashboard() {
  const { t, lang } = useI18n();
  const [tab, setTab] = useState<Tab>('overview');
  const { transactions, recipients, balances } = useStore();
  const [payroll, setPayroll] = useState(payrollSeed);
  const [payrollDone, setPayrollDone] = useState(false);
  const [compliance, setCompliance] = useState(complianceSeed);
  const [fxFrom, setFxFrom] = useState('USD');
  const [fxTo, setFxTo] = useState('AED');
  const [fxAmount, setFxAmount] = useState('');
  const [saved, setSaved] = useState(false);

  const tabLabels: Record<Tab, string> = {
    overview: t('biz.nav.overview'),
    payments: t('biz.nav.payments'),
    transfers: t('biz.nav.transfers'),
    recipients: t('biz.nav.recipients'),
    balances: t('biz.nav.balances'),
    fx: t('biz.nav.fx'),
    treasury: t('biz.nav.treasury'),
    payroll: t('biz.nav.payroll'),
    team: t('biz.nav.team'),
    compliance: t('biz.nav.compliance'),
    reports: t('biz.nav.reports'),
    settings: t('biz.nav.settings'),
  };

  const navItems = ([
    ['overview', LayoutDashboard],
    ['payments', CreditCard],
    ['transfers', ArrowLeftRight],
    ['recipients', Users],
    ['balances', Wallet],
    ['fx', Repeat],
    ['treasury', Landmark],
    ['payroll', Users2],
    ['team', Users],
    ['compliance', Shield],
    ['reports', FileBarChart],
    ['settings', Settings],
  ] as [Tab, typeof LayoutDashboard][]).map(([key, icon]) => ({
    route: 'business' as Route, label: tabLabels[key], icon, tabKey: key, onSelect: () => setTab(key),
  }));

  const stats = [
    { label: t('biz.overview.volume'), value: '$2.4M', change: '+18%', icon: TrendingUp, gradient: 'from-vanta-600 to-vanta-800' },
    { label: t('biz.overview.transactions'), value: '1,847', change: '+12%', icon: ArrowLeftRight, gradient: 'from-accent-500 to-accent-700' },
    { label: t('biz.overview.success'), value: '99.2%', change: '+0.4%', icon: CheckCircle2, gradient: 'from-success-500 to-success-700' },
    { label: t('biz.overview.pending'), value: '3', change: '', icon: Clock, gradient: 'from-warning-500 to-warning-600' },
  ];

  const pspStats = [
    { label: lang === 'fr' ? 'Paiements réussis' : 'Successful payments', value: '1,832', sub: '99.2%', icon: CheckCircle2, tone: 'success' as const },
    { label: lang === 'fr' ? 'Volume traité' : 'Processed volume', value: '$2.4M', sub: '+18% MoM', icon: DollarSign, tone: 'vanta' as const },
    { label: lang === 'fr' ? 'Temps moyen' : 'Avg processing', value: '1.2s', sub: '-120ms', icon: Zap, tone: 'accent' as const },
    { label: lang === 'fr' ? 'Corridors actifs' : 'Active corridors', value: '24', sub: lang === 'fr' ? '4 continents' : '4 continents', icon: Globe, tone: 'vanta' as const },
  ];

  const toneClasses: Record<string, string> = {
    success: 'from-success-500 to-success-700',
    vanta: 'from-vanta-600 to-vanta-800',
    accent: 'from-accent-500 to-accent-700',
  };

  const quickActions = [
    { label: t('biz.overview.bulk'), icon: Upload, desc: lang === 'fr' ? 'Virements groupés via CSV' : 'Bulk transfers via CSV', tab: 'payments' as Tab },
    { label: t('biz.overview.payroll'), icon: Users2, desc: lang === 'fr' ? 'Payer employés et contractuels' : 'Pay employees and contractors', tab: 'payroll' as Tab },
    { label: t('biz.overview.suppliers'), icon: Building, desc: lang === 'fr' ? 'Payer fournisseurs mondiaux' : 'Pay global suppliers', tab: 'recipients' as Tab },
  ];

  const runPayroll = () => {
    setPayroll(payroll.map((p) => ({ ...p, paid: true })));
    setPayrollDone(true);
    setTimeout(() => setPayrollDone(false), 2500);
  };

  const txTable = (limit: number) => (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-ink-100 bg-ink-50/50">
              <th className="text-left text-xs font-semibold text-ink-500 uppercase tracking-wider px-4 py-3">{t('dash.activity.recipient')}</th>
              <th className="text-right text-xs font-semibold text-ink-500 uppercase tracking-wider px-4 py-3">{t('dash.activity.amount')}</th>
              <th className="text-left text-xs font-semibold text-ink-500 uppercase tracking-wider px-4 py-3 hidden sm:table-cell">{t('dash.activity.date')}</th>
              <th className="text-right text-xs font-semibold text-ink-500 uppercase tracking-wider px-4 py-3">{t('dash.activity.status')}</th>
            </tr>
          </thead>
          <tbody>
            {transactions.slice(0, limit).map((tx, i) => (
              <tr key={tx.id} className="border-b border-ink-50 hover:bg-ink-50/50 transition-colors animate-fade-up" style={{ animationDelay: `${i * 40}ms` }}>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{tx.recipientFlag}</span>
                    <div>
                      <div className="font-semibold text-ink-900 text-sm">{tx.recipientName}</div>
                      <div className="text-xs text-ink-400">{tx.recipientCountry}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-right">
                  <div className="font-semibold text-ink-900 text-sm">{formatCurrency(tx.amount, tx.currency)}</div>
                  <div className="text-xs text-ink-400">{formatCurrency(tx.payoutAmount, tx.payoutCurrency)}</div>
                </td>
                <td className="px-4 py-4 text-sm text-ink-500 hidden sm:table-cell">
                  {new Date(tx.date).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'short' })}
                </td>
                <td className="px-4 py-4 text-right"><StatusBadge status={tx.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <DashboardLayout navItems={navItems} activeRoute={tab}>
      <div className="space-y-8 animate-fade-in" key={tab}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-vanta-900">{tabLabels[tab]}</h1>
            <p className="text-sm text-ink-500 mt-1">Acme Corp · {t('dash.home.welcome')}</p>
          </div>
          {tab === 'payroll' && (
            <button onClick={runPayroll} className="btn-primary text-sm">
              {payrollDone ? <><Check className="w-4 h-4" /> {t('biz.payroll.paid')}</> : t('biz.payroll.run')}
            </button>
          )}
        </div>

        {tab === 'overview' && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, i) => (
                <div key={i} className="card p-5 animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center`}>
                      <stat.icon className="w-5 h-5 text-white" />
                    </div>
                    {stat.change && <span className="text-xs font-semibold text-success-600">{stat.change}</span>}
                  </div>
                  <div className="font-display text-2xl font-bold text-vanta-900">{stat.value}</div>
                  <div className="text-sm text-ink-400 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              {quickActions.map((action, i) => (
                <button key={i} onClick={() => setTab(action.tab)} className="card card-hover p-5 text-left">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-vanta-50 flex items-center justify-center">
                      <action.icon className="w-6 h-6 text-vanta-700" />
                    </div>
                    <div>
                      <div className="font-semibold text-vanta-900">{action.label}</div>
                      <div className="text-xs text-ink-400 mt-0.5">{action.desc}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div>
              <h2 className="font-display text-lg font-bold text-vanta-900 mb-4">{t('biz.overview.recent')}</h2>
              {txTable(6)}
            </div>
          </>
        )}

        {(tab === 'payments' || tab === 'transfers') && (
          <>
            <div className="flex items-center justify-between">
              <div className="flex gap-3">
                <button className="btn-primary text-sm"><Plus className="w-4 h-4" /> {t('biz.nav.payments')}</button>
                <button className="btn-outline text-sm"><Upload className="w-4 h-4" /> CSV</button>
              </div>
              <div className="flex items-center gap-2 text-sm text-ink-500">
                <Activity className="w-4 h-4 text-success-500" />
                <span>{lang === 'fr' ? 'Temps réel' : 'Real-time'}</span>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {pspStats.map((s, i) => (
                <div key={i} className="card p-4">
                  <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${toneClasses[s.tone]} flex items-center justify-center mb-3`}>
                    <s.icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="font-display text-xl font-bold text-vanta-900">{s.value}</div>
                  <div className="text-xs text-ink-400 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <div className="card p-6">
                <h3 className="font-display text-lg font-bold text-vanta-900 mb-4">
                  {lang === 'fr' ? 'Paiements récents' : 'Recent payouts'}
                </h3>
                <div className="space-y-2">
                  {recentPayouts.map((p) => (
                    <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-ink-50 transition-colors">
                      <span className="text-xl flex-shrink-0">{p.flag}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-ink-900 text-sm truncate">{p.merchant}</div>
                        <div className="text-xs text-ink-400 font-mono">{p.id} · {p.method} · {p.time}</div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-semibold text-ink-900 text-sm">{formatCurrency(p.amount, p.currency)}</div>
                        <div className={`text-xs font-semibold ${p.status === 'completed' ? 'text-success-600' : 'text-warning-600'}`}>
                          {p.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card p-6">
                <h3 className="font-display text-lg font-bold text-vanta-900 mb-4">
                  {lang === 'fr' ? 'Top corridors' : 'Top corridors'}
                </h3>
                <div className="space-y-3">
                  {corridorStats.map((c) => (
                    <div key={c.route} className="flex items-center gap-3 p-3 rounded-xl hover:bg-ink-50 transition-colors">
                      <span className="text-lg flex-shrink-0">{c.flag}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-ink-900 text-sm">{c.route}</div>
                        <div className="text-xs text-ink-400">{c.txs} transactions</div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-semibold text-ink-900 text-sm">{c.volume}</div>
                        <div className="text-xs text-success-600">{c.success}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h2 className="font-display text-lg font-bold text-vanta-900 mb-4">{t('biz.overview.recent')}</h2>
              {txTable(20)}
            </div>
          </>
        )}

        {tab === 'recipients' && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recipients.map((r, i) => (
              <div key={r.id} className="card card-hover p-5 animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{r.flag}</span>
                  <div className="min-w-0">
                    <div className="font-semibold text-ink-900 truncate">{r.name}</div>
                    <div className="text-xs text-ink-400 truncate">{r.methodDetail}</div>
                  </div>
                </div>
                <span className="badge bg-vanta-50 text-vanta-700">{r.country}</span>
              </div>
            ))}
          </div>
        )}

        {tab === 'balances' && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {balances.map((b, i) => {
              const cur = getCurrencyByCode(b.currency);
              return (
                <div key={b.currency} className="card p-6 animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">{cur?.flag}</span>
                    <div>
                      <div className="font-display text-lg font-bold text-vanta-900">{b.currency}</div>
                      <div className="text-xs text-ink-400">{cur?.name}</div>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-ink-500">{t('dash.balances.available')}</span>
                    <span className="font-semibold text-ink-900">{formatCurrency(b.available, b.currency)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === 'fx' && (
          <div className="max-w-md card p-6 space-y-4">
            <div className="flex gap-3">
              <input type="number" value={fxAmount} onChange={(e) => setFxAmount(e.target.value)} className="input text-xl font-display font-bold" placeholder="0.00" />
              <select value={fxFrom} onChange={(e) => setFxFrom(e.target.value)} className="input w-32 font-semibold">
                {allCurrencies.map((c) => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
              </select>
            </div>
            <div className="flex justify-center">
              <div className="w-10 h-10 rounded-full bg-vanta-100 flex items-center justify-center">
                <Repeat className="w-5 h-5 text-vanta-600" />
              </div>
            </div>
            <div className="flex gap-3">
              <div className="input text-xl font-display font-bold text-vanta-600 flex items-center">
                {((parseFloat(fxAmount) || 0) * getFxRate(fxFrom, fxTo)).toLocaleString('en-US', { maximumFractionDigits: 2 })}
              </div>
              <select value={fxTo} onChange={(e) => setFxTo(e.target.value)} className="input w-32 font-semibold">
                {allCurrencies.map((c) => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
              </select>
            </div>
            <div className="text-center text-sm text-ink-500">
              {t('dash.exchange.rate')}: 1 {fxFrom} = {getFxRate(fxFrom, fxTo).toFixed(4)} {fxTo}
            </div>
          </div>
        )}

        {tab === 'treasury' && (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="font-display text-lg font-bold text-vanta-900 mb-4">{t('biz.nav.treasury')}</h3>
              <div className="space-y-3">
                {[
                  { currency: 'USD', amount: 542000, flag: '🇺🇸' },
                  { currency: 'EUR', amount: 318000, flag: '🇪🇺' },
                  { currency: 'AED', amount: 1240000, flag: '🇦🇪' },
                  { currency: 'XAF', amount: 89500000, flag: '🇨🇲' },
                ].map((pos) => (
                  <div key={pos.currency} className="flex items-center justify-between py-2 border-b border-ink-50 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{pos.flag}</span>
                      <span className="font-semibold text-ink-900">{pos.currency}</span>
                    </div>
                    <span className="font-semibold text-ink-700">{pos.amount.toLocaleString('en-US')}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card p-6">
              <h3 className="font-display text-lg font-bold text-vanta-900 mb-4">{t('admin.nav.treasury')}</h3>
              <div className="space-y-4">
                {[
                  { label: 'USD', pct: 78 },
                  { label: 'EUR', pct: 64 },
                  { label: 'AED', pct: 91 },
                  { label: 'XAF', pct: 42 },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-ink-600">{item.label}</span>
                      <span className="font-semibold text-ink-900">{item.pct}%</span>
                    </div>
                    <div className="h-2 bg-ink-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-1000 ${item.pct > 60 ? 'bg-vanta-500' : 'bg-warning-500'}`} style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'payroll' && (
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-ink-100 bg-ink-50/50">
                  <th className="text-left text-xs font-semibold text-ink-500 uppercase tracking-wider px-4 py-3">{t('dash.activity.recipient')}</th>
                  <th className="text-left text-xs font-semibold text-ink-500 uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Role</th>
                  <th className="text-right text-xs font-semibold text-ink-500 uppercase tracking-wider px-4 py-3">{t('dash.activity.amount')}</th>
                  <th className="text-right text-xs font-semibold text-ink-500 uppercase tracking-wider px-4 py-3">{t('dash.activity.status')}</th>
                </tr>
              </thead>
              <tbody>
                {payroll.map((p) => (
                  <tr key={p.id} className="border-b border-ink-50">
                    <td className="px-4 py-4">
                      <div className="font-semibold text-ink-900 text-sm">{p.name}</div>
                      <div className="text-xs text-ink-400">{p.country}</div>
                    </td>
                    <td className="px-4 py-4 text-sm text-ink-500 hidden sm:table-cell">{p.role}</td>
                    <td className="px-4 py-4 text-right font-semibold text-ink-900 text-sm">{formatCurrency(p.salary, p.currency)}</td>
                    <td className="px-4 py-4 text-right">
                      <span className={`badge ${p.paid ? 'bg-vanta-50 text-vanta-700 border border-vanta-200' : 'bg-ink-100 text-ink-500'}`}>
                        {p.paid ? t('biz.payroll.paid') : t('dash.activity.pending')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'team' && (
          <div className="grid sm:grid-cols-2 gap-4">
            {teamSeed.map((m, i) => (
              <div key={i} className="card p-5 flex items-center gap-4 animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-vanta-600 to-vanta-800 flex items-center justify-center text-white font-bold">
                  {m.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-ink-900">{m.name}</div>
                  <div className="text-xs text-ink-400 truncate">{m.email}</div>
                </div>
                <span className="badge bg-vanta-50 text-vanta-700">{m.role}</span>
              </div>
            ))}
          </div>
        )}

        {tab === 'compliance' && (
          <div className="space-y-3">
            {compliance.map((c) => (
              <div key={c.id} className="card p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-vanta-50 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-vanta-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-ink-900 text-sm">{c.entity}</div>
                  <div className="text-xs text-ink-400 font-mono">{c.id} · {c.type}</div>
                </div>
                <span className={`badge ${c.risk === 'Low' ? 'bg-vanta-50 text-vanta-700' : 'bg-warning-50 text-warning-700'}`}>{c.risk}</span>
                {c.done ? (
                  <span className="badge bg-vanta-500 text-white"><Check className="w-3 h-3" /> {t('admin.comp.approve')}</span>
                ) : (
                  <button onClick={() => setCompliance(compliance.map((x) => x.id === c.id ? { ...x, done: true } : x))} className="btn-primary text-xs px-3 py-2">
                    {t('admin.comp.approve')}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === 'reports' && (
          <div className="space-y-6">
            <div className="card p-6">
              <h3 className="font-display text-lg font-bold text-vanta-900 mb-6">{t('biz.reports.monthly')}</h3>
              <div className="flex items-end gap-4 h-48">
                {months.map((m, i) => (
                  <div key={m} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-xs font-semibold text-ink-600">${volumes[i]}M</span>
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-t from-vanta-600 to-vanta-400 transition-all duration-1000 hover:from-vanta-500 hover:to-accent-400"
                      style={{ height: `${(volumes[i] / 2.4) * 100}%` }}
                    />
                    <span className="text-xs text-ink-400">{m}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="card p-6">
                <h3 className="font-display text-lg font-bold text-vanta-900 mb-4">
                  {lang === 'fr' ? 'Répartition par méthode' : 'By payment method'}
                </h3>
                <div className="space-y-3">
                  {paymentMethods.map((m) => (
                    <div key={m.method}>
                      <div className="flex items-center justify-between text-sm mb-1.5">
                        <span className="flex items-center gap-2 text-ink-600">
                          <m.icon className="w-4 h-4 text-ink-400" />
                          {m.method}
                        </span>
                        <span className="font-semibold text-ink-900">${(m.volume / 1000).toFixed(0)}K</span>
                      </div>
                      <div className="h-2 bg-ink-100 rounded-full overflow-hidden">
                        <div className={`h-full ${m.color} rounded-full transition-all duration-1000`} style={{ width: `${m.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card p-6">
                <h3 className="font-display text-lg font-bold text-vanta-900 mb-4">
                  {lang === 'fr' ? 'Performance par corridor' : 'Corridor performance'}
                </h3>
                <div className="space-y-2">
                  {corridorStats.map((c) => (
                    <div key={c.route} className="flex items-center gap-3 p-2 rounded-lg hover:bg-ink-50">
                      <span className="text-lg">{c.flag}</span>
                      <div className="flex-1">
                        <div className="font-semibold text-ink-900 text-sm">{c.route}</div>
                        <div className="text-xs text-ink-400">{c.txs} txs</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-ink-900 text-sm">{c.volume}</div>
                        <div className="text-xs text-success-600">{c.success}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'settings' && (
          <form onSubmit={(e) => { e.preventDefault(); setSaved(true); setTimeout(() => setSaved(false), 2000); }} className="max-w-2xl space-y-6">
            <div className="card p-6 space-y-4">
              <h3 className="font-display text-lg font-bold text-vanta-900">{t('dash.home.profile')}</h3>
              <input className="input" defaultValue="Acme Corp" />
              <input className="input" defaultValue="Dubai, UAE" />
              <input className="input" defaultValue="TRN 100234567890003" />
              <button type="submit" className="btn-primary">
                {saved ? <><Check className="w-4 h-4" /> {t('set.saved')}</> : t('common.save')}
              </button>
            </div>
            <div className="card p-6">
              <h3 className="font-display text-lg font-bold text-vanta-900 mb-4">{t('api.keys.title')}</h3>
              <div className="flex items-center gap-3 bg-ink-50 rounded-lg px-4 py-3 border border-ink-200">
                <KeyRound className="w-4 h-4 text-ink-400" />
                <code className="text-sm font-mono text-ink-600 flex-1">vnt_live_••••••••••••4f2a</code>
                <span className="badge bg-vanta-50 text-vanta-700">Live</span>
              </div>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}
