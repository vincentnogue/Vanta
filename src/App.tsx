import { I18nProvider } from '@/i18n/I18nContext';
import { RouterProvider, useRouter } from '@/router/RouterContext';
import { useAuth } from '@/data/auth';
import { LandingPage } from '@/pages/LandingPage';
import { AuthPage } from '@/pages/AuthPage';
import { KycPage } from '@/pages/KycPage';
import { ForbiddenPage } from '@/pages/ForbiddenPage';
import { ConsumerDashboard } from '@/pages/ConsumerDashboard';
import { BusinessDashboard } from '@/pages/BusinessDashboard';
import { ApiPortal } from '@/pages/ApiPortal';
import { AdminPage } from '@/pages/AdminPage';
import { SuperAdminPage } from '@/pages/SuperAdminPage';
import { InfoPage } from '@/pages/InfoPage';
import type { InfoPageKey } from '@/data/infoContent';

const CONSUMER_ROUTES = ['consumer', 'send', 'recipients', 'activity', 'balances', 'exchange', 'security', 'settings', 'support'];
const PROTECTED_ROUTES = [...CONSUMER_ROUTES, 'business', 'admin', 'superadmin'];
const INFO_ROUTES: InfoPageKey[] = ['about', 'careers', 'press', 'contact', 'privacy', 'terms', 'licenses', 'compliance', 'status', 'blog'];

function AppContent() {
  const { route } = useRouter();
  const { user } = useAuth();

  // Auth-required platform
  if (PROTECTED_ROUTES.includes(route) && !user) return <AuthPage />;
  if (route === 'superadmin' && user?.role !== 'superadmin') return <ForbiddenPage />;
  if (route === 'admin' && user?.role !== 'superadmin') return <ForbiddenPage />;
  if (route === 'send' && user?.kycStatus !== 'verified') return <KycPage />;
  if (route === 'kyc' && !user) return <AuthPage />;
  if (route === 'kyc' && user?.kycStatus === 'verified') return <ConsumerDashboard />;

  let page: React.ReactNode;
  if (route === 'auth') page = user ? <ConsumerDashboard /> : <AuthPage />;
  else if (route === 'kyc') page = <KycPage />;
  else if (CONSUMER_ROUTES.includes(route)) page = <ConsumerDashboard />;
  else if (route === 'business') page = <BusinessDashboard />;
  else if (route === 'api') page = <ApiPortal />;
  else if (route === 'admin') page = <AdminPage />;
  else if (route === 'superadmin') page = <SuperAdminPage />;
  else if (INFO_ROUTES.includes(route as InfoPageKey)) page = <InfoPage page={route as InfoPageKey} />;
  else page = <LandingPage />;

  return <div key={route} className="animate-fade-in">{page}</div>;
}

export default function App() {
  return (
    <I18nProvider>
      <RouterProvider>
        <AppContent />
      </RouterProvider>
    </I18nProvider>
  );
}
