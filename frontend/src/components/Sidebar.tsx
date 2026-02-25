import React from 'react';
import { useNavigate, useLocation } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { AppUserRole } from '../backend';
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  Users,
  BarChart3,
  FolderOpen,
  LogOut,
  ChevronRight,
  Building2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

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
    icon: <LayoutDashboard className="h-4 w-4" />,
    roles: [AppUserRole.coordination, AppUserRole.coordinator, AppUserRole.administration],
  },
  {
    label: 'Relatórios',
    path: '/reports',
    icon: <FileText className="h-4 w-4" />,
  },
  {
    label: 'Arquivos',
    path: '/files',
    icon: <FolderOpen className="h-4 w-4" />,
    roles: [AppUserRole.coordination, AppUserRole.coordinator, AppUserRole.administration],
  },
  {
    label: 'Aprovações',
    path: '/approvals',
    icon: <CheckSquare className="h-4 w-4" />,
    roles: [AppUserRole.coordination, AppUserRole.coordinator, AppUserRole.administration],
  },
  {
    label: 'Consolidado',
    path: '/consolidated',
    icon: <BarChart3 className="h-4 w-4" />,
    roles: [AppUserRole.coordination, AppUserRole.coordinator, AppUserRole.administration],
  },
  {
    label: 'Utilizadores',
    path: '/users',
    icon: <Users className="h-4 w-4" />,
    roles: [AppUserRole.coordination, AppUserRole.administration],
  },
];

function getRoleLabel(role: AppUserRole): string {
  switch (role) {
    case AppUserRole.coordination: return 'Coordenação Geral';
    case AppUserRole.coordinator: return 'Coordenador';
    case AppUserRole.administration: return 'Administração';
    case AppUserRole.professional: return 'Profissional';
    default: return 'Utilizador';
  }
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0] ?? '')
    .join('')
    .toUpperCase();
}

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { identity, clear } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const queryClient = useQueryClient();

  const userRole = userProfile?.appRole ?? null;

  const visibleNavItems = NAV_ITEMS.filter((item) => {
    if (!item.roles) return true;
    if (!userRole) return false;
    return item.roles.includes(userRole);
  });

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const isActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === '/dashboard' || location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="w-64 min-h-screen bg-card border-r border-border flex flex-col">
      {/* Logo / Brand */}
      <div className="p-4 flex items-center gap-3 border-b border-border">
        <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <Building2 className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className="min-w-0">
          <p className="font-bold text-sm text-foreground leading-tight">Museus Centro</p>
          <p className="text-xs text-muted-foreground truncate">Gestão de Relatórios</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {visibleNavItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate({ to: item.path })}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors text-left',
              isActive(item.path)
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            {item.icon}
            <span className="flex-1">{item.label}</span>
            {isActive(item.path) && <ChevronRight className="h-3 w-3 opacity-70" />}
          </button>
        ))}
      </nav>

      <Separator />

      {/* User Profile */}
      <div className="p-3">
        {userProfile ? (
          <div className="flex items-center gap-3 px-2 py-2 rounded-md">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                {getInitials(userProfile.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground truncate">{userProfile.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {getRoleLabel(userProfile.appRole)}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 px-2 py-2">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className="text-xs">?</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground truncate">
                {identity?.getPrincipal().toString().slice(0, 12)}...
              </p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="w-full mt-1 gap-2 text-muted-foreground hover:text-foreground justify-start"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          © {new Date().getFullYear()} Built with ❤️ using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || 'museus-centro')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </aside>
  );
}
