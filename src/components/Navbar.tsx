import { useState, useRef, useEffect } from 'react';
import { Menu, X, ArrowRight, Sparkles, LogOut, User, Building2, ChevronDown } from 'lucide-react';
import { useI18n } from '@/i18n/I18nContext';
import { useRouter, type Route } from '@/router/RouterContext';
import { useAuth, signOut } from '@/data/auth';
import { Logo } from './Logo';
import { LanguageToggle } from './LanguageToggle';

export function Navbar() {
  const { t } = useI18n();
  const { navigate } = useRouter();
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const signupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (signupRef.current && !signupRef.current.contains(e.target as Node)) setSignupOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const startSignup = (type: 'personal' | 'business') => {
    try { sessionStorage.setItem('vanta-signup-type', type); } catch { /* ignore */ }
    setSignupOpen(false);
    navigate('auth');
  };

  const navItems: { label: string; route: Route }[] = [
    { label: t('nav.products'), route: 'home' },
    { label: t('nav.business'), route: 'business' },
    { label: t('nav.api'), route: 'api' },
  ];

  const accountLabel = user?.role === 'superadmin' ? 'Super Admin' : t('dash.nav.home');

  const accountButton = (className: string) =>
    user ? (
      <div className={`flex items-center gap-2 ${className}`}>
        <button
          onClick={() => navigate(user.role === 'superadmin' ? 'superadmin' : 'consumer')}
          className="group flex items-center text-sm font-medium px-4 py-2.5 rounded-full bg-gradient-to-r from-vanta-700 to-vanta-800 hover:from-vanta-800 hover:to-vanta-900 text-white shadow-lg shadow-vanta-700/30 transition-all duration-300 hover:scale-[1.02]"
        >
          <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold mr-2">
            {user.name[0]?.toUpperCase()}
          </span>
          {accountLabel}
          <ArrowRight className="w-0 h-4 opacity-0 group-hover:w-4 group-hover:opacity-100 group-hover:ml-2 transition-all duration-300" />
        </button>
        <button
          onClick={() => signOut()}
          className="p-2.5 rounded-full text-ink-500 hover:text-danger-600 hover:bg-danger-50 transition-colors"
          title={t('auth.signout')}
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    ) : (
      <div ref={signupRef} className={`relative ${className}`}>
        <button
          onClick={() => setSignupOpen((o) => !o)}
          className="group flex items-center text-sm font-medium px-4 py-2.5 rounded-full bg-gradient-to-r from-vanta-700 to-vanta-800 hover:from-vanta-800 hover:to-vanta-900 text-white shadow-lg shadow-vanta-700/30 hover:shadow-xl hover:shadow-vanta-700/40 transition-all duration-300 hover:scale-[1.02]"
        >
          <Sparkles className="w-4 h-4 mr-2 opacity-80" />
          {t('nav.getStarted')}
          <ChevronDown className={`w-4 h-4 ml-1.5 opacity-80 transition-transform duration-300 ${signupOpen ? 'rotate-180' : ''}`} />
        </button>
        {signupOpen && (
          <div className="absolute end-0 top-full mt-2 w-64 card p-2 shadow-2xl shadow-ink-900/15 z-50 animate-pop origin-top">
            <button
              onClick={() => startSignup('personal')}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-vanta-50 transition-colors text-start"
            >
              <span className="w-9 h-9 rounded-full bg-vanta-100 flex items-center justify-center shrink-0">
                <User className="w-4.5 h-4.5 text-vanta-700" />
              </span>
              <span>
                <span className="block text-sm font-semibold text-black">{t('nav.personalAccount')}</span>
                <span className="block text-xs text-ink-500">{t('auth.feature.transfers')}</span>
              </span>
            </button>
            <button
              onClick={() => startSignup('business')}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-vanta-50 transition-colors text-start"
            >
              <span className="w-9 h-9 rounded-full bg-accent-100 flex items-center justify-center shrink-0">
                <Building2 className="w-4.5 h-4.5 text-accent-700" />
              </span>
              <span>
                <span className="block text-sm font-semibold text-black">{t('nav.businessAccount')}</span>
                <span className="block text-xs text-ink-500">{t('auth.feature.payouts')}</span>
              </span>
            </button>
          </div>
        )}
      </div>
    );

  return (
    <header className="fixed top-4 inset-x-0 z-50 flex items-center justify-center px-4">
      <nav className="w-full max-w-sm md:max-w-3xl lg:max-w-5xl flex items-center justify-between p-1 rounded-2xl md:rounded-full bg-white/50 backdrop-blur-lg border border-ink-200/70 shadow-sm transition-all duration-500">
        <button onClick={() => navigate('home')} className="flex items-center pl-3 flex-shrink-0">
          <Logo size="sm" />
        </button>

        <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
          {navItems.map((item, i) => (
            <button
              key={i}
              onClick={() => navigate(item.route)}
              className="text-sm font-bold px-4 py-2 rounded-full text-ink-600 hover:text-vanta-700 hover:bg-vanta-50/60 transition-all duration-300"
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2 pr-1">
          <LanguageToggle />
          {!user && (
            <button
              onClick={() => navigate('auth')}
              className="text-sm font-medium px-4 py-2 rounded-full text-ink-600 hover:text-vanta-700 hover:bg-vanta-50/60 transition-all duration-300"
            >
              {t('nav.signin')}
            </button>
          )}
          {accountButton('')}
        </div>

        <div className="md:hidden flex items-center gap-1 pr-1">
          <LanguageToggle />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2.5 rounded-xl bg-white/80 border border-ink-200/50 text-ink-700 shadow-sm"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="md:hidden absolute top-full inset-x-4 mt-2 rounded-2xl bg-white/90 backdrop-blur-lg border border-ink-200/70 shadow-xl animate-fade-in">
          <div className="p-3 flex flex-col gap-1">
            {navItems.map((item, i) => (
              <button
                key={i}
                onClick={() => { navigate(item.route); setMobileOpen(false); }}
                className="px-4 py-3 text-left text-sm font-bold text-ink-600 hover:text-vanta-700 hover:bg-vanta-50/60 rounded-xl transition-all"
              >
                {item.label}
              </button>
            ))}
            <div className="h-px bg-ink-200 my-1" />
            {user ? (
              <>
                <button
                  onClick={() => { navigate(user.role === 'superadmin' ? 'superadmin' : 'consumer'); setMobileOpen(false); }}
                  className="btn-primary text-sm mt-1"
                >
                  {accountLabel}
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => { signOut(); setMobileOpen(false); }}
                  className="px-4 py-3 text-left text-sm font-medium text-ink-600 hover:bg-ink-100 rounded-xl"
                >
                  {t('auth.signout')}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => { navigate('auth'); setMobileOpen(false); }}
                  className="px-4 py-3 text-left text-sm font-medium text-ink-600 hover:bg-ink-100 rounded-xl"
                >
                  {t('nav.signin')}
                </button>
                <button
                  onClick={() => { navigate('auth'); setMobileOpen(false); }}
                  className="btn-primary text-sm mt-1"
                >
                  {t('nav.getStarted')}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
