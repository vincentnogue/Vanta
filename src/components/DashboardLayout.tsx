import { type ReactNode, useState, useMemo, useRef, useEffect } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { useRouter, type Route } from '@/router/RouterContext';
import { useAuth, signOut } from '@/data/auth';
import { useStore } from '@/data/store';
import { Logo } from '@/components/Logo';
import { LanguageToggle } from '@/components/LanguageToggle';
import {
  Home, Settings, LifeBuoy,
  Menu, X, ArrowLeft, Bell, Search, LogOut, ChevronDown, Clock,
} from 'lucide-react';

type NavItem = { route: Route; label: string; icon: typeof Home; tabKey?: string; onSelect?: () => void };

export function DashboardLayout({ children, navItems, activeRoute }: { children: ReactNode; navItems: NavItem[]; activeRoute: string }) {
  const { t } = useI18n();
  const { navigate } = useRouter();
  const { user } = useAuth();
  const { transactions } = useStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [search, setSearch] = useState('');
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Real activity needing attention — not a decorative always-on red dot.
  const pendingActivity = useMemo(
    () => transactions.filter((tx) => tx.status === 'pending' || tx.status === 'processing' || tx.status === 'review').slice(0, 6),
    [transactions],
  );

  const searchResults = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    return transactions
      .filter((tx) => tx.recipientName.toLowerCase().includes(q) || tx.id.toLowerCase().includes(q))
      .slice(0, 6);
  }, [search, transactions]);

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
                    ? 'bg-vanta-500/15 text-vanta-300'
                    : 'text-ink-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {item.label}
                {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-vanta-400" />}
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
                    ? 'bg-vanta-500/15 text-vanta-300'
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
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('common.search')}
                className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-ink-200 bg-white/60 focus:outline-none focus:ring-2 focus:ring-vanta-500/20 focus:border-vanta-500 transition-all"
              />
              {search.trim() !== '' && (
                <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-xl border border-ink-200 shadow-xl overflow-hidden z-40">
                  {searchResults.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-ink-400">{t('dash.search.empty')}</div>
                  ) : (
                    searchResults.map((tx) => (
                      <button
                        key={tx.id}
                        onClick={() => { setSearch(''); navigate('activity'); }}
                        className="w-full flex items-center justify-between gap-3 px-4 py-2.5 text-left hover:bg-ink-50 transition-colors border-b border-ink-50 last:border-0"
                      >
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-ink-900 truncate">{tx.recipientName}</div>
                          <div className="text-xs text-ink-400 font-mono">{tx.id}</div>
                        </div>
                        <span className="text-xs text-ink-400 shrink-0">{tx.currency} {tx.amount}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <LanguageToggle />

            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen((v) => !v)}
                className="relative p-2 rounded-lg text-ink-600 hover:bg-ink-100 transition-colors"
              >
                <Bell className="w-5 h-5" />
                {pendingActivity.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-danger-500" />
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl border border-ink-200 shadow-xl overflow-hidden z-40">
                  <div className="px-4 py-3 border-b border-ink-100 font-semibold text-sm text-ink-900">{t('dash.notifications')}</div>
                  {pendingActivity.length === 0 ? (
                    <div className="px-4 py-6 text-center text-sm text-ink-400">{t('dash.notifications.empty')}</div>
                  ) : (
                    <div className="max-h-72 overflow-y-auto">
                      {pendingActivity.map((tx) => (
                        <div key={tx.id} className="flex items-start gap-3 px-4 py-3 border-b border-ink-50 last:border-0">
                          <Clock className="w-4 h-4 text-warning-500 shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <div className="text-sm text-ink-800">
                              {t('dash.notifications.pending')} <span className="font-semibold">{tx.recipientName}</span>
                            </div>
                            <div className="text-xs text-ink-400 font-mono mt-0.5">{tx.id} · {tx.status}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen((v) => !v)}
                className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full hover:bg-ink-100 transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-vanta-700 to-vanta-900 flex items-center justify-center text-white text-sm font-bold">
                  {user?.name?.[0]?.toUpperCase() ?? 'V'}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-ink-400 hidden sm:block" />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-ink-200 shadow-xl overflow-hidden z-40">
                  <div className="px-4 py-3 border-b border-ink-100">
                    <div className="text-sm font-semibold text-ink-900 truncate">{user?.name}</div>
                    <div className="text-xs text-ink-400 truncate">{user?.email}</div>
                  </div>
                  <button
                    onClick={() => { setUserMenuOpen(false); navigate('settings'); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink-700 hover:bg-ink-50 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-ink-400" /> {t('dash.nav.settings')}
                  </button>
                  <button
                    onClick={() => { signOut(); navigate('home'); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-danger-600 hover:bg-danger-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> {t('auth.signout')}
                  </button>
                </div>
              )}
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
