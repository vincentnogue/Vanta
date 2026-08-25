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
  | 'blog';

type RouterContextValue = {
  route: Route;
  navigate: (route: Route) => void;
};

const RouterContext = createContext<RouterContextValue | null>(null);

const validRoutes: Route[] = [
  'home', 'consumer', 'business', 'api', 'admin', 'superadmin', 'auth', 'kyc', 'send', 'recipients', 'activity', 'balances', 'exchange', 'security', 'settings', 'support',
  'about', 'careers', 'press', 'contact', 'privacy', 'terms', 'licenses', 'compliance', 'status', 'blog',
];

function parseHash(): Route {
  const hash = window.location.hash.replace('#/', '').replace('#', '');
  if (validRoutes.includes(hash as Route)) return hash as Route;
  return 'home';
}

export function RouterProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState<Route>(parseHash());

  useEffect(() => {
    const onHashChange = () => setRoute(parseHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = (newRoute: Route) => {
    window.location.hash = `/${newRoute}`;
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
