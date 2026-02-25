import React, { useState } from 'react';
import { Search, Filter, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useAllReports } from '../hooks/useQueries';
import { Status } from '../backend';
import type { Report } from '../backend';
import { statusLabel, getMonthLabel, getMuseumLabel, MUSEUM_LOCATIONS, MONTHS } from '../utils/labels';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import ApprovalDetailView from '../components/ApprovalDetailView';

function getStatusColor(status: Status): string {
  switch (status) {
    case Status.approved: return 'bg-success/10 text-success border-success/20';
    case Status.submitted: return 'bg-primary/10 text-primary border-primary/20';
    case Status.underReview: return 'bg-warning/10 text-warning border-warning/20';
    case Status.requiresAdjustment: return 'bg-destructive/10 text-destructive border-destructive/20';
    case Status.draft: return 'bg-muted text-muted-foreground border-border';
    default: return 'bg-muted text-muted-foreground border-border';
  }
}

export default function ApprovalsPage() {
  const { data: reports = [], isLoading } = useAllReports();
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [monthFilter, setMonthFilter] = useState<string>('all');
  const [museumFilter, setMuseumFilter] = useState<string>('all');

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      !searchTerm ||
      report.professionalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.protocolNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    const matchesMonth = monthFilter === 'all' || report.referenceMonth === monthFilter;
    const matchesMuseum = museumFilter === 'all' || report.mainMuseum === museumFilter;
    return matchesSearch && matchesStatus && matchesMonth && matchesMuseum;
  });

  if (selectedReport) {
    return (
      <ApprovalDetailView
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
      />
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Aprovações</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Revise e aprove os relatórios enviados pelos profissionais.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: 'Aguardando',
            value: reports.filter((r) => r.status === Status.submitted).length,
            icon: Clock,
            color: 'text-primary',
          },
          {
            label: 'Em Revisão',
            value: reports.filter((r) => r.status === Status.underReview).length,
            icon: AlertCircle,
            color: 'text-warning',
          },
          {
            label: 'Aprovados',
            value: reports.filter((r) => r.status === Status.approved).length,
            icon: CheckCircle,
            color: 'text-success',
          },
          {
            label: 'Total',
            value: reports.length,
            icon: Filter,
            color: 'text-foreground',
          },
        ].map((stat) => (
          <div key={stat.label} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por profissional ou protocolo..."
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

      {/* Reports Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-xl">
          <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Nenhum relatório encontrado</h3>
          <p className="text-muted-foreground">
            {reports.length === 0
              ? 'Nenhum relatório foi enviado ainda.'
              : 'Nenhum relatório corresponde aos filtros selecionados.'}
          </p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="divide-y divide-border">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                onClick={() => setSelectedReport(report)}
                className="p-4 hover:bg-muted/30 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-muted-foreground font-mono">{report.protocolNumber}</span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(report.status)}`}
                      >
                        {statusLabel(report.status)}
                      </span>
                    </div>
                    <p className="font-medium text-foreground">{report.professionalName}</p>
                    <p className="text-sm text-muted-foreground">
                      {getMonthLabel(report.referenceMonth)} / {report.year.toString()} · {getMuseumLabel(report.mainMuseum)}
                    </p>
                  </div>
                  <div className="text-muted-foreground text-sm shrink-0">
                    Clique para revisar →
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
