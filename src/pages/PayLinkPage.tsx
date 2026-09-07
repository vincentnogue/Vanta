import { useEffect, useState } from 'react';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useI18n } from '@/i18n/I18nContext';
import { getRouteParam } from '@/router/RouterContext';
import { Logo } from '@/components/Logo';
import { formatCurrency } from '@/data/mockData';
import { fetchPublicPaymentLink, createPaymentLinkIntent, type PublicPaymentLink } from '@/data/paymentLinks';
import { getStripe, isStripeConfigured } from '@/lib/stripe';
import { ShieldCheck, Lock, Check, AlertCircle, Loader2, XCircle } from 'lucide-react';

const cardElementStyle = {
  style: {
    base: { fontSize: '15px', fontFamily: 'Poppins, system-ui, sans-serif', color: '#0f172a', '::placeholder': { color: '#94a3b8' } },
    invalid: { color: '#dc2626' },
  },
};

export function PayLinkPage() {
  const { t } = useI18n();
  const [link, setLink] = useState<PublicPaymentLink | null | undefined>(undefined);
  const linkId = getRouteParam();

  useEffect(() => {
    if (!linkId) {
      setLink(null);
      return;
    }
    fetchPublicPaymentLink(linkId).then(setLink).catch(() => setLink(null));
  }, [linkId]);

  return (
    <div className="min-h-screen bg-ink-50 flex flex-col items-center justify-center p-4">
      <div className="mb-6"><Logo size="md" /></div>

      {link === undefined ? (
        <div className="w-10 h-10 border-2 border-vanta-200 border-t-vanta-600 rounded-full animate-spin" />
      ) : link === null ? (
        <div className="card w-full max-w-sm p-8 text-center">
          <XCircle className="w-10 h-10 text-danger-500 mx-auto mb-3" />
          <h1 className="font-display text-lg font-bold text-ink-900">{t('paylink.notFound')}</h1>
          <p className="mt-2 text-sm text-ink-500">{t('paylink.notFoundDesc')}</p>
        </div>
      ) : (
        <PayLinkCheckout link={link} />
      )}
    </div>
  );
}

function PayLinkCheckout({ link }: { link: PublicPaymentLink }) {
  if (isStripeConfigured()) {
    return (
      <Elements stripe={getStripe()}>
        <PayLinkForm link={link} />
      </Elements>
    );
  }
  return <PayLinkForm link={link} />;
}

function PayLinkForm({ link }: { link: PublicPaymentLink }) {
  const { t } = useI18n();
  const stripe = useStripe();
  const elements = useElements();
  const [phase, setPhase] = useState<'form' | 'processing' | 'success'>('form');
  const [error, setError] = useState<string | null>(null);
  const [cardFocused, setCardFocused] = useState(false);

  const pay = async () => {
    setError(null);
    if (!isStripeConfigured()) {
      // Demo mode: no real Stripe key set yet — simulate so the merchant
      // flow can still be reviewed end-to-end before Stripe goes live.
      setPhase('processing');
      setTimeout(() => setPhase('success'), 1400);
      return;
    }
    if (!stripe || !elements) return;
    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;
    setPhase('processing');
    try {
      const { clientSecret } = await createPaymentLinkIntent(link.id);
      const result = await stripe.confirmCardPayment(clientSecret, { payment_method: { card: cardElement } });
      if (result.error) {
        setError(result.error.message ?? t('pay.cardError'));
        setPhase('form');
        return;
      }
      if (result.paymentIntent?.status === 'succeeded') {
        setPhase('success');
      } else {
        setError(t('pay.cardError'));
        setPhase('form');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setPhase('form');
    }
  };

  if (phase === 'success') {
    return (
      <div className="card w-full max-w-sm p-8 text-center animate-pop">
        <div className="w-14 h-14 rounded-full bg-vanta-50 flex items-center justify-center mx-auto mb-4">
          <Check className="w-7 h-7 text-vanta-600" />
        </div>
        <h1 className="font-display text-xl font-bold text-ink-900">{t('paylink.success')}</h1>
        <p className="mt-2 text-sm text-ink-500">
          {formatCurrency(link.amount, link.currency)} {t('paylink.paidTo')} {link.businessName}
        </p>
      </div>
    );
  }

  return (
    <div className="card w-full max-w-sm overflow-hidden">
      <div className="bg-vanta-950 px-6 py-6 text-center">
        <div className="text-xs text-ink-300">{t('paylink.payingTo')}</div>
        <div className="font-display text-lg font-bold text-white mt-0.5">{link.businessName}</div>
        <div className="font-display text-3xl font-bold text-white mt-3 tabular-nums">
          {formatCurrency(link.amount, link.currency)}
        </div>
        {link.description && <div className="mt-1 text-sm text-ink-300">{link.description}</div>}
      </div>

      <div className="p-6 space-y-4">
        {isStripeConfigured() ? (
          <div>
            <label className="text-xs font-semibold text-ink-500 mb-1.5 block">{t('pay.cardNumber')}</label>
            <div className={`rounded-lg border bg-white px-3.5 py-3 transition-all ${cardFocused ? 'border-vanta-500 ring-2 ring-vanta-500/20' : 'border-ink-200'}`}>
              <CardElement options={cardElementStyle} onFocus={() => setCardFocused(true)} onBlur={() => setCardFocused(false)} onChange={() => setError(null)} />
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-ink-300 bg-ink-50 px-3.5 py-3 text-xs text-ink-500 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" /> {t('pay.demoMode')} — {t('paylink.demoNote')}
          </div>
        )}

        {error && (
          <p className="text-xs text-danger-600 font-medium flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}
          </p>
        )}

        <button
          onClick={pay}
          disabled={phase === 'processing' || (isStripeConfigured() && (!stripe || !elements))}
          className="btn-primary w-full py-3.5 text-base disabled:opacity-60"
        >
          {phase === 'processing' ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> {t('pay.processing')}</>
          ) : (
            <><Lock className="w-4 h-4" /> {t('pay.pay')} {formatCurrency(link.amount, link.currency)}</>
          )}
        </button>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-ink-400">
          <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
          {isStripeConfigured() ? t('pay.poweredByStripe') : t('pay.poweredBy')}
        </div>
      </div>
    </div>
  );
}
