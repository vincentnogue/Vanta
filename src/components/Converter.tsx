import { useMemo, useState } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { useRouter } from '@/router/RouterContext';
import { currencies, getCurrencyByCode, getFxRate, calculateFee, formatCurrency } from '@/data/mockData';
import { ArrowDownUp, ArrowRight, Zap, Lock } from 'lucide-react';

function FlagChip({ code }: { code: string }) {
  return (
    <span className="w-7 h-7 rounded-full bg-white border border-ink-200 shadow-sm flex items-center justify-center text-base leading-none shrink-0 overflow-hidden">
      {getCurrencyByCode(code)?.flag}
    </span>
  );
}

export function Converter() {
  const { t } = useI18n();
  const { navigate } = useRouter();
  const [amount, setAmount] = useState('1000');
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('XAF');

  const { fee, received, rate } = useMemo(() => {
    const value = parseFloat(amount.replace(',', '.')) || 0;
    const f = calculateFee(value, from);
    const r = getFxRate(from, to);
    return { fee: f, received: Math.max(0, (value - f) * r), rate: r };
  }, [amount, from, to]);

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  const selectClass =
    'bg-transparent font-semibold text-black text-sm outline-none cursor-pointer appearance-none pe-5 bg-no-repeat bg-[right_0_center]';

  return (
    <div className="bg-white rounded-2xl border border-ink-200 p-5 sm:p-6 text-start shadow-[0_24px_60px_-20px_rgba(6,42,36,0.25)]">
      <div className="flex justify-center -mt-9 mb-4">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-ink-200 shadow-sm text-xs font-medium text-ink-600">
          <span className="w-1.5 h-1.5 rounded-full bg-vanta-500 animate-pulse" />
          {t('calc.badge')}
        </span>
      </div>
      <div className="space-y-1">
        <div className="rounded-xl border border-ink-200 px-4 py-3 focus-within:border-vanta-500 focus-within:ring-2 focus-within:ring-vanta-100 transition-all">
          <label className="block text-[11px] font-semibold text-ink-400 uppercase tracking-wide">
            {t('calc.youSend')}
          </label>
          <div className="mt-0.5 flex items-center justify-between gap-3">
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9.,]/g, ''))}
              inputMode="decimal"
              className="w-full bg-transparent font-display text-2xl font-bold text-black outline-none"
              aria-label={t('calc.youSend')}
            />
            <span className="flex items-center gap-2 shrink-0 rounded-full border border-ink-200 bg-white ps-1.5 pe-2.5 py-1.5 hover:border-vanta-400 transition-colors">
              <FlagChip code={from} />
              <span className="relative">
                <select value={from} onChange={(e) => setFrom(e.target.value)} className={selectClass} aria-label="From currency">
                  {currencies.map((c) => (
                    <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                  ))}
                </select>
                <span className="pointer-events-none absolute end-0 top-1/2 -translate-y-1/2 text-ink-400 text-[10px]">▾</span>
              </span>
            </span>
          </div>
        </div>

        <div className="relative flex justify-center -my-2.5 z-10">
          <button
            onClick={swap}
            aria-label="Swap currencies"
            className="w-9 h-9 rounded-full bg-vanta-600 text-white flex items-center justify-center shadow-lg shadow-vanta-600/40 hover:bg-vanta-700 hover:rotate-180 transition-all duration-300"
          >
            <ArrowDownUp className="w-4 h-4" />
          </button>
        </div>

        <div className="rounded-xl border border-ink-200 px-4 py-3 bg-vanta-50/50">
          <label className="block text-[11px] font-semibold text-ink-400 uppercase tracking-wide">
            {t('calc.recipientGets')}
          </label>
          <div className="mt-0.5 flex items-center justify-between gap-3">
            <span key={received} className="w-full font-display text-2xl font-bold text-vanta-700 animate-fade-in truncate">
              {formatCurrency(received, to)}
            </span>
            <span className="flex items-center gap-2 shrink-0 rounded-full border border-ink-200 bg-white ps-1.5 pe-2.5 py-1.5 hover:border-vanta-400 transition-colors">
              <FlagChip code={to} />
              <span className="relative">
                <select value={to} onChange={(e) => setTo(e.target.value)} className={selectClass} aria-label="To currency">
                  {currencies.map((c) => (
                    <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                  ))}
                </select>
                <span className="pointer-events-none absolute end-0 top-1/2 -translate-y-1/2 text-ink-400 text-[10px]">▾</span>
              </span>
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-1.5 text-xs text-ink-500">
        <div className="flex justify-between">
          <span>{t('calc.fee')}</span>
          <span className="font-mono font-semibold text-ink-700">{formatCurrency(fee, from)}</span>
        </div>
        <div className="flex justify-between">
          <span>{t('calc.rate')}</span>
          <span className="inline-flex items-center gap-1 font-mono font-semibold text-ink-700">
            <Lock className="w-3 h-3 text-vanta-600" />
            1 {from} = {rate.toLocaleString(undefined, { maximumFractionDigits: 4 })} {to}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="inline-flex items-center gap-1 text-vanta-600 font-semibold">
            <Zap className="w-3 h-3" />
            {t('calc.arrives')}
          </span>
        </div>
      </div>

      <button onClick={() => navigate('auth')} className="btn-primary w-full mt-5 h-11">
        {t('calc.cta')}
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
