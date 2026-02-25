import React, { useState } from 'react';
import { useGetAllReports, useGetCallerUserProfile } from '../hooks/useQueries';
import { AppUserRole, MuseumLocation, Report, Status } from '../backend';
import { statusLabel, getMonthLabel, getMuseumLabel, MUSEUM_LOCATIONS } from '../utils/labels';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, X, ClipboardCheck } from 'lucide-react';
import ApprovalDetailView from '../components/ApprovalDetailView';

const STATUS_OPTIONS: { value: Status | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos os status' },
  { value: Status.draft, label: 'Rascunho' },
  { value: Status.submitted, label: 'Enviado' },
  { value: Status.underReview, label: 'Em revisão' },
  { value: Status.approved, label: 'Aprovado' },
  { value: Status.analysis, label: 'Em análise' },
  { value: Status.requiresAdjustment, label: 'Necessita ajustes' },
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

export default function ApprovalsPage() {
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();
  const { data: reports, isLoading: reportsLoading } = useGetAllReports();

  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterMonth, setFilterMonth] = useState<string>('all');
  const [filterMuseum, setFilterMuseum] = useState<string>('all');
  const [filterProfessional, setFilterProfessional] = useState<string>('');

  const isCoordOrAdmin =
    userProfile?.appRole === AppUserRole.coordination ||
    userProfile?.appRole === AppUserRole.administration;

  if (profileLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!isCoordOrAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <ClipboardCheck className="w-12 h-12 text-muted-foreground" />
        <p className="text-muted-foreground text-lg">Acesso restrito à Coordenação e Administração.</p>
      </div>
    );
  }

  if (selectedReport) {
    return (
      <ApprovalDetailView
        report={selectedReport}
        onBack={() => setSelectedReport(null)}
      />
    );
  }

  const filteredReports = (reports ?? []).filter((r) => {
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    if (filterMonth !== 'all' && r.referenceMonth !== filterMonth) return false;
    if (filterMuseum !== 'all' && r.mainMuseum !== filterMuseum) return false;
    if (filterProfessional && !r.professionalName.toLowerCase().includes(filterProfessional.toLowerCase())) return false;
    return true;
  });

  const clearFilters = () => {
    setFilterStatus('all');
    setFilterMonth('all');
    setFilterMuseum('all');
    setFilterProfessional('');
  };

  const hasActiveFilters =
    filterStatus !== 'all' ||
    filterMonth !== 'all' ||
    filterMuseum !== 'all' ||
    filterProfessional !== '';

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <ClipboardCheck className="w-7 h-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Aprovações</h1>
          <p className="text-sm text-muted-foreground">Revise e aprove os relatórios enviados pelos profissionais</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-3">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por profissional..."
              value={filterProfessional}
              onChange={(e) => setFilterProfessional(e.target.value)}
              className="pl-9"
            />
          </div>

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

          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters} className="gap-2">
              <X className="w-4 h-4" />
              Limpar filtros
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {filteredReports.length} relatório(s) encontrado(s)
        </p>
      </div>

      {/* Reports Table */}
      {reportsLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 gap-3 bg-card border border-border rounded-xl">
          <ClipboardCheck className="w-10 h-10 text-muted-foreground" />
          <p className="text-muted-foreground">Nenhum relatório encontrado com os filtros selecionados.</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Profissional</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Mês de Referência</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Equipe/Museu</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Data de Envio</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((report, idx) => (
                <tr
                  key={report.id}
                  className={`cursor-pointer hover:bg-muted/40 transition-colors border-b border-border last:border-0 ${idx % 2 === 0 ? '' : 'bg-muted/20'}`}
                  onClick={() => setSelectedReport(report)}
                >
                  <td className="px-4 py-3 font-medium text-foreground">{report.professionalName}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {getMonthLabel(report.referenceMonth as string)} / {String(report.year)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {getMuseumLabel(report.mainMuseum as MuseumLocation)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={getStatusBadgeVariant(report.status as Status)}>
                      {statusLabel(report.status as Status)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(report.submittedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
