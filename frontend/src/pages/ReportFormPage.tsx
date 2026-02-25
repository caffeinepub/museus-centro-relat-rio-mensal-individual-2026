import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { Save, Send, ArrowLeft, Plus, AlertCircle, Info } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import {
  useGetCallerUserProfile,
  useReport,
  useCreateReport,
  useUpdateReport,
  useSubmitReport,
  useActivitiesForReport,
} from '../hooks/useQueries';
import { AppUserRole, Status, Month, MuseumLocation } from '../backend';
import type { Report } from '../backend';
import { getMonthLabel, getMuseumLabel, MUSEUM_LOCATIONS, MONTHS } from '../utils/labels';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import ActivitiesList from '../components/ActivitiesList';
import ExportReportPDFButton from '../components/ExportReportPDFButton';

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - 2 + i);

function emptyReport(authorId: string, museum: MuseumLocation): Report {
  return {
    id: '',
    protocolNumber: '',
    referenceMonth: Month.february,
    year: BigInt(CURRENT_YEAR),
    professionalName: '',
    role: '',
    mainMuseum: museum,
    workedAtOtherMuseum: false,
    otherMuseum: undefined,
    executiveSummary: '',
    positivePoints: '',
    difficulties: '',
    suggestions: '',
    identifiedOpportunity: '',
    opportunityCategory: '',
    expectedImpact: '',
    status: Status.draft,
    sendDate: undefined,
    signature: undefined,
    authorId: authorId as unknown as import('../backend').Report['authorId'],
    generalExecutiveSummary: undefined,
    consolidatedGoals: undefined,
    institutionalObservations: undefined,
    submittedAt: undefined,
    approvedAt: undefined,
    coordinatorComments: undefined,
    coordinatorSignature: undefined,
  };
}

