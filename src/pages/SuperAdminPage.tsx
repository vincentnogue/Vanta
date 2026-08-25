import { useMemo, useState } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { type Route } from '@/router/RouterContext';
import {
  LayoutDashboard, Building2, ArrowLeftRight, Users, ShieldAlert, ScrollText,
  Settings2, ShieldCheck, Network, Vault, FileCheck, TrendingUp, Activity,
  AlertTriangle, Check, X, Ban, CircleCheck, Lock, Globe2, Radio,
} from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { StatusBadge } from '@/components/StatusBadge';
import { formatCurrency } from '@/data/mockData';
import { useStore } from '@/data/store';
import { useAuth, addSuperAdmin, removeSuperAdmin, DEFAULT_SUPER_ADMINS } from '@/data/auth';

type Tab =
  | 'overview' | 'tenants' | 'transactions' | 'staff' | 'compliance'
  | 'providers' | 'treasury' | 'fraud' | 'audit' | 'admins' | 'settings';

type TenantStatus = 'active' | 'suspended' | 'trial';
type Tenant = {
  id: string; name: string; plan: 'Enterprise' | 'Business' | 'Starter';
  region: string; users: number; volume: string; status: TenantStatus;
  isolation: string; since: string;
};

const tenantsSeed: Tenant[] = [
  { id: 'TNT-0001', name: 'Nexus Trading LLC', plan: 'Enterprise', region: 'EU-West', users: 148, volume: '$4.8M', status: 'active', isolation: 'Dedicated schema · AES-256', since: '2024-03-12' },
  { id: 'TNT-0002', name: 'Sahel Remit SARL', plan: 'Business', region: 'EU-West', users: 32, volume: '$1.2M', status: 'active', isolation: 'Dedicated schema · AES-256', since: '2024-09-01' },
  { id: 'TNT-0003', name: 'Atlas Payroll Co', plan: 'Business', region: 'EU-Central', users: 57, volume: '$860K', status: 'active', isolation: 'Dedicated schema · AES-256', since: '2025-01-20' },
  { id: 'TNT-0004', name: 'Gulf Exports FZE', plan: 'Enterprise', region: 'ME-1', users: 203, volume: '$6.1M', status: 'active', isolation: 'Dedicated cluster · AES-256', since: '2023-11-05' },
  { id: 'TNT-0005', name: 'Kivu Microfinance', plan: 'Starter', region: 'EU-West', users: 9, volume: '$120K', status: 'trial', isolation: 'Dedicated schema · AES-256', since: '2026-07-30' },
  { id: 'TNT-0006', name: 'Polar Freight AB', plan: 'Business', region: 'EU-North', users: 41, volume: '$640K', status: 'suspended', isolation: 'Dedicated schema · AES-256', since: '2025-05-14' },
  { id: 'TNT-0007', name: 'Andes Retail Group', plan: 'Starter', region: 'EU-West', users: 12, volume: '$95K', status: 'trial', isolation: 'Dedicated schema · AES-256', since: '2026-08-10' },
];

type StaffMember = {
  id: string; name: string; role: string; online: boolean;
  handled: number; approval: number; sla: number; lastActive: string;
  suspended?: boolean;
};

const staffSeed: StaffMember[] = [
  { id: 'STF-01', name: 'Claire Dubois', role: 'Compliance Officer', online: true, handled: 342, approval: 94, sla: 98, lastActive: 'now' },
  { id: 'STF-02', name: 'Omar El Amrani', role: 'Fraud Analyst', online: true, handled: 518, approval: 89, sla: 96, lastActive: 'now' },
  { id: 'STF-03', name: 'Sofie Peeters', role: 'Treasury Analyst', online: true, handled: 187, approval: 97, sla: 99, lastActive: '2 min' },
  { id: 'STF-04', name: 'Lucas Martin', role: 'Support Lead', online: false, handled: 764, approval: 92, sla: 94, lastActive: '1 h' },
  { id: 'STF-05', name: 'Awa Ndiaye', role: 'Compliance Officer', online: true, handled: 295, approval: 96, sla: 97, lastActive: 'now' },
  { id: 'STF-06', name: 'Jan Vermeulen', role: 'DevOps Engineer', online: false, handled: 88, approval: 99, sla: 100, lastActive: '3 h' },
];

