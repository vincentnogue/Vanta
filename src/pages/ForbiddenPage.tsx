import { useI18n } from '@/i18n/I18nContext';
import { useRouter } from '@/router/RouterContext';
import { useAuth, signOut } from '@/data/auth';
import { Logo } from '@/components/Logo';
import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-react';

export function ForbiddenPage() {
  const { t } = useI18n();
  const { navigate } = useRouter();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-ink-50 flex flex-col items-center justify-center px-6 text-center">
      <Logo size="lg" />
      <div className="mt-10 w-16 h-16 rounded-2xl bg-danger-50 border border-danger-200 flex items-center justify-center animate-pop">
        <ShieldAlert className="w-8 h-8 text-danger-500" />
      </div>
      <h1 className="mt-6 font-display text-2xl sm:text-3xl font-bold text-black tracking-tight">
        {t('forbidden.title')}
      </h1>
      <p className="mt-3 text-ink-500 max-w-md">
        {t('forbidden.subtitle')}
        {user && <span className="block mt-1 text-xs font-mono text-ink-400">{user.email}</span>}
      </p>
      <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
        <button onClick={() => navigate('home')} className="btn-primary">
          <ArrowLeft className="w-4 h-4" />
          {t('dash.nav.backToSite')}
        </button>
        {user && (
          <button onClick={() => { signOut(); navigate('auth'); }} className="btn-outline">
            <LogOut className="w-4 h-4" />
            {t('auth.signout')}
          </button>
        )}
      </div>
    </div>
  );
}
