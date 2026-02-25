import React, { useState } from 'react';
import { useCoordinationDashboard, useGetCallerUserProfile } from '../hooks/useQueries';
import { AppUserRole, MuseumLocation } from '../backend';
import { getMonthLabel, getMuseumLabel, MUSEUM_LOCATIONS } from '../utils/labels';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { BarChart2, Users, Activity, Target, X, Search, TrendingUp } from 'lucide-react';
import ReportsByMuseumChart from '../components/dashboard/ReportsByMuseumChart';
import ReportsByMonthChart from '../components/dashboard/ReportsByMonthChart';
import ActivitiesByMuseumChart from '../components/dashboard/ActivitiesByMuseumChart';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from 'recharts';

const MONTHS = [
  { value: 'all', label: 'Todos os meses' },
  { value: 'february', label: 'Fevereiro' },
  { value: 'march', label: 'Março' },
  { value: 'april', label: 'Abril' },
  { value: 'may', label: 'Maio' },
  { value: 'june', label: 'Junho' },
  { value: 'july', label: 'Julho' },
  { value: 'august', label: 'Agosto' },
  { value: 'september', label: 'Setembro' },
  { value: 'october', label: 'Outubro' },
  { value: 'november', label: 'Novembro' },
];

interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  subtitle?: string;
  colorClass?: string;
}

