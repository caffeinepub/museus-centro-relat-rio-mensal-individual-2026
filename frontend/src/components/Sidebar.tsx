import { useNavigate, useLocation } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import {
  LayoutDashboard,
  FileText,
  Users,
  CheckSquare,
  Building2,
  LogOut,
  FolderOpen,
  Heart,
} from 'lucide-react';
import { AppUserRole } from '../backend';
import { getRoleLabel } from '../utils/labels';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  roles?: AppUserRole[];
}

const navItems: NavItem[] = [
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
    icon: <CheckSquare className="w-4 h-4" />,
    roles: [AppUserRole.coordination, AppUserRole.coordinator, AppUserRole.administration],
  },
  {
    label: 'Consolidado',
    path: '/consolidated',
    icon: <Building2 className="w-4 h-4" />,
    roles: [AppUserRole.coordination, AppUserRole.coordinator, AppUserRole.administration],
  },
  {
    label: 'Arquivos',
    path: '/files',
    icon: <FolderOpen className="w-4 h-4" />,
  },
  {
    label: 'Usuários',
    path: '/users',
    icon: <Users className="w-4 h-4" />,
    roles: [AppUserRole.coordination, AppUserRole.coordinator, AppUserRole.administration],
  },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { clear, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: userProfile } = useGetCallerUserProfile();

  const userRole = userProfile?.appRole;

  const visibleNavItems = navItems.filter((item) => {
    if (!item.roles) return true;
    if (!userRole) return false;
    return item.roles.includes(userRole);
  });

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    navigate({ to: '/' });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <aside className="w-64 min-h-screen bg-sidebar flex flex-col border-r border-sidebar-border">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border bg-sidebar">
        <div className="flex items-center gap-3">
          <img
            src="/assets/generated/museus-centro-logo.dim_256x256.png"
            alt="Museus Centro"
            className="w-8 h-8 object-contain rounded"
          />
          <div>
            <h1 className="text-sidebar-foreground font-bold text-sm leading-tight">
              Museus Centro
            </h1>
            <p className="text-sidebar-foreground/70 text-xs">Sistema de Relatórios</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 bg-sidebar">
        {visibleNavItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <button
              key={item.path}
              onClick={() => navigate({ to: item.path })}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-3 border-t border-sidebar-border bg-sidebar">
        {userProfile && (
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-sidebar-primary flex items-center justify-center shrink-0">
              <span className="text-sidebar-primary-foreground text-xs font-bold">
                {getInitials(userProfile.name)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sidebar-foreground text-xs font-medium truncate">
                {userProfile.name}
              </p>
              <p className="text-sidebar-foreground/60 text-xs truncate">
                {getRoleLabel(userProfile.appRole)}
              </p>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </button>

        {/* Attribution */}
        <div className="mt-3 pt-3 border-t border-sidebar-border text-center">
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sidebar-foreground/40 text-xs hover:text-sidebar-foreground/70 transition-colors flex items-center justify-center gap-1"
          >
            Built with <Heart className="w-3 h-3 fill-current text-red-400" /> caffeine.ai
          </a>
        </div>
      </div>
    </aside>
  );
}
