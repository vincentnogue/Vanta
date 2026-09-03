import { useEffect, useMemo, useState } from 'react';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useI18n } from '@/i18n/I18nContext';
import { getCurrencyByCode, formatCurrency } from '@/data/mockData';
import { detectBrand, formatCardNumber, formatExpiry } from '@/data/cardUtils';
import { CardBrandMark, ApplePayMark, GooglePayMark } from '@/components/CardBrandMark';
import { addMoney, addPaymentMethod, refreshStore, useStore } from '@/data/store';
import { createPaymentIntent } from '@/data/payments';
import { getStripe, isStripeConfigured } from '@/lib/stripe';
import { getCurrentUser } from '@/data/auth';
import { Logo } from '@/components/Logo';
import {
  X, CreditCard, Landmark, Lock, Check, Loader2, ShieldCheck, Plus, AlertCircle,
} from 'lucide-react';

type PayInMethod = 'card' | 'applepay' | 'googlepay' | 'sepa';
type Phase = 'form' | 'processing' | 'success';

type Props = {
  open: boolean;
  currencies: string[];
  defaultCurrency: string;
  defaultMethodId?: string;
  onClose: () => void;
};

const cardElementStyle = {
  style: {
    base: {
      fontSize: '15px',
      fontFamily: 'Poppins, system-ui, sans-serif',
      color: '#0f172a',
      '::placeholder': { color: '#94a3b8' },
    },
    invalid: { color: '#dc2626' },
  },
};

export function PspCheckout(props: Props) {
  // Only mount the Elements provider when a real publishable key is set —
  // avoids loading Stripe.js at all in pure demo mode.
  if (isStripeConfigured()) {
    return (
      <Elements stripe={getStripe()}>
        <PspCheckoutInner {...props} />
      </Elements>
    );
  }
  return <PspCheckoutInner {...props} />;
}

