import { useMemo } from 'react';
import { countries } from '@/data/mockData';
import { useI18n } from '@/i18n/I18nContext';

function FlagPill({ countryCode, name, code }: { countryCode: string; name: string; code: string }) {
  return (
    <span className="inline-flex items-center gap-2.5 mx-2 ps-1.5 pe-4 py-1.5 rounded-full bg-white border border-ink-200/80 shadow-sm hover:shadow-md hover:border-vanta-300 hover:-translate-y-0.5 transition-all duration-300">
      <span className="w-8 h-8 rounded-full overflow-hidden ring-1 ring-ink-100 shrink-0 bg-ink-50">
        <img
          src={`https://hatscripts.github.io/circle-flags/flags/${countryCode.toLowerCase()}.svg`}
          alt={name}
          className="w-full h-full object-cover"
          loading="lazy"
          width={32}
          height={32}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            const fallback = e.currentTarget.nextElementSibling as HTMLElement | null;
            if (fallback) fallback.style.display = 'flex';
          }}
        />
        <span className="hidden w-full h-full items-center justify-center bg-vanta-100 text-vanta-700 text-[10px] font-bold">
          {countryCode}
        </span>
      </span>
      <span className="text-sm font-semibold text-ink-700 whitespace-nowrap">{name}</span>
      <span className="text-[11px] font-mono font-medium text-vanta-600 whitespace-nowrap">{code}</span>
    </span>
  );
}

export function FlagRiver() {
  const { t, lang } = useI18n();

  const [rowA, rowB] = useMemo(() => {
    const list = countries.map((c) => ({
      countryCode: c.code,
      name: lang === 'fr' ? c.nameFr : c.name,
      code: c.currencies[0],
    }));
    const half = Math.ceil(list.length / 2);
    return [list.slice(0, half), list.slice(half)];
  }, [lang]);

  return (
    <section className="py-14 sm:py-20 bg-white overflow-hidden">
      <div className="section-padding max-w-3xl mx-auto text-center">
        <h2 className="font-display text-3xl sm:text-4xl font-semibold text-black tracking-tight">
          {t('flags.title')}
        </h2>
        <p className="mt-3 text-lg text-ink-500">{t('flags.subtitle')}</p>
      </div>

      <div className="mt-10 space-y-4 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        {[rowA, rowB].map((row, i) => (
          <div key={i} className="group flex overflow-hidden">
            <div className={`flex shrink-0 items-center py-1 group-hover:[animation-play-state:paused] ${i === 0 ? 'animate-marquee' : 'animate-marquee-reverse'}`}>
              {[...row, ...row].map((c, j) => (
                <FlagPill key={`${c.countryCode}-${j}`} {...c} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
