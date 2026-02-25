import React from 'react';
import { useNavigate, useLocation } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { AppUserRole } from '../backend';
import {
  FileText,
  LayoutDashboard,
  LogOut,
  User,
  Building2,
  ClipboardCheck,
  BarChart2,
  ChevronLeft,
  ChevronRight,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

function appRoleLabel(role: AppUserRole): string {
  switch (role) {
    case AppUserRole.coordination: return 'Coordenação';
    case AppUserRole.administration: return 'Administração';
    case AppUserRole.professional: return 'Profissional';
    default: return 'Profissional';
  }
}

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  isApproved?: boolean;
}

export default function Sidebar({ collapsed = false, onToggle, isApproved = true }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { clear } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();

  const isCoordOrAdmin =
    userProfile?.appRole === AppUserRole.coordination ||
    userProfile?.appRole === AppUserRole.administration;

  const isAdmin = userProfile?.appRole === AppUserRole.administration;
  const isCoordination = userProfile?.appRole === AppUserRole.coordination;

  // Coordinators and admins are always considered approved
  const canNavigate = isApproved || isCoordOrAdmin;

  const navItems = [
    {
      label: 'Relatórios',
      icon: <FileText className="w-5 h-5 shrink-0" />,
      path: '/reports',
      show: canNavigate,
    },
    {
      label: 'Aprovações',
      icon: <ClipboardCheck className="w-5 h-5 shrink-0" />,
      path: '/approvals',
      show: isCoordOrAdmin && canNavigate,
    },
    {
      label: 'Dashboard',
      icon: <BarChart2 className="w-5 h-5 shrink-0" />,
      path: '/dashboard',
      show: isCoordOrAdmin && canNavigate,
    },
    {
      label: 'Consolidado',
      icon: <LayoutDashboard className="w-5 h-5 shrink-0" />,
      path: '/consolidated-museum',
      show: isCoordOrAdmin && canNavigate,
    },
    {
      label: 'Gestão de Usuários',
      icon: <Users className="w-5 h-5 shrink-0" />,
      path: '/users',
      // Visible to both coordination and administration roles
      show: (isCoordination || isAdmin) && canNavigate,
    },
    {
      label: 'Administração',
      icon: <Building2 className="w-5 h-5 shrink-0" />,
      path: '/admin',
      show: isAdmin && canNavigate,
    },
  ];

  const handleLogout = async () => {
    await clear();
  };

  return (
    <aside
      className={`flex flex-col h-full bg-card border-r border-border transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Logo / Header */}
      <div className={`flex items-center gap-3 p-4 border-b border-border ${collapsed ? 'justify-center' : ''}`}>
        <img
          src="/assets/generated/museus-centro-logo.dim_256x256.png"
          alt="Logo"
          className="w-8 h-8 rounded-lg shrink-0"
        />
        {!collapsed && (
          <span className="font-bold text-foreground text-sm leading-tight">
            Museus Centro
          </span>
        )}
        {onToggle && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className={`ml-auto shrink-0 ${collapsed ? 'hidden' : ''}`}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Collapse toggle when collapsed */}
      {collapsed && onToggle && (
        <div className="flex justify-center p-2 border-b border-border">
          <Button variant="ghost" size="icon" onClick={onToggle}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems
          .filter((item) => item.show)
          .map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            return (
              <button
                key={item.path}
                onClick={() => navigate({ to: item.path })}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                } ${collapsed ? 'justify-center' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                {item.icon}
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
      </nav>

      {/* User Info & Logout */}
      <div className={`p-3 border-t border-border space-y-2`}>
        {!collapsed && userProfile && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50">
            <User className="w-4 h-4 text-muted-foreground shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-foreground truncate">{userProfile.name}</p>
              <p className="text-xs text-muted-foreground">{appRoleLabel(userProfile.appRole)}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors ${
            collapsed ? 'justify-center' : ''
          }`}
          title={collapsed ? 'Sair' : undefined}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Sair</span>}
        </button>
      </div>
    </aside>
  );
}
