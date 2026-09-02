import { useState } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { useRouter } from '@/router/RouterContext';
import { Logo } from '@/components/Logo';
import { LanguageToggle } from '@/components/LanguageToggle';
import { signIn, signUp, signInWithGoogle, isSuperAdminEmail } from '@/data/auth';
import { ArrowLeft, Mail, Lock, ArrowRight, Check, User, Building2, AlertCircle } from 'lucide-react';

function initialAccountType(): 'personal' | 'business' {
  try {
    return sessionStorage.getItem('vanta-signup-type') === 'business' ? 'business' : 'personal';
  } catch {
    return 'personal';
  }
}

export function AuthPage() {
  const { t } = useI18n();
  const { navigate } = useRouter();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [accountType, setAccountType] = useState<'personal' | 'business'>(initialAccountType);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogle = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      // Browser redirects to Google; nothing further to do here.
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === 'signup') {
        await signUp(email, password, name, accountType);
      } else {
        await signIn(email, password);
      }
      navigate(
        isSuperAdminEmail(email)
          ? 'superadmin'
          : mode === 'signup' && accountType === 'business'
            ? 'business'
            : 'consumer',
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-vanta-950 relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />
        <div className="absolute top-1/4 left-0 w-[400px] h-[400px] bg-accent-500/15 blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-vanta-500/20 blur-[100px]" />

        <div className="relative">
          <button onClick={() => navigate('home')}>
            <Logo dark size="lg" />
          </button>
        </div>

        <div className="relative">
          <h2 className="font-display text-4xl font-bold text-white tracking-tight text-balance">
            {t('tagline')}
          </h2>
          <p className="mt-4 text-ink-400 text-lg max-w-md">
            {t('hero.subtitle')}
          </p>
          <div className="mt-8 space-y-3">
            {[
              t('auth.feature.transfers'),
              t('auth.feature.payments'),
              t('auth.feature.balances'),
              t('auth.feature.payouts'),
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-ink-300">
                <div className="w-5 h-5 rounded-full bg-accent-500/20 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-accent-400" />
                </div>
                {feature}
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <LanguageToggle dark />
        </div>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-1/2 flex flex-col">
        <div className="p-6 flex items-center justify-between">
          <button
            onClick={() => navigate('home')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-ink-600 hover:text-vanta-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('dash.nav.backToSite')}
          </button>
          <div className="lg:hidden">
            <Logo />
          </div>
          <LanguageToggle />
        </div>

        <div className="flex-1 flex items-center justify-center px-6 pb-20">
          <div className="w-full max-w-sm">
            <h1 className="font-display text-3xl font-bold text-vanta-900 tracking-tight">
              {mode === 'signin' ? t('auth.welcome') : t('auth.createAccount')}
            </h1>
            <p className="mt-2 text-ink-500">
              {t('tagline')}
            </p>

            <button
              type="button"
              onClick={handleGoogle}
              disabled={googleLoading}
              className="mt-8 w-full flex items-center justify-center gap-3 h-12 rounded-lg border border-ink-200 bg-white font-semibold text-sm text-ink-700 hover:bg-ink-50 hover:border-ink-300 transition-all disabled:opacity-60"
            >
              {googleLoading ? (
                <span className="w-4 h-4 border-2 border-ink-300 border-t-ink-600 rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.47a5.54 5.54 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.82z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.88-3c-1.08.72-2.46 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.95H1.26v3.1A12 12 0 0 0 12 24z" />
                  <path fill="#FBBC05" d="M5.27 14.29a7.2 7.2 0 0 1 0-4.58v-3.1H1.26a12 12 0 0 0 0 10.78z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.26 6.61l4.01 3.1C6.22 6.86 8.87 4.75 12 4.75z" />
                </svg>
              )}
              {t('auth.continueWithGoogle')}
            </button>

            <div className="mt-6 flex items-center gap-3 text-xs font-medium text-ink-400">
              <span className="flex-1 h-px bg-ink-100" />
              {t('auth.or')}
              <span className="flex-1 h-px bg-ink-100" />
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              {mode === 'signup' && (
                <div>
                  <label className="block text-sm font-semibold text-ink-700 mb-2">
                    {t('auth.accountType')}
                  </label>
                  <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-ink-100/70">
                    {(['personal', 'business'] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setAccountType(type)}
                        className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                          accountType === type
                            ? 'bg-white text-vanta-800 shadow-sm ring-1 ring-ink-200'
                            : 'text-ink-500 hover:text-ink-700'
                        }`}
                      >
                        {type === 'personal' ? <User className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
                        {t(type === 'personal' ? 'auth.personal' : 'auth.business')}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {mode === 'signup' && (
                <div>
                  <label className="block text-sm font-semibold text-ink-700 mb-2">
                    {t('auth.fullName')}
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="input pl-12"
                      placeholder="Amira Benali"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-ink-700 mb-2">
                  {t('auth.email')}
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input pl-12"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink-700 mb-2">
                  {t('auth.password')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input pl-12"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-lg bg-danger-50 border border-danger-500/20 px-3.5 py-2.5 text-sm text-danger-700">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {mode === 'signin' && (
                <div className="flex justify-end">
                  <button type="button" className="text-sm text-vanta-600 hover:text-vanta-700 font-medium">
                    {t('auth.forgot')}
                  </button>
                </div>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full text-base py-4 disabled:opacity-70">
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {mode === 'signin' ? t('auth.signinBtn') : t('auth.signupBtn')}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-ink-500">
              {mode === 'signin' ? t('auth.noAccount') : t('auth.haveAccount')}{' '}
              <button
                onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                className="font-semibold text-vanta-600 hover:text-vanta-700"
              >
                {mode === 'signin' ? t('auth.signup') : t('auth.signin')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
