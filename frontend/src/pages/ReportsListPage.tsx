import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetReportsForUser, useGetAllReports, useGetCallerUserProfile } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { MuseumLocation, Report, Status, AppUserRole } from '../backend';
import { statusLabel, getMonthLabel, getMuseumLabel, MUSEUM_LOCATIONS } from '../utils/labels';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, FileText, Search, X, Filter } from 'lucide-react';

const STATUS_OPTIONS: { value: Status | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos os status' },
  { value: Status.draft, label: 'Rascunho' },
  { value: Status.submitted, label: 'Enviado' },
  { value: Status.underReview, label: 'Em revisão' },
  { value: Status.approved, label: 'Aprovado' },
  { value: Status.analysis, label: 'Em análise' },
  { value: Status.requiresAdjustment, label: 'Necessita ajustes' },
];

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

function getStatusBadgeVariant(status: Status): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case Status.approved: return 'default';
    case Status.submitted: return 'secondary';
    case Status.underReview: return 'outline';
    case Status.requiresAdjustment: return 'destructive';
    case Status.analysis: return 'outline';
    default: return 'secondary';
  }
}

function formatDate(time: bigint | undefined): string {
  if (!time) return '—';
  const ms = Number(time) / 1_000_000;
  return new Date(ms).toLocaleDateString('pt-BR');
}

