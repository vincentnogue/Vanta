import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

type Route =
  | 'home'
  | 'consumer'
  | 'business'
  | 'api'
  | 'admin'
  | 'superadmin'
  | 'auth'
  | 'kyc'
  | 'send'
  | 'recipients'
  | 'activity'
  | 'balances'
  | 'cards'
  | 'exchange'
  | 'security'
  | 'settings'
  | 'support'
  | 'about'
  | 'careers'
  | 'press'
  | 'contact'
  | 'privacy'
  | 'terms'
  | 'licenses'
  | 'compliance'
  | 'status'
  | 'blog'
  | 'paylink';

type RouterContextValue = {
  route: Route;
  navigate: (route: Route, param?: string) => void;
};

const RouterContext = createContext<RouterContextValue | null>(null);

const validRoutes: Route[] = [
  'home', 'consumer', 'business', 'api', 'admin', 'superadmin', 'auth', 'kyc', 'send', 'recipients', 'activity', 'balances', 'cards', 'exchange', 'security', 'settings', 'support',
  'about', 'careers', 'press', 'contact', 'privacy', 'terms', 'licenses', 'compliance', 'status', 'blog', 'paylink',
];

function parseHash(): Route {
  const raw = window.location.hash.replace('#/', '').replace('#', '');
  const base = raw.split('/')[0];
  if (validRoutes.includes(base as Route)) return base as Route;
  return 'home';
}

/** For routes that carry an id in the URL (currently just payment links):
 * reads it straight from the hash rather than threading a param through
 * the whole router type. */
export function getRouteParam(): string | null {
  const raw = window.location.hash.replace('#/', '').replace('#', '');
  const parts = raw.split('/');
  return parts.length > 1 && parts[1] ? decodeURIComponent(parts[1]) : null;
}

export function RouterProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState<Route>(parseHash());

  useEffect(() => {
    const onHashChange = () => setRoute(parseHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = (newRoute: Route, param?: string) => {
    window.location.hash = param ? `/${newRoute}/${encodeURIComponent(param)}` : `/${newRoute}`;
    setRoute(newRoute);
    window.scrollTo(0, 0);
  };

  return (
    <RouterContext.Provider value={{ route, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error('useRouter must be used within RouterProvider');
  return ctx;
}

export type { Route };
