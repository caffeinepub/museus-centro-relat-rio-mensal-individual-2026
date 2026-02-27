import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { Plus, Search, FileText, Loader2, Edit, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  useGetReportsForUser,
  useDeleteReport,
  useActivitiesForReport,
} from '../hooks/useQueries';
import { getMuseumLabel, getMonthLabel, getStatusLabel, getStatusColor } from '../utils/labels';
import ActivitiesList from '../components/ActivitiesList';
import ExportReportPDFButton from '../components/ExportReportPDFButton';
import type { Report, Activity } from '../types';

function ReportActivitiesRow({
  report,
  onEdit,
  onDelete,
}: {
  report: Report;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [showActivities, setShowActivities] = useState(false);
  const { data: activities = [] } = useActivitiesForReport(showActivities ? report.id : undefined);

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-foreground truncate">{report.professionalName}</span>
            <Badge className={`text-xs shrink-0 ${getStatusColor(report.status)}`}>
              {getStatusLabel(report.status)}
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground flex items-center gap-3">
            <span>#{report.protocolNumber}</span>
            <span>{getMonthLabel(report.referenceMonth)} / {Number(report.year)}</span>
            <span>{getMuseumLabel(report.mainMuseum)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-4 shrink-0">
          <ExportReportPDFButton report={report} activities={activities as Activity[]} />
          <Button size="sm" variant="ghost" onClick={onEdit}>
            <Edit className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-red-600 hover:text-red-700"
            onClick={onDelete}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowActivities(s => !s)}
          >
            {showActivities ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
      </div>
      {showActivities && (
        <div className="border-t border-border p-4 bg-muted/20">
          <ActivitiesList
            reportId={report.id}
            activities={activities as Activity[]}
            isLoading={false}
            canEdit={false}
          />
        </div>
      )}
    </div>
  );
}

export default function ReportsListPage() {
  const navigate = useNavigate();
  const { data: reports = [], isLoading } = useGetReportsForUser();
  const deleteReport = useDeleteReport();

  const [search, setSearch] = useState('');
  const [deletingReport, setDeletingReport] = useState<Report | null>(null);

  const filtered = (reports as Report[]).filter(r =>
    r.professionalName?.toLowerCase().includes(search.toLowerCase()) ||
    r.protocolNumber?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async () => {
    if (!deletingReport) return;
    try {
      await deleteReport.mutateAsync(deletingReport.id);
      toast.success('Relatório excluído com sucesso!');
      setDeletingReport(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao excluir relatório';
      toast.error(message);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FileText className="w-7 h-7 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Meus Relatórios</h1>
        </div>
        <Button onClick={() => navigate({ to: '/reports/new' })}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Relatório
        </Button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Buscar relatórios..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          Nenhum relatório encontrado.{' '}
          <button
            className="text-primary underline"
            onClick={() => navigate({ to: '/reports/new' })}
          >
            Criar novo relatório
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(report => (
            <ReportActivitiesRow
              key={report.id}
              report={report}
              onEdit={() => navigate({ to: `/reports/${report.id}/edit` })}
              onDelete={() => setDeletingReport(report)}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingReport} onOpenChange={open => { if (!open) setDeletingReport(null); }}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o relatório de <strong>{deletingReport?.professionalName}</strong>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteReport.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteReport.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
