import React, { useState } from 'react';
import { useAllReports, useGetCallerUserProfile, useIsCoordinadorGeral } from '../hooks/useQueries';
import { Report, Status, AppUserRole } from '../backend';
import ApprovalDetailView from '../components/ApprovalDetailView';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Search, FileText, Calendar, User, Building2, ChevronRight } from 'lucide-react';
import { statusLabel, getMuseumLabel, getMonthLabel, MONTHS } from '../utils/labels';
import { Month } from '../backend';

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'Todos os Status' },
  { value: Status.submitted, label: statusLabel(Status.submitted) },
  { value: Status.underReview, label: statusLabel(Status.underReview) },
  { value: Status.analysis, label: statusLabel(Status.analysis) },
  { value: Status.approved, label: statusLabel(Status.approved) },
  { value: Status.requiresAdjustment, label: statusLabel(Status.requiresAdjustment) },
  { value: Status.draft, label: statusLabel(Status.draft) },
];

function getStatusBadgeVariant(status: Status): 'default' | 'secondary' | 'outline' | 'destructive' {
  switch (status) {
    case Status.approved: return 'default';
    case Status.submitted: return 'secondary';
    case Status.underReview: return 'outline';
    case Status.requiresAdjustment: return 'destructive';
    default: return 'outline';
  }
}

export default function ApprovalsPage() {
  const { data: reports, isLoading } = useAllReports();
  const { data: userProfile } = useGetCallerUserProfile();
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [monthFilter, setMonthFilter] = useState<string>('all');

  const userRole = userProfile?.appRole;

  const filteredReports = (reports ?? []).filter((r) => {
    const matchesSearch =
      !searchTerm ||
      r.professionalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.protocolNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchesMonth = monthFilter === 'all' || r.referenceMonth === monthFilter;
    return matchesSearch && matchesStatus && matchesMonth;
  });

  // Sort: submitted/underReview first, then others
  const sortedReports = [...filteredReports].sort((a, b) => {
    const priority = (s: Status) => {
      if (s === Status.submitted) return 0;
      if (s === Status.underReview) return 1;
      if (s === Status.analysis) return 2;
      if (s === Status.requiresAdjustment) return 3;
      if (s === Status.approved) return 4;
      return 5;
    };
    return priority(a.status) - priority(b.status);
  });

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-border">
        <h1 className="text-2xl font-bold text-foreground">Aprovações</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Gerencie e aprove os relatórios submetidos pelos profissionais
        </p>
      </div>

      <div className="p-4 border-b border-border space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por profissional ou protocolo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={monthFilter} onValueChange={setMonthFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Meses</SelectItem>
              {MONTHS.map((m) => (
                <SelectItem key={m} value={m}>
                  {getMonthLabel(m)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Report List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))
        ) : sortedReports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="h-12 w-12 text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground font-medium">Nenhum relatório encontrado</p>
            <p className="text-muted-foreground/60 text-sm mt-1">
              Ajuste os filtros para ver mais resultados
            </p>
          </div>
        ) : (
          sortedReports.map((report) => (
            <Card
              key={report.id}
              className="cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => setSelectedReport(report)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-medium text-sm text-foreground truncate">
                        {report.professionalName}
                      </span>
                      <Badge variant={getStatusBadgeVariant(report.status)} className="text-xs">
                        {statusLabel(report.status)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {getMonthLabel(report.referenceMonth)} / {report.year.toString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {getMuseumLabel(report.mainMuseum)}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {report.role}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground/60 mt-1">{report.protocolNumber}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Detail Sheet */}
      <Sheet open={!!selectedReport} onOpenChange={(open) => { if (!open) setSelectedReport(null); }}>
        <SheetContent side="right" className="w-full sm:max-w-2xl p-0 overflow-hidden">
          {selectedReport && (
            <ApprovalDetailView
              report={selectedReport}
              onClose={() => setSelectedReport(null)}
              userRole={userRole}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