function KPICard({ title, value, icon, subtitle, colorClass = 'text-primary' }: KPICardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className={`text-3xl font-bold mt-1 ${colorClass}`}>{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        <div className={`p-2 rounded-lg bg-muted ${colorClass}`}>{icon}</div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();

  const [filterMonth, setFilterMonth] = useState<string>('all');
  const [filterMuseum, setFilterMuseum] = useState<MuseumLocation | 'all'>('all');
  const [filterProfessional, setFilterProfessional] = useState<string>('');

  const isCoordOrAdmin =
    userProfile?.appRole === AppUserRole.coordination ||
    userProfile?.appRole === AppUserRole.administration;

  const dashboardFilter = {
    month: filterMonth !== 'all' ? filterMonth : undefined,
    museum: filterMuseum !== 'all' ? filterMuseum : undefined,
    professionalName: filterProfessional || undefined,
  };

  const { data: dashboard, isLoading: dashboardLoading } = useCoordinationDashboard(dashboardFilter);

  const clearFilters = () => {
    setFilterMonth('all');
    setFilterMuseum('all');
    setFilterProfessional('');
  };

  const hasActiveFilters = filterMonth !== 'all' || filterMuseum !== 'all' || filterProfessional !== '';

  if (profileLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28" />)}
        </div>
      </div>
    );
  }

  if (!isCoordOrAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <BarChart2 className="w-12 h-12 text-muted-foreground" />
        <p className="text-muted-foreground text-lg">Acesso restrito à Coordenação e Administração.</p>
      </div>
    );
  }

  const statusBreakdown = dashboard?.reportStatusBreakdown;

  // Audience by profile chart data
  const audienceData = dashboard
    ? [
        { name: 'Crianças', value: Number(dashboard.audienceByProfile.children) },
        { name: 'Jovens', value: Number(dashboard.audienceByProfile.youth) },
        { name: 'Adultos', value: Number(dashboard.audienceByProfile.adults) },
        { name: 'Idosos', value: Number(dashboard.audienceByProfile.elderly) },
        { name: 'PCD', value: Number(dashboard.audienceByProfile.pcd) },
      ]
    : [];

  // Monthly evolution chart data
  const monthlyData = dashboard
    ? dashboard.monthlyEvolution
        .map(([month, count]) => ({
          month: getMonthLabel(month),
          público: Number(count),
        }))
        .sort((a, b) => a.month.localeCompare(b.month))
    : [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <BarChart2 className="w-7 h-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard da Coordenação</h1>
          <p className="text-sm text-muted-foreground">Indicadores consolidados de todos os profissionais</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-3">
        <div className="flex flex-wrap gap-3 items-center">
          <Select value={filterMonth} onValueChange={setFilterMonth}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((m) => (
                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filterMuseum}
            onValueChange={(v) => setFilterMuseum(v as MuseumLocation | 'all')}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Equipe/Museu" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as equipes</SelectItem>
              {MUSEUM_LOCATIONS.map((loc) => (
                <SelectItem key={loc} value={loc}>
                  {getMuseumLabel(loc)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por profissional..."
              value={filterProfessional}
              onChange={(e) => setFilterProfessional(e.target.value)}
              className="pl-9"
            />
          </div>

          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters} className="gap-2">
              <X className="w-4 h-4" />
              Limpar filtros
            </Button>
          )}
        </div>
      </div>

      {dashboardLoading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28" />)}
          </div>
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <>
          {/* Main KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KPICard
              title="Total de Atividades"
              value={Number(dashboard?.totalActivitiesPerMuseum?.reduce((acc, [, n]) => acc + Number(n), 0) ?? 0)}
              icon={<Activity className="w-5 h-5" />}
              subtitle="Todas as atividades registradas"
            />
            <KPICard
              title="Público Total"
              value={Number(dashboard?.totalAudience ?? 0).toLocaleString('pt-BR')}
              icon={<Users className="w-5 h-5" />}
              subtitle="Pessoas alcançadas"
              colorClass="text-blue-600"
            />
            <KPICard
              title="Metas Vinculadas"
              value={Number(dashboard?.totalLinkedGoals ?? 0)}
              icon={<Target className="w-5 h-5" />}
              subtitle={`${Number(dashboard?.goalsAchieved ?? 0)} alcançadas`}
              colorClass="text-green-600"
            />
            <KPICard
              title="Horas Dedicadas"
              value={Number(dashboard?.totalDedicatedHours ?? 0)}
              icon={<TrendingUp className="w-5 h-5" />}
              subtitle="Total de horas registradas"
              colorClass="text-amber-600"
            />
          </div>

          {/* Report Status Breakdown */}
          {statusBreakdown && (
            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="font-semibold text-foreground mb-4">Status dos Relatórios</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                  { label: 'Rascunho', value: Number(statusBreakdown.draft), color: 'text-muted-foreground' },
                  { label: 'Enviado', value: Number(statusBreakdown.submitted), color: 'text-blue-600' },
                  { label: 'Em Revisão', value: Number(statusBreakdown.underReview), color: 'text-amber-600' },
                  { label: 'Aprovado', value: Number(statusBreakdown.approved), color: 'text-green-600' },
                  { label: 'Em Análise', value: Number(statusBreakdown.analysis), color: 'text-purple-600' },
                  { label: 'Requer Ajuste', value: Number(statusBreakdown.requiresAdjustment), color: 'text-red-600' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="text-center p-3 bg-muted/30 rounded-lg">
                    <p className={`text-2xl font-bold ${color}`}>{value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="font-semibold text-foreground mb-4">Relatórios por Equipe</h2>
              <ReportsByMuseumChart data={dashboard?.reportsByMuseum ?? []} />
            </div>
            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="font-semibold text-foreground mb-4">Relatórios por Mês</h2>
              <ReportsByMonthChart data={dashboard?.reportsByMonth ?? []} />
            </div>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="font-semibold text-foreground mb-4">Atividades por Equipe</h2>
              <ActivitiesByMuseumChart data={dashboard?.totalActivitiesPerMuseum ?? []} />
            </div>
            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="font-semibold text-foreground mb-4">Público por Perfil</h2>
              {audienceData.every(d => d.value === 0) ? (
                <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
                  Nenhum dado disponível
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={audienceData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                    <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="value" name="Público" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Monthly Evolution */}
          {monthlyData.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="font-semibold text-foreground mb-4">Evolução Mensal do Público</h2>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={monthlyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                  <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="público"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Additional KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KPICard
              title="Com Acessibilidade"
              value={Number(dashboard?.activitiesWithAccessibility ?? 0)}
              icon={<Users className="w-5 h-5" />}
              subtitle="Atividades acessíveis"
              colorClass="text-purple-600"
            />
            <KPICard
              title="Com Parcerias"
              value={Number(dashboard?.partnershipsCount ?? 0)}
              icon={<Target className="w-5 h-5" />}
              subtitle="Atividades com parceiros"
              colorClass="text-indigo-600"
            />
            <KPICard
              title="Atividades Planejadas"
              value={Number(dashboard?.plannedActivitiesCount ?? 0)}
              icon={<Activity className="w-5 h-5" />}
              subtitle="Rotina + metas"
              colorClass="text-teal-600"
            />
            <KPICard
              title="Atividades Extras"
              value={Number(dashboard?.extraActivitiesCount ?? 0)}
              icon={<TrendingUp className="w-5 h-5" />}
              subtitle="Além do planejado"
              colorClass="text-orange-600"
            />
          </div>
        </>
      )}
    </div>
  );
}
