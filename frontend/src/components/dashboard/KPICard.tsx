import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPICardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  variant?: 'default' | 'accent' | 'success' | 'warning';
}

const variantStyles = {
  default: 'bg-card border-border',
  accent: 'bg-accent/10 border-accent/20',
  success: 'bg-green-50 border-green-200',
  warning: 'bg-amber-50 border-amber-200',
};

const iconStyles = {
  default: 'bg-primary/10 text-primary',
  accent: 'bg-accent/20 text-accent',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-amber-100 text-amber-700',
};

export default function KPICard({ label, value, icon: Icon, description, variant = 'default' }: KPICardProps) {
  return (
    <div className={cn('rounded-lg border p-5 shadow-xs', variantStyles[variant])}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
          <p className="text-2xl font-bold text-foreground font-display">{value}</p>
          {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
        </div>
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ml-3', iconStyles[variant])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
