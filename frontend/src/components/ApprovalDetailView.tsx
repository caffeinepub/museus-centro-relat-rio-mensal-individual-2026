import React, { useState } from 'react';
import { toast } from 'sonner';
import { CheckCircle, RotateCcw, Loader2, FileText, Calendar, User, Building2, ChevronDown, ChevronUp, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { useReviewReport } from '../hooks/useQueries';
import { ReviewAction } from '../backend';
import { getMuseumLabel, getMonthLabel, getStatusLabel, getStatusColor } from '../utils/labels';
import type { Report, Activity } from '../types';

interface ApprovalDetailViewProps {
  report: Report;
  activities: Activity[];
  onClose: () => void;
}

function ActivityCard({ activity }: { activity: Activity }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="border border-border">
      <CardHeader className="pb-2 cursor-pointer" onClick={() => setExpanded(e => !e)}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{activity.activityName}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge className={`text-xs ${getStatusColor(activity.status)}`}>
              {getStatusLabel(activity.status)}
            </Badge>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">{activity.actionType}</p>
      </CardHeader>
      {expanded && (
        <CardContent className="pt-0 space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="font-medium text-muted-foreground">Museu:</span>
              <p>{getMuseumLabel(activity.museum)}</p>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Público Total:</span>
              <p>{Number(activity.totalAudience)}</p>
            </div>
          </div>
          {activity.executedDescription && (
            <div className="text-sm">
              <span className="font-medium text-muted-foreground">Descrição:</span>
              <p className="mt-1 text-foreground">{activity.executedDescription}</p>
            </div>
          )}
          {activity.achievedResults && (
            <div className="text-sm">
              <span className="font-medium text-muted-foreground">Resultados:</span>
              <p className="mt-1 text-foreground">{activity.achievedResults}</p>
            </div>
          )}
          {activity.evidencias && activity.evidencias.length > 0 && (
            <div className="text-sm">
              <span className="font-medium text-muted-foreground flex items-center gap-1 mb-2">
                <Paperclip className="w-3 h-3" /> Evidências ({activity.evidencias.length})
              </span>
              <div className="space-y-1">
                {activity.evidencias.map((ev) => (
                  <div key={ev.fileId} className="flex items-center gap-2 p-2 bg-muted/30 rounded text-xs">
                    <FileText className="w-3 h-3 text-muted-foreground" />
                    <span className="flex-1 truncate">{ev.fileName}</span>
                    <span className="text-muted-foreground">{ev.fileType}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

export default function ApprovalDetailView({ report, activities, onClose }: ApprovalDetailViewProps) {
  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [comments, setComments] = useState('');
  const reviewReport = useReviewReport();

  const handleApprove = async () => {
    try {
      await reviewReport.mutateAsync({
        reportId: report.id,
        action: ReviewAction.approve,
        comment: undefined,
      });
      toast.success('Relatório aprovado com sucesso!');
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao aprovar relatório';
      toast.error(message);
    }
  };

  const handleReturn = async () => {
    if (!comments.trim()) {
      toast.error('Por favor, adicione um comentário para devolver o relatório.');
      return;
    }
    try {
      await reviewReport.mutateAsync({
        reportId: report.id,
        action: ReviewAction.returnReport,
        comment: comments.trim() || undefined,
      });
      toast.success('Relatório devolvido para ajustes.');
      setShowReturnDialog(false);
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao devolver relatório';
      toast.error(message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">
            Relatório #{report.protocolNumber}
          </h2>
          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" /> {report.professionalName}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" /> {getMonthLabel(report.referenceMonth)} / {Number(report.year)}
            </span>
            <span className="flex items-center gap-1">
              <Building2 className="w-3 h-3" /> {getMuseumLabel(report.mainMuseum)}
            </span>
          </div>
        </div>
        <Badge className={`${getStatusColor(report.status)}`}>
          {getStatusLabel(report.status)}
        </Badge>
      </div>

      {/* Report Fields */}
      <div className="space-y-4">
        {[
          { label: 'Cargo / Função', value: report.funcaoCargo },
          { label: 'Resumo Executivo', value: report.executiveSummary },
          { label: 'Pontos Positivos', value: report.positivePoints },
          { label: 'Dificuldades', value: report.difficulties },
          { label: 'Sugestões', value: report.suggestions },
          { label: 'Oportunidade Identificada', value: report.identifiedOpportunity },
          { label: 'Categoria da Oportunidade', value: report.opportunityCategory },
          { label: 'Impacto Esperado', value: report.expectedImpact },
        ].map(({ label, value }) =>
          value ? (
            <div key={label} className="text-sm">
              <span className="font-semibold text-muted-foreground">{label}</span>
              <p className="mt-1 text-foreground whitespace-pre-wrap">{value}</p>
            </div>
          ) : null
        )}

        {report.coordinatorComments && (
          <div className="text-sm p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <span className="font-semibold text-yellow-800">Comentários do Coordenador:</span>
            <p className="mt-1 text-yellow-900">{report.coordinatorComments}</p>
          </div>
        )}
      </div>

      {/* Activities */}
      {activities.length > 0 && (
        <div>
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Atividades ({activities.length})
          </h3>
          <div className="space-y-2">
            {activities.map(activity => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-3 pt-4 border-t border-border">
        <Button
          onClick={handleApprove}
          disabled={reviewReport.isPending}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          {reviewReport.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <CheckCircle className="w-4 h-4 mr-2" />
          )}
          Aprovar
        </Button>
        <Button
          variant="outline"
          onClick={() => setShowReturnDialog(true)}
          disabled={reviewReport.isPending}
          className="border-orange-300 text-orange-700 hover:bg-orange-50"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Devolver
        </Button>
        <Button variant="ghost" onClick={onClose} className="ml-auto">
          Fechar
        </Button>
      </div>

      {/* Return Dialog */}
      <Dialog open={showReturnDialog} onOpenChange={setShowReturnDialog}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Devolver Relatório</DialogTitle>
            <DialogDescription>
              Adicione um comentário explicando o motivo da devolução. Este comentário será visível ao profissional.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Textarea
              placeholder="Descreva os ajustes necessários..."
              value={comments}
              onChange={e => setComments(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReturnDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleReturn}
              disabled={reviewReport.isPending || !comments.trim()}
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