export default function ReportsListPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();

  const isCoordOrAdmin =
    userProfile?.appRole === AppUserRole.coordination ||
    userProfile?.appRole === AppUserRole.administration;

  const isAdmin = userProfile?.appRole === AppUserRole.administration;
  const isCoordination = userProfile?.appRole === AppUserRole.coordination;
  const isProfessional = userProfile?.appRole === AppUserRole.professional;

  // Users who can create reports: professionals and coordination
  const canCreateReport = isProfessional || isCoordination;

  const userId = identity?.getPrincipal().toString();
  const { data: myReports, isLoading: myReportsLoading } = useGetReportsForUser(
    isCoordOrAdmin ? undefined : userId
  );
  const { data: allReports, isLoading: allReportsLoading } = useGetAllReports();

  const reports = isCoordOrAdmin ? (allReports ?? []) : (myReports ?? []);
  const isLoading = isCoordOrAdmin ? allReportsLoading : myReportsLoading;

  // Filters
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterMonth, setFilterMonth] = useState<string>('all');
  const [filterMuseum, setFilterMuseum] = useState<string>('all');
  const [filterProfessional, setFilterProfessional] = useState<string>('');
  const [filterDateFrom, setFilterDateFrom] = useState<string>('');
  const [filterDateTo, setFilterDateTo] = useState<string>('');

  const filteredReports = reports.filter((r) => {
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    if (filterMonth !== 'all' && r.referenceMonth !== filterMonth) return false;
    if (filterMuseum !== 'all' && r.mainMuseum !== filterMuseum) return false;
    if (isCoordOrAdmin && filterProfessional && !r.professionalName.toLowerCase().includes(filterProfessional.toLowerCase())) return false;
    if (filterDateFrom && r.submittedAt) {
      const submittedMs = Number(r.submittedAt) / 1_000_000;
      const fromMs = new Date(filterDateFrom).getTime();
      if (submittedMs < fromMs) return false;
    }
    if (filterDateTo && r.submittedAt) {
      const submittedMs = Number(r.submittedAt) / 1_000_000;
      const toMs = new Date(filterDateTo).getTime() + 86400000;
      if (submittedMs > toMs) return false;
    }
    return true;
  });

  const clearFilters = () => {
    setFilterStatus('all');
    setFilterMonth('all');
    setFilterMuseum('all');
    setFilterProfessional('');
    setFilterDateFrom('');
    setFilterDateTo('');
  };

  const hasActiveFilters =
    filterStatus !== 'all' ||
    filterMonth !== 'all' ||
    filterMuseum !== 'all' ||
    filterProfessional !== '' ||
    filterDateFrom !== '' ||
    filterDateTo !== '';

  const stats = {
    total: reports.length,
    submitted: reports.filter((r) => r.status === Status.submitted).length,
    approved: reports.filter((r) => r.status === Status.approved).length,
    draft: reports.filter((r) => r.status === Status.draft).length,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-7 h-7 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Relatórios</h1>
            <p className="text-sm text-muted-foreground">
              {isAdmin
                ? 'Todos os relatórios dos profissionais'
                : isCoordination
                ? 'Relatórios — crie os seus ou visualize todos'
                : 'Seus relatórios mensais'}
            </p>
          </div>
        </div>
        {canCreateReport && (
          <Button onClick={() => navigate({ to: '/reports/new' })} className="gap-2">
            <Plus className="w-4 h-4" />
            Novo Relatório
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'text-foreground' },
          { label: 'Enviados', value: stats.submitted, color: 'text-blue-600' },
          { label: 'Aprovados', value: stats.approved, color: 'text-green-600' },
          { label: 'Rascunhos', value: stats.draft, color: 'text-muted-foreground' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Filtros</span>
        </div>
        <div className="flex flex-wrap gap-3">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

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

          <Select value={filterMuseum} onValueChange={setFilterMuseum}>
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

          {isCoordOrAdmin && (
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por profissional..."
                value={filterProfessional}
                onChange={(e) => setFilterProfessional(e.target.value)}
                className="pl-9"
              />
            </div>
          )}

          <Input
            type="date"
            value={filterDateFrom}
            onChange={(e) => setFilterDateFrom(e.target.value)}
            className="w-[160px]"
            placeholder="De"
          />
          <Input
            type="date"
            value={filterDateTo}
            onChange={(e) => setFilterDateTo(e.target.value)}
            className="w-[160px]"
            placeholder="Até"
          />

          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters} className="gap-2">
              <X className="w-4 h-4" />
              Limpar
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {filteredReports.length} relatório(s) encontrado(s)
        </p>
      </div>

      {/* Reports List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20 w-full" />)}
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 gap-3 bg-card border border-border rounded-xl">
          <FileText className="w-10 h-10 text-muted-foreground" />
          <p className="text-muted-foreground">
            {hasActiveFilters
              ? 'Nenhum relatório encontrado com os filtros selecionados.'
              : 'Nenhum relatório encontrado. Crie seu primeiro relatório!'}
          </p>
          {!hasActiveFilters && canCreateReport && (
            <Button onClick={() => navigate({ to: '/reports/new' })} className="gap-2">
              <Plus className="w-4 h-4" />
              Novo Relatório
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              isCoordOrAdmin={isCoordOrAdmin}
              onClick={() => navigate({ to: `/reports/${report.id}/edit` })}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface ReportCardProps {
  report: Report;
  isCoordOrAdmin: boolean;
  onClick: () => void;
}

function ReportCard({ report, isCoordOrAdmin, onClick }: ReportCardProps) {
  return (
    <div
      className="bg-card border border-border rounded-xl p-4 cursor-pointer hover:bg-muted/30 transition-colors"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-foreground truncate">{report.professionalName}</h3>
            {isCoordOrAdmin && (
              <span className="text-xs text-muted-foreground">— {report.role}</span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1 flex-wrap text-sm text-muted-foreground">
            <span>{getMonthLabel(report.referenceMonth as string)} / {String(report.year)}</span>
            <span>•</span>
            <span>{getMuseumLabel(report.mainMuseum as MuseumLocation)}</span>
            {report.submittedAt && (
              <>
                <span>•</span>
                <span>Enviado em {new Date(Number(report.submittedAt) / 1_000_000).toLocaleDateString('pt-BR')}</span>
              </>
            )}
          </div>
        </div>
        <Badge variant={getStatusBadgeVariant(report.status as Status)}>
          {statusLabel(report.status as Status)}
        </Badge>
      </div>
    </div>
  );
}
