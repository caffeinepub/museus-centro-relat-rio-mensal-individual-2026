import React, { useState } from 'react';
import { useCoordinationDashboard } from '../hooks/useQueries';
import { DashboardFilter, MuseumLocation } from '../backend';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import KPICard from '../components/dashboard/KPICard';
import MonthlyEvolutionChart from '../components/dashboard/MonthlyEvolutionChart';
import ActivitiesByMuseumChart from '../components/dashboard/ActivitiesByMuseumChart';
import AudienceByProfileChart from '../components/dashboard/AudienceByProfileChart';
import PlannedVsAchievedChart from '../components/dashboard/PlannedVsAchievedChart';
import ReportsByMonthChart from '../components/dashboard/ReportsByMonthChart';
import ReportsByMuseumChart from '../components/dashboard/ReportsByMuseumChart';
import PublicoGeralCard from '../components/dashboard/PublicoGeralCard';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, AlertCircle, BarChart3 } from 'lucide-react';
import { MUSEUM_LOCATIONS, getMuseumLabel, getMonthOptions } from '../utils/labels';

const MONTH_OPTIONS = getMonthOptions();

export default function DashboardPage() {
  const { data: userProfile } = useGetCallerUserProfile();
  const [filter, setFilter] = useState<DashboardFilter>({
    museum: undefined,
    month: undefined,
    professionalName: undefined,
  });

  const {
    data: dashboard,
    isLoading,
    isError,
    error,
    refetch,
  } = useCoordinationDashboard(filter);

  const handleMuseumChange = (value: string) => {
    setFilter((prev) => ({
      ...prev,
      museum: value === 'all' ? undefined : (value as MuseumLocation),
    }));
  };

  const handleMonthChange = (value: string) => {
    setFilter((prev) => ({
      ...prev,
      month: value === 'all' ? undefined : value,
    }));
  };

  const handleClearFilters = () => {
    setFilter({ museum: undefined, month: undefined, professionalName: undefined });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">A carregar dashboard...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4 text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <div>
            <h2 className="text-lg font-semibold text-foreground">Erro ao carregar dashboard</h2>
            <p className="text-muted-foreground text-sm mt-1">
              {error instanceof Error ? error.message : 'Ocorreu um erro inesperado'}
            </p>
          </div>
          <Button onClick={() => refetch()} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-center">
          <BarChart3 className="h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">Sem dados disponíveis</p>
        </div>
      </div>
    );
  }

  const totalAudience = Number(dashboard.totalAudience ?? 0);
  const totalHours = Number(dashboard.totalDedicatedHours ?? 0);
  const totalLinkedGoals = Number(dashboard.totalLinkedGoals ?? 0);
  const goalsAchieved = Number(dashboard.goalsAchieved ?? 0);
  const goalsInProgress = Number(dashboard.goalsInProgress ?? 0);
  const plannedCount = Number(dashboard.plannedActivitiesCount ?? 0);
  const extraCount = Number(dashboard.extraActivitiesCount ?? 0);
  const accessibilityCount = Number(dashboard.activitiesWithAccessibility ?? 0);
  const partnershipsCount = Number(dashboard.partnershipsCount ?? 0);

  const statusBreakdown = dashboard.reportStatusBreakdown ?? {
    draft: 0n,
    submitted: 0n,
    underReview: 0n,
    approved: 0n,
    analysis: 0n,
    requiresAdjustment: 0n,
  };

  const totalReports =
    Number(statusBreakdown.draft ?? 0) +
    Number(statusBreakdown.submitted ?? 0) +
    Number(statusBreakdown.underReview ?? 0) +
    Number(statusBreakdown.approved ?? 0) +
    Number(statusBreakdown.analysis ?? 0) +
    Number(statusBreakdown.requiresAdjustment ?? 0);

  const audienceByProfile = dashboard.audienceByProfile ?? {
    children: 0n,
    youth: 0n,
    adults: 0n,
    elderly: 0n,
    pcd: 0n,
  };

  const monthlyEvolution = Array.isArray(dashboard.monthlyEvolution)
    ? dashboard.monthlyEvolution
    : [];
  const totalActivitiesPerMuseum = Array.isArray(dashboard.totalActivitiesPerMuseum)
    ? dashboard.totalActivitiesPerMuseum
    : [];
  const reportsByMuseum = Array.isArray(dashboard.reportsByMuseum)
    ? dashboard.reportsByMuseum
    : [];
  const reportsByMonth = Array.isArray(dashboard.reportsByMonth)
    ? dashboard.reportsByMonth
    : [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Visão geral das atividades e relatórios
            {userProfile?.name ? ` — Olá, ${userProfile.name.split(' ')[0]}` : ''}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Atualizar
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-wrap gap-3 items-center">
            <span className="text-sm font-medium text-muted-foreground">Filtros:</span>
            <Select
              value={filter.museum ?? 'all'}
              onValueChange={handleMuseumChange}
            >
              <SelectTrigger className="w-48 bg-background border-border">
                <SelectValue placeholder="Todos os museus" />
              </SelectTrigger>
              <SelectContent className="bg-background border-border">
                <SelectItem value="all">Todos os museus</SelectItem>
                {MUSEUM_LOCATIONS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {getMuseumLabel(m)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filter.month ?? 'all'}
              onValueChange={handleMonthChange}
            >
              <SelectTrigger className="w-40 bg-background border-border">
                <SelectValue placeholder="Todos os meses" />
              </SelectTrigger>
              <SelectContent className="bg-background border-border">
                <SelectItem value="all">Todos os meses</SelectItem>
                {MONTH_OPTIONS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(filter.museum || filter.month) && (
              <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                Limpar filtros
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard
          title="Total de Relatórios"
          value={totalReports}
          icon="file"
          variant="default"
        />
        <KPICard
          title="Total de Público"
          value={totalAudience.toLocaleString('pt-PT')}
          icon="users"
          variant="success"
        />
        <KPICard
          title="Horas Dedicadas"
          value={totalHours}
          icon="clock"
          variant="default"
        />
        <KPICard
          title="Parcerias"
          value={partnershipsCount}
          icon="handshake"
          variant="warning"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard
          title="Metas Vinculadas"
          value={totalLinkedGoals}
          icon="target"
          variant="default"
        />
        <KPICard
          title="Metas Alcançadas"
          value={goalsAchieved}
          icon="check"
          variant="success"
        />
        <KPICard
          title="Metas em Progresso"
          value={goalsInProgress}
          icon="progress"
          variant="warning"
        />
        <KPICard
          title="Com Acessibilidade"
          value={accessibilityCount}
          icon="accessibility"
          variant="default"
        />
      </div>

      {/* Público Geral Card */}
      <PublicoGeralCard />

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MonthlyEvolutionChart data={monthlyEvolution} />
        <AudienceByProfileChart data={audienceByProfile} />
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivitiesByMuseumChart data={totalActivitiesPerMuseum} />
        <PlannedVsAchievedChart
          planned={plannedCount}
          extra={extraCount}
        />
      </div>

      {/* Charts Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReportsByMonthChart data={reportsByMonth} />
        <ReportsByMuseumChart data={reportsByMuseum} />
      </div>

      {/* Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Estado dos Relatórios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: 'Rascunho', value: Number(statusBreakdown.draft ?? 0), color: 'bg-muted' },
              { label: 'Submetido', value: Number(statusBreakdown.submitted ?? 0), color: 'bg-blue-100 dark:bg-blue-900/30' },
              { label: 'Em Revisão', value: Number(statusBreakdown.underReview ?? 0), color: 'bg-yellow-100 dark:bg-yellow-900/30' },
              { label: 'Aprovado', value: Number(statusBreakdown.approved ?? 0), color: 'bg-green-100 dark:bg-green-900/30' },
              { label: 'Em Análise', value: Number(statusBreakdown.analysis ?? 0), color: 'bg-purple-100 dark:bg-purple-900/30' },
              { label: 'Ajuste', value: Number(statusBreakdown.requiresAdjustment ?? 0), color: 'bg-red-100 dark:bg-red-900/30' },
            ].map((item) => (
              <div key={item.label} className={`rounded-lg p-3 text-center ${item.color}`}>
                <p className="text-2xl font-bold text-foreground">{item.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
