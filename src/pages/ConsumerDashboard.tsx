import { useState } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import type { Language } from '@/i18n/translations';
import { useRouter, type Route } from '@/router/RouterContext';
import { DashboardLayout } from '@/components/DashboardLayout';
import {
  Home, Send, Users, Activity as ActivityIcon, Wallet, Repeat, Shield, Settings,
  Check, ArrowLeft, ArrowRight, Building2, CreditCard, Landmark, Smartphone, Wallet as WalletIcon, Banknote,
} from 'lucide-react';
import {
  formatCurrency, getCurrencyByCode,
  countries as allCountries, currencies as allCurrencies, getFxRate, calculateFee,
  type Transaction, type PayoutMethod,
} from '@/data/mockData';
import { useStore, createTransfer, addRecipient, exchangeMoney, nextTxId } from '@/data/store';
import { useAuth } from '@/data/auth';
import { StatusBadge } from '@/components/StatusBadge';
import { PspCheckout } from '@/components/PspCheckout';
import { CardsPage } from './CardsPage';
import { X, Monitor, Smartphone as PhoneIcon, Globe as GlobeIcon, MessageSquare, Plus } from 'lucide-react';

const iconMap: Record<string, typeof Home> = {
  Building2, CreditCard, Landmark, Smartphone, Wallet: WalletIcon, Banknote, Send, Users, Home,
};

const payoutMethodLabelsMap: Record<PayoutMethod, { en: string; fr: string; icon: string }> = {
  bank: { en: 'Bank account', fr: 'Compte bancaire', icon: 'Building2' },
  mobile_money: { en: 'Mobile money', fr: 'Mobile money', icon: 'Smartphone' },
  wallet: { en: 'Wallet', fr: 'Portefeuille', icon: 'Wallet' },
  card: { en: 'Card', fr: 'Carte', icon: 'CreditCard' },
  cash: { en: 'Cash pickup', fr: 'Retrait en espèces', icon: 'Banknote' },
};

function getCountries() { return allCountries; }
const currenciesList = allCurrencies;
function getFxRateFor(from: string, to: string) { return getFxRate(from, to); }
function calculateFeeAmount(amount: number, currency: string) { return calculateFee(amount, currency); }

