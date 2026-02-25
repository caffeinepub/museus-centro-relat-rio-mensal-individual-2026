import React from 'react';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  variant?: 'default' | 'accent' | 'success' | 'warning';
  subtitle?: string;
}

const VARIANT_STYLES = {
  default: 'bg-card border-border',
  accent: 'bg-primary/5 border-primary/20',
  success: 'bg-success/5 border-success/20',
  warning: 'bg-warning/5 border-warning/20',
};

const ICON_STYLES = {
  default: 'bg-primary/10 text-primary',
  accent: 'bg-primary/15 text-primary',
  success: 'bg-success/15 text-success',
  warning: 'bg-warning/15 text-warning',
};

export default function KPICard({ title, value, icon, variant = 'default', subtitle }: KPICardProps) {
  return (
    <div className={cn('rounded-xl border p-5 transition-shadow hover:shadow-sm', VARIANT_STYLES[variant])}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
          <p className="text-2xl font-bold text-foreground mt-1 leading-none">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1.5">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', ICON_STYLES[variant])}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