type FraudAlert = { id: string; customer: string; tenant: string; reason: string; score: number; amount: string; state: 'open' | 'blocked' | 'allowed' };

const fraudSeed: FraudAlert[] = [
  { id: 'FRD-3311', customer: 'Unknown device login', tenant: 'Nexus Trading LLC', reason: 'Impossible travel · 2 countries / 1h', score: 91, amount: '$48,200', state: 'open' },
  { id: 'FRD-3309', customer: 'Batch payout spike', tenant: 'Gulf Exports FZE', reason: 'Volume 8× above baseline', score: 84, amount: '$210,000', state: 'open' },
  { id: 'FRD-3304', customer: 'Card funding retry loop', tenant: 'Sahel Remit SARL', reason: '17 attempts / 10 min', score: 77, amount: '$3,400', state: 'open' },
  { id: 'FRD-3298', customer: 'New recipient + max limit', tenant: 'Atlas Payroll Co', reason: 'First transfer at daily cap', score: 68, amount: '$25,000', state: 'open' },
];

const auditSeed = [
  { actor: 'claire.dubois@vanta.eu', action: 'Approved KYC case CMP-2026-0812', target: 'Aminata Diallo', time: '2026-08-24 06:12', ip: '10.4.2.18' },
  { actor: 'system', action: 'Tenant isolation snapshot completed', target: 'TNT-0004', time: '2026-08-24 06:00', ip: '—' },
  { actor: 'omar.elamrani@vanta.eu', action: 'Blocked transaction', target: 'VNT-20260823-000000031', time: '2026-08-24 05:47', ip: '10.4.2.22' },
  { actor: 'sofie.peeters@vanta.eu', action: 'Rebalanced XAF liquidity pool', target: 'Treasury / XAF', time: '2026-08-24 05:15', ip: '10.4.2.31' },
  { actor: 'admin@vanta.eu', action: 'Updated global fee to 1.20%', target: 'Platform settings', time: '2026-08-24 04:58', ip: '10.4.1.2' },
  { actor: 'lucas.martin@vanta.eu', action: 'Resolved ticket TKT-0987', target: 'Kwesi Mensah', time: '2026-08-24 04:20', ip: '10.4.2.27' },
];

const liveFeedSeed = [
  { icon: ArrowLeftRight, text: 'Transfer completed · 1,000 AED → XAF', meta: 'TNT-0002 · 0.8s', tone: 'text-vanta-600 bg-vanta-50' },
  { icon: ShieldAlert, text: 'Fraud score 91 assigned', meta: 'FRD-3311 · rules engine', tone: 'text-danger-600 bg-danger-50' },
  { icon: Building2, text: 'New tenant provisioned', meta: 'TNT-0007 · isolated schema', tone: 'text-vanta-600 bg-vanta-50' },
  { icon: FileCheck, text: 'KYC case approved', meta: 'CMP-2026-0812 · STF-01', tone: 'text-vanta-600 bg-vanta-50' },
  { icon: Vault, text: 'Liquidity rebalance executed', meta: 'XAF pool · +12%', tone: 'text-warning-600 bg-warning-50' },
  { icon: Network, text: 'Provider failover test passed', meta: 'EuroPay SEPA → backup rail', tone: 'text-vanta-600 bg-vanta-50' },
];

const volumeByDay = [38, 42, 35, 47, 52, 44, 58, 61, 49, 55, 63, 59, 66, 72];

const providers = [
  { name: 'Gulf Bank Rail', type: 'Bank', success: 98.8, latency: '1.2s', cost: '1.1%', online: true },
  { name: 'Sahel Mobile Money', type: 'Mobile Money', success: 97.4, latency: '0.8s', cost: '0.8%', online: true },
  { name: 'AtlasFX', type: 'FX Provider', success: 99.6, latency: '0.3s', cost: '0.15%', online: true },
  { name: 'EuroPay SEPA', type: 'PSP', success: 94.2, latency: '2.1s', cost: '1.4%', online: false },
];