function PspCheckoutInner({ open, currencies, defaultCurrency, defaultMethodId, onClose }: Props) {
  const { t } = useI18n();
  const { paymentMethods } = useStore();
  const stripe = useStripe();
  const elements = useElements();
  const [currency, setCurrency] = useState(defaultCurrency);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PayInMethod>('card');
  const [phase, setPhase] = useState<Phase>('form');
  const [card, setCard] = useState({ number: '', expiry: '', cvc: '' });
  const [cardError, setCardError] = useState(false);
  const [stripeErrorMsg, setStripeErrorMsg] = useState<string | null>(null);
  const [cardFocused, setCardFocused] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string>('new');
  const [saveCard, setSaveCard] = useState(true);

  const brand = useMemo(() => detectBrand(card.number.replace(/\s/g, '')), [card.number]);
  const currentUserEmail = getCurrentUser()?.email;
  const amountNum = parseFloat(amount);
  const usingSavedCard = method === 'card' && selectedCardId !== 'new';
  const useRealStripe = isStripeConfigured() && method === 'card' && !usingSavedCard;

  useEffect(() => {
    if (open) {
      setPhase('form');
      setCardError(false);
      setStripeErrorMsg(null);
      setCard({ number: '', expiry: '', cvc: '' });
      setMethod('card');
      const preferred = paymentMethods.find((p) => p.id === defaultMethodId)
        ?? paymentMethods.find((p) => p.isDefault);
      setSelectedCardId(preferred?.id ?? 'new');
      setSaveCard(true);
    }
  }, [open, defaultMethodId, paymentMethods]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const startPayment = async () => {
    if (!amountNum || amountNum <= 0 || phase !== 'form') return;
    setStripeErrorMsg(null);

    // Real Stripe path: new card, key configured.
    if (useRealStripe) {
      if (!stripe || !elements) return;
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) return;
      setPhase('processing');
      try {
        const { clientSecret } = await createPaymentIntent(amountNum, currency);
        const result = await stripe.confirmCardPayment(clientSecret, {
          payment_method: { card: cardElement },
        });
        if (result.error) {
          setStripeErrorMsg(result.error.message ?? t('pay.cardError'));
          setPhase('form');
          return;
        }
        if (result.paymentIntent?.status === 'succeeded') {
          setPhase('success');
          // The Stripe webhook — not this client — is what actually credits the
          // balance and writes the transaction. Give it a moment, then re-pull
          // real data from Supabase instead of guessing the new balance locally.
          setTimeout(() => {
            refreshStore();
            onClose();
            setAmount('');
          }, 2200);
        } else {
          setStripeErrorMsg(t('pay.cardError'));
          setPhase('form');
        }
      } catch (err) {
        setStripeErrorMsg(err instanceof Error ? err.message : String(err));
        setPhase('form');
      }
      return;
    }

    // Demo / simulated path: sandbox card fields (Stripe not connected yet),
    // saved-card reuse, SEPA, Apple Pay, Google Pay.
    if (method === 'card' && !usingSavedCard) {
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
      if (method === 'card' && !usingSavedCard && saveCard) {
        const digits = card.number.replace(/\s/g, '');
        const [mm, yy] = card.expiry.split('/');
        addPaymentMethod({
          id: `pm_${Date.now()}`,
          brand,
          last4: digits.slice(-4),
          expMonth: mm,
          expYear: yy,
          holder: 'Demo User',
          isDefault: false,
        });
      }
      addMoney(currency, amountNum, storeMethod);
      setPhase('success');
      setTimeout(() => {
        onClose();
        setAmount('');
      }, 1400);
    }, 1600);
  };

  const methods: { id: PayInMethod; label: string }[] = [
    { id: 'card', label: t('pay.method.card') },
    { id: 'applepay', label: 'Apple Pay' },
    { id: 'googlepay', label: 'Google Pay' },
    { id: 'sepa', label: t('pay.method.sepa') },
  ];

  const cur = getCurrencyByCode(currency);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in" onClick={onClose}>
      <div className="card w-full max-w-md overflow-hidden animate-pop shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-vanta-950 px-6 pt-6 pb-7 relative">
          <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg text-ink-400 hover:bg-white/10 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
          <Logo dark size="sm" />
          <div className="mt-5 flex items-center gap-2 text-xs font-semibold text-accent-400">
            <Lock className="w-3.5 h-3.5" />
            {t('pay.secure')}
            {!isStripeConfigured() && (
              <span className="ml-1 badge bg-white/10 text-ink-300 text-[9px] py-0.5">{t('pay.demoMode')}</span>
            )}
          </div>
          <h2 className="font-display text-sm font-medium text-ink-300 mt-2">{t('pay.title')}</h2>
          {(parseFloat(amount) || 0) > 0 ? (
            <p className="font-display text-3xl font-bold text-white mt-0.5 tabular-nums">
              {formatCurrency(parseFloat(amount), currency)}
            </p>
          ) : (
            <p className="text-sm text-ink-400 mt-1">{t('pay.chooseAmount')}</p>
          )}
          {currentUserEmail && (
            <p className="text-[11px] text-ink-400 mt-2">{t('pay.receiptTo')} <span className="text-ink-200">{currentUserEmail}</span></p>
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
                  {m.id === 'card' && <CreditCard className={`w-4 h-4 ${method === m.id ? 'text-vanta-600' : 'text-ink-400'}`} />}
                  {m.id === 'applepay' && <ApplePayMark className="h-4 w-6 rounded" />}
                  {m.id === 'googlepay' && <GooglePayMark className="h-4 w-6 rounded" />}
                  {m.id === 'sepa' && <Landmark className={`w-4 h-4 ${method === m.id ? 'text-vanta-600' : 'text-ink-400'}`} />}
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
              {paymentMethods.length > 0 && (
                <div className="space-y-2">
                  {paymentMethods.map((pm) => (
                    <button
                      type="button"
                      key={pm.id}
                      onClick={() => { setSelectedCardId(pm.id); setCardError(false); }}
                      disabled={phase !== 'form'}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-all ${
                        selectedCardId === pm.id
                          ? 'border-vanta-500 bg-vanta-50 ring-1 ring-vanta-500/20'
                          : 'border-ink-200 bg-white hover:border-ink-300'
                      }`}
                    >
                      <CardBrandMark brand={pm.brand} className="h-5 w-8 rounded flex-shrink-0" />
                      <span className="text-sm font-semibold text-ink-800 font-mono">•••• {pm.last4}</span>
                      <span className="ml-auto text-xs text-ink-400">{pm.expMonth}/{pm.expYear}</span>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => { setSelectedCardId('new'); setCardError(false); }}
                    disabled={phase !== 'form'}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-all ${
                      selectedCardId === 'new'
                        ? 'border-vanta-500 bg-vanta-50 ring-1 ring-vanta-500/20'
                        : 'border-dashed border-ink-300 bg-white hover:border-ink-400'
                    }`}
                  >
                    <Plus className={`w-4 h-4 flex-shrink-0 ${selectedCardId === 'new' ? 'text-vanta-600' : 'text-ink-400'}`} />
                    <span className={`text-sm font-semibold ${selectedCardId === 'new' ? 'text-vanta-700' : 'text-ink-500'}`}>
                      {t('pay.newCard')}
                    </span>
                  </button>
                </div>
              )}

              {!usingSavedCard && isStripeConfigured() && (
                <>
                  <div>
                    <label className="text-xs font-semibold text-ink-500 mb-1.5 block">{t('pay.cardNumber')}</label>
                    <div
                      className={`rounded-lg border bg-white px-3.5 py-3 transition-all ${
                        cardFocused ? 'border-vanta-500 ring-2 ring-vanta-500/20' : 'border-ink-200'
                      }`}
                    >
                      <CardElement
                        options={cardElementStyle}
                        onChange={() => setStripeErrorMsg(null)}
                        onFocus={() => setCardFocused(true)}
                        onBlur={() => setCardFocused(false)}
                      />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-xs text-ink-500 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={saveCard}
                      onChange={(e) => setSaveCard(e.target.checked)}
                      disabled={phase !== 'form'}
                      className="w-3.5 h-3.5 rounded border-ink-300 text-vanta-600 focus:ring-vanta-500"
                    />
                    {t('pay.saveCard')}
                  </label>
                  {stripeErrorMsg && (
                    <p className="text-xs text-danger-600 font-medium flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {stripeErrorMsg}
                    </p>
                  )}
                </>
              )}

              {!usingSavedCard && !isStripeConfigured() && (
                <>
                  <div>
                    <label className="text-xs font-semibold text-ink-500 mb-1.5 block">{t('pay.cardNumber')}</label>
                    <div className="relative">
                      <input
                        value={card.number}
                        onChange={(e) => setCard({ ...card, number: formatCardNumber(e.target.value) })}
                        placeholder="4242 4242 4242 4242"
                        inputMode="numeric"
                        className="input py-2.5 pr-16"
                        disabled={phase !== 'form'}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                        {card.number.replace(/\s/g, '').length >= 2 ? (
                          <CardBrandMark brand={brand} className="h-5 w-8 rounded" />
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
                  <label className="flex items-center gap-2 text-xs text-ink-500 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={saveCard}
                      onChange={(e) => setSaveCard(e.target.checked)}
                      disabled={phase !== 'form'}
                      className="w-3.5 h-3.5 rounded border-ink-300 text-vanta-600 focus:ring-vanta-500"
                    />
                    {t('pay.saveCard')}
                  </label>
                  {cardError && <p className="text-xs text-danger-600 font-medium">{t('pay.cardError')}</p>}
                </>
              )}
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
                {method === 'applepay' ? <ApplePayMark className="h-4 w-6 rounded" /> : <GooglePayMark className="h-4 w-6 rounded" />}
                {t('pay.expressNote')}
              </p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={phase !== 'form' || !amount || parseFloat(amount) <= 0 || (useRealStripe && (!stripe || !elements))}
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

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-ink-400">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            {isStripeConfigured() ? (
              <span>
                {t('pay.secure')} · {t('pay.poweredByStripe')}
              </span>
            ) : (
              t('pay.poweredBy')
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
