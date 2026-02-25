import React, { useRef, useState } from 'react';
import { Report, Status, ExternalBlob } from '../backend';
import { useGetActivitiesForReport, useReviewReport } from '../hooks/useQueries';
import { statusLabel, monthLabel } from '../utils/labels';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, CheckCircle, RotateCcw, Loader2 } from 'lucide-react';
import SignatureCanvas, { SignatureCanvasHandle } from './SignatureCanvas';
import ActivitiesList from './ActivitiesList';

interface ApprovalDetailViewProps {
  report: Report;
  onBack: () => void;
}

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

export default function ApprovalDetailView({ report, onBack }: ApprovalDetailViewProps) {
  const { data: activities, isLoading: activitiesLoading } = useGetActivitiesForReport(report.id);
  const reviewReport = useReviewReport();

  const [comments, setComments] = useState(report.coordinatorComments ?? '');
  const [signatureCaptured, setSignatureCaptured] = useState(false);
  const signatureRef = useRef<SignatureCanvasHandle>(null);

  const handleReturnForRevision = async () => {
    await reviewReport.mutateAsync({
      reportId: report.id,
      newStatus: Status.underReview,
      comments: comments || null,
      signature: null,
    });
    onBack();
  };

  const handleApprove = async () => {
    const sigBase64 = signatureRef.current?.getSignatureBase64();
    if (!sigBase64) return;

    // Convert base64 to ExternalBlob
    const base64Data = sigBase64.replace(/^data:image\/\w+;base64,/, '');
    const binaryStr = atob(base64Data);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }
    const blob = ExternalBlob.fromBytes(bytes);

    await reviewReport.mutateAsync({
      reportId: report.id,
      newStatus: Status.approved,
      comments: comments || null,
      signature: blob,
    });
    onBack();
  };

  const isLoading = reviewReport.isPending;

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} disabled={isLoading}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground">Detalhes do Relatório</h1>
          <p className="text-sm text-muted-foreground">Protocolo: {report.protocolNumber}</p>
        </div>
        <Badge variant={getStatusBadgeVariant(report.status as Status)}>
          {statusLabel(report.status as Status)}
        </Badge>
      </div>

      {/* Report Info */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <h2 className="font-semibold text-foreground text-lg">Informações do Relatório</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Profissional:</span>
            <p className="font-medium text-foreground">{report.professionalName}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Função:</span>
            <p className="font-medium text-foreground">{report.role}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Mês de Referência:</span>
            <p className="font-medium text-foreground">
              {monthLabel(report.referenceMonth)} / {String(report.year)}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Museu Principal:</span>
            <p className="font-medium text-foreground">{report.mainMuseum}</p>
          </div>
          {report.workedAtOtherMuseum && report.otherMuseum && (
            <div>
              <span className="text-muted-foreground">Outro Museu:</span>
              <p className="font-medium text-foreground">{report.otherMuseum}</p>
            </div>
          )}
          <div>
            <span className="text-muted-foreground">Data de Envio:</span>
            <p className="font-medium text-foreground">{formatDate(report.submittedAt)}</p>
          </div>
          {report.approvedAt && (
            <div>
              <span className="text-muted-foreground">Data de Aprovação:</span>
              <p className="font-medium text-foreground">{formatDate(report.approvedAt)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Report Content */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <h2 className="font-semibold text-foreground text-lg">Conteúdo do Relatório</h2>
        <div className="space-y-3 text-sm">
          {[
            { label: 'Resumo Executivo', value: report.executiveSummary },
            { label: 'Pontos Positivos', value: report.positivePoints },
            { label: 'Dificuldades', value: report.difficulties },
            { label: 'Sugestões', value: report.suggestions },
            { label: 'Oportunidade Identificada', value: report.identifiedOpportunity },
            { label: 'Categoria da Oportunidade', value: report.opportunityCategory },
            { label: 'Impacto Esperado', value: report.expectedImpact },
          ].map(({ label, value }) => (
            <div key={label}>
              <span className="text-muted-foreground font-medium">{label}:</span>
              <p className="text-foreground mt-1 whitespace-pre-wrap">{value || '—'}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Activities — ActivitiesList fetches its own data by reportId */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <h2 className="font-semibold text-foreground text-lg">
          Atividades {activitiesLoading ? '' : `(${activities?.length ?? 0})`}
        </h2>
        {activitiesLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : (
          <ActivitiesList reportId={report.id} canEdit={false} />
        )}
      </div>

      {/* Coordinator Comments */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-3">
        <h2 className="font-semibold text-foreground text-lg">Comentários da Coordenação</h2>
        <Textarea
          placeholder="Adicione comentários ou observações sobre este relatório..."
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          rows={4}
          disabled={isLoading}
        />
      </div>

      {/* Signature for Approval */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-3">
        <h2 className="font-semibold text-foreground text-lg">Assinatura da Coordenação</h2>
        <p className="text-sm text-muted-foreground">
          Para aprovar o relatório, assine no campo abaixo. A assinatura é obrigatória para aprovação.
        </p>
        <SignatureCanvas
          ref={signatureRef}
          onSignatureChange={(hasSignature) => setSignatureCaptured(hasSignature)}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-end">
        <Button
          variant="outline"
          onClick={handleReturnForRevision}
          disabled={isLoading}
          className="gap-2"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
          Devolver para Revisão
        </Button>
        <Button
          onClick={handleApprove}
          disabled={isLoading || !signatureCaptured}
          className="gap-2"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
          Aprovar Relatório
        </Button>
      </div>
    </div>
  );
}
