import React, { useRef, useState } from 'react';
import { Report, Status, AppUserRole, ExternalBlob } from '../backend';
import { useReviewReport } from '../hooks/useQueries';
import SignatureCanvas, { SignatureCanvasHandle } from './SignatureCanvas';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, RotateCcw, X, FileText, Calendar, User, Building2, Loader2 } from 'lucide-react';
import { statusLabel, getMuseumLabel, getMonthLabel } from '../utils/labels';

interface ApprovalDetailViewProps {
  report: Report;
  onClose: () => void;
  userRole?: AppUserRole;
}

export default function ApprovalDetailView({ report, onClose, userRole }: ApprovalDetailViewProps) {
  const [comments, setComments] = useState<string>(report.coordinatorComments ?? '');
  const [showSignature, setShowSignature] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<Status | null>(null);
  const signatureRef = useRef<SignatureCanvasHandle>(null);
  const reviewMutation = useReviewReport();

  const isCoordinatorOrAdmin =
    userRole === AppUserRole.coordination ||
    userRole === AppUserRole.coordinator ||
    userRole === AppUserRole.administration;

  const canApprove =
    userRole === AppUserRole.coordination ||
    userRole === AppUserRole.administration;

  const isSubmittedOrUnderReview =
    report.status === Status.submitted ||
    report.status === Status.underReview ||
    report.status === Status.analysis;

  const isApproved = report.status === Status.approved;

  const handleAction = (status: Status) => {
    setPendingStatus(status);
    setShowSignature(true);
  };

  const handleConfirm = async () => {
    if (!pendingStatus) return;
    let signatureBlob: ExternalBlob | null = null;
    if (signatureRef.current) {
      const base64 = signatureRef.current.getSignatureBase64();
      if (base64) {
        const res = await fetch(base64);
        const buf = await res.arrayBuffer();
        signatureBlob = ExternalBlob.fromBytes(new Uint8Array(buf));
      }
    }
    reviewMutation.mutate(
      {
        reportId: report.id,
        status: pendingStatus,
        comments: comments || null,
        signature: signatureBlob,
      },
      {
        onSuccess: () => {
          setShowSignature(false);
          setPendingStatus(null);
          onClose();
        },
      }
    );
  };

  const handleCancel = () => {
    setShowSignature(false);
    setPendingStatus(null);
  };

  const getStatusBadgeVariant = (status: Status): 'default' | 'secondary' | 'outline' | 'destructive' => {
    switch (status) {
      case Status.approved: return 'default';
      case Status.submitted: return 'secondary';
      case Status.underReview: return 'outline';
      case Status.requiresAdjustment: return 'destructive';
      case Status.draft: return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-background z-10">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-primary" />
          <div>
            <h2 className="font-semibold text-foreground text-sm">{report.professionalName}</h2>
            <p className="text-xs text-muted-foreground">{report.protocolNumber}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-4 space-y-4">
        {/* Status & Meta */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-wrap gap-3 items-center">
              <Badge variant={getStatusBadgeVariant(report.status)}>
                {statusLabel(report.status)}
              </Badge>
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                {getMonthLabel(report.referenceMonth)} / {report.year.toString()}
              </span>
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <Building2 className="h-3.5 w-3.5" />
                {getMuseumLabel(report.mainMuseum)}
              </span>
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <User className="h-3.5 w-3.5" />
                {report.role}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Report Content */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Resumo Executivo</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{report.executiveSummary}</p>
          </CardContent>
        </Card>

        {report.positivePoints && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Pontos Positivos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{report.positivePoints}</p>
            </CardContent>
          </Card>
        )}

        {report.difficulties && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Dificuldades</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{report.difficulties}</p>
            </CardContent>
          </Card>
        )}

        {report.suggestions && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Sugestões</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{report.suggestions}</p>
            </CardContent>
          </Card>
        )}

        {report.identifiedOpportunity && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Oportunidade Identificada</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{report.identifiedOpportunity}</p>
              {report.opportunityCategory && (
                <p className="text-xs text-muted-foreground mt-1">Categoria: {report.opportunityCategory}</p>
              )}
              {report.expectedImpact && (
                <p className="text-xs text-muted-foreground mt-1">Impacto esperado: {report.expectedImpact}</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Coordinator Comments (existing) */}
        {report.coordinatorComments && (
          <Card className="border-warning/30 bg-warning/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-warning">Comentários do Coordenador</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{report.coordinatorComments}</p>
            </CardContent>
          </Card>
        )}

        {/* Coordinator Actions */}
        {isCoordinatorOrAdmin && !showSignature && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Ações do Coordenador</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Comentários / Observações
                </label>
                <Textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Adicione comentários ou observações para o profissional..."
                  rows={3}
                  className="text-sm"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {canApprove && !isApproved && (
                  <Button
                    onClick={() => handleAction(Status.approved)}
                    className="flex items-center gap-2 bg-success text-success-foreground hover:bg-success/90"
                    disabled={reviewMutation.isPending}
                  >
                    <CheckCircle className="h-4 w-4" />
                    Aprovar Relatório
                  </Button>
                )}

                {isSubmittedOrUnderReview && (
                  <Button
                    variant="outline"
                    onClick={() => handleAction(Status.underReview)}
                    disabled={reviewMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Marcar Em Revisão
                  </Button>
                )}

                {!isApproved && (
                  <Button
                    variant="destructive"
                    onClick={() => handleAction(Status.requiresAdjustment)}
                    disabled={reviewMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Devolver para Ajuste
                  </Button>
                )}
              </div>

              {isApproved && (
                <div className="flex items-center gap-2 text-success text-sm font-medium">
                  <CheckCircle className="h-4 w-4" />
                  Relatório aprovado
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Signature Capture */}
        {showSignature && (
          <Card className="border-primary/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">
                {pendingStatus === Status.approved
                  ? 'Assinar e Aprovar Relatório'
                  : pendingStatus === Status.requiresAdjustment
                  ? 'Assinar e Devolver para Ajuste'
                  : 'Assinar e Confirmar'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Assine abaixo para confirmar a ação. A assinatura será registrada junto ao relatório.
              </p>
              <SignatureCanvas ref={signatureRef} />
              <div className="flex gap-2">
                <Button
                  onClick={handleConfirm}
                  disabled={reviewMutation.isPending}
                  className={
                    pendingStatus === Status.approved
                      ? 'bg-success text-success-foreground hover:bg-success/90'
                      : pendingStatus === Status.requiresAdjustment
                      ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                      : ''
                  }
                >
                  {reviewMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    'Confirmar'
                  )}
                </Button>
                <Button variant="outline" onClick={handleCancel} disabled={reviewMutation.isPending}>
                  Cancelar
                </Button>
              </div>
              {reviewMutation.isError && (
                <p className="text-xs text-destructive">
                  Erro ao processar ação. Verifique suas permissões e tente novamente.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        <Separator />

        {report.approvedAt && (
          <p className="text-xs text-muted-foreground text-center">
            Aprovado em: {new Date(Number(report.approvedAt) / 1_000_000).toLocaleDateString('pt-BR')}
          </p>
        )}
        {report.submittedAt && (
          <p className="text-xs text-muted-foreground text-center">
            Submetido em: {new Date(Number(report.submittedAt) / 1_000_000).toLocaleDateString('pt-BR')}
          </p>
        )}
      </div>
    </div>
  );
}
