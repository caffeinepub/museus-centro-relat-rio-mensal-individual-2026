import React, { useState, useEffect } from 'react';
import {
  createRouter,
  createRoute,
  createRootRoute,
  RouterProvider,
  Outlet,
} from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile, useIsCallerApproved } from './hooks/useQueries';
import { AppUserRole } from './backend';
import Sidebar from './components/Sidebar';
import ProfileSetupModal from './components/ProfileSetupModal';
import PendingApprovalPage from './pages/PendingApprovalPage';
import ReportsListPage from './pages/ReportsListPage';
import ReportFormPage from './pages/ReportFormPage';
import ActivityFormPage from './pages/ActivityFormPage';
import DashboardPage from './pages/DashboardPage';
import ApprovalsPage from './pages/ApprovalsPage';
import UserManagementPage from './pages/UserManagementPage';
import ConsolidatedMuseumPage from './pages/ConsolidatedMuseumPage';

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

// ── Index Page (role-based redirect) ──────────────────────────────────────
function IndexPage() {
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();

  const isCoordOrAdmin =
    userProfile?.appRole === AppUserRole.coordination ||
    userProfile?.appRole === AppUserRole.administration;

  if (!identity) return <LoginPage />;
  if (isCoordOrAdmin) return <DashboardPage />;
  return <ReportsListPage />;
}

// ── App Shell (authenticated) ──────────────────────────────────────────────
function AppShell() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched: profileFetched } = useGetCallerUserProfile();
  const { data: isApproved, isLoading: approvalLoading } = useIsCallerApproved();
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  const isAuthenticated = !!identity;
  const isCoordination = userProfile?.appRole === AppUserRole.coordination;
  const isAdministration = userProfile?.appRole === AppUserRole.administration;
  const isCoordOrAdmin = isCoordination || isAdministration;

  // Show profile setup modal when profile is not set
  useEffect(() => {
    if (isAuthenticated && profileFetched && userProfile === null) {
      setShowProfileSetup(true);
    } else if (userProfile !== null && userProfile !== undefined) {
      setShowProfileSetup(false);
    }
  }, [isAuthenticated, profileFetched, userProfile]);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Loading state
  if (profileLoading || approvalLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Profile setup — ProfileSetupModal manages its own open state via Dialog open={true}
  if (showProfileSetup) {
    return <ProfileSetupModal />;
  }

  // Pending approval (non-coordinator/admin users who are not approved)
  if (!isCoordOrAdmin && isApproved === false) {
    return <PendingApprovalPage />;
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar isApproved={isApproved ?? false} />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

// ── Routes ─────────────────────────────────────────────────────────────────
const rootRoute = createRootRoute({
  component: AppShell,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: IndexPage,
});

const reportsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reports',
  component: ReportsListPage,
});

const newReportRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reports/new',
  component: ReportFormPage,
});

const editReportRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reports/$reportId',
  component: ReportFormPage,
});

const newActivityRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reports/$reportId/activities/new',
  component: ActivityFormPage,
});

const editActivityRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reports/$reportId/activities/$activityId',
  component: ActivityFormPage,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: DashboardPage,
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
  indexRoute,
  reportsRoute,
  newReportRoute,
  editReportRoute,
  newActivityRoute,
  editActivityRoute,
  dashboardRoute,
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

export default function App() {
  return <RouterProvider router={router} />;
}
