import { useI18n } from '@/i18n/I18nContext';
import {
  LayoutDashboard, ArrowLeftRight, Send, Users, ShieldCheck, Wallet,
  Search, Bell, TrendingUp, Zap,
} from 'lucide-react';

const rows = [
  { id: '#VNT-000042', date: 'Aug 23, 2026', name: 'Aminata Diallo', rail: 'Wave', amount: '164,320 XAF', fee: '15.0 AED', status: 'completed' },
  { id: '#VNT-000041', date: 'Aug 23, 2026', name: 'Jean-Paul Mbarga', rail: 'Orange Money', amount: '410,800 XAF', fee: '30.0 AED', status: 'processing' },
  { id: '#VNT-000040', date: 'Aug 22, 2026', name: 'Chioma Okafor', rail: 'GTBank', amount: '2,150,000 NGN', fee: '60.0 AED', status: 'completed' },
  { id: '#VNT-000039', date: 'Aug 22, 2026', name: 'James Mwangi', rail: 'M-Pesa', amount: '28,400 KES', fee: '9.6 AED', status: 'completed' },
  { id: '#VNT-000038', date: 'Aug 21, 2026', name: 'Kwesi Mensah', rail: 'MTN Momo', amount: '5,180 GHS', fee: '18.0 AED', status: 'review' },
];

const statusStyle: Record<string, string> = {
  completed: 'bg-vanta-50 text-vanta-700 border border-vanta-200',
  processing: 'bg-blue-50 text-blue-600 border border-blue-200',
  review: 'bg-amber-50 text-amber-600 border border-amber-200',
};

const sideItems = [
  { icon: LayoutDashboard, label: 'Dashboard', active: false },
  { icon: ArrowLeftRight, label: 'Transactions', active: true },
  { icon: Send, label: 'Send', active: false },
  { icon: Users, label: 'Recipients', active: false },
  { icon: Wallet, label: 'Balances', active: false },
  { icon: ShieldCheck, label: 'KYC', active: false },
];

