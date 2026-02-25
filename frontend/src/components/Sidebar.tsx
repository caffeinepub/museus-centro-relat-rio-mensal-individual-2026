import React from 'react';
import { useNavigate, useLocation } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useGetCallerUserProfile, useIsCoordinadorGeral } from '../hooks/useQueries';
import { AppUserRole } from '../backend';
import {
  LayoutDashboard,
  FileText,
  ClipboardCheck,
  Users,
  BarChart3,
  LogOut,
  Building2,
  Target,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  isApproved?: boolean;
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  roles?: AppUserRole[];
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: <LayoutDashboard className="w-4 h-4" />,
    roles: [AppUserRole.coordination, AppUserRole.coordinator, AppUserRole.administration],
  },
  {
    label: 'Relatórios',
    path: '/reports',
    icon: <FileText className="w-4 h-4" />,
  },
  {
    label: 'Aprovações',
    path: '/approvals',
    icon: <ClipboardCheck className="w-4 h-4" />,
    roles: [AppUserRole.coordination, AppUserRole.coordinator, AppUserRole.administration],
  },
  {
    label: 'Consolidado',
    path: '/consolidated',
    icon: <BarChart3 className="w-4 h-4" />,
    roles: [AppUserRole.coordination, AppUserRole.coordinator, AppUserRole.administration],
  },
  {
    label: 'Usuários',
    path: '/users',
    icon: <Users className="w-4 h-4" />,
    roles: [AppUserRole.coordination, AppUserRole.coordinator, AppUserRole.administration],
  },
  {
    label: 'Metas',
    path: '/goals',
    icon: <Target className="w-4 h-4" />,
    roles: [AppUserRole.administration],
  },
];

export default function Sidebar({ isApproved = true }: SidebarProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { clear, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: userProfile } = useGetCallerUserProfile();
  const isCoordinadorGeral = useIsCoordinadorGeral(userProfile);

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const userRole = userProfile?.appRole;

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (!isApproved) return false;
    if (!item.roles) return true;
    if (!userRole) return false;
    return item.roles.includes(userRole);
  });

  const isActive = (path: string) => {
    if (path === '/reports') return pathname.startsWith('/reports');
    return pathname === path || pathname.startsWith(path + '/');
  };

  const getRoleLabel = () => {
    if (!userRole) return '';
    if (isCoordinadorGeral) return 'Coordenador Geral';
    const labels: Record<AppUserRole, string> = {
      [AppUserRole.professional]: 'Profissional',
      [AppUserRole.coordination]: 'Coordenação',
      [AppUserRole.coordinator]: 'Coordenador',
      [AppUserRole.administration]: 'Administração',
    };
    return labels[userRole] ?? '';
  };

  return (
    <aside className="w-64 h-screen flex flex-col bg-sidebar border-r border-sidebar-border">
      {/* Logo */}
      <div className="p-5 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0">
            <img
              src="/assets/generated/museus-centro-logo.dim_256x256.png"
              alt="Museus Centro"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-sidebar-foreground leading-tight">Museus Centro</p>
            <p className="text-xs text-sidebar-foreground/60 truncate">Sistema de Relatórios</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      {userProfile && (
        <div className="px-4 py-3 border-b border-sidebar-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
              {userProfile.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-sidebar-foreground truncate">{userProfile.name}</p>
              <p className="text-xs text-sidebar-foreground/60">{getRoleLabel()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {isApproved ? (
          visibleItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate({ to: item.path })}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                isActive(item.path)
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent'
              }`}
            >
              <span className={isActive(item.path) ? 'text-primary-foreground' : 'text-sidebar-foreground/50 group-hover:text-sidebar-foreground'}>
                {item.icon}
              </span>
              <span className="flex-1 text-left">{item.label}</span>
              {isActive(item.path) && (
                <ChevronRight className="w-3.5 h-3.5 opacity-70" />
              )}
            </button>
          ))
        ) : (
          <div className="px-3 py-4 text-xs text-sidebar-foreground/50 text-center">
            Aguardando aprovação para acessar o sistema
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10 text-sm"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4" />
          Sair
        </Button>
      </div>
    </aside>
  );
}
