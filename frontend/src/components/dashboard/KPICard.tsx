interface KPICardProps {
  title: string;
  value: number | string;
  icon?: React.ReactNode;
  subtitle?: string;
}

export default function KPICard({ title, value, icon, subtitle }: KPICardProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
          {title}
        </span>
        {icon && (
          <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center text-primary">
            {icon}
          </div>
        )}
      </div>
      <div>
        <span className="text-2xl font-bold text-foreground">
          {typeof value === 'number' ? value.toLocaleString('pt-BR') : value}
        </span>
        {subtitle && (
          <p className="text-muted-foreground text-xs mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
