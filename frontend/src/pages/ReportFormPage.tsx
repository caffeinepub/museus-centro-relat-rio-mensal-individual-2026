import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import {
  useGetReport,
  useCreateReport,
  useUpdateReport,
  useSubmitReport,
  useUploadSignature,
  useUpdateCoordinationFields,
  useGetActivitiesForReport,
  useGetCallerUserProfile,
} from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import SignatureCanvas, { SignatureCanvasHandle } from '../components/SignatureCanvas';
import ActivitiesList from '../components/ActivitiesList';
import { generateReportPDF } from '../utils/pdfGenerator';
import { toast } from 'sonner';
import {
  Save,
  Send,
  PenLine,
  AlertCircle,
  Info,
  FileDown,
} from 'lucide-react';
import { Status, Month, AppUserRole, MuseumLocation } from '../backend';
import type { Report } from '../backend';
import { statusLabel, monthLabel, getMuseumLabel, MUSEUM_LOCATIONS } from '../utils/labels';

const PROFESSIONAL_ROLES = [
  'Coordenação Geral (Daniel Perini)',
  'Coordenação Técnica',
  'Educativo',
  'Comunicação',
  'Produção',
  'Administrativo',
  'Outro',
];

const MONTHS = [
  { value: Month.february, label: 'Fevereiro' },
  { value: Month.march, label: 'Março' },
  { value: Month.april, label: 'Abril' },
  { value: Month.may, label: 'Maio' },
  { value: Month.june, label: 'Junho' },
  { value: Month.july, label: 'Julho' },
  { value: Month.august, label: 'Agosto' },
  { value: Month.september, label: 'Setembro' },
  { value: Month.october, label: 'Outubro' },
  { value: Month.november, label: 'Novembro' },
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i);

function formatDate(time: bigint | undefined): string {
  if (!time) return '—';
  const ms = Number(time) / 1_000_000;
  return new Date(ms).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getStatusVariant(status: Status): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case Status.approved: return 'default';
    case Status.submitted: return 'secondary';
    case Status.underReview: return 'outline';
    default: return 'outline';
  }
}

