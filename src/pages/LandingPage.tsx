import { useEffect, useState } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { useRouter } from '@/router/RouterContext';
import {
  ArrowRight, Send, Building2, Code2, ShieldCheck,
  Globe2, Quote, Route as RouteIcon, CheckCircle2, Terminal,
  CreditCard, Smartphone, Landmark, Lock, Repeat,
  ShoppingCart, Link2, ArrowDownToLine, ArrowUpFromLine, Receipt,
} from 'lucide-react';
import { countries, type Region } from '@/data/mockData';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { BelgianFlag } from '@/components/BelgianFlag';
import { HeroMockup } from '@/components/HeroMockup';
import { RateTicker } from '@/components/RateTicker';
import { CountUp } from '@/components/CountUp';
import { Reveal } from '@/components/Reveal';
import { Converter } from '@/components/Converter';
import { FlagRiver } from '@/components/FlagRiver';
import { ShieldCheck as ShieldCheckIcon, Globe2 as Globe2Icon, Scale } from 'lucide-react';

const trustFeatures = [
  { icon: Globe2Icon, key: 'hero.feat1' as const },
  { icon: ShieldCheckIcon, key: 'hero.feat2' as const },
  { icon: Scale, key: 'hero.feat3' as const },
];

const corridors = [
  { from: '🇪🇺 Europe', to: '🇸🇳 Senegal', toFr: '🇸🇳 Sénégal', fee: '1.1%', speed: 'Instant' },
  { from: '🇫🇷 France', to: '🇨🇲 Cameroon', toFr: '🇨🇲 Cameroun', fee: '1.1%', speed: 'Instant' },
  { from: '🇧🇪 Belgium', to: '🇳🇬 Nigeria', toFr: '🇳🇬 Nigéria', fee: '0.9%', speed: '~30 s' },
  { from: '🇦🇪 UAE', to: '🇰🇪 Kenya', toFr: '🇰🇪 Kenya', fee: '1.0%', speed: '~30 s' },
  { from: '🇺🇸 USA', to: '🇳🇬 Nigeria', toFr: '🇳🇬 Nigéria', fee: '0.8%', speed: '~3 min' },
  { from: '🇬🇧 UK', to: '🇬🇭 Ghana', toFr: '🇬🇭 Ghana', fee: '1.0%', speed: 'Instant' },
];

const regions: (Region | 'All')[] = ['All', 'Africa', 'Europe', 'Asia', 'Americas', 'Oceania'];

