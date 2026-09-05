import { Suspense, lazy } from 'react';
import { I18nProvider } from '@/i18n/I18nContext';
import { RouterProvider, useRouter } from '@/router/RouterContext';
import { useAuth } from '@/data/auth';
import { LandingPage } from '@/pages/LandingPage';
import { AuthPage } from '@/pages/AuthPage';
import { KycPage } from '@/pages/KycPage';
import { ForbiddenPage } from '@/pages/ForbiddenPage';
import type { InfoPageKey } from '@/data/infoContent';

// Route-based code splitting: the landing page, auth, and KYC screens are
// needed immediately (anonymous visitors hit them first), so they stay as
// normal imports. Everything behind login is lazy-loaded on demand instead
// of shipping every dashboard in the initial bundle.
const ConsumerDashboard = lazy(() => import('@/pages/ConsumerDashboard').then((m) => ({ default: m.ConsumerDashboard })));
const BusinessDashboard = lazy(() => import('@/pages/BusinessDashboard').then((m) => ({ default: m.BusinessDashboard })));
const ApiPortal = lazy(() => import('@/pages/ApiPortal').then((m) => ({ default: m.ApiPortal })));
const AdminPage = lazy(() => import('@/pages/AdminPage').then((m) => ({ default: m.AdminPage })));
const SuperAdminPage = lazy(() => import('@/pages/SuperAdminPage').then((m) => ({ default: m.SuperAdminPage })));
const InfoPage = lazy(() => import('@/pages/InfoPage').then((m) => ({ default: m.InfoPage })));

function RouteLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-vanta-200 border-t-vanta-600 rounded-full animate-spin" />
    </div>
  );
}

const CONSUMER_ROUTES = ['consumer', 'send', 'recipients', 'activity', 'balances', 'cards', 'exchange', 'security', 'settings', 'support'];
const PROTECTED_ROUTES = [...CONSUMER_ROUTES, 'business', 'admin', 'superadmin'];
const INFO_ROUTES: InfoPageKey[] = ['about', 'careers', 'press', 'contact', 'privacy', 'terms', 'licenses', 'compliance', 'status', 'blog'];

function AppContent() {
  const { route } = useRouter();
  const { user, loading } = useAuth();

  // While the Supabase session is resolving, avoid flashing the sign-in page.
  if (loading && PROTECTED_ROUTES.includes(route)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-vanta-200 border-t-vanta-600 rounded-full animate-spin" />
      </div>
    );
  }

  // Auth-required platform
  if (PROTECTED_ROUTES.includes(route) && !user) return <AuthPage />;
  if (route === 'superadmin' && user?.role !== 'superadmin') return <ForbiddenPage />;
  if (route === 'admin' && user?.role !== 'superadmin') return <ForbiddenPage />;
  if (route === 'kyc' && !user) return <AuthPage />;

  let page: React.ReactNode;
  if (route === 'send' && user?.kycStatus !== 'verified') page = <KycPage />;
  else if (route === 'kyc' && user?.kycStatus === 'verified') page = <ConsumerDashboard />;
  else if (route === 'auth') page = user ? <ConsumerDashboard /> : <AuthPage />;
  else if (route === 'kyc') page = <KycPage />;
  else if (CONSUMER_ROUTES.includes(route)) page = <ConsumerDashboard />;
  else if (route === 'business') page = <BusinessDashboard />;
  else if (route === 'api') page = <ApiPortal />;
  else if (route === 'admin') page = <AdminPage />;
  else if (route === 'superadmin') page = <SuperAdminPage />;
  else if (INFO_ROUTES.includes(route as InfoPageKey)) page = <InfoPage page={route as InfoPageKey} />;
  else page = <LandingPage />;

  return (
    <div key={route} className="animate-fade-in">
      <Suspense fallback={<RouteLoader />}>{page}</Suspense>
    </div>
  );
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
