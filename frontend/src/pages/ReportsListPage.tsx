import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Plus, FileText, Search, Calendar, Building2 } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useReportsForUser, useAllReports } from '../hooks/useQueries';
import { AppUserRole, Status } from '../backend';
import type { Report } from '../backend';
import { statusLabel, getMonthLabel, getMuseumLabel, MUSEUM_LOCATIONS, MONTHS } from '../utils/labels';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

function getStatusColor(status: Status): string {
  switch (status) {
    case Status.approved: return 'bg-success/10 text-success border-success/20';
    case Status.submitted: return 'bg-primary/10 text-primary border-primary/20';
    case Status.underReview: return 'bg-warning/10 text-warning border-warning/20';
    case Status.requiresAdjustment: return 'bg-destructive/10 text-destructive border-destructive/20';
    case Status.draft: return 'bg-muted text-muted-foreground border-border';
    case Status.analysis: return 'bg-secondary/10 text-secondary-foreground border-secondary/20';
    default: return 'bg-muted text-muted-foreground border-border';
  }
}

export default function ReportsListPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();

  const isCoordOrAdmin =
    userProfile?.appRole === AppUserRole.coordination ||
    userProfile?.appRole === AppUserRole.administration;

  const { data: userReports, isLoading: userReportsLoading } = useReportsForUser(
    !isCoordOrAdmin ? identity?.getPrincipal() : undefined
  );
  const { data: allReports, isLoading: allReportsLoading } = useAllReports();

  const reports = isCoordOrAdmin ? (allReports ?? []) : (userReports ?? []);
  const isLoading = isCoordOrAdmin ? allReportsLoading : userReportsLoading;

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [monthFilter, setMonthFilter] = useState<string>('all');
  const [museumFilter, setMuseumFilter] = useState<string>('all');

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      !searchTerm ||
      report.professionalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.protocolNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.executiveSummary.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    const matchesMonth = monthFilter === 'all' || report.referenceMonth === monthFilter;
    const matchesMuseum = museumFilter === 'all' || report.mainMuseum === museumFilter;

    return matchesSearch && matchesStatus && matchesMonth && matchesMuseum;
  });

  const stats = {
    total: reports.length,
    draft: reports.filter((r) => r.status === Status.draft).length,
    submitted: reports.filter((r) => r.status === Status.submitted).length,
    approved: reports.filter((r) => r.status === Status.approved).length,
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Relatórios</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isCoordOrAdmin ? 'Todos os relatórios do sistema' : 'Seus relatórios mensais'}
          </p>
        </div>
        <Button onClick={() => navigate({ to: '/reports/new' })} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Novo Relatório
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total', value: stats.total, color: 'text-foreground' },
          { label: 'Rascunhos', value: stats.draft, color: 'text-muted-foreground' },
          { label: 'Enviados', value: stats.submitted, color: 'text-primary' },
          { label: 'Aprovados', value: stats.approved, color: 'text-success' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, protocolo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            {Object.values(Status).map((s) => (
              <SelectItem key={s} value={s}>{statusLabel(s)}</SelectItem>
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
              <SelectItem key={m} value={m}>{getMonthLabel(m)}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={museumFilter} onValueChange={setMuseumFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Equipe/Museu" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as equipes</SelectItem>
            {MUSEUM_LOCATIONS.map((m) => (
              <SelectItem key={m} value={m}>{getMuseumLabel(m)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Reports List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-xl">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Nenhum relatório encontrado</h3>
          <p className="text-muted-foreground mb-4">
            {reports.length === 0
              ? 'Crie seu primeiro relatório clicando no botão acima.'
              : 'Nenhum relatório corresponde aos filtros selecionados.'}
          </p>
          {reports.length === 0 && (
            <Button onClick={() => navigate({ to: '/reports/new' })}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Relatório
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              onClick={() => navigate({ to: '/reports/$reportId', params: { reportId: report.id } })}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ReportCard({ report, onClick }: { report: Report; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="bg-card border border-border rounded-xl p-4 hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-muted-foreground font-mono">{report.protocolNumber}</span>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(report.status)}`}
            >
              {statusLabel(report.status)}
            </span>
          </div>
          <h3 className="font-semibold text-foreground truncate">{report.professionalName}</h3>
          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {getMonthLabel(report.referenceMonth)} / {report.year.toString()}
            </span>
            <span className="flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" />
              {getMuseumLabel(report.mainMuseum)}
            </span>
          </div>
          {report.executiveSummary && (
            <p className="text-sm text-muted-foreground mt-2 line-clamp-1">{report.executiveSummary}</p>
          )}
        </div>
        <div className="shrink-0">
          <FileText className="w-5 h-5 text-muted-foreground" />
        </div>
      </div>
    </div>
  );
}
