import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  FileText,
  Users,
  Clock,
  Target,
  CheckCircle,
  TrendingUp,
  Accessibility,
  Handshake,
  BarChart3,
} from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number | undefined;
  icon?: string;
  subtitle?: string;
  variant?: 'default' | 'success' | 'warning' | 'destructive';
}

function getIcon(icon: string | undefined) {
  switch (icon) {
    case 'file': return <FileText className="h-5 w-5" />;
    case 'users': return <Users className="h-5 w-5" />;
    case 'clock': return <Clock className="h-5 w-5" />;
    case 'target': return <Target className="h-5 w-5" />;
    case 'check': return <CheckCircle className="h-5 w-5" />;
    case 'progress': return <TrendingUp className="h-5 w-5" />;
    case 'accessibility': return <Accessibility className="h-5 w-5" />;
    case 'handshake': return <Handshake className="h-5 w-5" />;
    default: return <BarChart3 className="h-5 w-5" />;
  }
}

function getVariantClasses(variant: string | undefined) {
  switch (variant) {
    case 'success': return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
    case 'warning': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30';
    case 'destructive': return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
    default: return 'text-primary bg-primary/10';
  }
}

export default function KPICard({ title, value, icon, subtitle, variant }: KPICardProps) {
  const displayValue = value !== undefined && value !== null ? String(value) : '0';

  return (
    <Card>
      <CardContent className="pt-4 pb-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide truncate">
              {title ?? ''}
            </p>
            <p className="text-2xl font-bold text-foreground mt-1">{displayValue}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1 truncate">{subtitle}</p>
            )}
          </div>
          <div className={`p-2 rounded-lg shrink-0 ${getVariantClasses(variant)}`}>
            {getIcon(icon)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
