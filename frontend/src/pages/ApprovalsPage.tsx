import React, { useState } from 'react';
import { toast } from 'sonner';
import { CheckCircle, RotateCcw, Loader2, Search, Eye, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usePendingReports, useReviewReport, useActivitiesForReport } from '../hooks/useQueries';
import { ReviewAction } from '../backend';
import { getMuseumLabel, getMonthLabel, getStatusLabel, getStatusColor } from '../utils/labels';
import ApprovalDetailView from '../components/ApprovalDetailView';
import type { Report, Activity } from '../types';

function ReportActivitiesWrapper({
  report,
  onClose,
}: {
  report: Report;
  onClose: () => void;
}) {
  const { data: activities = [] } = useActivitiesForReport(report.id);
  return <ApprovalDetailView report={report} activities={activities as Activity[]} onClose={onClose} />;
}

export default function ApprovalsPage() {
  const { data: reports = [], isLoading } = usePendingReports();
  const reviewReport = useReviewReport();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [approvingReport, setApprovingReport] = useState<Report | null>(null);
  const [returningReport, setReturningReport] = useState<Report | null>(null);
  const [returnComment, setReturnComment] = useState('');

  const filtered = (reports as Report[]).filter(r => {
    const matchesSearch =
      r.professionalName?.toLowerCase().includes(search.toLowerCase()) ||
      r.protocolNumber?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || String(r.status) === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleApprove = async () => {
    if (!approvingReport) return;
    try {
      await reviewReport.mutateAsync({
        reportId: approvingReport.id,
        action: ReviewAction.approve,
        comment: undefined,
      });
      toast.success('Relatório aprovado com sucesso!');
      setApprovingReport(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao aprovar relatório';
      toast.error(message);
    }
  };

  const handleReturn = async () => {
    if (!returningReport) return;
    if (!returnComment.trim()) {
      toast.error('Por favor, adicione um comentário para devolver o relatório.');
      return;
    }
    try {
      await reviewReport.mutateAsync({
        reportId: returningReport.id,
        action: ReviewAction.returnReport,
        comment: returnComment.trim() || undefined,
      });
      toast.success('Relatório devolvido para ajustes.');
      setReturningReport(null);
      setReturnComment('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao devolver relatório';
      toast.error(message);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <CheckCircle className="w-7 h-7 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Aprovações</h1>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Buscar por profissional ou protocolo..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48 bg-white">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="submitted">Enviado</SelectItem>
            <SelectItem value="underReview">Em Revisão</SelectItem>
            <SelectItem value="analysis">Em Análise</SelectItem>
            <SelectItem value="requiresAdjustment">Requer Ajuste</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          Nenhum relatório pendente de aprovação.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(report => (
            <div
              key={report.id}
              className="flex items-center justify-between p-4 bg-card border border-border rounded-lg hover:bg-muted/30 transition-colors"
            >
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
              <div className="flex items-center gap-2 ml-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedReport(report)}
                >
                  <Eye className="w-3 h-3 mr-1" />
                  Ver
                </Button>
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => setApprovingReport(report)}
                  disabled={reviewReport.isPending}
                >
                  {reviewReport.isPending ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <CheckCircle className="w-3 h-3 mr-1" />
                  )}
                  Aprovar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-orange-300 text-orange-700 hover:bg-orange-50"
                  onClick={() => { setReturningReport(report); setReturnComment(''); }}
                  disabled={reviewReport.isPending}
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Devolver
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail View Dialog */}
      <Dialog open={!!selectedReport} onOpenChange={open => { if (!open) setSelectedReport(null); }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle>Detalhes do Relatório</DialogTitle>
          </DialogHeader>
          {selectedReport && (
            <ReportActivitiesWrapper
              report={selectedReport}
              onClose={() => setSelectedReport(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Approve Confirmation */}
      <AlertDialog open={!!approvingReport} onOpenChange={open => { if (!open) setApprovingReport(null); }}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Aprovação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja aprovar o relatório de <strong>{approvingReport?.professionalName}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApprove}
              disabled={reviewReport.isPending}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {reviewReport.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Aprovar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Return Dialog */}
      <Dialog open={!!returningReport} onOpenChange={open => { if (!open) { setReturningReport(null); setReturnComment(''); } }}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Devolver Relatório</DialogTitle>
            <DialogDescription>
              Adicione um comentário explicando o motivo da devolução para <strong>{returningReport?.professionalName}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Textarea
              placeholder="Descreva os ajustes necessários..."
              value={returnComment}
              onChange={e => setReturnComment(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setReturningReport(null); setReturnComment(''); }}>
              Cancelar
            </Button>
            <Button
              onClick={handleReturn}
              disabled={reviewReport.isPending || !returnComment.trim()}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              {reviewReport.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Devolver
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
