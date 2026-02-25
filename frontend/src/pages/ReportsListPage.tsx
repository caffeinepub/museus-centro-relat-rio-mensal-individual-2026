import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import {
  useReportsForUser,
  useAllReports,
  useDeleteReport,
  useGetCallerUserProfile,
  useAllActivities,
  useIsCoordinadorGeral,
} from '../hooks/useQueries';
import { AppUserRole, type Report } from '../backend';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Plus,
  FileText,
  Trash2,
  Edit,
  Eye,
  Loader2,
  Search,
  Download,
  Filter,
} from 'lucide-react';
import { statusLabel, getMuseumLabel, MONTHS, getMonthLabel } from '../utils/labels';
import { generateConsolidatedExcel } from '../utils/excelGenerator';
import type { Principal } from '@dfinity/principal';

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  draft: 'secondary',
  submitted: 'default',
  underReview: 'outline',
  approved: 'default',
  analysis: 'outline',
  requiresAdjustment: 'destructive',
};

export default function ReportsListPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const isCoordinadorGeral = useIsCoordinadorGeral(userProfile);

  const isCoordinator =
    userProfile?.appRole === AppUserRole.coordination ||
    userProfile?.appRole === AppUserRole.coordinator ||
    userProfile?.appRole === AppUserRole.administration;

  const { data: myReports, isLoading: myLoading } = useReportsForUser(
    !isCoordinator ? (identity?.getPrincipal() as unknown as Principal) : undefined
  );
  const { data: allReports, isLoading: allLoading } = useAllReports();
  const { data: allActivities } = useAllActivities();
  const deleteReport = useDeleteReport();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [monthFilter, setMonthFilter] = useState<string>('all');
  const [reportToDelete, setReportToDelete] = useState<Report | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const reports = isCoordinator ? (allReports ?? []) : (myReports ?? []);
  const isLoading = isCoordinator ? allLoading : myLoading;

  const filteredReports = reports.filter((r) => {
    const matchesSearch =
      !searchTerm ||
      r.professionalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.protocolNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.executiveSummary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchesMonth = monthFilter === 'all' || r.referenceMonth === monthFilter;
    return matchesSearch && matchesStatus && matchesMonth;
  });

  const handleDelete = async () => {
    if (!reportToDelete) return;
    try {
      await deleteReport.mutateAsync(reportToDelete.id);
      setReportToDelete(null);
    } catch {
      // error handled by mutation
    }
  };

  const handleExportXLSX = async () => {
    if (!allReports || !allActivities) return;
    setIsExporting(true);
    try {
      generateConsolidatedExcel(allReports, allActivities);
    } finally {
      setIsExporting(false);
    }
  };

  const canEdit = (report: Report): boolean => {
    if (isCoordinator) return true;
    return (
      report.authorId.toString() === identity?.getPrincipal().toString() &&
      (report.status === 'draft' || report.status === 'requiresAdjustment')
    );
  };

  const canDelete = (report: Report): boolean => {
    if (isCoordinator) return true;
    return (
      report.authorId.toString() === identity?.getPrincipal().toString() &&
      (report.status === 'draft' || report.status === 'requiresAdjustment')
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Relatórios</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isCoordinator
              ? `${filteredReports.length} relatório(s) no sistema`
              : `${filteredReports.length} relatório(s) seus`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isCoordinator && (
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
          )}
          <Button onClick={() => navigate({ to: '/reports/new' })}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Relatório
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar por profissional, protocolo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="draft">Rascunho</SelectItem>
            <SelectItem value="submitted">Submetido</SelectItem>
            <SelectItem value="underReview">Em Revisão</SelectItem>
            <SelectItem value="approved">Aprovado</SelectItem>
            <SelectItem value="analysis">Em Análise</SelectItem>
            <SelectItem value="requiresAdjustment">Requer Ajuste</SelectItem>
          </SelectContent>
        </Select>
        <Select value={monthFilter} onValueChange={setMonthFilter}>
          <SelectTrigger className="w-full sm:w-44">
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

      {/* Reports List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Nenhum relatório encontrado</p>
          <p className="text-sm mt-1">
            {searchTerm || statusFilter !== 'all' || monthFilter !== 'all'
              ? 'Tente ajustar os filtros'
              : 'Crie seu primeiro relatório'}
          </p>
          {!searchTerm && statusFilter === 'all' && monthFilter === 'all' && (
            <Button
              className="mt-4"
              onClick={() => navigate({ to: '/reports/new' })}
            >
              <Plus className="w-4 h-4 mr-2" />
              Criar Relatório
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              className="group flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:shadow-sm hover:border-primary/30 transition-all"
            >
              <div className="flex items-start gap-4 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-foreground text-sm">
                      {report.professionalName}
                    </p>
                    <Badge
                      variant={STATUS_VARIANTS[report.status] ?? 'secondary'}
                      className="text-xs"
                    >
                      {statusLabel(report.status)}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {getMonthLabel(report.referenceMonth)} {report.year.toString()} ·{' '}
                    {getMuseumLabel(report.mainMuseum)} · {report.protocolNumber}
                  </p>
                  {report.executiveSummary && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                      {report.executiveSummary}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0 ml-3">
                <Button
                  size="icon"
                  variant="ghost"
                  className="w-8 h-8"
                  onClick={() => navigate({ to: `/reports/${report.id}` })}
                >
                  <Eye className="w-3.5 h-3.5" />
                </Button>
                {canEdit(report) && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="w-8 h-8"
                    onClick={() => navigate({ to: `/reports/${report.id}/edit` })}
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </Button>
                )}
                {canDelete(report) && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="w-8 h-8 text-destructive hover:text-destructive"
                    onClick={() => setReportToDelete(report)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!reportToDelete} onOpenChange={(open) => !open && setReportToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Relatório</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o relatório de{' '}
              <strong>{reportToDelete?.professionalName}</strong>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteReport.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
