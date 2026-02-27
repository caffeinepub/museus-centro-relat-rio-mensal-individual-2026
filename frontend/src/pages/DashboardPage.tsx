import { useState } from 'react';
import { useCoordinationDashboard, useGetCallerUserProfile } from '../hooks/useQueries';
import type { DashboardFilter } from '../types';
import KPICard from '../components/dashboard/KPICard';
import ActivitiesByMuseumChart from '../components/dashboard/ActivitiesByMuseumChart';
import AudienceByProfileChart from '../components/dashboard/AudienceByProfileChart';
import MonthlyEvolutionChart from '../components/dashboard/MonthlyEvolutionChart';
import PlannedVsAchievedChart from '../components/dashboard/PlannedVsAchievedChart';
import PublicoGeralCard from '../components/dashboard/PublicoGeralCard';
import ReportsByMonthChart from '../components/dashboard/ReportsByMonthChart';
import ReportsByMuseumChart from '../components/dashboard/ReportsByMuseumChart';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Users,
  Target,
  Clock,
  Handshake,
  FileText,
} from 'lucide-react';

const MONTHS = [
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

export default function DashboardPage() {
  const { data: userProfile } = useGetCallerUserProfile();
  const [filter, setFilter] = useState<DashboardFilter>({
    museum: null,
    month: null,
    professionalName: null,
  });

  const { data: dashboard, isLoading } = useCoordinationDashboard(filter);

  const toNum = (v: bigint | number | undefined | null): number => Number(v ?? 0);

  const totalReports = dashboard
    ? toNum(dashboard.reportStatusBreakdown.draft) +
      toNum(dashboard.reportStatusBreakdown.submitted) +
      toNum(dashboard.reportStatusBreakdown.underReview) +
      toNum(dashboard.reportStatusBreakdown.approved) +
      toNum(dashboard.reportStatusBreakdown.analysis) +
      toNum(dashboard.reportStatusBreakdown.requiresAdjustment)
    : 0;

  // Convert bigint tuple arrays to number tuple arrays for charts
  const totalActivitiesPerMuseum: [string, number][] = (dashboard?.totalActivitiesPerMuseum ?? []).map(
    ([k, v]) => [k, toNum(v)]
  );
  const monthlyEvolution: [string, number][] = (dashboard?.monthlyEvolution ?? []).map(
    ([k, v]) => [k, toNum(v)]
  );
  const reportsByMonth: [string, number][] = (dashboard?.reportsByMonth ?? []).map(
    ([k, v]) => [k, toNum(v)]
  );
  const reportsByMuseum: [string, number][] = (dashboard?.reportsByMuseum ?? []).map(
    ([k, v]) => [k, toNum(v)]
  );

  const audienceByProfile = dashboard?.audienceByProfile
    ? {
        children: toNum(dashboard.audienceByProfile.children),
        youth: toNum(dashboard.audienceByProfile.youth),
        adults: toNum(dashboard.audienceByProfile.adults),
        elderly: toNum(dashboard.audienceByProfile.elderly),
        pcd: toNum(dashboard.audienceByProfile.pcd),
      }
    : { children: 0, youth: 0, adults: 0, elderly: 0, pcd: 0 };

  return (
    <div className="p-6 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Visão geral das atividades e relatórios
            {userProfile?.name ? ` — Olá, ${userProfile.name.split(' ')[0]}` : ''}
          </p>
        </div>

        {/* Filters */}
        <div className="bg-card border border-border rounded-lg p-4 mb-6 flex flex-wrap gap-3">
          <Select
            value={filter.month ?? 'all'}
            onValueChange={(val) =>
              setFilter((f) => ({ ...f, month: val === 'all' ? null : val }))
            }
          >
            <SelectTrigger className="w-44 bg-background border-input text-foreground">
              <SelectValue placeholder="Todos os Meses" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="all" className="text-foreground">Todos os Meses</SelectItem>
              {MONTHS.map((m) => (
                <SelectItem key={m.value} value={m.value} className="text-foreground">
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
              <KPICard
                title="Total Público"
                value={toNum(dashboard?.totalAudience)}
                icon={<Users className="w-5 h-5" />}
              />
              <KPICard
                title="Metas Vinculadas"
                value={toNum(dashboard?.totalLinkedGoals)}
                icon={<Target className="w-5 h-5" />}
              />
              <KPICard
                title="Metas Alcançadas"
                value={toNum(dashboard?.goalsAchieved)}
                icon={<Target className="w-5 h-5" />}
              />
              <KPICard
                title="Horas Dedicadas"
                value={toNum(dashboard?.totalDedicatedHours)}
                icon={<Clock className="w-5 h-5" />}
              />
              <KPICard
                title="Parcerias"
                value={toNum(dashboard?.partnershipsCount)}
                icon={<Handshake className="w-5 h-5" />}
              />
              <KPICard
                title="Relatórios"
                value={totalReports}
                icon={<FileText className="w-5 h-5" />}
              />
            </div>

            {/* Público Geral Card */}
            <div className="mb-6">
              <PublicoGeralCard />
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <ActivitiesByMuseumChart data={totalActivitiesPerMuseum} />
              <AudienceByProfileChart data={audienceByProfile} />
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <MonthlyEvolutionChart data={monthlyEvolution} />
              <PlannedVsAchievedChart
                planned={toNum(dashboard?.plannedActivitiesCount)}
                extra={toNum(dashboard?.extraActivitiesCount)}
              />
            </div>

            {/* Charts Row 3 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ReportsByMonthChart data={reportsByMonth} />
              <ReportsByMuseumChart data={reportsByMuseum} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
