import { useState } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { useRouter, type Route } from '@/router/RouterContext';
import { DashboardLayout } from '@/components/DashboardLayout';
import { PspCheckout } from '@/components/PspCheckout';
import { formatCardNumber, formatExpiry, detectBrand } from '@/data/cardUtils';
import { useStore, addPaymentMethod, removePaymentMethod, setDefaultPaymentMethod } from '@/data/store';
import {
  Home, Send, Users, Activity, Wallet, CreditCard, ArrowLeftRight, Shield, Settings,
  Plus, Star, Trash2, X, Check,
} from 'lucide-react';

export function CardsPage() {
  const { t } = useI18n();
  const { route } = useRouter();
  const { paymentMethods, balances } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [showTopUp, setShowTopUp] = useState(false);
  const [topUpMethodId, setTopUpMethodId] = useState<string | undefined>(undefined);

  const navItems = [
    { route: 'consumer' as Route, label: t('dash.nav.home'), icon: Home },
    { route: 'send' as Route, label: t('dash.nav.send'), icon: Send },
    { route: 'recipients' as Route, label: t('dash.nav.recipients'), icon: Users },
    { route: 'activity' as Route, label: t('dash.nav.activity'), icon: Activity },
    { route: 'balances' as Route, label: t('dash.nav.balances'), icon: Wallet },
    { route: 'cards' as Route, label: t('dash.nav.cards'), icon: CreditCard },
    { route: 'exchange' as Route, label: t('dash.nav.exchange'), icon: ArrowLeftRight },
    { route: 'security' as Route, label: t('dash.nav.security'), icon: Shield },
    { route: 'settings' as Route, label: t('dash.nav.settings'), icon: Settings },
  ];

  return (
    <DashboardLayout navItems={navItems} activeRoute={route}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-vanta-900">{t('cards.title')}</h2>
            <p className="text-sm text-ink-500 mt-1">{t('cards.subtitle')}</p>
          </div>
          <button onClick={() => setShowAdd(true)} className="btn-primary text-sm">
            <Plus className="w-4 h-4" /> {t('cards.add')}
          </button>
        </div>

        {paymentMethods.length === 0 ? (
          <div className="card p-10 text-center">
            <CreditCard className="w-10 h-10 text-ink-300 mx-auto mb-3" />
            <p className="text-ink-500 text-sm">{t('cards.empty')}</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {paymentMethods.map((pm, i) => (
              <div key={pm.id} className="card card-hover p-5 animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-vanta-600 to-vanta-800 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  {pm.isDefault && (
                    <span className="badge bg-vanta-50 text-vanta-700 inline-flex items-center gap-1">
                      <Star className="w-3 h-3" /> {t('cards.default')}
                    </span>
                  )}
                </div>
                <div className="font-mono text-lg font-semibold text-ink-900 tracking-wider">
                  •••• {pm.last4}
                </div>
                <div className="text-xs text-ink-400 mt-1">
                  {pm.brand} · {t('cards.expires')} {pm.expMonth}/{pm.expYear}
                </div>
                <div className="text-xs text-ink-400 mt-0.5 truncate">{pm.holder}</div>
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-ink-100">
                  <button
                    onClick={() => { setTopUpMethodId(pm.id); setShowTopUp(true); }}
                    className="flex-1 text-xs font-semibold text-vanta-700 hover:text-vanta-800 py-1.5 rounded-lg hover:bg-vanta-50 transition-colors"
                  >
                    {t('cards.topUp')}
                  </button>
                  {!pm.isDefault && (
                    <button
                      onClick={() => setDefaultPaymentMethod(pm.id)}
                      className="flex-1 text-xs font-semibold text-ink-500 hover:text-ink-700 py-1.5 rounded-lg hover:bg-ink-50 transition-colors"
                    >
                      {t('cards.setDefault')}
                    </button>
                  )}
                  <button
                    onClick={() => removePaymentMethod(pm.id)}
                    aria-label={t('cards.remove')}
                    className="p-1.5 rounded-lg text-ink-400 hover:text-error-600 hover:bg-error-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAdd && <AddCardModal onClose={() => setShowAdd(false)} />}
      <PspCheckout
        open={showTopUp}
        currencies={balances.map((b) => b.currency)}
        defaultCurrency={balances[0]?.currency ?? 'AED'}
        defaultMethodId={topUpMethodId}
        onClose={() => setShowTopUp(false)}
      />
    </DashboardLayout>
  );
}

function AddCardModal({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  const [holder, setHolder] = useState('');
  const [number, setNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [makeDefault, setMakeDefault] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);

  const brand = detectBrand(number);
  const digits = number.replace(/\D/g, '');
  const valid = holder.trim().length > 1 && digits.length >= 15 && /^\d{2}\/\d{2}$/.test(expiry) && cvc.length >= 3;

  const submit = () => {
    if (!valid || processing) return;
    setProcessing(true);
    setTimeout(() => {
      const [mm, yy] = expiry.split('/');
      addPaymentMethod({
        id: `pm_${Date.now()}`,
        brand,
        last4: digits.slice(-4),
        expMonth: mm,
        expYear: yy,
        holder: holder.trim(),
        isDefault: makeDefault,
      });
      setProcessing(false);
      setDone(true);
      setTimeout(onClose, 900);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-vanta-950/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-up" onClick={(e) => e.stopPropagation()}>
        <div className="bg-gradient-to-br from-vanta-800 to-vanta-950 px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-bold">{t('cards.add')}</h3>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" aria-label="Close">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {done ? (
          <div className="p-10 text-center">
            <div className="w-14 h-14 rounded-full bg-success-50 flex items-center justify-center mx-auto mb-3">
              <Check className="w-7 h-7 text-success-600" />
            </div>
            <p className="font-semibold text-ink-900">{t('cards.added')}</p>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-ink-500 mb-1.5">{t('cards.holder')}</label>
              <input
                value={holder}
                onChange={(e) => setHolder(e.target.value)}
                placeholder="John Doe"
                className="input text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-500 mb-1.5">{t('pay.cardNumber')}</label>
              <div className="relative">
                <input
                  value={number}
                  onChange={(e) => setNumber(formatCardNumber(e.target.value))}
                  placeholder="1234 5678 9012 3456"
                  inputMode="numeric"
                  className="input text-sm font-mono pr-16"
                />
                {digits.length >= 2 && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-vanta-700 bg-vanta-50 px-1.5 py-0.5 rounded">
                    {brand}
                  </span>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-ink-500 mb-1.5">{t('pay.expiry')}</label>
                <input
                  value={expiry}
                  onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                  placeholder="MM/YY"
                  inputMode="numeric"
                  className="input text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink-500 mb-1.5">{t('pay.cvc')}</label>
                <input
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="CVC"
                  inputMode="numeric"
                  className="input text-sm font-mono"
                />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-ink-600 cursor-pointer">
              <input
                type="checkbox"
                checked={makeDefault}
                onChange={(e) => setMakeDefault(e.target.checked)}
                className="w-4 h-4 rounded border-ink-300 text-vanta-600 focus:ring-vanta-500"
              />
              {t('cards.setDefault')}
            </label>
            <button
              onClick={submit}
              disabled={!valid || processing}
              className="btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              {t('cards.add')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
