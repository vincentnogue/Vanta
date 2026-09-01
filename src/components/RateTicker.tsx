import { TrendingUp, TrendingDown } from 'lucide-react';

const rates = [
  { pair: 'EUR → XAF', value: '655.30', up: true },
  { pair: 'EUR → XOF', value: '655.30', up: true },
  { pair: 'EUR → NGN', value: '1,720.00', up: false },
  { pair: 'EUR → KES', value: '141.20', up: true },
  { pair: 'EUR → GHS', value: '15.80', up: false },
  { pair: 'EUR → USD', value: '1.093', up: true },
  { pair: 'EUR → GBP', value: '0.847', up: false },
  { pair: 'EUR → AED', value: '4.015', up: true },
  { pair: 'USD → XAF', value: '603.40', up: true },
  { pair: 'GBP → USD', value: '1.261', up: true },
  { pair: 'EUR → UGX', value: '4,065.00', up: true },
  { pair: 'EUR → ZAR', value: '21.10', up: true },
];

export function RateTicker() {
  const items = [...rates, ...rates];
  return (
    <div className="relative border-y border-ink-100 bg-white/80 backdrop-blur-sm overflow-hidden py-3">
      <div className="flex w-max animate-marquee gap-10 px-5">
        {items.map((r, i) => (
          <div key={i} className="flex items-center gap-2 text-sm whitespace-nowrap">
            <span className="font-semibold text-black">{r.pair}</span>
            <span className="font-mono text-ink-500">{r.value}</span>
            {r.up ? (
              <TrendingUp className="w-3.5 h-3.5 text-vanta-500" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-danger-500" />
            )}
          </div>
        ))}
      </div>
      <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white to-transparent pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white to-transparent pointer-events-none" />
    </div>
  );
}
