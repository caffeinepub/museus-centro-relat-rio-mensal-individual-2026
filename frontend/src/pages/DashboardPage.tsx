import React, { useState } from 'react';
import { useGetCallerUserProfile, useCoordinationDashboard, useAllReports, useAllActivities, useIsCoordinadorGeral } from '../hooks/useQueries';
import { MuseumLocation, type DashboardFilter } from '../backend';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Download, BarChart3, Users, Clock, Target } from 'lucide-react';
import { MUSEUM_LOCATIONS, getMuseumLabel, MONTHS, getMonthLabel } from '../utils/labels';
import { generateConsolidatedExcel } from '../utils/excelGenerator';
import KPICard from '../components/dashboard/KPICard';
import ReportsByMuseumChart from '../components/dashboard/ReportsByMuseumChart';
import ReportsByMonthChart from '../components/dashboard/ReportsByMonthChart';
import PublicoGeralCard from '../components/dashboard/PublicoGeralCard';

export default function DashboardPage() {
  const { data: userProfile } = useGetCallerUserProfile();
  const isCoordinadorGeral = useIsCoordinadorGeral(userProfile);

  const [museumFilter, setMuseumFilter] = useState<MuseumLocation | 'all'>('all');
  const [monthFilter, setMonthFilter] = useState<string>('all');
  const [isExporting, setIsExporting] = useState(false);

  const filter: DashboardFilter = {
    museum: museumFilter !== 'all' ? museumFilter : undefined,
    month: monthFilter !== 'all' ? monthFilter : undefined,
  };

  const { data: dashboard, isLoading } = useCoordinationDashboard(filter);
  const { data: allReports } = useAllReports();
  const { data: allActivities } = useAllActivities();

  const handleExportXLSX = async () => {
    if (!allReports || !allActivities) return;
    setIsExporting(true);
    try {
      generateConsolidatedExcel(allReports, allActivities);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Visão geral das atividades e relatórios
            {isCoordinadorGeral && ' — Coordenador Geral'}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportXLSX}
          disabled={isExporting || !allReports?.length}
        >
          {isExporting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Download className="w-4 h-4 mr-2" />
          )}
          Exportar XLSX
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select
          value={museumFilter}
          onValueChange={(v) => setMuseumFilter(v as MuseumLocation | 'all')}
        >
          <SelectTrigger className="w-48">
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

        <Select value={monthFilter} onValueChange={setMonthFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Mês" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os meses</SelectItem>
            {MONTHS.map((m) => (
              <SelectItem key={m} value={m}>
                {getMonthLabel(m)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Público Geral Card — always visible, independent of dashboard filter */}
      <PublicoGeralCard />

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : dashboard ? (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              title="Total de Público"
              value={Number(dashboard.totalAudience).toLocaleString('pt-BR')}
              icon={<Users className="w-5 h-5" />}
              variant="default"
            />
            <KPICard
              title="Horas Dedicadas"
              value={Number(dashboard.totalDedicatedHours).toLocaleString('pt-BR')}
              icon={<Clock className="w-5 h-5" />}
              variant="accent"
            />
            <KPICard
              title="Metas Alcançadas"
              value={`${Number(dashboard.goalsAchieved)} / ${Number(dashboard.totalLinkedGoals)}`}
              icon={<Target className="w-5 h-5" />}
              variant="success"
            />
            <KPICard
              title="Parcerias"
              value={Number(dashboard.partnershipsCount).toLocaleString('pt-BR')}
              icon={<BarChart3 className="w-5 h-5" />}
              variant="warning"
            />
          </div>

          {/* Secondary KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card-section text-center">
              <p className="text-2xl font-bold text-foreground">{Number(dashboard.plannedActivitiesCount)}</p>
              <p className="text-xs text-muted-foreground mt-1">Atividades Planejadas</p>
            </div>
            <div className="card-section text-center">
              <p className="text-2xl font-bold text-foreground">{Number(dashboard.extraActivitiesCount)}</p>
              <p className="text-xs text-muted-foreground mt-1">Atividades Extras</p>
            </div>
            <div className="card-section text-center">
              <p className="text-2xl font-bold text-foreground">{Number(dashboard.activitiesWithAccessibility)}</p>
              <p className="text-xs text-muted-foreground mt-1">Com Acessibilidade</p>
            </div>
            <div className="card-section text-center">
              <p className="text-2xl font-bold text-foreground">{Number(dashboard.goalsInProgress)}</p>
              <p className="text-xs text-muted-foreground mt-1">Metas em Andamento</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card-section">
              <h3 className="text-sm font-semibold text-foreground mb-4">Relatórios por Equipe</h3>
              <ReportsByMuseumChart data={dashboard.reportsByMuseum} />
            </div>
            <div className="card-section">
              <h3 className="text-sm font-semibold text-foreground mb-4">Relatórios por Mês</h3>
              <ReportsByMonthChart data={dashboard.reportsByMonth} />
            </div>
          </div>

          {/* Status Breakdown */}
          <div className="card-section">
            <h3 className="text-sm font-semibold text-foreground mb-4">Status dos Relatórios</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { key: 'draft', label: 'Rascunho', value: Number(dashboard.reportStatusBreakdown.draft) },
                { key: 'submitted', label: 'Submetido', value: Number(dashboard.reportStatusBreakdown.submitted) },
                { key: 'underReview', label: 'Em Revisão', value: Number(dashboard.reportStatusBreakdown.underReview) },
                { key: 'approved', label: 'Aprovado', value: Number(dashboard.reportStatusBreakdown.approved) },
                { key: 'analysis', label: 'Em Análise', value: Number(dashboard.reportStatusBreakdown.analysis) },
                { key: 'requiresAdjustment', label: 'Requer Ajuste', value: Number(dashboard.reportStatusBreakdown.requiresAdjustment) },
              ].map((item) => (
                <div key={item.key} className="text-center p-3 rounded-lg bg-muted/50 border border-border">
                  <p className="text-xl font-bold text-foreground">{item.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Audience Breakdown */}
          <div className="card-section">
            <h3 className="text-sm font-semibold text-foreground mb-4">Público por Perfil</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { label: 'Crianças', value: Number(dashboard.audienceByProfile.children) },
                { label: 'Jovens', value: Number(dashboard.audienceByProfile.youth) },
                { label: 'Adultos', value: Number(dashboard.audienceByProfile.adults) },
                { label: 'Idosos', value: Number(dashboard.audienceByProfile.elderly) },
                { label: 'PCD', value: Number(dashboard.audienceByProfile.pcd) },
              ].map((item) => (
                <div key={item.label} className="text-center p-3 rounded-lg bg-muted/50 border border-border">
                  <p className="text-xl font-bold text-foreground">{item.value.toLocaleString('pt-BR')}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Nenhum dado disponível</p>
        </div>
      )}
    </div>
  );
}