export function HeroMockup() {
  const { t } = useI18n();

  return (
    <div className="relative mx-auto w-full max-w-5xl">
      {/* Glow */}
      <div className="absolute -inset-10 bg-gradient-to-r from-vanta-400/15 via-vanta-500/20 to-accent-400/15 blur-3xl rounded-[3rem] animate-pulse-slow" />

      <div className="relative rounded-3xl border border-ink-200/70 bg-white shadow-[0_48px_96px_-24px_rgba(4,47,46,0.28)] overflow-hidden">
        {/* Window bar */}
        <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-ink-100 bg-ink-50/80">
          <span className="w-2.5 h-2.5 rounded-full bg-danger-500/60" />
          <span className="w-2.5 h-2.5 rounded-full bg-warning-500/60" />
          <span className="w-2.5 h-2.5 rounded-full bg-vanta-500/60" />
          <span className="ml-3 text-[10px] font-mono text-ink-400">app.vanta.global/transactions</span>
          <span className="ml-auto badge bg-vanta-500 text-white text-[10px] py-0.5">
            <Zap className="w-2.5 h-2.5" /> Live
          </span>
        </div>

        <div className="flex text-left">
          {/* Sidebar */}
          <div className="hidden sm:flex w-44 flex-col bg-vanta-950 p-3 gap-1">
            <div className="flex items-center gap-2 px-2 py-2 mb-2">
              <img src="/logo.svg" alt="VANTA" className="w-6 h-6 invert" />
              <span className="text-white font-display font-bold text-sm tracking-tight">VANTA</span>
            </div>
            {sideItems.map((item, i) => (
              <div
                key={i}
                className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium ${
                  item.active ? 'bg-vanta-500/20 text-vanta-300' : 'text-ink-400'
                }`}
              >
                <item.icon className="w-3.5 h-3.5" />
                {item.label}
                {item.active && <span className="ml-auto w-1 h-1 rounded-full bg-vanta-400" />}
              </div>
            ))}
            <div className="mt-auto rounded-lg bg-white/5 border border-white/10 p-2.5">
              <div className="text-[9px] text-ink-400 uppercase tracking-wide">Treasury</div>
              <div className="text-xs font-bold text-white mt-0.5">$4.2M</div>
              <div className="flex items-center gap-1 text-[9px] text-vanta-300 mt-0.5">
                <TrendingUp className="w-2.5 h-2.5" /> +12.4%
              </div>
            </div>
          </div>

          {/* Main */}
          <div className="flex-1 min-w-0 bg-white">
            <div className="flex items-center justify-between px-4 py-3 border-b border-ink-100">
              <div>
                <div className="text-sm font-display font-bold text-black">Transactions</div>
                <div className="text-[10px] text-ink-400">Dashboard › Transactions</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center gap-1.5 text-[10px] text-ink-500 bg-ink-50 border border-ink-200 rounded-lg px-2.5 py-1.5">
                  <Search className="w-3 h-3" /> {t('common.search')}
                </div>
                <Bell className="w-3.5 h-3.5 text-ink-400" />
                <div className="text-right">
                  <div className="text-[9px] text-ink-400">Account Balance</div>
                  <div className="text-xs font-bold text-vanta-600">254,852 XAF</div>
                </div>
              </div>
            </div>

            <div className="px-4 py-2 flex items-center gap-2 border-b border-ink-100">
              <span className="badge bg-vanta-500 text-white text-[10px] py-0.5">Live</span>
              <span className="badge bg-ink-100 text-ink-500 text-[10px] py-0.5">Sandbox</span>
            </div>

            <table className="w-full text-[11px]">
              <thead>
                <tr className="text-ink-400 border-b border-ink-100">
                  <th className="text-left font-medium px-4 py-2">ID</th>
                  <th className="text-left font-medium px-2 py-2 hidden md:table-cell">Date</th>
                  <th className="text-left font-medium px-2 py-2">Recipient</th>
                  <th className="text-left font-medium px-2 py-2 hidden lg:table-cell">Rail</th>
                  <th className="text-left font-medium px-2 py-2">Amount</th>
                  <th className="text-left font-medium px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="border-b border-ink-50 hover:bg-vanta-50/40 transition-colors">
                    <td className="px-4 py-2.5 font-mono text-ink-500">{r.id}</td>
                    <td className="px-2 py-2.5 text-ink-500 hidden md:table-cell">{r.date}</td>
                    <td className="px-2 py-2.5 font-medium text-black">{r.name}</td>
                    <td className="px-2 py-2.5 text-ink-500 hidden lg:table-cell">{r.rail}</td>
                    <td className="px-2 py-2.5 font-semibold text-black whitespace-nowrap">{r.amount}</td>
                    <td className="px-4 py-2.5">
                      <span className={`badge text-[9px] py-0.5 ${statusStyle[r.status]}`}>{r.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Floating quote card */}
      <div className="absolute -right-5 lg:-right-12 top-8 w-56 card p-4 shadow-xl shadow-vanta-900/15 animate-float hidden sm:block">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-ink-400 font-medium">{t('quote.title')}</span>
          <span className="badge bg-vanta-50 text-vanta-700 border border-vanta-200 text-[9px] py-0.5">
            <Zap className="w-2.5 h-2.5" /> {t('corr.speed')}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="font-display font-bold text-black">1,000 AED</span>
          <span className="text-vanta-500">→</span>
          <span className="font-display font-bold text-vanta-600">164,320 XAF</span>
        </div>
        <div className="mt-2 h-1 rounded-full bg-ink-100 overflow-hidden">
          <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-vanta-500 to-accent-400 animate-shimmer shimmer-bg" />
        </div>
        <div className="mt-2 text-[9px] text-ink-400 font-mono">VNT-20260823-000000001</div>
      </div>

      {/* Floating success chip */}
      <div className="absolute -left-5 lg:-left-12 bottom-10 card px-4 py-3 shadow-xl shadow-vanta-900/15 animate-float hidden sm:flex items-center gap-3" style={{ animationDelay: '1.2s' }}>
        <span className="w-8 h-8 rounded-full bg-vanta-500 flex items-center justify-center">
          <Zap className="w-4 h-4 text-white" />
        </span>
        <div>
          <div className="text-xs font-bold text-black">Payout completed</div>
          <div className="text-[10px] text-ink-400">M-Pesa · 0.8s · Kenya</div>
        </div>
      </div>
    </div>
  );
}
