import { useI18n } from '@/i18n/I18nContext';
import { useRouter, type Route } from '@/router/RouterContext';
import { Logo } from './Logo';
import { LanguageToggle } from './LanguageToggle';
import { MapPin, Linkedin, Twitter, Github, Globe, ShieldCheck } from 'lucide-react';

export function Footer() {
  const { t } = useI18n();
  const { navigate } = useRouter();

  const sections: { title: string; links: { label: string; route: Route }[] }[] = [
    {
      title: t('footer.product'),
      links: [
        { label: t('footer.send'), route: 'send' },
        { label: t('footer.exchange'), route: 'exchange' },
        { label: t('footer.recipients'), route: 'recipients' },
        { label: t('footer.balances'), route: 'balances' },
      ],
    },
    {
      title: t('footer.company'),
      links: [
        { label: t('footer.about'), route: 'about' },
        { label: t('footer.careers'), route: 'careers' },
        { label: t('footer.contact'), route: 'contact' },
        { label: t('footer.press'), route: 'press' },
      ],
    },
    {
      title: t('footer.legal'),
      links: [
        { label: t('footer.privacy'), route: 'privacy' },
        { label: t('footer.terms'), route: 'terms' },
        { label: t('footer.licenses'), route: 'licenses' },
        { label: t('footer.compliance'), route: 'compliance' },
      ],
    },
    {
      title: t('footer.resources'),
      links: [
        { label: t('footer.docs'), route: 'api' },
        { label: t('footer.status'), route: 'status' },
        { label: t('footer.blog'), route: 'blog' },
        { label: t('footer.support'), route: 'support' },
      ],
    },
  ];

  const socials = [
    { icon: Linkedin, label: 'LinkedIn', href: '#' },
    { icon: Twitter, label: 'X', href: '#' },
    { icon: Github, label: 'GitHub', href: '#' },
    { icon: Globe, label: 'Website', href: '#' },
  ];

  return (
    <footer className="bg-slate-950 text-ink-300 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[150px] bg-vanta-500/8 blur-[120px]" />

      <div className="section-padding max-w-7xl mx-auto relative">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 py-14">
          {/* Brand column */}
          <div className="col-span-2">
            <Logo dark />
            <p className="mt-4 text-sm text-ink-300 max-w-xs leading-relaxed">
              {t('tagline')}
            </p>
            <p className="mt-3 text-[11px] text-ink-400 max-w-xs leading-relaxed">
              {t('footer.license')}
            </p>
            <div className="mt-4 flex items-center gap-3 text-[11px] text-ink-400">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-vanta-400" />
                NBB Regulated
              </span>
              <span className="w-1 h-1 rounded-full bg-ink-600" />
              <span>PSD2</span>
            </div>
            <div className="mt-5 flex items-center gap-4">
              <LanguageToggle dark />
              <div className="flex items-center gap-2">
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    aria-label={s.label}
                    className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-ink-300 hover:text-accent-400 hover:border-accent-400/30 hover:bg-white/10 transition-all duration-200"
                  >
                    <s.icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Link sections */}
          {sections.map((section, i) => (
            <div key={i}>
              <h4 className="text-[13px] font-semibold text-white mb-4 uppercase tracking-wide">
                {section.title}
              </h4>
              <ul className="space-y-2.5">
                {section.links.map((link, j) => (
                  <li key={j}>
                    <button
                      onClick={() => link.route && navigate(link.route)}
                      className="text-[13px] text-ink-300 hover:text-white transition-colors duration-200 text-left hover:translate-x-0.5 transition-transform"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-ink-400 text-center sm:text-left">
            {t('footer.developedBy')} {t('footer.rights')}
          </p>
          <div className="flex items-center gap-4 text-xs text-ink-400">
            <button
              onClick={() => navigate('privacy')}
              className="hover:text-white transition-colors"
            >
              {t('footer.privacy')}
            </button>
            <span className="w-1 h-1 rounded-full bg-ink-600" />
            <button
              onClick={() => navigate('terms')}
              className="hover:text-white transition-colors"
            >
              {t('footer.terms')}
            </button>
            <span className="w-1 h-1 rounded-full bg-ink-600" />
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              {t('footer.location')}
            </div>
          </div>
        </div>

        {/* Subtle watermark */}
        <div className="w-full h-[8vh] hidden lg:flex items-center justify-center pointer-events-none select-none">
          <span className="text-[9vw] font-bold leading-none text-white/[0.03] tracking-tight">VANTA</span>
        </div>
      </div>
    </footer>
  );
}