export default function ReportFormPage() {
  const { reportId } = useParams({ strict: false }) as { reportId?: string };
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();

  const isCoordination = userProfile?.appRole === AppUserRole.coordination;
  const isCoordinator = userProfile?.appRole === AppUserRole.coordinator;
  const isCoordOrAdmin =
    userProfile?.appRole === AppUserRole.coordination ||
    userProfile?.appRole === AppUserRole.coordinator ||
    userProfile?.appRole === AppUserRole.administration;

  const isNew = !reportId || reportId === 'new';

  const { data: existingReport, isLoading: reportLoading } = useReport(isNew ? undefined : reportId);
  const { data: activities } = useActivitiesForReport(isNew ? undefined : reportId);

  const createReport = useCreateReport();
  const updateReport = useUpdateReport();
  const submitReport = useSubmitReport();

  const [form, setForm] = useState<Report | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialized) return;
    if (isNew && identity && userProfile) {
      setForm(emptyReport(identity.getPrincipal().toString(), userProfile.museum));
      setInitialized(true);
    } else if (!isNew && existingReport) {
      setForm(existingReport);
      setInitialized(true);
    }
  }, [isNew, existingReport, identity, userProfile, initialized]);

  const updateField = <K extends keyof Report>(key: K, value: Report[K]) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  // Determine edit permissions
  const isOwner = form?.authorId?.toString() === identity?.getPrincipal().toString();
  const isEditableStatus = form?.status === Status.draft || form?.status === Status.requiresAdjustment;
  const canEditReportFields = isCoordOrAdmin || (isOwner && isEditableStatus);
  const canEditActivities = isCoordOrAdmin || (isOwner && isEditableStatus);

  const handleSave = async () => {
    if (!form) return;
    setError(null);

    try {
      if (isNew) {
        const newId = await createReport.mutateAsync(form);
        toast.success('Relatório criado com sucesso!');
        navigate({ to: `/reports/${newId}` });
      } else {
        await updateReport.mutateAsync({ reportId: reportId!, report: form });
        toast.success('Relatório atualizado com sucesso!');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao salvar relatório.';
      setError(msg);
      toast.error(msg);
    }
  };

  const handleSubmit = async () => {
    if (!form || !reportId) return;
    setError(null);

    try {
      // Save first if needed
      if (form.status === Status.draft) {
        await updateReport.mutateAsync({ reportId, report: form });
      }
      await submitReport.mutateAsync(reportId);
      toast.success('Relatório enviado para aprovação!');
      navigate({ to: '/reports' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao enviar relatório.';
      setError(msg);
      toast.error(msg);
    }
  };

  if (reportLoading || (!initialized && !isNew)) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!form) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Erro ao carregar relatório.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const isSaving = createReport.isPending || updateReport.isPending;
  const isSubmitting = submitReport.isPending;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate({ to: '/reports' })}
          className="rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">
            {isNew ? 'Novo Relatório' : 'Editar Relatório'}
          </h1>
          {!isNew && form.protocolNumber && (
            <p className="text-sm text-muted-foreground mt-0.5">
              Protocolo: {form.protocolNumber}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!isNew && <ExportReportPDFButton report={form} activities={activities ?? []} />}
          {canEditReportFields && (
            <Button onClick={handleSave} disabled={isSaving} variant="outline">
              {isSaving ? (
                <>
                  <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </>
              )}
            </Button>
          )}
          {!isNew && isOwner && isEditableStatus && (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar para Aprovação
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!canEditReportFields && !isNew && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Este relatório está em modo somente leitura.
            {isCoordOrAdmin && ' Coordenadores podem inserir e editar atividades.'}
          </AlertDescription>
        </Alert>
      )}

      {/* Basic Info */}
      <div className="card-section">
        <h2 className="section-title">Informações Básicas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <Label htmlFor="professionalName">Nome do Profissional *</Label>
            <Input
              id="professionalName"
              value={form.professionalName}
              onChange={(e) => updateField('professionalName', e.target.value)}
              disabled={!canEditReportFields}
              placeholder="Nome completo"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="role">Função *</Label>
            <Input
              id="role"
              value={form.role}
              onChange={(e) => updateField('role', e.target.value)}
              disabled={!canEditReportFields}
              placeholder="Cargo ou função"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="referenceMonth">Mês de Referência *</Label>
            <Select
              value={form.referenceMonth}
              onValueChange={(v) => updateField('referenceMonth', v as Month)}
              disabled={!canEditReportFields}
            >
              <SelectTrigger id="referenceMonth">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {getMonthLabel(m)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="year">Ano *</Label>
            <Select
              value={String(form.year)}
              onValueChange={(v) => updateField('year', BigInt(v))}
              disabled={!canEditReportFields}
            >
              <SelectTrigger id="year">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {YEARS.map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="mainMuseum">Equipe/Museu Principal *</Label>
            <Select
              value={form.mainMuseum}
              onValueChange={(v) => updateField('mainMuseum', v as MuseumLocation)}
              disabled={!canEditReportFields}
            >
              <SelectTrigger id="mainMuseum">
                <SelectValue />
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
              <Checkbox
                checked={form.workedAtOtherMuseum}
                onCheckedChange={(checked) => updateField('workedAtOtherMuseum', !!checked)}
                disabled={!canEditReportFields}
              />
              Atuou em outro museu?
            </Label>
            {form.workedAtOtherMuseum && (
              <Input
                value={form.otherMuseum ?? ''}
                onChange={(e) => updateField('otherMuseum', e.target.value || undefined)}
                disabled={!canEditReportFields}
                placeholder="Nome do outro museu"
              />
            )}
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div className="card-section">
        <h2 className="section-title">Conteúdo do Relatório</h2>
        <div className="space-y-5">
          {[
            { key: 'executiveSummary' as const, label: 'Resumo Executivo *', placeholder: 'Descreva o resumo executivo do período' },
            { key: 'positivePoints' as const, label: 'Pontos Positivos *', placeholder: 'Descreva os pontos positivos do período' },
            { key: 'difficulties' as const, label: 'Dificuldades *', placeholder: 'Descreva as dificuldades encontradas' },
            { key: 'suggestions' as const, label: 'Sugestões *', placeholder: 'Descreva suas sugestões de melhoria' },
          ].map(({ key, label, placeholder }) => (
            <div key={key} className="space-y-1.5">
              <Label htmlFor={key}>{label}</Label>
              <Textarea
                id={key}
                value={form[key] as string}
                onChange={(e) => updateField(key, e.target.value)}
                disabled={!canEditReportFields}
                placeholder={placeholder}
                rows={3}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Opportunities */}
      <div className="card-section">
        <h2 className="section-title">Oportunidades e Impacto</h2>
        <div className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="identifiedOpportunity">Oportunidade Identificada</Label>
            <Textarea
              id="identifiedOpportunity"
              value={form.identifiedOpportunity}
              onChange={(e) => updateField('identifiedOpportunity', e.target.value)}
              disabled={!canEditReportFields}
              placeholder="Descreva a oportunidade identificada"
              rows={2}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="opportunityCategory">Categoria da Oportunidade</Label>
            <Input
              id="opportunityCategory"
              value={form.opportunityCategory}
              onChange={(e) => updateField('opportunityCategory', e.target.value)}
              disabled={!canEditReportFields}
              placeholder="Ex: Educação, Cultura, Tecnologia"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="expectedImpact">Impacto Esperado</Label>
            <Textarea
              id="expectedImpact"
              value={form.expectedImpact}
              onChange={(e) => updateField('expectedImpact', e.target.value)}
              disabled={!canEditReportFields}
              placeholder="Descreva o impacto esperado"
              rows={2}
            />
          </div>
        </div>
      </div>

      {/* Coordination Fields (read-only for non-coordinators) */}
      {(isCoordOrAdmin || form.generalExecutiveSummary || form.consolidatedGoals || form.institutionalObservations) && (
        <div className="card-section">
          <h2 className="section-title">Campos da Coordenação</h2>
          <div className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="generalExecutiveSummary">Resumo Executivo Geral</Label>
              <Textarea
                id="generalExecutiveSummary"
                value={form.generalExecutiveSummary ?? ''}
                onChange={(e) => updateField('generalExecutiveSummary', e.target.value || undefined)}
                disabled={!isCoordOrAdmin}
                placeholder="Resumo executivo consolidado pela coordenação"
                rows={3}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="consolidatedGoals">Metas Consolidadas</Label>
              <Textarea
                id="consolidatedGoals"
                value={form.consolidatedGoals ?? ''}
                onChange={(e) => updateField('consolidatedGoals', e.target.value || undefined)}
                disabled={!isCoordOrAdmin}
                placeholder="Metas consolidadas pela coordenação"
                rows={3}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="institutionalObservations">Observações Institucionais</Label>
              <Textarea
                id="institutionalObservations"
                value={form.institutionalObservations ?? ''}
                onChange={(e) => updateField('institutionalObservations', e.target.value || undefined)}
                disabled={!isCoordOrAdmin}
                placeholder="Observações institucionais"
                rows={3}
              />
            </div>
            {form.coordinatorComments && (
              <div className="space-y-1.5">
                <Label>Comentários do Coordenador</Label>
                <div className="p-3 bg-muted/50 rounded-lg text-sm text-foreground border border-border">
                  {form.coordinatorComments}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Activities */}
      {!isNew && (
        <div className="card-section">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title mb-0">Atividades</h2>
            {canEditActivities && (
              <Button
                size="sm"
                onClick={() => navigate({ to: `/reports/${reportId}/activities/new` })}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Atividade
              </Button>
            )}
          </div>
          <ActivitiesList reportId={reportId!} canEdit={canEditActivities} />
        </div>
      )}

      {/* Footer actions */}
      {canEditReportFields && (
        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button variant="outline" onClick={() => navigate({ to: '/reports' })}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {isNew ? 'Criar Relatório' : 'Salvar Alterações'}
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
