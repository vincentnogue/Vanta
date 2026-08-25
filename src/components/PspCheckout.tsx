import { useEffect, useMemo, useState } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { getCurrencyByCode, formatCurrency } from '@/data/mockData';
import { addMoney } from '@/data/store';
import {
  X, CreditCard, Smartphone, Landmark, Lock, Check, Loader2, ShieldCheck,
} from 'lucide-react';

type PayInMethod = 'card' | 'applepay' | 'googlepay' | 'sepa';
type Phase = 'form' | 'processing' | 'success';

type Props = {
  open: boolean;
  currencies: string[];
  defaultCurrency: string;
  onClose: () => void;
};

function detectBrand(number: string): string | null {
  if (/^4/.test(number)) return 'VISA';
  if (/^(5[1-5]|2[2-7])/.test(number)) return 'MASTERCARD';
  if (/^3[47]/.test(number)) return 'AMEX';
  return null;
}

function formatCardNumber(value: string): string {
  return value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function PspCheckout({ open, currencies, defaultCurrency, onClose }: Props) {
  const { t } = useI18n();
  const [currency, setCurrency] = useState(defaultCurrency);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PayInMethod>('card');
  const [phase, setPhase] = useState<Phase>('form');
  const [card, setCard] = useState({ number: '', expiry: '', cvc: '' });
  const [cardError, setCardError] = useState(false);

  const brand = useMemo(() => detectBrand(card.number.replace(/\s/g, '')), [card.number]);
  const amountNum = parseFloat(amount);

  useEffect(() => {
    if (open) {
      setPhase('form');
      setCardError(false);
      setCard({ number: '', expiry: '', cvc: '' });
      setMethod('card');
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const startPayment = () => {
    if (!amountNum || amountNum <= 0 || phase !== 'form') return;
    if (method === 'card') {
      const digits = card.number.replace(/\s/g, '');
      const valid = digits.length >= 15 && card.expiry.length === 5 && card.cvc.length >= 3;
      if (!valid) {
        setCardError(true);
        return;
      }
    }
    setPhase('processing');
    const storeMethod = method === 'sepa' ? 'bank' : 'card';
    setTimeout(() => {
      addMoney(currency, amountNum, storeMethod);
      setPhase('success');
      setTimeout(() => {
        onClose();
        setAmount('');
      }, 1400);
    }, 1600);
  };

  const methods: { id: PayInMethod; label: string; icon: typeof CreditCard }[] = [
    { id: 'card', label: t('pay.method.card'), icon: CreditCard },
    { id: 'applepay', label: 'Apple Pay', icon: Smartphone },
    { id: 'googlepay', label: 'Google Pay', icon: Smartphone },
    { id: 'sepa', label: t('pay.method.sepa'), icon: Landmark },
  ];

  const cur = getCurrencyByCode(currency);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in" onClick={onClose}>
      <div className="card w-full max-w-md overflow-hidden animate-pop shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-vanta-950 px-6 py-5 relative">
          <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg text-ink-400 hover:bg-white/10">
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 text-xs font-semibold text-accent-400">
            <Lock className="w-3.5 h-3.5" />
            {t('pay.secure')}
          </div>
          <h2 className="font-display text-lg font-bold text-white mt-1">{t('pay.title')}</h2>
          {(parseFloat(amount) ?? 0) > 0 ? (
            <p className="font-display text-2xl font-bold text-white mt-1">
              {formatCurrency(parseFloat(amount), currency)}
            </p>
          ) : (
            <p className="text-sm text-ink-400 mt-1">{t('pay.chooseAmount')}</p>
          )}
        </div>

        <form
          className="p-6 space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            startPayment();
          }}
        >
          {/* Amount + currency */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs font-semibold text-ink-500 mb-1.5 block">{t('pay.amount')}</label>
              <input
                type="number"
                min="1"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="500.00"
                className="input py-2.5"
                disabled={phase !== 'form'}
              />
            </div>
            <div className="w-28">
              <label className="text-xs font-semibold text-ink-500 mb-1.5 block">{t('pay.currency')}</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="input py-2.5"
                disabled={phase !== 'form'}
              >
                {currencies.map((c) => (
                  <option key={c} value={c}>
                    {getCurrencyByCode(c)?.flag} {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Method selector */}
          <div>
            <label className="text-xs font-semibold text-ink-500 mb-1.5 block">{t('pay.method')}</label>
            <div className="grid grid-cols-4 gap-2">
              {methods.map((m) => (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => { setMethod(m.id); setCardError(false); }}
                  disabled={phase !== 'form'}
                  className={`flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl border text-center transition-all ${
                    method === m.id
                      ? 'border-vanta-500 bg-vanta-50 ring-2 ring-vanta-500/20'
                      : 'border-ink-200 hover:border-ink-300 hover:bg-ink-50'
                  }`}
                >
                  <m.icon className={`w-4 h-4 ${method === m.id ? 'text-vanta-600' : 'text-ink-400'}`} />
                  <span className={`text-[11px] font-semibold leading-tight ${method === m.id ? 'text-vanta-700' : 'text-ink-500'}`}>
                    {m.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Card fields */}
          {method === 'card' && (
            <div className="rounded-xl border border-ink-200 p-4 space-y-3 bg-ink-50/40">
              <div>
                <label className="text-xs font-semibold text-ink-500 mb-1.5 block">{t('pay.cardNumber')}</label>
                <div className="relative">
                  <input
                    value={card.number}
                    onChange={(e) => setCard({ ...card, number: formatCardNumber(e.target.value) })}
                    placeholder="1234 5678 9012 3456"
                    inputMode="numeric"
                    className="input py-2.5 pr-16"
                    disabled={phase !== 'form'}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                    {brand ? (
                      <span className="text-[10px] font-bold text-ink-600 border border-ink-300 rounded px-1.5 py-0.5">{brand}</span>
                    ) : (
                      <CreditCard className="w-4 h-4 text-ink-300" />
                    )}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-ink-500 mb-1.5 block">{t('pay.expiry')}</label>
                  <input
                    value={card.expiry}
                    onChange={(e) => setCard({ ...card, expiry: formatExpiry(e.target.value) })}
                    placeholder="MM/YY"
                    inputMode="numeric"
                    className="input py-2.5"
                    disabled={phase !== 'form'}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-ink-500 mb-1.5 block">{t('pay.cvc')}</label>
                  <input
                    value={card.cvc}
                    onChange={(e) => setCard({ ...card, cvc: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                    placeholder="CVC"
                    inputMode="numeric"
                    className="input py-2.5"
                    disabled={phase !== 'form'}
                  />
                </div>
              </div>
              {cardError && <p className="text-xs text-danger-600 font-medium">{t('pay.cardError')}</p>}
            </div>
          )}

          {method === 'sepa' && (
            <div className="rounded-xl border border-ink-200 p-4 bg-ink-50/40 space-y-2">
              <p className="text-xs text-ink-500">{t('pay.sepaNote')}</p>
              <code className="text-xs font-mono text-ink-700">AE07 0331 2345 6789 0123 456</code>
            </div>
          )}

          {(method === 'applepay' || method === 'googlepay') && (
            <div className="rounded-xl border border-ink-200 p-4 bg-ink-50/40">
              <p className="text-xs text-ink-500 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-ink-400" />
                {t('pay.expressNote')}
              </p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={phase !== 'form' || !amount || parseFloat(amount) <= 0}
            className="btn-primary w-full py-3.5 text-base"
          >
            {phase === 'processing' ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> {t('pay.processing')}</>
            ) : phase === 'success' ? (
              <><Check className="w-5 h-5" /> {t('pay.success')}</>
            ) : (
              <><Lock className="w-4 h-4" /> {t('pay.pay')} {cur?.flag} {formatCurrency(parseFloat(amount) || 0, currency)}</>
            )}
          </button>

          <div className="flex items-center justify-center gap-2 text-[11px] text-ink-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            {t('pay.poweredBy')}
          </div>
        </form>
      </div>
    </div>
  );
}