const liquidity = [
  { currency: 'USD', amount: '$4.2M', pct: 78 },
  { currency: 'EUR', amount: '€2.8M', pct: 64 },
  { currency: 'AED', amount: '11.6M AED', pct: 91 },
  { currency: 'XAF', amount: '890M XAF', pct: 42 },
  { currency: 'NGN', amount: '1.2B NGN', pct: 55 },
  { currency: 'KES', amount: '96M KES', pct: 70 },
];

const complianceSeed = [
  { id: 'CMP-2026-0812', subject: 'Aminata Diallo', tenant: 'Sahel Remit SARL', reason: 'Velocity check', state: 'open' as 'open' | 'approved' | 'flagged' },
  { id: 'CMP-2026-0811', subject: 'Nexus Trading LLC', tenant: 'Nexus Trading LLC', reason: 'KYB document expired', state: 'open' as 'open' | 'approved' | 'flagged' },
  { id: 'CMP-2026-0809', subject: 'Jean-Paul Mbarga', tenant: 'Kivu Microfinance', reason: 'High-risk corridor', state: 'open' as 'open' | 'approved' | 'flagged' },
];

const tenantStatusTone: Record<TenantStatus, string> = {
  active: 'bg-vanta-50 text-vanta-700 border border-vanta-200',
  suspended: 'bg-danger-50 text-danger-600 border border-danger-200',
  trial: 'bg-warning-50 text-warning-600 border border-warning-500/30',
};

