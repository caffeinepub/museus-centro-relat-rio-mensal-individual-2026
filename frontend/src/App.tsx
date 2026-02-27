import React from 'react';
import {
  createRouter,
  createRoute,
  createRootRoute,
  RouterProvider,
  Outlet,
  Navigate,
} from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile, useIsCallerApproved } from './hooks/useQueries';
import Sidebar from './components/Sidebar';
import ProfileSetupModal from './components/ProfileSetupModal';
import PendingApprovalPage from './pages/PendingApprovalPage';
import DashboardPage from './pages/DashboardPage';
import ReportsListPage from './pages/ReportsListPage';
import ReportFormPage from './pages/ReportFormPage';
import ActivityFormPage from './pages/ActivityFormPage';
import ApprovalsPage from './pages/ApprovalsPage';
import UserManagementPage from './pages/UserManagementPage';
import ConsolidatedMuseumPage from './pages/ConsolidatedMuseumPage';
import FileManagementPage from './pages/FileManagementPage';
import { Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';

// ── Auth Guard Layout ──────────────────────────────────────────────────────

function AppLayout() {
  const { identity, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const queryClient = useQueryClient();

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

  if (isInitializing || (isAuthenticated && (profileLoading || approvalLoading))) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">A carregar...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="bg-card border border-border rounded-2xl shadow-lg p-8 text-center space-y-6 max-w-md w-full mx-4">
          <img
            src="/assets/generated/museus-centro-logo.dim_256x256.png"
            alt="Museus Centro"
            className="h-20 w-20 mx-auto object-contain"
          />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Museus Centro</h1>
            <p className="text-muted-foreground mt-2">
              Sistema de Gestão de Relatórios e Atividades
            </p>
          </div>
          <LoginButton />
        </div>
      </div>
    );
  }

  if (showProfileSetup) {
    return (
      <ProfileSetupModal
        onComplete={() => {
          queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
        }}
      />
    );
  }

  if (showPendingApproval) {
    return <PendingApprovalPage />;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-background">
        <Outlet />
      </main>
    </div>
  );
}

function LoginButton() {
  const { login, loginStatus } = useInternetIdentity();
  const isLoggingIn = loginStatus === 'logging-in';

  return (
    <button
      onClick={() => login()}
      disabled={isLoggingIn}
      className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2 mx-auto"
    >
      {isLoggingIn && <Loader2 className="h-4 w-4 animate-spin" />}
      {isLoggingIn ? 'A entrar...' : 'Entrar'}
    </button>
  );
}

// ── Index redirect component ───────────────────────────────────────────────

function IndexRedirect() {
  return <Navigate to="/dashboard" />;
}

// ── Routes ─────────────────────────────────────────────────────────────────

const rootRoute = createRootRoute({
  component: AppLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: IndexRedirect,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: DashboardPage,
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

const approvalsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/approvals',
  component: ApprovalsPage,
});

const usersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/users',
  component: UserManagementPage,
});

const consolidatedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/consolidated',
  component: ConsolidatedMuseumPage,
});

const filesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/files',
  component: FileManagementPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  dashboardRoute,
  reportsRoute,
  newReportRoute,
  editReportRoute,
  newActivityRoute,
  editActivityRoute,
  approvalsRoute,
  usersRoute,
  consolidatedRoute,
  filesRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors />
    </>
  );
}