export default function ReportFormPage() {
  const params = useParams({ strict: false }) as { reportId?: string };
  const reportId = params.reportId;
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();

  const isCoordination = userProfile?.appRole === AppUserRole.coordination;
  const isAdmin = userProfile?.appRole === AppUserRole.administration;
  const isCoordOrAdmin = isCoordination || isAdmin;

  const effectiveReportId = reportId && reportId !== 'new' ? reportId : undefined;

  const { data: existingReport, isLoading: reportLoading } = useGetReport(effectiveReportId);
  const { data: activities } = useGetActivitiesForReport(effectiveReportId);

  const createReport = useCreateReport();
  const updateReport = useUpdateReport();
  const submitReport = useSubmitReport();
  const uploadSignature = useUploadSignature();
  const updateCoordFields = useUpdateCoordinationFields();

  const signatureRef = useRef<SignatureCanvasHandle>(null);
  const [signatureDrawn, setSignatureDrawn] = useState(false);

  // Form state
  const [professionalName, setProfessionalName] = useState('');
  const [role, setRole] = useState('');
  const [mainMuseum, setMainMuseum] = useState<MuseumLocation | ''>('');
  const [workedAtOtherMuseum, setWorkedAtOtherMuseum] = useState(false);
  const [otherMuseum, setOtherMuseum] = useState('');
  const [referenceMonth, setReferenceMonth] = useState<string>(Month.february);
  const [year, setYear] = useState(CURRENT_YEAR.toString());
  const [executiveSummary, setExecutiveSummary] = useState('');
  const [positivePoints, setPositivePoints] = useState('');
  const [difficulties, setDifficulties] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [identifiedOpportunity, setIdentifiedOpportunity] = useState('');
  const [opportunityCategory, setOpportunityCategory] = useState('');
  const [expectedImpact, setExpectedImpact] = useState('');

  // Coordination fields
  const [generalExecutiveSummary, setGeneralExecutiveSummary] = useState('');
  const [consolidatedGoals, setConsolidatedGoals] = useState('');
  const [institutionalObservations, setInstitutionalObservations] = useState('');

  const [currentReportId, setCurrentReportId] = useState<string | undefined>(effectiveReportId);

  // Populate form from existing report
  useEffect(() => {
    if (existingReport) {
      setProfessionalName(existingReport.professionalName);
      setRole(existingReport.role);
      setMainMuseum(existingReport.mainMuseum as MuseumLocation);
      setWorkedAtOtherMuseum(existingReport.workedAtOtherMuseum);
      setOtherMuseum(existingReport.otherMuseum || '');
      setReferenceMonth(existingReport.referenceMonth);
      setYear(existingReport.year.toString());
      setExecutiveSummary(existingReport.executiveSummary);
      setPositivePoints(existingReport.positivePoints);
      setDifficulties(existingReport.difficulties);
      setSuggestions(existingReport.suggestions);
      setIdentifiedOpportunity(existingReport.identifiedOpportunity);
      setOpportunityCategory(existingReport.opportunityCategory);
      setExpectedImpact(existingReport.expectedImpact);
      setGeneralExecutiveSummary(existingReport.generalExecutiveSummary || '');
      setConsolidatedGoals(existingReport.consolidatedGoals || '');
      setInstitutionalObservations(existingReport.institutionalObservations || '');
    }
  }, [existingReport]);

  // Determine if the current user is the author of this report
  const currentUserPrincipal = identity?.getPrincipal().toString();
  const isOwnReport =
    !existingReport ||
    existingReport.authorId.toString() === currentUserPrincipal;

  const isReadOnly = (() => {
    if (isCoordOrAdmin && !isOwnReport) {
      return true;
    }
    if (existingReport) {
      return (
        existingReport.status === Status.submitted ||
        existingReport.status === Status.approved
      );
    }
    return false;
  })();

  const isEditable = !isReadOnly;

  const currentStatus = existingReport?.status;

  const activitiesCount = activities?.length || 0;
  const canSubmit = !isReadOnly && (activitiesCount > 0 || executiveSummary.trim().length > 0);

  const buildReportPayload = (): Report => {
    const principal = identity!.getPrincipal();
    return {
      id: currentReportId || '',
      protocolNumber: existingReport?.protocolNumber || '',
      referenceMonth: referenceMonth as Month,
      year: BigInt(year),
      professionalName,
      role,
      mainMuseum: mainMuseum as MuseumLocation,
      workedAtOtherMuseum,
      otherMuseum: workedAtOtherMuseum ? otherMuseum : undefined,
      executiveSummary,
      positivePoints,
      difficulties,
      suggestions,
      identifiedOpportunity,
      opportunityCategory,
      expectedImpact,
      status: existingReport?.status || Status.draft,
      sendDate: existingReport?.sendDate,
      signature: existingReport?.signature,
      authorId: principal,
      generalExecutiveSummary: generalExecutiveSummary || undefined,
      consolidatedGoals: consolidatedGoals || undefined,
      institutionalObservations: institutionalObservations || undefined,
      submittedAt: existingReport?.submittedAt,
      approvedAt: existingReport?.approvedAt,
      coordinatorComments: existingReport?.coordinatorComments,
      coordinatorSignature: existingReport?.coordinatorSignature,
    };
  };

  const handleSaveDraft = async () => {
    if (!identity) return;
    try {
      const payload = buildReportPayload();
      if (currentReportId) {
        await updateReport.mutateAsync({ reportId: currentReportId, report: payload });
        toast.success('Rascunho salvo com sucesso!');
      } else {
        const newId = await createReport.mutateAsync(payload);
        setCurrentReportId(newId);
        navigate({ to: `/reports/${newId}/edit` });
        toast.success('Relatório criado com sucesso!');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido';
      toast.error('Erro ao salvar: ' + msg);
    }
  };

  const handleSubmit = async () => {
    if (!currentReportId) {
      toast.error('Salve o relatório antes de enviar.');
      return;
    }
    try {
      await submitReport.mutateAsync(currentReportId);
      toast.success('Relatório enviado para aprovação!');
      navigate({ to: '/reports' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido';
      toast.error('Erro ao enviar: ' + msg);
    }
  };

  const handleSignAndSave = async () => {
    if (!currentReportId) {
      toast.error('Salve o relatório antes de assinar.');
      return;
    }
    const sigData = signatureRef.current?.getSignatureBase64();
    if (!sigData) {
      toast.error('Por favor, desenhe sua assinatura antes de salvar.');
      return;
    }
    try {
      await uploadSignature.mutateAsync({ reportId: currentReportId, signatureBase64: sigData });
      toast.success('Assinatura salva com sucesso!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido';
      toast.error('Erro ao salvar assinatura: ' + msg);
    }
  };

  const handleSaveCoordFields = async () => {
    if (!currentReportId) return;
    try {
      await updateCoordFields.mutateAsync({
        reportId: currentReportId,
        executiveSummary: generalExecutiveSummary,
        consolidatedGoals,
        institutionalObservations,
      });
      toast.success('Campos de coordenação salvos!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido';
      toast.error('Erro ao salvar campos de coordenação: ' + msg);
    }
  };

  const handleGeneratePDF = () => {
    if (!existingReport) return;
    generateReportPDF(existingReport, activities || []);
  };

  const isSaving =
    createReport.isPending ||
    updateReport.isPending ||
    submitReport.isPending ||
    uploadSignature.isPending;

  if (reportLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">
            {currentReportId ? 'Relatório Mensal' : 'Novo Relatório'}
          </h1>
          {existingReport?.protocolNumber && (
            <p className="text-sm text-muted-foreground">
              Protocolo: {existingReport.protocolNumber}
            </p>
          )}
        </div>
        {currentStatus && (
          <Badge variant={getStatusVariant(currentStatus)} className="text-sm px-3 py-1">
            {statusLabel(currentStatus)}
          </Badge>
        )}
      </div>

      {/* Status timestamps */}
      {(existingReport?.submittedAt || existingReport?.approvedAt) && (
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          {existingReport.submittedAt && (
            <span>📤 Enviado em: <strong>{formatDate(existingReport.submittedAt)}</strong></span>
          )}
          {existingReport.approvedAt && (
            <span>✅ Aprovado em: <strong>{formatDate(existingReport.approvedAt)}</strong></span>
          )}
        </div>
      )}

      {/* Coordinator comments (read-only for professional) */}
      {existingReport?.coordinatorComments &&
        (currentStatus === Status.underReview || currentStatus === Status.approved) && (
          <Alert className="border-amber-300 bg-amber-50 dark:bg-amber-950/20">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription>
              <strong className="text-amber-800 dark:text-amber-200">
                Comentários da Coordenação:
              </strong>
              <p className="mt-1 text-amber-700 dark:text-amber-300 whitespace-pre-wrap">
                {existingReport.coordinatorComments}
              </p>
            </AlertDescription>
          </Alert>
        )}

      {/* Read-only notice for own report that is submitted/approved */}
      {isReadOnly && isOwnReport && currentStatus && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Este relatório está em modo somente leitura (status: {statusLabel(currentStatus)}).
            {currentStatus === Status.underReview &&
              ' Você pode editar após a coordenação devolver para revisão.'}
          </AlertDescription>
        </Alert>
      )}

      {/* Read-only notice for coord/admin viewing another user's report */}
      {isReadOnly && isCoordOrAdmin && !isOwnReport && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Você está visualizando o relatório de outro profissional em modo somente leitura.
            Para revisar e aprovar, utilize a página de <strong>Aprovações</strong>.
          </AlertDescription>
        </Alert>
      )}

      {/* Identification */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Identificação — Equipe Principal</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Mês de Referência</Label>
            <Select
              value={referenceMonth}
              onValueChange={setReferenceMonth}
              disabled={isReadOnly}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Ano</Label>
            <Select value={year} onValueChange={setYear} disabled={isReadOnly}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {YEARS.map((y) => (
                  <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Nome do Profissional</Label>
            <Input
              value={professionalName}
              onChange={(e) => setProfessionalName(e.target.value)}
              disabled={isReadOnly}
              placeholder="Nome completo"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Função</Label>
            <Select value={role} onValueChange={setRole} disabled={isReadOnly}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar função..." />
              </SelectTrigger>
              <SelectContent>
                {PROFESSIONAL_ROLES.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Equipe Principal</Label>
            <Select
              value={mainMuseum}
              onValueChange={(v) => setMainMuseum(v as MuseumLocation)}
              disabled={isReadOnly}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecionar equipe..." />
              </SelectTrigger>
              <SelectContent>
                {MUSEUM_LOCATIONS.map((loc) => (
                  <SelectItem key={loc} value={loc}>
                    {getMuseumLabel(loc)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={workedAtOtherMuseum}
                onChange={(e) => setWorkedAtOtherMuseum(e.target.checked)}
                disabled={isReadOnly}
                className="rounded"
              />
              Atuou em outra equipe?
            </Label>
            {workedAtOtherMuseum && (
              <Input
                value={otherMuseum}
                onChange={(e) => setOtherMuseum(e.target.value)}
                disabled={isReadOnly}
                placeholder="Nome da outra equipe/museu"
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Narrative */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Narrativa do Período</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Resumo Executivo</Label>
            <Textarea
              value={executiveSummary}
              onChange={(e) => setExecutiveSummary(e.target.value)}
              disabled={isReadOnly}
              rows={4}
              placeholder="Descreva as principais ações do período..."
            />
          </div>
          <div className="space-y-1.5">
            <Label>Pontos Positivos</Label>
            <Textarea
              value={positivePoints}
              onChange={(e) => setPositivePoints(e.target.value)}
              disabled={isReadOnly}
              rows={3}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Dificuldades</Label>
            <Textarea
              value={difficulties}
              onChange={(e) => setDifficulties(e.target.value)}
              disabled={isReadOnly}
              rows={3}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Sugestões</Label>
            <Textarea
              value={suggestions}
              onChange={(e) => setSuggestions(e.target.value)}
              disabled={isReadOnly}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Opportunity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Oportunidade Identificada</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Oportunidade</Label>
            <Textarea
              value={identifiedOpportunity}
              onChange={(e) => setIdentifiedOpportunity(e.target.value)}
              disabled={isReadOnly}
              rows={3}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Categoria</Label>
            <Input
              value={opportunityCategory}
              onChange={(e) => setOpportunityCategory(e.target.value)}
              disabled={isReadOnly}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Impacto Esperado</Label>
            <Textarea
              value={expectedImpact}
              onChange={(e) => setExpectedImpact(e.target.value)}
              disabled={isReadOnly}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Coordination fields (only for coord/admin) */}
      {isCoordOrAdmin && currentReportId && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Campos da Coordenação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Resumo Executivo Geral</Label>
              <Textarea
                value={generalExecutiveSummary}
                onChange={(e) => setGeneralExecutiveSummary(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Metas Consolidadas</Label>
              <Textarea
                value={consolidatedGoals}
                onChange={(e) => setConsolidatedGoals(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Observações Institucionais</Label>
              <Textarea
                value={institutionalObservations}
                onChange={(e) => setInstitutionalObservations(e.target.value)}
                rows={3}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleSaveCoordFields}
              disabled={updateCoordFields.isPending}
              className="gap-2"
            >
              {updateCoordFields.isPending && <Save className="w-4 h-4 animate-spin" />}
              Salvar Campos de Coordenação
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Activities */}
      {currentReportId && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Atividades</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivitiesList
              reportId={currentReportId}
              canEdit={isEditable}
            />
            {isEditable && (
              <Button
                type="button"
                variant="outline"
                className="mt-4 gap-2"
                onClick={() => navigate({ to: `/reports/${currentReportId}/activities/new` })}
              >
                + Adicionar Atividade
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Signature */}
      {isEditable && currentReportId && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <PenLine className="w-4 h-4" />
              Assinatura Digital
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {existingReport?.signature && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Assinatura atual:</p>
                <img
                  src={existingReport.signature}
                  alt="Assinatura"
                  className="border rounded max-h-20"
                />
              </div>
            )}
            <SignatureCanvas
              ref={signatureRef}
              onSignatureChange={(hasSignature) => setSignatureDrawn(hasSignature)}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSignAndSave}
              disabled={!signatureDrawn || uploadSignature.isPending}
              className="gap-2"
            >
              {uploadSignature.isPending && <Save className="w-4 h-4 animate-spin" />}
              Salvar Assinatura
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 pb-8">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate({ to: '/reports' })}
        >
          Voltar
        </Button>

        {existingReport && (
          <Button
            type="button"
            variant="outline"
            onClick={handleGeneratePDF}
            className="gap-2"
          >
            <FileDown className="w-4 h-4" />
            Exportar PDF
          </Button>
        )}

        {isEditable && (
          <>
            <Button
              type="button"
              onClick={handleSaveDraft}
              disabled={isSaving}
              variant="secondary"
              className="gap-2"
            >
              {(createReport.isPending || updateReport.isPending) && (
                <Save className="w-4 h-4 animate-spin" />
              )}
              <Save className="w-4 h-4" />
              Salvar Rascunho
            </Button>

            {currentReportId && (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit || submitReport.isPending}
                className="gap-2"
              >
                {submitReport.isPending && <Send className="w-4 h-4 animate-spin" />}
                <Send className="w-4 h-4" />
                Enviar para Aprovação
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
