import { type ReactNode, useState } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { useRouter, type Route } from '@/router/RouterContext';
import { useAuth, signOut } from '@/data/auth';
import { Logo } from '@/components/Logo';
import { LanguageToggle } from '@/components/LanguageToggle';
import {
  Home, Settings, LifeBuoy,
  Menu, X, ArrowLeft, Bell, Search, LogOut,
} from 'lucide-react';

type NavItem = { route: Route; label: string; icon: typeof Home; tabKey?: string; onSelect?: () => void };

export function DashboardLayout({ children, navItems, activeRoute }: { children: ReactNode; navItems: NavItem[]; activeRoute: string }) {
  const { t } = useI18n();
  const { navigate } = useRouter();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const bottomItems: NavItem[] = [
    { route: 'support', label: t('dash.nav.support'), icon: LifeBuoy },
    { route: 'settings', label: t('dash.nav.settings'), icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-ink-50 flex">
      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-vanta-950 z-50 flex flex-col transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-5 flex items-center justify-between">
          <button onClick={() => navigate('home')}>
            <Logo dark />
          </button>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-ink-400 hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = activeRoute === (item.tabKey ?? item.route);
            return (
              <button
                key={item.tabKey ?? item.route}
                onClick={() => {
                  if (item.onSelect) item.onSelect();
                  else navigate(item.route);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-accent-500/15 text-accent-400'
                    : 'text-ink-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {item.label}
                {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-accent-400" />}
              </button>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-white/10 space-y-1">
          {bottomItems.map((item) => {
            const isActive = activeRoute === item.route;
            return (
              <button
                key={item.route}
                onClick={() => { navigate(item.route); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-accent-500/15 text-accent-400'
                    : 'text-ink-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {item.label}
              </button>
            );
          })}
          <button
            onClick={() => navigate('home')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-ink-500 hover:text-white hover:bg-white/5 transition-all"
          >
            <ArrowLeft className="w-5 h-5 flex-shrink-0" />
            {t('dash.nav.backToSite')}
          </button>
          <button
            onClick={() => { signOut(); navigate('home'); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-ink-500 hover:text-danger-400 hover:bg-white/5 transition-all"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {t('auth.signout')}
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 glass border-b border-ink-200/60 px-5 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-ink-600 hover:bg-ink-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="relative flex-1 max-w-md hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
              <input
                type="text"
                placeholder={t('common.search')}
                className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-ink-200 bg-white/60 focus:outline-none focus:ring-2 focus:ring-vanta-500/20 focus:border-vanta-500 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <LanguageToggle />
            <button className="relative p-2 rounded-lg text-ink-600 hover:bg-ink-100 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-danger-500" />
            </button>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-vanta-700 to-vanta-900 flex items-center justify-center text-white text-sm font-bold" title={user?.email}>
              {user?.name?.[0]?.toUpperCase() ?? 'V'}
            </div>
          </div>
        </header>

        <main className="flex-1 p-5 lg:p-8 max-w-6xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