export function LandingPage() {
  const { t, lang } = useI18n();
  const { navigate } = useRouter();
  const [scrollY, setScrollY] = useState(0);
  const [region, setRegion] = useState<Region | 'All'>('All');
  const [query, setQuery] = useState('');

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const filteredCountries = countries.filter((c) => {
    if (region !== 'All' && c.region !== region) return false;
    if (query) {
      const q = query.toLowerCase();
      return c.name.toLowerCase().includes(q) || c.nameFr.toLowerCase().includes(q);
    }
    return true;
  });

  const showGrid = query !== '';
  const carouselRows = [
    filteredCountries.filter((_, i) => i % 3 === 0),
    filteredCountries.filter((_, i) => i % 3 === 1),
    filteredCountries.filter((_, i) => i % 3 === 2),
  ].filter((row) => row.length > 0);

  const handleSpotlight = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty('--mx', `${x}px`);
    e.currentTarget.style.setProperty('--my', `${y}px`);
    const rx = ((y / rect.height) - 0.5) * -5;
    const ry = ((x / rect.width) - 0.5) * 5;
    e.currentTarget.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
  };

  const handleTiltLeave = (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.transform = '';
  };

  const products = [
    {
      icon: Send,
      name: t('products.consumer.name'),
      desc: t('products.consumer.desc'),
      route: 'consumer' as const,
    },
    {
      icon: Building2,
      name: t('products.business.name'),
      desc: t('products.business.desc'),
      route: 'business' as const,
    },
    {
      icon: Code2,
      name: t('products.api.name'),
      desc: t('products.api.desc'),
      route: 'api' as const,
    },
  ];

  const suiteProducts = [
    { icon: ShoppingCart, title: t('suite.checkouts.title'), desc: t('suite.checkouts.desc') },
    { icon: Smartphone, title: t('suite.pos.title'), desc: t('suite.pos.desc') },
    { icon: Link2, title: t('suite.link.title'), desc: t('suite.link.desc') },
    { icon: ArrowDownToLine, title: t('suite.collect.title'), desc: t('suite.collect.desc') },
    { icon: ArrowUpFromLine, title: t('suite.disburse.title'), desc: t('suite.disburse.desc') },
    { icon: Receipt, title: t('suite.invoice.title'), desc: t('suite.invoice.desc') },
  ];

  const steps = [
    { icon: Quote, title: t('steps.1.title'), desc: t('steps.1.desc') },
    { icon: RouteIcon, title: t('steps.2.title'), desc: t('steps.2.desc') },
    { icon: CheckCircle2, title: t('steps.3.title'), desc: t('steps.3.desc') },
  ];

  const stats = [
    { value: countries.length, suffix: '', label: t('hero.stat1Label') },
    { value: 40, suffix: '+', label: t('hero.stat2Label') },
    { value: 500, suffix: '+', label: t('coverage.corridors') },
  ];

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Navbar />

      {/* Hero — centered headline + CTAs + product mockup below (PayUnit-style) */}
      <section className="relative overflow-hidden pt-32 pb-16 lg:pt-40 lg:pb-24">
        <div
          className="absolute inset-0 z-0 bg-grid-light"
          style={{
            maskImage:
              'repeating-linear-gradient(to right, black 0px, black 3px, transparent 3px, transparent 8px), repeating-linear-gradient(to bottom, black 0px, black 3px, transparent 3px, transparent 8px), radial-gradient(ellipse 80% 80% at 0% 0%, #000 50%, transparent 90%)',
            WebkitMaskImage:
              'repeating-linear-gradient(to right, black 0px, black 3px, transparent 3px, transparent 8px), repeating-linear-gradient(to bottom, black 0px, black 3px, transparent 3px, transparent 8px), radial-gradient(ellipse 80% 80% at 0% 0%, #000 50%, transparent 90%)',
            maskComposite: 'intersect',
            WebkitMaskComposite: 'source-in',
          }}
        />

        <div className="absolute top-10 start-[12%] w-72 h-72 rounded-full bg-vanta-100/50 blur-[120px] animate-breathe pointer-events-none" />
        <div className="absolute top-16 end-[10%] w-80 h-80 rounded-full bg-accent-100/40 blur-[130px] animate-breathe pointer-events-none" style={{ animationDelay: '2.5s' }} />

        <div className="section-padding max-w-5xl mx-auto relative z-10 text-center">
          <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.75rem] font-semibold text-black tracking-tight text-balance leading-[1.1] animate-fade-up">
            {t('hero.title')}{' '}
            <span className="text-glow-scroll animate-text-glow-scroll inline-block">
              {t('hero.titleHighlight')}
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-ink-500 max-w-2xl mx-auto leading-relaxed animate-fade-up animate-delay-100">
            {t('hero.subtitle')}
          </p>

          <div className="mt-9 flex flex-col sm:flex-row items-center gap-3 justify-center animate-fade-up animate-delay-200">
            <button onClick={() => navigate('auth')} className="btn-primary h-12 pl-7 pr-2 text-base w-full sm:w-auto">
              {t('hero.cta')}
              <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <ArrowRight className="w-4 h-4" />
              </span>
            </button>
            <button
              onClick={() => navigate('api')}
              className="inline-flex items-center gap-3 h-12 pl-7 pr-2 rounded-lg bg-white border border-ink-200 text-black font-medium text-base w-full sm:w-auto justify-center transition-all duration-300 hover:border-ink-300 hover:shadow-md"
            >
              {t('hero.ctaSecondary')}
              <span className="w-8 h-8 rounded-full bg-ink-900/5 flex items-center justify-center">
                <ArrowRight className="w-4 h-4" />
              </span>
            </button>
          </div>

          <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 animate-fade-up animate-delay-300">
            {trustFeatures.map((f) => (
              <li key={f.key} className="flex items-center gap-2 text-[13px] font-medium text-ink-600">
                <span className="w-5 h-5 rounded-full bg-vanta-100 flex items-center justify-center shrink-0">
                  <f.icon className="w-3 h-3 text-vanta-700" />
                </span>
                {t(f.key)}
              </li>
            ))}
          </ul>

          <div className="mt-5 flex items-center gap-2 justify-center text-xs text-ink-400 animate-fade-up animate-delay-500">
            <BelgianFlag />
            <span>{t('hero.trustLine')}</span>
          </div>
        </div>

        {/* Product mockup, straight under the fold like the reference design */}
        <div className="section-padding max-w-6xl mx-auto relative z-10 mt-16 lg:mt-20">
          <Reveal delay={150}>
            <HeroMockup />
          </Reveal>
        </div>

        <div
          className="absolute inset-x-0 bottom-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
          style={{ transform: `translateY(${scrollY * 0.2}px)` }}
        >
          <span className="text-[20vw] font-bold leading-none text-black/[0.04]">VANTA</span>
        </div>
      </section>

      {/* Live FX ticker */}
      <RateTicker />

      {/* Flags river — 194 countries in motion */}
      <FlagRiver />

      {/* Live rate calculator */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="section-padding max-w-6xl mx-auto">
          <Reveal className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-vanta-50 border border-vanta-100 text-vanta-700 text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-vanta-500 animate-pulse" />
              {t('showcase.badge')}
            </div>
            <h2 className="mt-5 font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-black tracking-tight">
              {t('showcase.title')}
            </h2>
            <p className="mt-4 text-lg text-ink-500">{t('showcase.subtitle')}</p>
          </Reveal>
          <Reveal delay={150} className="mt-12 max-w-md mx-auto">
            <Converter />
            <button
              onClick={() => navigate('auth')}
              className="mt-6 mx-auto flex items-center gap-2 text-vanta-700 font-semibold text-sm hover:gap-3 transition-all"
            >
              {t('showcase.cta')}
              <ArrowRight className="w-4 h-4" />
            </button>
          </Reveal>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-b border-ink-100 bg-white relative z-10">
        <div className="section-padding max-w-6xl mx-auto py-10 grid grid-cols-3 gap-6 sm:gap-8">
          {stats.map((stat, i) => (
            <Reveal key={i} delay={i * 120} className="text-center">
              <div className="font-display text-3xl sm:text-4xl font-bold text-black">
                <CountUp value={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-sm text-ink-500 mt-1">{stat.label}</div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Products */}
      <section className="py-16 sm:py-20 bg-white">
        <Reveal>
        <div className="section-padding max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-black tracking-tight">
              {t('products.title')}
            </h2>
            <p className="mt-4 text-lg text-ink-500">{t('products.subtitle')}</p>
          </div>

          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {products.map((product, i) => (
              <button
                key={i}
                onClick={() => navigate(product.route)}
                onMouseMove={handleSpotlight}
                onMouseLeave={handleTiltLeave}
                className="card card-hover spotlight p-8 text-left group transition-transform duration-200 will-change-transform"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-vanta-600 to-vanta-800 flex items-center justify-center mb-6 shadow-lg shadow-vanta-600/30">
                  <product.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-display text-xl font-bold text-black mb-3">{product.name}</h3>
                <p className="text-ink-500 leading-relaxed text-sm">{product.desc}</p>
                <div className="mt-6 inline-flex items-center gap-2 text-vanta-600 font-semibold text-sm group-hover:gap-3 transition-all">
                  {t('products.learnMore')}
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            ))}
          </div>
        </div>
        </Reveal>
      </section>

      {/* Payment product suite */}
      <section className="py-16 sm:py-20 bg-ink-50/60 border-y border-ink-100">
        <Reveal>
        <div className="section-padding max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-black tracking-tight">
              {t('suite.title').split(' ').map((word, i, arr) =>
                i >= arr.length - 2 ? (
                  <span key={i} className="bg-gradient-to-r from-vanta-700 via-vanta-500 to-accent-400 bg-clip-text text-transparent">
                    {word}{i < arr.length - 1 ? ' ' : ''}
                  </span>
                ) : (
                  <span key={i}>{word} </span>
                ),
              )}
            </h2>
            <p className="mt-4 text-lg text-ink-500">{t('suite.subtitle')}</p>
          </div>

          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {suiteProducts.map((p, i) => (
              <div
                key={i}
                onMouseMove={handleSpotlight}
                onMouseLeave={handleTiltLeave}
                className="relative overflow-hidden card spotlight p-6 will-change-transform transition-transform duration-200"
              >
                <div className="absolute -right-4 -top-4 w-24 h-24 text-ink-100 opacity-60 pointer-events-none">
                  <p.icon className="w-full h-full" strokeWidth={1} />
                </div>
                <div className="relative">
                  <p.icon className="w-6 h-6 text-vanta-600 mb-4" />
                  <h3 className="font-display text-lg font-bold text-black mb-2">{p.title}</h3>
                  <p className="text-sm text-ink-500 leading-relaxed max-w-xs">{p.desc}</p>
                  <div className="mt-4 inline-flex items-center gap-1.5 text-vanta-700 font-semibold text-sm hover:gap-2.5 transition-all cursor-pointer">
                    {t('products.learnMore')}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        </Reveal>
      </section>

      {/* How it works */}
      <section className="py-24 bg-ink-50/60 border-y border-ink-100">
        <Reveal>
        <div className="section-padding max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-black tracking-tight">
              {t('steps.title')}
            </h2>
            <p className="mt-4 text-lg text-ink-500">{t('steps.subtitle')}</p>
          </div>

          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {steps.map((step, i) => (
              <div key={i} className="card p-8 relative">
                <span className="absolute top-6 right-6 font-display text-5xl font-bold text-vanta-100">
                  {i + 1}
                </span>
                <div className="w-12 h-12 rounded-xl bg-vanta-50 border border-vanta-100 flex items-center justify-center mb-5">
                  <step.icon className="w-6 h-6 text-vanta-600" />
                </div>
                <h3 className="font-display text-lg font-bold text-black mb-2">{step.title}</h3>
                <p className="text-sm text-ink-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
        </Reveal>
      </section>

      {/* PSP — VantaPay rails */}
      <section className="py-24 bg-vanta-950 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-accent-500/10 blur-[120px]" />
        <Reveal>
        <div className="section-padding max-w-6xl mx-auto relative">
          <div className="text-center max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-accent-400 bg-accent-500/10 border border-accent-500/20 rounded-full px-3 py-1.5">
              <Lock className="w-3.5 h-3.5" />
              {t('psp.badge')}
            </span>
            <h2 className="mt-5 font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-white tracking-tight">
              {t('psp.title')}
            </h2>
            <p className="mt-4 text-lg text-ink-300">{t('psp.subtitle')}</p>
          </div>

          <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: CreditCard, label: t('pay.method.card'), sub: 'Visa · Mastercard · Amex' },
              { icon: Smartphone, label: 'Apple Pay', sub: 'One-touch' },
              { icon: Smartphone, label: 'Google Pay', sub: 'One-touch' },
              { icon: Landmark, label: t('pay.method.sepa'), sub: 'IBAN · Instant' },
            ].map((m, i) => (
              <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center hover:bg-white/10 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-500 to-accent-700 flex items-center justify-center mx-auto mb-4">
                  <m.icon className="w-6 h-6 text-white" />
                </div>
                <div className="font-semibold text-white text-sm">{m.label}</div>
                <div className="text-xs text-ink-400 mt-1">{m.sub}</div>
              </div>
            ))}
          </div>

          {/* Payment funnel */}
          <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8">
            <h3 className="font-display text-lg font-bold text-white mb-6">{t('psp.funnel')}</h3>
            <div className="flex flex-wrap items-center gap-4">
              {[
                { stage: lang === 'fr' ? 'Initié' : 'Initiated', count: 1847 },
                { stage: lang === 'fr' ? 'Contrôle conformité' : 'Compliance check', count: 1847 },
                { stage: lang === 'fr' ? 'FX routé' : 'FX routed', count: 1839 },
                { stage: lang === 'fr' ? 'Paiement envoyé' : 'Payout sent', count: 1832 },
                { stage: lang === 'fr' ? 'Complété' : 'Completed', count: 1832 },
              ].map((s, i, arr) => (
                <div key={s.stage} className="flex items-center gap-4">
                  <div>
                    <div className="font-display text-xl font-bold text-accent-400">{s.count.toLocaleString()}</div>
                    <div className="text-xs text-ink-400">{s.stage}</div>
                    <div className="mt-1.5 h-1 rounded-full bg-white/10 overflow-hidden w-24">
                      <div className="h-full rounded-full bg-accent-500" style={{ width: `${Math.round((s.count / arr[0].count) * 100)}%` }} />
                    </div>
                  </div>
                  {i < arr.length - 1 && <Repeat className="w-4 h-4 text-ink-500 flex-shrink-0" />}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 text-center">
            <button onClick={() => navigate('auth')} className="btn-primary text-base px-8 py-3.5">
              {t('psp.cta')} <ArrowRight className="w-4 h-4" />
            </button>
            <p className="mt-4 text-[11px] text-ink-400 flex items-center justify-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              {t('pay.poweredBy')}
            </p>
          </div>
        </div>
        </Reveal>
      </section>

      {/* Corridors */}
      <section className="py-16 sm:py-20 bg-ink-50/60 border-y border-ink-100">
        <Reveal>
        <div className="section-padding max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-black tracking-tight">
              {t('corr.title')}
            </h2>
            <p className="mt-4 text-lg text-ink-500">{t('corr.subtitle')}</p>
          </div>

          <div className="card overflow-hidden">
            <div className="hidden sm:grid grid-cols-[1fr_24px_1fr_80px_90px] items-center gap-4 px-6 py-3 bg-ink-50 border-b border-ink-100 text-xs font-semibold text-ink-500 uppercase tracking-wide">
              <span>{t('corr.origin')}</span>
              <span />
              <span>{t('corr.destination')}</span>
              <span className="text-right">{t('corr.fee')}</span>
              <span className="text-right">{t('corr.delivery')}</span>
            </div>
            {corridors.map((c, i) => (
              <div
                key={i}
                className="group grid grid-cols-[1fr_20px_1fr] sm:grid-cols-[1fr_24px_1fr_80px_90px] items-center gap-2 sm:gap-4 px-6 py-4 border-b border-ink-100 last:border-0 hover:bg-vanta-50/40 transition-all duration-200 hover:px-7"
              >
                <span className="text-sm font-semibold text-black truncate">{c.from}</span>
                <span className="flex items-center justify-center text-ink-300 group-hover:text-vanta-500 group-hover:translate-x-0.5 transition-all duration-200">
                  <ArrowRight className="w-4 h-4" />
                </span>
                <span className="text-sm font-semibold text-black truncate">{lang === 'fr' ? c.toFr : c.to}</span>
                <span className="hidden sm:block text-sm text-right font-mono text-ink-500">{c.fee}</span>
                <span className="hidden sm:flex justify-end">
                  <span className={`badge ${c.speed === 'Instant' ? 'bg-vanta-50 text-vanta-700 border border-vanta-200' : 'bg-ink-100 text-ink-600'}`}>
                    {c.speed === 'Instant' ? t('corr.speed') : c.speed}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
        </Reveal>
      </section>

      {/* API */}
      <section className="py-16 sm:py-20 bg-white">
        <Reveal>
        <div className="section-padding max-w-6xl mx-auto">
          <div className="rounded-3xl bg-vanta-950 relative overflow-hidden p-8 lg:p-12">
            <div className="absolute inset-0 bg-grid-pattern opacity-30" />
            <div className="absolute top-0 left-1/3 w-[500px] h-[300px] bg-vanta-500/15 blur-[120px]" />

            <div className="relative grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-vanta-500/10 border border-vanta-500/20 text-vanta-300 text-sm font-medium mb-6">
                  <Terminal className="w-4 h-4" />
                  {t('apis.badge')}
                </div>
                <h2 className="font-display text-3xl sm:text-4xl font-semibold text-white tracking-tight">
                  {t('apis.title')}
                </h2>
                <p className="mt-4 text-ink-300 leading-relaxed">{t('apis.subtitle')}</p>
                <button onClick={() => navigate('api')} className="btn-accent mt-8">
                  {t('apis.cta')}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="rounded-xl bg-black/60 border border-white/10 overflow-hidden">
                <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/10">
                  <span className="w-3 h-3 rounded-full bg-danger-500/70" />
                  <span className="w-3 h-3 rounded-full bg-warning-500/70" />
                  <span className="w-3 h-3 rounded-full bg-success-500/70" />
                  <span className="ml-3 text-xs text-ink-400 font-mono">POST /v1/quotes</span>
                </div>
                <pre className="p-5 text-sm font-mono leading-relaxed overflow-x-auto">
                  <code>
                    <span className="text-ink-500">$ </span>
                    <span className="text-vanta-300">curl</span>
                    <span className="text-ink-300"> https://api.vanta.global/v1/quotes \</span>
                    {'\n'}
                    <span className="text-ink-300">  -H </span>
                    <span className="text-vanta-200">"Authorization: Bearer vnt_sk_..."</span>
                    <span className="text-ink-300"> \</span>
                    {'\n'}
                    <span className="text-ink-300">  -H </span>
                    <span className="text-vanta-200">"Idempotency-Key: req_9f2a"</span>
                    <span className="text-ink-300"> \</span>
                    {'\n'}
                    <span className="text-ink-300">  -d </span>
                    <span className="text-vanta-200">'{'{'}"from":"AED","to":"XAF",</span>
                    {'\n'}
                    <span className="text-vanta-200">        "amount":1000{'}'}'</span>
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </div>
        </Reveal>
      </section>

      {/* Coverage */}
      <section className="py-16 sm:py-20 bg-white relative overflow-hidden">
        <Reveal>
        <div className="section-padding max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-black tracking-tight">
              {t('coverage.title')}
            </h2>
            <p className="mt-4 text-lg text-ink-500">{t('coverage.subtitle')}</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 mb-8">
            <div className="flex flex-wrap justify-center gap-2 flex-1">
              {regions.map((r) => (
                <button
                  key={r}
                  onClick={() => setRegion(r)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                    region === r
                      ? 'bg-vanta-700 text-white shadow-lg shadow-vanta-700/30'
                      : 'bg-white border border-ink-200 text-ink-600 hover:border-vanta-400 hover:text-vanta-700'
                  }`}
                >
                  {r === 'All' ? t('dash.activity.all') : r}
                </button>
              ))}
            </div>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('common.search')}
              className="input !w-full sm:!w-56 !py-2 text-sm"
              aria-label="Search country"
            />
          </div>

          {showGrid ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {filteredCountries.map((country) => (
                  <div
                    key={country.code}
                    className="card p-3 flex items-center gap-2.5 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                  >
                    <span className="text-xl">{country.flag}</span>
                    <div className="min-w-0">
                      <div className="text-[13px] font-semibold text-ink-800 truncate">
                        {lang === 'fr' ? country.nameFr : country.name}
                      </div>
                      <div className="text-[11px] text-vanta-600 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-vanta-500" />
                        {t('coverage.active')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {filteredCountries.length === 0 && (
                <p className="text-center text-ink-400 text-sm mt-8">{t('dash.activity.empty')}</p>
              )}
            </>
          ) : (
            <div className="space-y-4 marquee-mask -mx-5 sm:-mx-8 lg:-mx-12">
              {carouselRows.map((row, ri) => (
                <div key={ri} className="marquee-row overflow-hidden">
                  <div className={`marquee-track flex w-max gap-3 ${ri % 2 === 1 ? 'animate-marquee-reverse' : 'animate-marquee'}`}>
                    {[...row, ...row].map((country, i) => (
                      <div
                        key={`${country.code}-${i}`}
                        className="card px-4 py-2.5 flex items-center gap-2.5 shrink-0 hover:shadow-lg hover:border-vanta-300 transition-all duration-300"
                      >
                        <span className="text-lg">{country.flag}</span>
                        <span className="text-[13px] font-semibold text-ink-800 whitespace-nowrap">
                          {lang === 'fr' ? country.nameFr : country.name}
                        </span>
                        <span className="text-[10px] font-mono text-ink-400">{country.currencies[0]}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-vanta-500" title={t('coverage.active')} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        </Reveal>
      </section>

      {/* Security */}
      <section className="py-16 sm:py-20 bg-ink-50/60">
        <Reveal>
        <div className="section-padding max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: message */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-vanta-50 border border-vanta-100 text-vanta-700 text-sm font-medium">
                <ShieldCheck className="w-4 h-4" />
                {t('security.badge')}
              </div>
              <h2 className="mt-5 font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-black tracking-tight">
                {t('security.title').split(' ').slice(0, -1).join(' ')}{' '}
                <span className="bg-gradient-to-r from-vanta-700 via-accent-500 to-vanta-500 bg-clip-text text-transparent">
                  {t('security.title').split(' ').slice(-1)}
                </span>
              </h2>
              <p className="mt-4 text-lg text-ink-500 max-w-md">{t('security.subtitle')}</p>

              <ul className="mt-8 space-y-6">
                {[
                  { title: t('security.audit'), desc: t('security.auditDesc') },
                  { title: t('security.encryption'), desc: t('security.encryptionDesc') },
                  { title: t('security.zeroStorage'), desc: t('security.zeroStorageDesc') },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-0.5 w-6 h-6 rounded-full bg-vanta-50 border border-vanta-100 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5 text-vanta-600" />
                    </span>
                    <div>
                      <div className="font-display font-bold text-black">{item.title}</div>
                      <p className="mt-0.5 text-sm text-ink-500 leading-relaxed">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: PCI DSS badge card */}
            <div className="flex flex-col items-center">
              <div className="w-full max-w-xs card p-8 flex items-center justify-center">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-14 h-14 text-vanta-600" strokeWidth={1.5} />
                  <div className="text-left">
                    <div className="font-display font-black text-xl text-vanta-900 leading-tight">PCI DSS</div>
                    <div className="text-xs font-semibold text-vanta-600 tracking-wide">COMPLIANT</div>
                  </div>
                </div>
              </div>
              <div className="mt-6 text-center">
                <div className="font-display text-2xl font-bold text-black">{t('security.pciLevel')}</div>
                <div className="text-vanta-600 font-semibold text-sm mt-1">PCI DSS</div>
                <div className="text-ink-400 text-sm mt-1">{t('security.pciAnnual')}</div>
              </div>
            </div>
          </div>
        </div>
        </Reveal>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20 bg-white">
        <Reveal>
        <div className="section-padding max-w-5xl mx-auto">
          <div className="relative rounded-3xl bg-gradient-to-br from-vanta-700 via-vanta-600 to-vanta-800 p-8 lg:p-12 text-center overflow-hidden">
            <div className="absolute inset-0 bg-grid-pattern opacity-20" />
            <Globe2 className="w-12 h-12 text-white/80 mx-auto mb-6 relative" />
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-white tracking-tight text-balance relative">
              {t('cta.title')}
            </h2>
            <p className="mt-4 text-lg text-vanta-100 max-w-2xl mx-auto relative">{t('cta.subtitle')}</p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center relative">
              <button
                onClick={() => navigate('auth')}
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-lg bg-white text-vanta-800 font-semibold transition-all duration-300 hover:scale-[1.02] shadow-lg"
              >
                {t('cta.button')}
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigate('business')}
                className="btn-ghost text-base px-7 py-4 text-white hover:bg-white/10"
              >
                {t('cta.secondary')}
              </button>
            </div>
          </div>
        </div>
        </Reveal>
      </section>

      <Footer />
    </div>
  );
}
