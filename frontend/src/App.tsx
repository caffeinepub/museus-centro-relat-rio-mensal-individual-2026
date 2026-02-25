import React from 'react';
import {
  createRouter,
  createRoute,
  createRootRoute,
  RouterProvider,
  Outlet,
} from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile, useIsCallerApproved } from './hooks/useQueries';
import Sidebar from './components/Sidebar';
import ProfileSetupModal from './components/ProfileSetupModal';
import DashboardPage from './pages/DashboardPage';
import ReportsListPage from './pages/ReportsListPage';
import ReportFormPage from './pages/ReportFormPage';
import ActivityFormPage from './pages/ActivityFormPage';
import ApprovalsPage from './pages/ApprovalsPage';
import UserManagementPage from './pages/UserManagementPage';
import ConsolidatedMuseumPage from './pages/ConsolidatedMuseumPage';
import PendingApprovalPage from './pages/PendingApprovalPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

// ── Login Page ─────────────────────────────────────────────────────────────

function LoginPage() {
  const { login, loginStatus } = useInternetIdentity();
  const isLoggingIn = loginStatus === 'logging-in';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-8 p-8 max-w-md w-full">
        <img
          src="/assets/generated/museus-centro-logo.dim_256x256.png"
          alt="Museus Centro Logo"
          className="w-32 h-32 object-contain"
        />
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">Museus Centro</h1>
          <p className="text-muted-foreground">Sistema de Gestão de Relatórios</p>
        </div>
        <div className="w-full bg-card border border-border rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-foreground mb-4 text-center">Entrar no Sistema</h2>
          <p className="text-sm text-muted-foreground mb-6 text-center">
            Faça login com sua identidade digital para acessar o sistema de relatórios.
          </p>
          <button
            onClick={login}
            disabled={isLoggingIn}
            className="w-full py-3 px-6 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoggingIn ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Entrando...
              </span>
            ) : (
              'Entrar'
            )}
          </button>
        </div>
        <footer className="text-center text-xs text-muted-foreground mt-4">
          <p>
            Feito com ❤️ usando{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              caffeine.ai
            </a>
          </p>
          <p className="mt-1">© {new Date().getFullYear()} Museus Centro</p>
        </footer>
      </div>
    </div>
  );
}

// ── Layout ─────────────────────────────────────────────────────────────────

function AppLayout() {
  const { identity, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched: profileFetched,
  } = useGetCallerUserProfile();

  const { data: isApproved, isLoading: approvalLoading } = useIsCallerApproved();

  const showProfileSetup =
    isAuthenticated && !profileLoading && profileFetched && userProfile === null;

  const showPendingApproval =
    isAuthenticated &&
    !profileLoading &&
    profileFetched &&
    userProfile !== null &&
    !approvalLoading &&
    isApproved === false;

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="flex flex-col items-center gap-3">
          <img src="/assets/generated/museus-centro-logo.dim_256x256.png" alt="Logo" className="h-16 w-16 opacity-80" />
          <div className="h-1 w-32 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full animate-pulse w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  if (showProfileSetup) {
    return <ProfileSetupModal />;
  }

  if (showPendingApproval) {
    return <PendingApprovalPage />;
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}

// ── Routes ─────────────────────────────────────────────────────────────────

const rootRoute = createRootRoute({
  component: AppLayout,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: DashboardPage,
});

const reportsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reports',
  component: ReportsListPage,
});

const reportNewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reports/new',
  component: ReportFormPage,
});

const reportEditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reports/$reportId',
  component: ReportFormPage,
});

const activityNewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/activities/new',
  component: ActivityFormPage,
});

const activityEditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/activities/$activityId',
  component: ActivityFormPage,
});

const approvalsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/approvals',
  component: ApprovalsPage,
});

const userManagementRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/users',
  component: UserManagementPage,
});

const consolidatedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/consolidated',
  component: ConsolidatedMuseumPage,
});

const routeTree = rootRoute.addChildren([
  dashboardRoute,
  reportsRoute,
  reportNewRoute,
  reportEditRoute,
  activityNewRoute,
  activityEditRoute,
  approvalsRoute,
  userManagementRoute,
  consolidatedRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

// ── App ────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
