import { useEffect, useRef, useState } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { languages, type Language } from '@/i18n/translations';
import { Languages, Check, ChevronDown } from 'lucide-react';

export function LanguageToggle({ dark = false }: { dark?: boolean }) {
  const { lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
          dark
            ? 'text-ink-300 hover:text-white hover:bg-white/10'
            : 'text-ink-600 hover:text-vanta-900 hover:bg-ink-100'
        }`}
        aria-label="Select language"
      >
        <Languages className="w-4 h-4" />
        {languages[lang].short}
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute end-0 mt-2 w-48 rounded-xl bg-white border border-ink-200 shadow-xl overflow-hidden animate-fade-in z-50">
          {(Object.keys(languages) as Language[]).map((code) => (
            <button
              key={code}
              onClick={() => {
                setLang(code);
                setOpen(false);
              }}
              className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                lang === code ? 'bg-vanta-50 text-vanta-700 font-semibold' : 'text-ink-700 hover:bg-ink-50'
              }`}
            >
              <span>{languages[code].name}</span>
              {lang === code && <Check className="w-4 h-4" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