export function SuperAdminPage() {
  const { t } = useI18n();
  const [tab, setTab] = useState<Tab>('overview');
  const { transactions } = useStore();
  const [tenants, setTenants] = useState(tenantsSeed);
  const [fraud, setFraud] = useState(fraudSeed);
  const [cases, setCases] = useState(complianceSeed);
  const [tenantQuery, setTenantQuery] = useState('');
  const [maintenance, setMaintenance] = useState(false);
  const [saved, setSaved] = useState(false);
  const { superAdminEmails } = useAuth();
  const [staff, setStaff] = useState(staffSeed);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminAdded, setAdminAdded] = useState(false);
  const [staffForm, setStaffForm] = useState({ name: '', email: '', role: 'Compliance Officer' });

  const tabLabels: Record<Tab, string> = {
    overview: t('sa.nav.overview'),
    tenants: t('sa.nav.tenants'),
    transactions: t('admin.nav.transactions'),
    staff: t('sa.nav.staff'),
    compliance: t('admin.nav.compliance'),
    providers: t('admin.nav.providers'),
    treasury: t('admin.nav.treasury'),
    fraud: t('sa.nav.fraud'),
    audit: t('sa.nav.audit'),
    admins: t('sa.admins.title'),
    settings: t('sa.nav.settings'),
  };

  const navItems = ([
    ['overview', LayoutDashboard],
    ['tenants', Building2],
    ['transactions', ArrowLeftRight],
    ['staff', Users],
    ['compliance', ShieldCheck],
    ['fraud', ShieldAlert],
    ['providers', Network],
    ['treasury', Vault],
    ['audit', ScrollText],
    ['admins', ShieldCheck],
    ['settings', Settings2],
  ] as [Tab, typeof LayoutDashboard][]).map(([key, icon]) => ({
    route: 'superadmin' as Route, label: tabLabels[key], icon, tabKey: key, onSelect: () => setTab(key),
  }));

  const filteredTenants = useMemo(
    () => tenants.filter((x) => x.name.toLowerCase().includes(tenantQuery.toLowerCase()) || x.id.toLowerCase().includes(tenantQuery.toLowerCase())),
    [tenants, tenantQuery],
  );

  const kpis = [
    { label: t('sa.ov.volumeToday'), value: '$6.4M', icon: TrendingUp, delta: '+12.4%' },
    { label: t('sa.ov.activeTenants'), value: String(tenants.filter((x) => x.status === 'active').length), icon: Building2, delta: '+2' },
    { label: t('sa.ov.activeUsers'), value: '18,204', icon: Users, delta: '+3.1%' },
    { label: t('sa.ov.tps'), value: '42.7', icon: Activity, delta: 'peak 118' },
    { label: t('sa.ov.uptime'), value: '99.99%', icon: Radio, delta: '90d' },
    { label: t('sa.ov.alerts'), value: String(fraud.filter((f) => f.state === 'open').length + cases.filter((c) => c.state === 'open').length), icon: AlertTriangle, delta: 'SLA 100%' },
  ];

  const maxVol = Math.max(...volumeByDay);

  const saveSettings = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <DashboardLayout navItems={navItems} activeRoute={tab}>
      <div className="space-y-8 animate-fade-in" key={tab}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-display text-2xl font-bold text-black">{tabLabels[tab]}</h1>
            <p className="text-xs text-ink-400 mt-1 flex items-center gap-1.5">
              <Lock className="w-3 h-3" /> {t('sa.title')} · {t('sa.tenants.isolation')}
            </p>
          </div>
          <span className="badge bg-vanta-950 text-vanta-300 border border-vanta-800">
            <Globe2 className="w-3.5 h-3.5" /> Multi-tenant · 194 {t('coverage.countries').toLowerCase()}
          </span>
        </div>

        {tab === 'overview' && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {kpis.map((kpi, i) => (
                <div key={i} className="card p-4 animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
                  <div className="w-8 h-8 rounded-lg bg-vanta-50 border border-vanta-100 flex items-center justify-center mb-3">
                    <kpi.icon className="w-4 h-4 text-vanta-600" />
                  </div>
                  <div className="font-display text-lg font-bold text-black">{kpi.value}</div>
                  <div className="text-[11px] text-ink-500 mt-0.5">{kpi.label}</div>
                  <div className="text-[10px] text-vanta-600 font-semibold mt-1">{kpi.delta}</div>
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="card p-6 lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display font-bold text-black">{t('sa.ov.volumeByDay')}</h2>
                  <span className="badge bg-vanta-50 text-vanta-700 border border-vanta-200">$M</span>
                </div>
                <div className="flex items-end gap-2 h-40">
                  {volumeByDay.map((v, i) => (
                    <div key={i} className="flex-1 h-full flex flex-col items-center justify-end gap-1.5 group">
                      <span className="text-[9px] font-mono text-ink-400 opacity-0 group-hover:opacity-100 transition-opacity">{v}</span>
                      <div
                        className="w-full rounded-t-md bg-gradient-to-t from-vanta-700 to-vanta-400 group-hover:from-vanta-600 group-hover:to-accent-400 transition-all duration-500"
                        style={{ height: `${(v / maxVol) * 100}%` }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="card overflow-hidden">
                <div className="px-5 py-4 border-b border-ink-100 flex items-center justify-between">
                  <h2 className="font-display font-bold text-black text-sm">{t('sa.ov.liveFeed')}</h2>
                  <span className="w-2 h-2 rounded-full bg-vanta-500 animate-pulse" />
                </div>
                <div className="divide-y divide-ink-50 max-h-64 overflow-y-auto">
                  {liveFeedSeed.map((e, i) => (
                    <div key={i} className="px-5 py-3 flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${e.tone}`}>
                        <e.icon className="w-4 h-4" />
                      </span>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-ink-900 truncate">{e.text}</div>
                        <div className="text-[10px] text-ink-400 font-mono">{e.meta}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h2 className="font-display font-bold text-black mb-5">{t('sa.ov.tenantsByPlan')}</h2>
              <div className="grid sm:grid-cols-3 gap-4">
                {(['Enterprise', 'Business', 'Starter'] as const).map((plan) => {
                  const count = tenants.filter((x) => x.plan === plan).length;
                  const pct = Math.round((count / tenants.length) * 100);
                  return (
                    <div key={plan} className="rounded-xl border border-ink-100 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-ink-800">{plan}</span>
                        <span className="text-xs font-mono text-ink-400">{count}</span>
                      </div>
                      <div className="h-2 bg-ink-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-vanta-600 to-accent-400 transition-all duration-1000" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {tab === 'tenants' && (
          <>
            <div className="flex items-center gap-3">
              <input
                value={tenantQuery}
                onChange={(e) => setTenantQuery(e.target.value)}
                placeholder={t('sa.tenants.search')}
                className="input !w-full sm:!w-72 !py-2.5 text-sm"
              />
              <span className="badge bg-vanta-50 text-vanta-700 border border-vanta-200 whitespace-nowrap">
                <Lock className="w-3 h-3" /> {t('sa.tenants.isolation')}
              </span>
            </div>
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-ink-100 bg-ink-50/50">
                      <th className="text-left text-xs font-semibold text-ink-500 uppercase tracking-wider px-6 py-3">{t('sa.tenants.title')}</th>
                      <th className="text-left text-xs font-semibold text-ink-500 uppercase tracking-wider px-4 py-3 hidden md:table-cell">{t('sa.tenants.plan')}</th>
                      <th className="text-left text-xs font-semibold text-ink-500 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">{t('sa.tenants.region')}</th>
                      <th className="text-right text-xs font-semibold text-ink-500 uppercase tracking-wider px-4 py-3 hidden sm:table-cell">{t('sa.tenants.users')}</th>
                      <th className="text-right text-xs font-semibold text-ink-500 uppercase tracking-wider px-4 py-3">{t('sa.tenants.volume')}</th>
                      <th className="text-right text-xs font-semibold text-ink-500 uppercase tracking-wider px-6 py-3">{t('sa.tenants.status')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTenants.map((tenant) => (
                      <tr key={tenant.id} className="border-b border-ink-50 hover:bg-ink-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-ink-900 text-sm">{tenant.name}</div>
                          <div className="text-[11px] text-ink-400 font-mono flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" /> {tenant.id} · {tenant.isolation}
                          </div>
                        </td>
                        <td className="px-4 py-4 hidden md:table-cell">
                          <span className="badge bg-ink-100 text-ink-700">{tenant.plan}</span>
                        </td>
                        <td className="px-4 py-4 hidden lg:table-cell text-sm text-ink-600">{tenant.region}</td>
                        <td className="px-4 py-4 text-right text-sm text-ink-800 hidden sm:table-cell">{tenant.users}</td>
                        <td className="px-4 py-4 text-right font-semibold text-ink-900 text-sm">{tenant.volume}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className={`badge ${tenantStatusTone[tenant.status]}`}>{t(`sa.tenants.${tenant.status}` as const)}</span>
                            {tenant.status !== 'suspended' ? (
                              <button
                                onClick={() => setTenants(tenants.map((x) => x.id === tenant.id ? { ...x, status: 'suspended' } : x))}
                                className="p-1.5 rounded-lg text-danger-500 hover:bg-danger-50 transition-colors"
                                title={t('sa.tenants.suspend')}
                              >
                                <Ban className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => setTenants(tenants.map((x) => x.id === tenant.id ? { ...x, status: 'active' } : x))}
                                className="p-1.5 rounded-lg text-vanta-600 hover:bg-vanta-50 transition-colors"
                                title={t('sa.tenants.activate')}
                              >
                                <CircleCheck className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {tab === 'transactions' && (
          <div className="card overflow-hidden">
            <div className="divide-y divide-ink-100">
              {transactions.map((tx) => (
                <div key={tx.id} className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-ink-50/50 transition-colors">
                  <div className="min-w-0">
                    <div className="font-semibold text-ink-900 text-sm truncate">{tx.recipientFlag} {tx.recipientName}</div>
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

        {tab === 'staff' && (
          <div className="space-y-6">
            <div className="card p-5">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  value={staffForm.name}
                  onChange={(e) => setStaffForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder={t('sa.staff.name')}
                  className="input !py-2.5 text-sm flex-1"
                />
                <input
                  value={staffForm.email}
                  onChange={(e) => setStaffForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder={t('sa.staff.email')}
                  type="email"
                  className="input !py-2.5 text-sm flex-1"
                />
                <select
                  value={staffForm.role}
                  onChange={(e) => setStaffForm((f) => ({ ...f, role: e.target.value }))}
                  className="input !py-2.5 text-sm sm:w-52"
                >
                  <option>Compliance Officer</option>
                  <option>Fraud Analyst</option>
                  <option>Support Lead</option>
                  <option>Treasury Ops</option>
                  <option>Support Agent</option>
                </select>
                <button
                  onClick={() => {
                    if (!staffForm.name.trim() || !staffForm.email.trim()) return;
                    setStaff((s) => [
                      { id: `STF-${String(s.length + 1).padStart(2, '0')}`, name: staffForm.name.trim(), role: staffForm.role, online: false, handled: 0, approval: 100, sla: 100, lastActive: 'now' },
                      ...s,
                    ]);
                    setStaffForm({ name: '', email: '', role: 'Compliance Officer' });
                  }}
                  className="btn-primary text-sm !py-2.5 whitespace-nowrap"
                >
                  {t('sa.staff.add')}
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
            {staff.map((member, i) => (
              <div key={member.id} className={`card p-5 animate-fade-up ${member.suspended ? 'opacity-60' : ''}`} style={{ animationDelay: `${i * 60}ms` }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-vanta-600 to-vanta-800 text-white flex items-center justify-center font-display font-bold text-sm">
                      {member.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${member.online && !member.suspended ? 'bg-vanta-500' : 'bg-ink-300'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-ink-900 text-sm">{member.name}</div>
                    <div className="text-xs text-ink-400">{member.role} · {member.id}</div>
                  </div>
                  <span className={`badge ${member.suspended ? 'bg-danger-50 text-danger-600 border border-danger-200' : member.online ? 'bg-vanta-50 text-vanta-700 border border-vanta-200' : 'bg-ink-100 text-ink-500'}`}>
                    {member.suspended ? t('sa.staff.suspended') : member.online ? t('sa.staff.online') : t('sa.staff.offline')}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center mb-4">
                  <div className="rounded-lg bg-ink-50 py-2">
                    <div className="font-display font-bold text-black text-sm">{member.handled}</div>
                    <div className="text-[10px] text-ink-400">{t('sa.staff.handled')}</div>
                  </div>
                  <div className="rounded-lg bg-ink-50 py-2">
                    <div className="font-display font-bold text-black text-sm">{member.approval}%</div>
                    <div className="text-[10px] text-ink-400">{t('sa.staff.approval')}</div>
                  </div>
                  <div className="rounded-lg bg-ink-50 py-2">
                    <div className="font-display font-bold text-black text-sm">{member.sla}%</div>
                    <div className="text-[10px] text-ink-400">{t('sa.staff.sla')}</div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-[11px] text-ink-500 mb-1.5">
                    <span>{t('sa.staff.performance')}</span>
                    <span className="font-mono">{Math.round((member.approval + member.sla) / 2)}%</span>
                  </div>
                  <div className="h-2 bg-ink-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-vanta-600 to-accent-400 transition-all duration-1000"
                      style={{ width: `${(member.approval + member.sla) / 2}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-ink-400 mt-2">{t('sa.staff.lastActive')}: {member.lastActive}</div>
                </div>
                <div className="mt-4 pt-4 border-t border-ink-100 flex items-center gap-2">
                  <button
                    onClick={() => setStaff((s) => s.map((m) => m.id === member.id ? { ...m, suspended: !m.suspended, online: m.suspended ? m.online : false } : m))}
                    className={`flex-1 text-xs font-semibold px-3 py-2 rounded-lg transition-colors ${
                      member.suspended
                        ? 'bg-vanta-50 text-vanta-700 hover:bg-vanta-100'
                        : 'bg-warning-50 text-warning-600 hover:bg-warning-500/20'
                    }`}
                  >
                    {member.suspended ? t('sa.tenants.activate') : t('sa.staff.suspend')}
                  </button>
                  <button
                    onClick={() => setStaff((s) => s.filter((m) => m.id !== member.id))}
                    className="flex-1 text-xs font-semibold px-3 py-2 rounded-lg bg-danger-50 text-danger-600 hover:bg-danger-500/20 transition-colors"
                  >
                    {t('sa.staff.remove')}
                  </button>
                </div>
              </div>
            ))}
            </div>
          </div>
        )}

        {tab === 'compliance' && (
          <div className="space-y-3">
            {cases.map((c) => (
              <div key={c.id} className="card p-5 flex items-center gap-4 flex-wrap">
                <div className="w-10 h-10 rounded-xl bg-vanta-50 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-vanta-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-ink-900 text-sm">{c.subject}</div>
                  <div className="text-xs text-ink-400 font-mono">{c.id} — {c.reason} · {c.tenant}</div>
                </div>
                {c.state === 'open' ? (
                  <div className="flex gap-2">
                    <button onClick={() => setCases(cases.map((x) => x.id === c.id ? { ...x, state: 'approved' as const } : x))} className="btn-primary text-xs px-3 py-2">
                      <Check className="w-3.5 h-3.5" /> {t('admin.comp.approve')}
                    </button>
                    <button onClick={() => setCases(cases.map((x) => x.id === c.id ? { ...x, state: 'flagged' as const } : x))} className="btn-outline text-xs px-3 py-2">
                      <X className="w-3.5 h-3.5" /> {t('admin.comp.flag')}
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

        {tab === 'fraud' && (
          <>
            <div className="flex items-center gap-2 text-sm text-ink-500">
              <ShieldAlert className="w-4 h-4 text-danger-500" />
              {fraud.filter((f) => f.state === 'open').length} {t('sa.fraud.queue')}
            </div>
            <div className="space-y-3">
              {fraud.map((f) => (
                <div key={f.id} className="card p-5 flex items-center gap-4 flex-wrap">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-display font-bold text-sm ${
                    f.score >= 85 ? 'bg-danger-50 text-danger-600' : f.score >= 70 ? 'bg-warning-50 text-warning-600' : 'bg-vanta-50 text-vanta-700'
                  }`}>
                    {f.score}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-ink-900 text-sm">{f.customer}</div>
                    <div className="text-xs text-ink-400 font-mono">{f.id} · {f.tenant} · {f.reason}</div>
                  </div>
                  <div className="text-sm font-semibold text-black">{f.amount}</div>
                  {f.state === 'open' ? (
                    <div className="flex gap-2">
                      <button onClick={() => setFraud(fraud.map((x) => x.id === f.id ? { ...x, state: 'blocked' as const } : x))} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-danger-500 text-white text-xs font-semibold hover:bg-danger-600 transition-colors">
                        <Ban className="w-3.5 h-3.5" /> {t('sa.fraud.block')}
                      </button>
                      <button onClick={() => setFraud(fraud.map((x) => x.id === f.id ? { ...x, state: 'allowed' as const } : x))} className="btn-outline text-xs px-3 py-2">
                        <Check className="w-3.5 h-3.5" /> {t('sa.fraud.allow')}
                      </button>
                    </div>
                  ) : (
                    <span className={`badge ${f.state === 'blocked' ? 'bg-danger-500 text-white' : 'bg-vanta-500 text-white'}`}>
                      {f.state === 'blocked' ? t('sa.fraud.blocked') : t('sa.fraud.allowed')}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {tab === 'providers' && (
          <div className="card overflow-hidden">
            <div className="divide-y divide-ink-100">
              {providers.map((p, i) => (
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
              ))}
            </div>
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
                <div className="text-xs text-ink-400 mt-2">{l.pct}%</div>
              </div>
            ))}
          </div>
        )}

        {tab === 'audit' && (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-ink-100 bg-ink-50/50">
                    <th className="text-left text-xs font-semibold text-ink-500 uppercase tracking-wider px-6 py-3">{t('sa.audit.actor')}</th>
                    <th className="text-left text-xs font-semibold text-ink-500 uppercase tracking-wider px-4 py-3">{t('sa.audit.action')}</th>
                    <th className="text-left text-xs font-semibold text-ink-500 uppercase tracking-wider px-4 py-3 hidden md:table-cell">{t('sa.audit.target')}</th>
                    <th className="text-left text-xs font-semibold text-ink-500 uppercase tracking-wider px-4 py-3 hidden sm:table-cell">{t('sa.audit.time')}</th>
                    <th className="text-right text-xs font-semibold text-ink-500 uppercase tracking-wider px-6 py-3 hidden lg:table-cell">{t('sa.audit.ip')}</th>
                  </tr>
                </thead>
                <tbody>
                  {auditSeed.map((a, i) => (
                    <tr key={i} className="border-b border-ink-50 hover:bg-ink-50/50 transition-colors">
                      <td className="px-6 py-3.5 text-xs font-mono text-ink-700">{a.actor}</td>
                      <td className="px-4 py-3.5 text-sm text-ink-900">{a.action}</td>
                      <td className="px-4 py-3.5 text-xs text-ink-500 hidden md:table-cell">{a.target}</td>
                      <td className="px-4 py-3.5 text-xs font-mono text-ink-400 hidden sm:table-cell">{a.time}</td>
                      <td className="px-6 py-3.5 text-xs font-mono text-ink-400 text-right hidden lg:table-cell">{a.ip}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'admins' && (
          <div className="space-y-6">
            <div className="card p-5">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="new.admin@vanta.global"
                  type="email"
                  className="input !py-2.5 text-sm flex-1"
                />
                <button
                  onClick={() => {
                    if (!adminEmail.trim() || !adminEmail.includes('@')) return;
                    addSuperAdmin(adminEmail);
                    setAdminEmail('');
                    setAdminAdded(true);
                    setTimeout(() => setAdminAdded(false), 2000);
                  }}
                  className="btn-primary text-sm !py-2.5 whitespace-nowrap"
                >
                  {adminAdded ? <Check className="w-4 h-4" /> : null}
                  {adminAdded ? t('sa.admins.added') : t('sa.admins.add')}
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {superAdminEmails.map((email, i) => {
                const isProtected = DEFAULT_SUPER_ADMINS.includes(email);
                return (
                  <div key={email} className="card p-4 flex items-center gap-4 animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-vanta-600 to-vanta-800 text-white flex items-center justify-center font-display font-bold text-sm">
                      {email[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-ink-900 text-sm truncate">{email}</div>
                      <div className="text-xs text-ink-400 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-vanta-500" />
                        Super Admin
                        {isProtected && <span className="badge bg-ink-100 text-ink-500 ml-1">{t('sa.admins.protected')}</span>}
                      </div>
                    </div>
                    {!isProtected && (
                      <button
                        onClick={() => removeSuperAdmin(email)}
                        className="text-xs font-semibold px-3 py-2 rounded-lg bg-danger-50 text-danger-600 hover:bg-danger-500/20 transition-colors"
                      >
                        {t('sa.staff.remove')}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === 'settings' && (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="card p-6 space-y-5">
              <h2 className="font-display font-bold text-black">{t('sa.set.fees')}</h2>
              <div>
                <label className="text-xs font-semibold text-ink-500 mb-1.5 block">{t('sa.set.globalFee')}</label>
                <input type="number" defaultValue={1.2} step={0.1} className="input" />
              </div>
              <div>
                <label className="text-xs font-semibold text-ink-500 mb-1.5 block">{t('sa.set.perTxLimit')}</label>
                <input type="number" defaultValue={50000} className="input" />
              </div>
              <div>
                <label className="text-xs font-semibold text-ink-500 mb-1.5 block">{t('sa.set.dailyLimit')}</label>
                <input type="number" defaultValue={100000} className="input" />
              </div>
              <button onClick={saveSettings} className="btn-primary text-sm">
                {saved ? <Check className="w-4 h-4" /> : null}
                {saved ? t('sa.set.saved') : t('common.save')}
              </button>
            </div>

            <div className="card p-6 space-y-5">
              <h2 className="font-display font-bold text-black">{t('sa.set.maintenance')}</h2>
              <div className="flex items-center justify-between rounded-xl border border-ink-100 p-4">
                <div>
                  <div className="text-sm font-semibold text-ink-900">{t('sa.set.maintenance')}</div>
                  <div className="text-xs text-ink-400 mt-0.5">{maintenance ? t('sa.set.on') : t('sa.set.off')}</div>
                </div>
                <button
                  onClick={() => setMaintenance(!maintenance)}
                  className={`relative w-12 h-7 rounded-full transition-colors duration-300 ${maintenance ? 'bg-danger-500' : 'bg-ink-200'}`}
                  role="switch"
                  aria-checked={maintenance}
                >
                  <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all duration-300 ${maintenance ? 'left-6' : 'left-1'}`} />
                </button>
              </div>
              <div className="rounded-xl bg-vanta-950 p-4 text-xs text-ink-300 font-mono space-y-1">
                <div>region: eu-west-1 (primary)</div>
                <div>encryption: AES-256-GCM · TLS 1.3</div>
                <div>isolation: schema-per-tenant · row-level security</div>
                <div>backups: 15 min PITR · 35 days retention</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