export function ConsumerDashboard() {
  const { t, lang } = useI18n();
  const { route, navigate } = useRouter();
  const { balances, transactions } = useStore();
  const { user } = useAuth();
  const kycVerified = user?.kycStatus === 'verified';

  const navItems = [
    { route: 'consumer' as Route, label: t('dash.nav.home'), icon: Home },
    { route: (kycVerified ? 'send' : 'kyc') as Route, label: t('dash.nav.send'), icon: Send },
    { route: 'recipients' as Route, label: t('dash.nav.recipients'), icon: Users },
    { route: 'activity' as Route, label: t('dash.nav.activity'), icon: ActivityIcon },
    { route: 'balances' as Route, label: t('dash.nav.balances'), icon: Wallet },
    { route: 'cards' as Route, label: t('dash.nav.cards'), icon: CreditCard },
    { route: 'exchange' as Route, label: t('dash.nav.exchange'), icon: Repeat },
    { route: 'security' as Route, label: t('dash.nav.security'), icon: Shield },
    { route: 'settings' as Route, label: t('dash.nav.settings'), icon: Settings },
  ];

  if (route === 'send') return <SendMoney />;
  if (route === 'recipients') return <Recipients />;
  if (route === 'activity') return <ActivityPage />;
  if (route === 'balances') return <Balances />;
  if (route === 'cards') return <CardsPage />;
  if (route === 'exchange') return <Exchange />;
  if (route === 'security') return <SecurityPage />;
  if (route === 'settings') return <SettingsPage />;
  if (route === 'support') return <SupportPage />;

  // Home dashboard
  const totalUsd = balances.reduce((sum, b) => sum + b.available * getFxRate(b.currency, 'USD'), 0);

  const quickActions = [
    { label: t('dash.home.sendMoney'), icon: Send, route: 'send' as Route, gradient: 'from-vanta-600 to-vanta-800' },
    { label: t('dash.home.exchange'), icon: Repeat, route: 'exchange' as Route, gradient: 'from-accent-500 to-accent-700' },
    { label: t('dash.home.addRecipient'), icon: Users, route: 'recipients' as Route, gradient: 'from-vanta-500 to-vanta-700' },
  ];

  const pendingTx = transactions.filter((tx) => tx.status === 'processing' || tx.status === 'pending');

  return (
    <DashboardLayout navItems={navItems} activeRoute="consumer">
      <div className="space-y-8 animate-fade-in">
        {!kycVerified && (
          <button
            onClick={() => navigate('kyc')}
            className="w-full card p-4 flex items-center gap-4 text-left border-warning-500/40 bg-warning-50/60 hover:bg-warning-50 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-warning-500/15 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-warning-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-ink-900 text-sm">{t('kyc.title')}</div>
              <div className="text-xs text-ink-500">{t('kyc.subtitle')}</div>
            </div>
            <ArrowRight className="w-5 h-5 text-warning-600 flex-shrink-0" />
          </button>
        )}
        <div>
          <h1 className="font-display text-2xl font-bold text-vanta-900">
            {t('dash.home.welcome')}
          </h1>
        </div>

        {/* Balance card */}
        <div className="relative rounded-2xl bg-gradient-to-br from-vanta-900 to-vanta-950 p-6 overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-20" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent-500/15 blur-[80px]" />
          <div className="relative">
            <p className="text-sm text-ink-400">{t('dash.home.totalBalance')}</p>
            <p className="mt-2 font-display text-4xl font-bold text-white">
              ${totalUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {balances.slice(0, 4).map((b) => {
                const cur = getCurrencyByCode(b.currency);
                return (
                  <div key={b.currency} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm">
                    <span>{cur?.flag}</span>
                    <span className="text-white font-medium">{formatCurrency(b.available, b.currency)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid sm:grid-cols-3 gap-4">
          {quickActions.map((action, i) => (
            <button
              key={i}
              onClick={() => navigate(action.route)}
              className="card card-hover p-5 flex items-center gap-4 text-left"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center flex-shrink-0`}>
                <action.icon className="w-6 h-6 text-white" />
              </div>
              <span className="font-semibold text-vanta-900">{action.label}</span>
            </button>
          ))}
        </div>

        {/* Pending transfers */}
        {pendingTx.length > 0 && (
          <div>
            <h2 className="font-display text-lg font-bold text-vanta-900 mb-4">{t('dash.home.pending')}</h2>
            <div className="space-y-3">
              {pendingTx.map((tx) => (
                <TransactionRow key={tx.id} tx={tx} lang={lang} />
              ))}
            </div>
          </div>
        )}

        {/* Recent activity */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-bold text-vanta-900">{t('dash.home.recentActivity')}</h2>
            <button
              onClick={() => navigate('activity')}
              className="text-sm font-semibold text-vanta-600 hover:text-vanta-700"
            >
              {t('dash.home.viewAll')}
            </button>
          </div>
          <div className="space-y-3">
            {transactions.slice(0, 5).map((tx, i) => (
              <div key={tx.id} className="animate-fade-up" style={{ animationDelay: `${i * 70}ms` }}>
                <TransactionRow tx={tx} lang={lang} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function TransactionRow({ tx, lang }: { tx: Transaction; lang: Language }) {
  const date = new Date(tx.date);
  const dateStr = date.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="card p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className="w-10 h-10 rounded-full bg-ink-100 flex items-center justify-center text-xl flex-shrink-0">
        {tx.recipientFlag}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-ink-900 truncate">{tx.recipientName}</div>
        <div className="text-sm text-ink-400">{dateStr} · {tx.id.slice(-12)}</div>
      </div>
      <div className="text-right flex-shrink-0">
        <div className="font-semibold text-ink-900">-{formatCurrency(tx.amount, tx.currency)}</div>
        <div className="text-sm text-ink-400">{formatCurrency(tx.payoutAmount, tx.payoutCurrency)}</div>
      </div>
      <StatusBadge status={tx.status} />
    </div>
  );
}

// --- Send Money Flow ---
function SendMoney() {
  const { t, lang } = useI18n();
  const { navigate } = useRouter();
  const [step, setStep] = useState(1);
  const [destCountry, setDestCountry] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [sendCurrency, setSendCurrency] = useState('AED');
  const [fundingMethod, setFundingMethod] = useState('');
  const [recipient, setRecipient] = useState('');
  const [payoutMethod, setPayoutMethod] = useState('');
  const [success, setSuccess] = useState(false);
  const [txId, setTxId] = useState('');
  const { recipients, balances } = useStore();
  const { user } = useAuth();
  const kycVerified = user?.kycStatus === 'verified';
  const [insufficient, setInsufficient] = useState(false);

  const navItems = [
    { route: 'consumer' as Route, label: t('dash.nav.home'), icon: Home },
    { route: (kycVerified ? 'send' : 'kyc') as Route, label: t('dash.nav.send'), icon: Send },
    { route: 'recipients' as Route, label: t('dash.nav.recipients'), icon: Users },
    { route: 'activity' as Route, label: t('dash.nav.activity'), icon: ActivityIcon },
    { route: 'balances' as Route, label: t('dash.nav.balances'), icon: Wallet },
    { route: 'cards' as Route, label: t('dash.nav.cards'), icon: CreditCard },
    { route: 'exchange' as Route, label: t('dash.nav.exchange'), icon: Repeat },
    { route: 'security' as Route, label: t('dash.nav.security'), icon: Shield },
    { route: 'settings' as Route, label: t('dash.nav.settings'), icon: Settings },
  ];

  const steps = [t('dash.send.step1'), t('dash.send.step2'), t('dash.send.step3'), t('dash.send.step4'), t('dash.send.step5'), t('dash.send.step6')];
  const countries = getCountries();
  const selectedCountry = countries.find((c) => c.code === destCountry);
  const payoutCurrency = selectedCountry?.currencies[0] ?? 'XAF';
  const amount = parseFloat(sendAmount) || 0;
  const fee = calculateFeeAmount(amount, sendCurrency);
  const rate = getFxRateFor(sendCurrency, payoutCurrency);
  const recipientGets = Math.round((amount - fee) * rate * 100) / 100;
  const selectedRecipient = recipients.find((r) => r.id === recipient);

  const fundingOptions = [
    { id: 'bank_transfer', icon: 'Building2', labelEn: 'Bank transfer', labelFr: 'Virement bancaire' },
    { id: 'debit_card', icon: 'CreditCard', labelEn: 'Debit card', labelFr: 'Carte de débit' },
    { id: 'open_banking', icon: 'Landmark', labelEn: 'Open banking', labelFr: 'Open banking' },
  ];

  const balanceForSend = balances.find((b) => b.currency === sendCurrency);
  const hasFunds = !!balanceForSend && balanceForSend.available >= amount && amount > 0;

  const handleConfirm = () => {
    if (!hasFunds) {
      setInsufficient(true);
      setTimeout(() => setInsufficient(false), 3000);
      return;
    }
    const id = nextTxId();
    createTransfer({
      id,
      recipientName: selectedRecipient?.name ?? 'New recipient',
      recipientCountry: selectedRecipient?.country ?? selectedCountry?.name ?? '',
      recipientFlag: selectedRecipient?.flag ?? selectedCountry?.flag ?? '🌍',
      amount,
      currency: sendCurrency,
      payoutAmount: recipientGets,
      payoutCurrency,
      status: 'processing',
      date: new Date().toISOString(),
      method: (payoutMethod as PayoutMethod) || 'bank',
    });
    setTxId(id);
    setSuccess(true);
  };

  if (success) {
    return (
      <DashboardLayout navItems={navItems} activeRoute="send">
        <div className="max-w-md mx-auto text-center py-16 animate-fade-in">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <span className="absolute inset-0 rounded-full bg-success-500/30 animate-ring-pulse" />
            <div className="relative w-20 h-20 rounded-full bg-success-500/10 flex items-center justify-center animate-pop">
              <Check className="w-10 h-10 text-success-600" />
            </div>
          </div>
          <h1 className="font-display text-2xl font-bold text-vanta-900">{t('common.success')}!</h1>
          <p className="mt-2 text-ink-500">
            {formatCurrency(amount, sendCurrency)} → {formatCurrency(recipientGets, payoutCurrency)}
          </p>
          <p className="text-sm text-ink-400 mt-1 font-mono">{txId}</p>
          <button onClick={() => navigate('consumer')} className="btn-primary mt-8">
            {t('dash.nav.home')}
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={navItems} activeRoute="send">
      <div className="max-w-2xl mx-auto animate-fade-in">
        <button onClick={() => navigate('consumer')} className="inline-flex items-center gap-2 text-sm font-semibold text-ink-500 hover:text-vanta-900 mb-6">
          <ArrowLeft className="w-4 h-4" />
          {t('dash.send.back')}
        </button>

        <h1 className="font-display text-2xl font-bold text-vanta-900 mb-2">{t('dash.send.title')}</h1>

        {/* Step indicator */}
        <div className="flex items-center gap-1 mb-8">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center flex-1 last:flex-none">
              <div className={`flex items-center gap-2 ${i + 1 <= step ? '' : 'opacity-40'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  i + 1 < step ? 'bg-success-500 text-white' : i + 1 === step ? 'bg-vanta-900 text-white' : 'bg-ink-200 text-ink-500'
                }`}>
                  {i + 1 < step ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <span className="text-xs font-medium text-ink-600 hidden sm:block">{s}</span>
              </div>
              {i < steps.length - 1 && <div className={`h-px flex-1 mx-2 ${i + 1 < step ? 'bg-success-500' : 'bg-ink-200'}`} />}
            </div>
          ))}
        </div>

        <div className="card p-6">
          {/* Step 1: Destination */}
          {step === 1 && (
            <div className="animate-fade-in">
              <h2 className="font-display text-lg font-bold text-vanta-900 mb-4">{t('dash.send.destination')}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {countries.filter((c) => c.active).map((c) => (
                  <button
                    key={c.code}
                    onClick={() => { setDestCountry(c.code); setStep(2); }}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      destCountry === c.code ? 'border-vanta-500 bg-vanta-50' : 'border-ink-200 hover:border-vanta-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">{c.flag}</div>
                    <div className="text-sm font-semibold text-ink-900 truncate">{lang === 'fr' ? c.nameFr : c.name}</div>
                    <div className="text-xs text-ink-400">{c.currencies[0]}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Amount */}
          {step === 2 && (
            <div className="animate-fade-in">
              <h2 className="font-display text-lg font-bold text-vanta-900 mb-4">{t('dash.send.amount')}</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-ink-600 mb-2 block">{t('dash.send.youSend')}</label>
                  <div className="flex gap-3">
                    <input
                      type="number"
                      value={sendAmount}
                      onChange={(e) => setSendAmount(e.target.value)}
                      className="input text-2xl font-display font-bold"
                      placeholder="0.00"
                      autoFocus
                    />
                    <select
                      value={sendCurrency}
                      onChange={(e) => setSendCurrency(e.target.value)}
                      className="input w-32 font-semibold"
                    >
                      {['AED', 'USD', 'EUR', 'GBP'].map((c) => {
                        const cur = getCurrencyByCode(c);
                        return <option key={c} value={c}>{cur?.flag} {c}</option>;
                      })}
                    </select>
                  </div>
                </div>

                {amount > 0 && (
                  <div className="rounded-xl bg-ink-50 p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-ink-500">{t('dash.send.rate')}</span>
                      <span className="font-medium text-ink-900">1 {sendCurrency} = {rate.toFixed(2)} {payoutCurrency}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-ink-500">{t('dash.send.fee')}</span>
                      <span className="font-medium text-ink-900">{formatCurrency(fee, sendCurrency)}</span>
                    </div>
                    <div className="flex justify-between text-base font-bold pt-2 border-t border-ink-200">
                      <span className="text-vanta-900">{t('dash.send.recipientGets')}</span>
                      <span className="text-accent-600">{formatCurrency(recipientGets, payoutCurrency)}</span>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button onClick={() => setStep(1)} className="btn-outline flex-1">
                    {t('common.back')}
                  </button>
                  <button
                    onClick={() => amount > 0 && setStep(3)}
                    disabled={amount <= 0}
                    className="btn-primary flex-1"
                  >
                    {t('common.next')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Funding */}
          {step === 3 && (
            <div className="animate-fade-in">
              <h2 className="font-display text-lg font-bold text-vanta-900 mb-4">{t('dash.send.funding')}</h2>
              <div className="space-y-3">
                {fundingOptions.map((opt) => {
                  const Icon = iconMap[opt.icon];
                  return (
                    <button
                      key={opt.id}
                      onClick={() => { setFundingMethod(opt.id); setStep(4); }}
                      className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 text-left ${
                        fundingMethod === opt.id ? 'border-vanta-500 bg-vanta-50' : 'border-ink-200 hover:border-vanta-300'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-lg bg-vanta-100 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-vanta-700" />
                      </div>
                      <span className="font-semibold text-ink-900">{lang === 'fr' ? opt.labelFr : opt.labelEn}</span>
                    </button>
                  );
                })}
              </div>
              <button onClick={() => setStep(2)} className="btn-outline mt-4">
                {t('common.back')}
              </button>
            </div>
          )}

          {/* Step 4: Recipient */}
          {step === 4 && (
            <div className="animate-fade-in">
              <h2 className="font-display text-lg font-bold text-vanta-900 mb-4">{t('dash.send.recipient')}</h2>
              <div className="space-y-3">
                {recipients.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => { setRecipient(r.id); setStep(5); }}
                    className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 text-left ${
                      recipient === r.id ? 'border-vanta-500 bg-vanta-50' : 'border-ink-200 hover:border-vanta-300'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-ink-100 flex items-center justify-center text-xl">{r.flag}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-ink-900 truncate">{r.name}</div>
                      <div className="text-sm text-ink-400 truncate">{r.methodDetail}</div>
                    </div>
                  </button>
                ))}
                <button onClick={() => navigate('recipients')} className="w-full p-4 rounded-xl border-2 border-dashed border-ink-300 text-ink-500 hover:border-vanta-400 hover:text-vanta-600 transition-all font-semibold">
                  + {t('dash.send.addNew')}
                </button>
              </div>
              <button onClick={() => setStep(3)} className="btn-outline mt-4">
                {t('common.back')}
              </button>
            </div>
          )}

          {/* Step 5: Payout method */}
          {step === 5 && (
            <div className="animate-fade-in">
              <h2 className="font-display text-lg font-bold text-vanta-900 mb-4">{t('dash.send.payout')}</h2>
              <div className="space-y-3">
                {(selectedCountry?.payoutMethods ?? ['bank', 'mobile_money']).map((method) => {
                  const labels = payoutMethodLabelsMap[method];
                  const Icon = iconMap[labels.icon];
                  return (
                    <button
                      key={method}
                      onClick={() => { setPayoutMethod(method); setStep(6); }}
                      className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 text-left ${
                        payoutMethod === method ? 'border-vanta-500 bg-vanta-50' : 'border-ink-200 hover:border-vanta-300'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-lg bg-accent-50 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-accent-700" />
                      </div>
                      <span className="font-semibold text-ink-900">{lang === 'fr' ? labels.fr : labels.en}</span>
                    </button>
                  );
                })}
              </div>
              <button onClick={() => setStep(4)} className="btn-outline mt-4">
                {t('common.back')}
              </button>
            </div>
          )}

          {/* Step 6: Quote review */}
          {step === 6 && (
            <div className="animate-fade-in">
              <h2 className="font-display text-lg font-bold text-vanta-900 mb-6">{t('dash.send.quote')}</h2>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-ink-50 p-4">
                    <div className="text-xs text-ink-500 mb-1">{t('dash.send.youSend')}</div>
                    <div className="font-display text-xl font-bold text-vanta-900">{formatCurrency(amount, sendCurrency)}</div>
                  </div>
                  <div className="rounded-xl bg-accent-50 p-4">
                    <div className="text-xs text-ink-500 mb-1">{t('dash.send.recipientGets')}</div>
                    <div className="font-display text-xl font-bold text-accent-700">{formatCurrency(recipientGets, payoutCurrency)}</div>
                  </div>
                </div>

                <div className="space-y-3 py-4 border-y border-ink-100">
                  <DetailRow label={t('dash.send.from')} value={`${getCurrencyByCode(sendCurrency)?.flag} ${sendCurrency}`} />
                  <DetailRow label={t('dash.send.to')} value={`${selectedCountry?.flag} ${lang === 'fr' ? selectedCountry?.nameFr : selectedCountry?.name}`} />
                  <DetailRow label={t('dash.send.recipient')} value={selectedRecipient?.name ?? ''} />
                  <DetailRow label={t('dash.send.rate')} value={`1 ${sendCurrency} = ${rate.toFixed(2)} ${payoutCurrency}`} />
                  <DetailRow label={t('dash.send.fee')} value={formatCurrency(fee, sendCurrency)} />
                  <DetailRow label={t('dash.send.delivery')} value={t('dash.send.instant')} highlight />
                </div>

                {insufficient && (
                  <p className="text-center text-sm text-danger-600 font-medium animate-fade-in">{t('bal.insufficient')}</p>
                )}

                <div className="flex gap-3">
                  <button onClick={() => setStep(5)} className="btn-outline flex-1">
                    {t('common.back')}
                  </button>
                  <button onClick={handleConfirm} className="btn-accent flex-1 text-base py-4">
                    {t('dash.send.sendNow')}
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function DetailRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-ink-500">{label}</span>
      <span className={`text-sm font-semibold ${highlight ? 'text-success-600' : 'text-ink-900'}`}>{value}</span>
    </div>
  );
}

// --- Recipients Page ---
function Recipients() {
  const { t, lang } = useI18n();
  const { navigate } = useRouter();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [countryCode, setCountryCode] = useState('SN');
  const [method, setMethod] = useState<PayoutMethod>('mobile_money');
  const [detail, setDetail] = useState('');
  const { recipients } = useStore();
  const { user } = useAuth();
  const kycVerified = user?.kycStatus === 'verified';

  const filtered = recipients.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()) || r.country.toLowerCase().includes(search.toLowerCase()),
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const country = allCountries.find((c) => c.code === countryCode);
    addRecipient({
      id: `r${Date.now()}`,
      name,
      country: lang === 'fr' ? country?.nameFr ?? '' : country?.name ?? '',
      countryCode,
      flag: country?.flag ?? '🌍',
      method,
      methodDetail: detail,
      lastUsed: null,
    });
    setShowForm(false);
    setName('');
    setDetail('');
  };

  const navItems = [
    { route: 'consumer' as Route, label: t('dash.nav.home'), icon: Home },
    { route: (kycVerified ? 'send' : 'kyc') as Route, label: t('dash.nav.send'), icon: Send },
    { route: 'recipients' as Route, label: t('dash.nav.recipients'), icon: Users },
    { route: 'activity' as Route, label: t('dash.nav.activity'), icon: ActivityIcon },
    { route: 'balances' as Route, label: t('dash.nav.balances'), icon: Wallet },
    { route: 'cards' as Route, label: t('dash.nav.cards'), icon: CreditCard },
    { route: 'exchange' as Route, label: t('dash.nav.exchange'), icon: Repeat },
    { route: 'security' as Route, label: t('dash.nav.security'), icon: Shield },
    { route: 'settings' as Route, label: t('dash.nav.settings'), icon: Settings },
  ];

  return (
    <DashboardLayout navItems={navItems} activeRoute="recipients">
      <div className="animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-2xl font-bold text-vanta-900">{t('dash.recipients.title')}</h1>
          <button onClick={() => setShowForm(true)} className="btn-primary text-sm">
            <Plus className="w-4 h-4" /> {t('dash.recipients.add')}
          </button>
        </div>

        {showForm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
            <form onSubmit={handleAdd} className="card p-6 w-full max-w-md space-y-4 animate-pop">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-bold text-vanta-900">{t('rec.form.title')}</h2>
                <button type="button" onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-ink-100">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <input required value={name} onChange={(e) => setName(e.target.value)} placeholder={t('rec.form.name')} className="input" />
              <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)} className="input">
                {allCountries.filter((c) => c.active).map((c) => (
                  <option key={c.code} value={c.code}>{c.flag} {lang === 'fr' ? c.nameFr : c.name}</option>
                ))}
              </select>
              <select value={method} onChange={(e) => setMethod(e.target.value as PayoutMethod)} className="input">
                {(['bank', 'mobile_money', 'wallet', 'card', 'cash'] as PayoutMethod[]).map((m) => (
                  <option key={m} value={m}>{lang === 'fr' ? payoutMethodLabelsMap[m].fr : payoutMethodLabelsMap[m].en}</option>
                ))}
              </select>
              <input required value={detail} onChange={(e) => setDetail(e.target.value)} placeholder={t('rec.form.detail')} className="input" />
              <button type="submit" className="btn-primary w-full">{t('rec.form.save')}</button>
            </form>
          </div>
        )}

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('dash.recipients.search')}
          className="input mb-6"
        />

        {filtered.length === 0 ? (
          <div className="card p-12 text-center">
            <Users className="w-12 h-12 text-ink-300 mx-auto mb-4" />
            <p className="text-ink-500">{t('dash.recipients.empty')}</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {filtered.map((r) => {
              const labels = payoutMethodLabelsMap[r.method];
              const Icon = iconMap[labels.icon];
              return (
                <div key={r.id} className="card card-hover p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-ink-100 flex items-center justify-center text-2xl flex-shrink-0">
                      {r.flag}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-ink-900 truncate">{r.name}</div>
                      <div className="text-sm text-ink-400 truncate">{r.methodDetail}</div>
                      <div className="mt-3 flex items-center gap-2">
                        <span className="badge bg-vanta-50 text-vanta-700">
                          <Icon className="w-3 h-3" />
                          {lang === 'fr' ? labels.fr : labels.en}
                        </span>
                        {r.lastUsed && (
                          <span className="text-xs text-ink-400">
                            {t('dash.recipients.lastUsed')}: {new Date(r.lastUsed).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'short' })}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(kycVerified ? 'send' : 'kyc')}
                      className="btn-accent text-xs px-3 py-2 flex-shrink-0"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

// --- Activity Page ---
function ActivityPage() {
  const { t, lang } = useI18n();
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending' | 'failed'>('all');
  const { transactions } = useStore();
  const { user } = useAuth();
  const kycVerified = user?.kycStatus === 'verified';

  const navItems = [
    { route: 'consumer' as Route, label: t('dash.nav.home'), icon: Home },
    { route: (kycVerified ? 'send' : 'kyc') as Route, label: t('dash.nav.send'), icon: Send },
    { route: 'recipients' as Route, label: t('dash.nav.recipients'), icon: Users },
    { route: 'activity' as Route, label: t('dash.nav.activity'), icon: ActivityIcon },
    { route: 'balances' as Route, label: t('dash.nav.balances'), icon: Wallet },
    { route: 'cards' as Route, label: t('dash.nav.cards'), icon: CreditCard },
    { route: 'exchange' as Route, label: t('dash.nav.exchange'), icon: Repeat },
    { route: 'security' as Route, label: t('dash.nav.security'), icon: Shield },
    { route: 'settings' as Route, label: t('dash.nav.settings'), icon: Settings },
  ];

  const filtered = transactions.filter((tx) => {
    if (filter === 'all') return true;
    if (filter === 'pending') return tx.status === 'processing' || tx.status === 'pending';
    return tx.status === filter;
  });

  const filters = [
    { id: 'all' as const, label: t('dash.activity.all') },
    { id: 'completed' as const, label: t('dash.activity.completed') },
    { id: 'pending' as const, label: t('dash.activity.pending') },
    { id: 'failed' as const, label: t('dash.activity.failed') },
  ];

  return (
    <DashboardLayout navItems={navItems} activeRoute="activity">
      <div className="animate-fade-in">
        <h1 className="font-display text-2xl font-bold text-vanta-900 mb-6">{t('dash.activity.title')}</h1>

        <div className="flex gap-2 mb-6 overflow-x-auto">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
                filter === f.id ? 'bg-vanta-900 text-white' : 'bg-white text-ink-600 border border-ink-200 hover:border-vanta-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="card p-12 text-center">
            <ActivityIcon className="w-12 h-12 text-ink-300 mx-auto mb-4" />
            <p className="text-ink-500">{t('dash.activity.empty')}</p>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-ink-100 bg-ink-50/50">
                    <th className="text-left text-xs font-semibold text-ink-500 uppercase tracking-wider px-4 py-3">{t('dash.activity.recipient')}</th>
                    <th className="text-left text-xs font-semibold text-ink-500 uppercase tracking-wider px-4 py-3 hidden sm:table-cell">{t('dash.activity.id')}</th>
                    <th className="text-right text-xs font-semibold text-ink-500 uppercase tracking-wider px-4 py-3">{t('dash.activity.amount')}</th>
                    <th className="text-left text-xs font-semibold text-ink-500 uppercase tracking-wider px-4 py-3 hidden md:table-cell">{t('dash.activity.date')}</th>
                    <th className="text-right text-xs font-semibold text-ink-500 uppercase tracking-wider px-4 py-3">{t('dash.activity.status')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((tx) => (
                    <tr key={tx.id} className="border-b border-ink-50 hover:bg-ink-50/50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{tx.recipientFlag}</span>
                          <div>
                            <div className="font-semibold text-ink-900 text-sm">{tx.recipientName}</div>
                            <div className="text-xs text-ink-400">{tx.recipientCountry}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-xs text-ink-400 font-mono hidden sm:table-cell">{tx.id.slice(-16)}</td>
                      <td className="px-4 py-4 text-right">
                        <div className="font-semibold text-ink-900 text-sm">-{formatCurrency(tx.amount, tx.currency)}</div>
                        <div className="text-xs text-ink-400">{formatCurrency(tx.payoutAmount, tx.payoutCurrency)}</div>
                      </td>
                      <td className="px-4 py-4 text-sm text-ink-500 hidden md:table-cell">
                        {new Date(tx.date).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <StatusBadge status={tx.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

// --- Balances Page ---
function Balances() {
  const { t } = useI18n();
  const { balances } = useStore();
  const { user } = useAuth();
  const kycVerified = user?.kycStatus === 'verified';
  const [showAdd, setShowAdd] = useState(false);

  const navItems = [
    { route: 'consumer' as Route, label: t('dash.nav.home'), icon: Home },
    { route: (kycVerified ? 'send' : 'kyc') as Route, label: t('dash.nav.send'), icon: Send },
    { route: 'recipients' as Route, label: t('dash.nav.recipients'), icon: Users },
    { route: 'activity' as Route, label: t('dash.nav.activity'), icon: ActivityIcon },
    { route: 'balances' as Route, label: t('dash.nav.balances'), icon: Wallet },
    { route: 'cards' as Route, label: t('dash.nav.cards'), icon: CreditCard },
    { route: 'exchange' as Route, label: t('dash.nav.exchange'), icon: Repeat },
    { route: 'security' as Route, label: t('dash.nav.security'), icon: Shield },
    { route: 'settings' as Route, label: t('dash.nav.settings'), icon: Settings },
  ];

  return (
    <DashboardLayout navItems={navItems} activeRoute="balances">
      <div className="animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-2xl font-bold text-vanta-900">{t('dash.balances.title')}</h1>
          <button onClick={() => setShowAdd(true)} className="btn-primary text-sm">
            <Plus className="w-4 h-4" /> {t('dash.balances.add')}
          </button>
        </div>

        <PspCheckout
          open={showAdd}
          currencies={balances.map((b) => b.currency)}
          defaultCurrency={balances[0]?.currency ?? 'AED'}
          onClose={() => setShowAdd(false)}
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {balances.map((b) => {
            const cur = getCurrencyByCode(b.currency);
            return (
              <div key={b.currency} className="card card-hover p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{cur?.flag}</span>
                  <div>
                    <div className="font-display text-lg font-bold text-vanta-900">{b.currency}</div>
                    <div className="text-xs text-ink-400">{cur?.name}</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-ink-500">{t('dash.balances.available')}</span>
                    <span className="font-semibold text-ink-900">{formatCurrency(b.available, b.currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-ink-500">{t('dash.balances.pending')}</span>
                    <span className="text-sm text-ink-600">{formatCurrency(b.pending, b.currency)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}

// --- Exchange Page ---
function Exchange() {
  const { t } = useI18n();
  const { user } = useAuth();
  const kycVerified = user?.kycStatus === 'verified';
  const [fromCurrency, setFromCurrency] = useState('AED');
  const [toCurrency, setToCurrency] = useState('USD');
  const [amount, setAmount] = useState('');
  const [done, setDone] = useState(false);
  const [failed, setFailed] = useState(false);

  const handleExchange = () => {
    const value = parseFloat(amount);
    if (!value || value <= 0) return;
    const ok = exchangeMoney(fromCurrency, toCurrency, value, getFxRateFor(fromCurrency, toCurrency));
    if (ok) {
      setDone(true);
      setAmount('');
      setTimeout(() => setDone(false), 2000);
    } else {
      setFailed(true);
      setTimeout(() => setFailed(false), 2500);
    }
  };

  const navItems = [
    { route: 'consumer' as Route, label: t('dash.nav.home'), icon: Home },
    { route: (kycVerified ? 'send' : 'kyc') as Route, label: t('dash.nav.send'), icon: Send },
    { route: 'recipients' as Route, label: t('dash.nav.recipients'), icon: Users },
    { route: 'activity' as Route, label: t('dash.nav.activity'), icon: ActivityIcon },
    { route: 'balances' as Route, label: t('dash.nav.balances'), icon: Wallet },
    { route: 'cards' as Route, label: t('dash.nav.cards'), icon: CreditCard },
    { route: 'exchange' as Route, label: t('dash.nav.exchange'), icon: Repeat },
    { route: 'security' as Route, label: t('dash.nav.security'), icon: Shield },
    { route: 'settings' as Route, label: t('dash.nav.settings'), icon: Settings },
  ];

  const rate = getFxRateFor(fromCurrency, toCurrency);
  const result = (parseFloat(amount) || 0) * rate;

  return (
    <DashboardLayout navItems={navItems} activeRoute="exchange">
      <div className="max-w-md mx-auto animate-fade-in">
        <h1 className="font-display text-2xl font-bold text-vanta-900 mb-6">{t('dash.exchange.title')}</h1>

        <div className="card p-6 space-y-4">
          <div>
            <label className="text-sm font-semibold text-ink-600 mb-2 block">{t('dash.exchange.from')}</label>
            <div className="flex gap-3">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input text-xl font-display font-bold"
                placeholder="0.00"
              />
              <select value={fromCurrency} onChange={(e) => setFromCurrency(e.target.value)} className="input w-32 font-semibold">
                {currenciesList.map((c) => (
                  <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="w-10 h-10 rounded-full bg-vanta-100 flex items-center justify-center">
              <Repeat className="w-5 h-5 text-vanta-600" />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-ink-600 mb-2 block">{t('dash.exchange.to')}</label>
            <div className="flex gap-3">
              <div className="input text-xl font-display font-bold text-accent-600 flex items-center">
                {result.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <select value={toCurrency} onChange={(e) => setToCurrency(e.target.value)} className="input w-32 font-semibold">
                {currenciesList.map((c) => (
                  <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="text-center text-sm text-ink-500 pt-2">
            {t('dash.exchange.rate')}: 1 {fromCurrency} = {rate.toFixed(4)} {toCurrency}
          </div>

          {failed && (
            <p className="text-center text-sm text-danger-600 font-medium animate-fade-in">{t('ex.insufficient')}</p>
          )}

          <button onClick={handleExchange} className="btn-accent w-full text-base py-4">
            {done ? <><Check className="w-5 h-5" /> {t('ex.success')}</> : t('dash.exchange.exchange')}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}




// --- Security Page ---
function SecurityPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const kycVerified = user?.kycStatus === 'verified';
  const [mfa, setMfa] = useState(true);
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [updated, setUpdated] = useState(false);
  const [sessions, setSessions] = useState([
    { id: 's1', device: 'MacBook Pro · Chrome', location: 'Dubai, AE', icon: 'desktop', current: true },
    { id: 's2', device: 'iPhone 15 · VANTA App', location: 'Dubai, AE', icon: 'phone', current: false },
    { id: 's3', device: 'Windows · Edge', location: 'Paris, FR', icon: 'desktop', current: false },
  ]);

  const navItems = [
    { route: 'consumer' as Route, label: t('dash.nav.home'), icon: Home },
    { route: (kycVerified ? 'send' : 'kyc') as Route, label: t('dash.nav.send'), icon: Send },
    { route: 'recipients' as Route, label: t('dash.nav.recipients'), icon: Users },
    { route: 'activity' as Route, label: t('dash.nav.activity'), icon: ActivityIcon },
    { route: 'balances' as Route, label: t('dash.nav.balances'), icon: Wallet },
    { route: 'cards' as Route, label: t('dash.nav.cards'), icon: CreditCard },
    { route: 'exchange' as Route, label: t('dash.nav.exchange'), icon: Repeat },
    { route: 'security' as Route, label: t('dash.nav.security'), icon: Shield },
    { route: 'settings' as Route, label: t('dash.nav.settings'), icon: Settings },
  ];

  const handlePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setUpdated(true);
    setCurrent('');
    setNext('');
    setTimeout(() => setUpdated(false), 2000);
  };

  return (
    <DashboardLayout navItems={navItems} activeRoute="security">
      <div className="max-w-2xl space-y-6 animate-fade-in">
        <h1 className="font-display text-2xl font-bold text-vanta-900">{t('dash.nav.security')}</h1>

        <div className="card p-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-vanta-50 flex items-center justify-center">
              <Shield className="w-6 h-6 text-vanta-600" />
            </div>
            <div>
              <div className="font-semibold text-ink-900">{t('dash.home.mfa')}</div>
              <div className="text-sm text-ink-400 mt-0.5">{t('sec.mfaDesc')}</div>
            </div>
          </div>
          <button
            onClick={() => setMfa(!mfa)}
            className={`relative w-12 h-7 rounded-full transition-colors ${mfa ? 'bg-vanta-500' : 'bg-ink-200'}`}
          >
            <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all ${mfa ? 'left-6' : 'left-1'}`} />
          </button>
        </div>

        <form onSubmit={handlePassword} className="card p-6 space-y-4">
          <h2 className="font-display text-lg font-bold text-vanta-900">{t('sec.changePassword')}</h2>
          <input required type="password" value={current} onChange={(e) => setCurrent(e.target.value)} placeholder={t('sec.current')} className="input" />
          <input required type="password" minLength={8} value={next} onChange={(e) => setNext(e.target.value)} placeholder={t('sec.new')} className="input" />
          <button type="submit" className="btn-primary">
            {updated ? <><Check className="w-4 h-4" /> {t('set.saved')}</> : t('sec.update')}
          </button>
        </form>

        <div className="card p-6">
          <h2 className="font-display text-lg font-bold text-vanta-900 mb-4">{t('dash.home.sessions')}</h2>
          <div className="space-y-3">
            {sessions.map((s) => (
              <div key={s.id} className="flex items-center gap-4 py-2 border-b border-ink-50 last:border-0">
                <div className="w-10 h-10 rounded-lg bg-ink-100 flex items-center justify-center">
                  {s.icon === 'phone' ? <PhoneIcon className="w-5 h-5 text-ink-500" /> : <Monitor className="w-5 h-5 text-ink-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-ink-900 text-sm truncate">{s.device}</div>
                  <div className="text-xs text-ink-400">{s.location}</div>
                </div>
                {s.current ? (
                  <span className="badge bg-vanta-50 text-vanta-700 border border-vanta-200">{t('sec.thisDevice')}</span>
                ) : (
                  <button
                    onClick={() => setSessions(sessions.filter((x) => x.id !== s.id))}
                    className="text-xs font-semibold text-danger-600 hover:text-danger-700"
                  >
                    {t('sec.revoke')}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// --- Settings Page ---
const PROFILE_STORAGE = 'vanta-profile-v1';

type ProfilePrefs = {
  name: string;
  phone: string;
  notifs: { email: boolean; sms: boolean; push: boolean; marketing: boolean };
};

function loadProfile(defaultName: string): ProfilePrefs {
  const fallback: ProfilePrefs = {
    name: defaultName,
    phone: '+971 50 123 4567',
    notifs: { email: true, sms: false, push: true, marketing: false },
  };
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE);
    if (raw) return { ...fallback, ...(JSON.parse(raw) as Partial<ProfilePrefs>) };
  } catch {
    // corrupted storage — fall back to defaults
  }
  return fallback;
}

function SettingsPage() {
  const { t, lang, setLang } = useI18n();
  const { user } = useAuth();
  const kycVerified = user?.kycStatus === 'verified';
  const [profile] = useState(() => loadProfile(user?.name ?? 'Vincent Nogue'));
  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.phone);
  const [saved, setSaved] = useState(false);
  const [notifs, setNotifs] = useState(profile.notifs);

  const navItems = [
    { route: 'consumer' as Route, label: t('dash.nav.home'), icon: Home },
    { route: (kycVerified ? 'send' : 'kyc') as Route, label: t('dash.nav.send'), icon: Send },
    { route: 'recipients' as Route, label: t('dash.nav.recipients'), icon: Users },
    { route: 'activity' as Route, label: t('dash.nav.activity'), icon: ActivityIcon },
    { route: 'balances' as Route, label: t('dash.nav.balances'), icon: Wallet },
    { route: 'cards' as Route, label: t('dash.nav.cards'), icon: CreditCard },
    { route: 'exchange' as Route, label: t('dash.nav.exchange'), icon: Repeat },
    { route: 'security' as Route, label: t('dash.nav.security'), icon: Shield },
    { route: 'settings' as Route, label: t('dash.nav.settings'), icon: Settings },
  ];

  const notifItems = [
    { key: 'email' as const, label: t('set.emailNotif') },
    { key: 'sms' as const, label: t('set.smsNotif') },
    { key: 'push' as const, label: t('set.pushNotif') },
    { key: 'marketing' as const, label: t('set.marketing') },
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem(PROFILE_STORAGE, JSON.stringify({ name, phone, notifs }));
    } catch {
      // storage unavailable — keep in-memory state
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <DashboardLayout navItems={navItems} activeRoute="settings">
      <div className="max-w-2xl space-y-6 animate-fade-in">
        <h1 className="font-display text-2xl font-bold text-vanta-900">{t('dash.nav.settings')}</h1>

        <form onSubmit={handleSave} className="card p-6 space-y-4">
          <h2 className="font-display text-lg font-bold text-vanta-900">{t('dash.home.profile')}</h2>
          <div>
            <label className="block text-sm font-semibold text-ink-600 mb-1.5">{t('set.name')}</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="input" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink-600 mb-1.5">{t('set.phone')}</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="input" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink-600 mb-1.5">{t('set.country')}</label>
            <select className="input" defaultValue="AE">
              {allCountries.filter((c) => c.active).map((c) => (
                <option key={c.code} value={c.code}>{c.flag} {lang === 'fr' ? c.nameFr : c.name}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn-primary">
            {saved ? <><Check className="w-4 h-4" /> {t('set.saved')}</> : t('common.save')}
          </button>
        </form>

        <div className="card p-6">
          <h2 className="font-display text-lg font-bold text-vanta-900 mb-4">{t('dash.home.notifications')}</h2>
          <div className="space-y-4">
            {notifItems.map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <span className="text-sm font-medium text-ink-700">{item.label}</span>
                <button
                  onClick={() => setNotifs({ ...notifs, [item.key]: !notifs[item.key] })}
                  className={`relative w-12 h-7 rounded-full transition-colors ${notifs[item.key] ? 'bg-vanta-500' : 'bg-ink-200'}`}
                >
                  <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all ${notifs[item.key] ? 'left-6' : 'left-1'}`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GlobeIcon className="w-5 h-5 text-ink-400" />
            <span className="text-sm font-medium text-ink-700">Language / Langue</span>
          </div>
          <div className="flex gap-2">
            {(['en', 'fr'] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  lang === l ? 'bg-vanta-500 text-white' : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
                }`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// --- Support Page ---
function SupportPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const kycVerified = user?.kycStatus === 'verified';
  const [tickets, setTickets] = useState([
    { id: 'TKT-1042', subject: 'Transfer tracking — VNT-20260823', status: 'open' as const, date: 'Aug 23, 2026' },
    { id: 'TKT-0987', subject: 'KYC document re-upload', status: 'resolved' as const, date: 'Aug 12, 2026' },
  ]);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const navItems = [
    { route: 'consumer' as Route, label: t('dash.nav.home'), icon: Home },
    { route: (kycVerified ? 'send' : 'kyc') as Route, label: t('dash.nav.send'), icon: Send },
    { route: 'recipients' as Route, label: t('dash.nav.recipients'), icon: Users },
    { route: 'activity' as Route, label: t('dash.nav.activity'), icon: ActivityIcon },
    { route: 'balances' as Route, label: t('dash.nav.balances'), icon: Wallet },
    { route: 'cards' as Route, label: t('dash.nav.cards'), icon: CreditCard },
    { route: 'exchange' as Route, label: t('dash.nav.exchange'), icon: Repeat },
    { route: 'security' as Route, label: t('dash.nav.security'), icon: Shield },
    { route: 'settings' as Route, label: t('dash.nav.settings'), icon: Settings },
  ];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    setTickets([{ id: `TKT-${1043 + tickets.length}`, subject, status: 'open', date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) }, ...tickets]);
    setSubject('');
    setMessage('');
    setSent(true);
    setTimeout(() => setSent(false), 2500);
  };

  return (
    <DashboardLayout navItems={navItems} activeRoute="support">
      <div className="max-w-2xl space-y-6 animate-fade-in">
        <h1 className="font-display text-2xl font-bold text-vanta-900">{t('dash.nav.support')}</h1>

        <form onSubmit={handleSend} className="card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-vanta-50 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-vanta-600" />
            </div>
            <h2 className="font-display text-lg font-bold text-vanta-900">{t('sup.new')}</h2>
          </div>
          <input required value={subject} onChange={(e) => setSubject(e.target.value)} placeholder={t('sup.subject')} className="input" />
          <textarea required value={message} onChange={(e) => setMessage(e.target.value)} placeholder={t('sup.message')} rows={4} className="input resize-none" />
          {sent && <p className="text-sm text-vanta-600 font-medium animate-fade-in">{t('sup.sent')}</p>}
          <button type="submit" className="btn-primary">{t('sup.send')}</button>
        </form>

        <div className="card p-6">
          <h2 className="font-display text-lg font-bold text-vanta-900 mb-4">{t('sup.tickets')}</h2>
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="flex items-center gap-4 py-2 border-b border-ink-50 last:border-0">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-ink-900 text-sm truncate">{ticket.subject}</div>
                  <div className="text-xs text-ink-400 font-mono">{ticket.id} · {ticket.date}</div>
                </div>
                <span className={`badge ${ticket.status === 'open' ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'bg-vanta-50 text-vanta-700 border border-vanta-200'}`}>
                  {ticket.status === 'open' ? t('sup.open') : t('sup.resolved')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
