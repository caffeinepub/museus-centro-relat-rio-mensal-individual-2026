import React, { useState, useEffect } from 'react';
import {
  createRouter,
  createRoute,
  createRootRoute,
  RouterProvider,
  Outlet,
} from '@tanstack/react-router';
import { QueryClient, QueryClientProvider, useMutation, useQueryClient } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile, useIsCallerApproved } from './hooks/useQueries';
import { AppUserRole, MuseumLocation } from './backend';
import type { UserProfile } from './backend';
import { useActor } from './hooks/useActor';
import Sidebar from './components/Sidebar';
import ReportsListPage from './pages/ReportsListPage';
import ReportFormPage from './pages/ReportFormPage';
import ActivityFormPage from './pages/ActivityFormPage';
import DashboardPage from './pages/DashboardPage';
import ApprovalsPage from './pages/ApprovalsPage';
import ConsolidatedMuseumPage from './pages/ConsolidatedMuseumPage';
import UserManagementPage from './pages/UserManagementPage';
import PendingApprovalPage from './pages/PendingApprovalPage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Building2 } from 'lucide-react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

// ── Profile Setup Modal ────────────────────────────────────────────────────

function ProfileSetupModal({ onSave }: { onSave: (name: string, role: AppUserRole) => void }) {
  const [name, setName] = useState('');
  const [role, setRole] = useState<AppUserRole>(AppUserRole.professional);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    await onSave(name.trim(), role);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl p-8 w-full max-w-md shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <Building2 className="w-8 h-8 text-primary" />
          <div>
            <h2 className="text-xl font-bold text-foreground">Bem-vindo!</h2>
            <p className="text-sm text-muted-foreground">Configure seu perfil para continuar</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Seu nome completo</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite seu nome..."
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Função</Label>
            <Select value={role} onValueChange={(v) => setRole(v as AppUserRole)}>
              <SelectTrigger id="role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={AppUserRole.professional}>Profissional</SelectItem>
                <SelectItem value={AppUserRole.coordination}>Coordenação</SelectItem>
                <SelectItem value={AppUserRole.administration}>Administração</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full" disabled={saving || !name.trim()}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Salvar perfil
          </Button>
        </form>
      </div>
    </div>
  );
}

// ── Save profile hook ──────────────────────────────────────────────────────

function useSaveCallerUserProfileMutation() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['currentUserProfile'] });
      qc.invalidateQueries({ queryKey: ['isCallerApproved'] });
    },
  });
}

// ── App Layout ─────────────────────────────────────────────────────────────

function AppLayout() {
  const { identity, isInitializing, login, loginStatus } = useInternetIdentity();
  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched: profileFetched,
  } = useGetCallerUserProfile();
  const {
    data: isApproved,
    isLoading: approvalLoading,
    isFetched: approvalFetched,
  } = useIsCallerApproved();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { mutateAsync: saveProfile } = useSaveCallerUserProfileMutation();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  // Show profile setup modal when user is authenticated but has no profile yet
  const showProfileSetup = isAuthenticated && !profileLoading && profileFetched && userProfile === null;

  // Determine if user is a coordinator or admin (they bypass approval gate)
  const isCoordOrAdmin =
    userProfile?.appRole === AppUserRole.coordination ||
    userProfile?.appRole === AppUserRole.administration;

  // Show pending approval screen when:
  // - user is authenticated
  // - profile is loaded and exists (setup is done)
  // - approval status is fetched and user is NOT approved
  // - user is not a coordinator/admin (they are always approved)
  const showPendingApproval =
    isAuthenticated &&
    !profileLoading &&
    profileFetched &&
    userProfile !== null &&
    !showProfileSetup &&
    approvalFetched &&
    !approvalLoading &&
    isApproved === false &&
    !isCoordOrAdmin;

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="bg-card border border-border rounded-2xl p-10 w-full max-w-sm shadow-xl text-center space-y-6">
          <img
            src="/assets/generated/museus-centro-logo.dim_256x256.png"
            alt="Museus Centro"
            className="w-20 h-20 rounded-2xl mx-auto"
          />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Museus Centro</h1>
            <p className="text-sm text-muted-foreground mt-1">Sistema de Relatórios Mensais</p>
          </div>
          <Button
            onClick={login}
            disabled={isLoggingIn}
            className="w-full"
            size="lg"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Entrando...
              </>
            ) : (
              'Entrar'
            )}
          </Button>
        </div>
      </div>
    );
  }

  // Show pending approval page (full screen, no sidebar)
  if (showPendingApproval) {
    return <PendingApprovalPage />;
  }

  const handleSaveProfile = async (name: string, role: AppUserRole) => {
    await saveProfile({ name, appRole: role, museum: MuseumLocation.equipePrincipal });
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((c) => !c)}
        isApproved={isApproved ?? false}
      />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
        {showProfileSetup && (
          <ProfileSetupModal onSave={handleSaveProfile} />
        )}
      </main>
    </div>
  );
}

// ── Index redirect component ───────────────────────────────────────────────

function IndexRedirect() {
  useEffect(() => {
    window.location.replace('/reports');
  }, []);
  return (
    <div className="flex items-center justify-center h-screen bg-background">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
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
  path: '/reports/$reportId/edit',
  component: ReportFormPage,
});

const newActivityRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reports/$reportId/activities/new',
  component: ActivityFormPage,
});

const editActivityRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reports/$reportId/activities/$activityId/edit',
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

const consolidatedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/consolidated-museum',
  component: ConsolidatedMuseumPage,
});

const usersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/users',
  component: UserManagementPage,
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
  consolidatedRoute,
  usersRoute,
]);

const router = createRouter({ routeTree });

// ── Root App ───────────────────────────────────────────────────────────────

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
