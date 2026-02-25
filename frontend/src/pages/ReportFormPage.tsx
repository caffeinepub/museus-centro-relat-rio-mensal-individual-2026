import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { Save, Send, ArrowLeft, Plus, AlertCircle, Info, Printer } from 'lucide-react';
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
import { toast } from 'sonner';
import ActivitiesList from '../components/ActivitiesList';
import ExportReportPDFButton from '../components/ExportReportPDFButton';

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - 2 + i);

export default function ReportFormPage() {
  const { reportId } = useParams({ strict: false }) as { reportId?: string };
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();

  const isCoordination = userProfile?.appRole === AppUserRole.coordination;
  const isCoordOrAdmin =
    userProfile?.appRole === AppUserRole.coordination ||
    userProfile?.appRole === AppUserRole.administration;

  const { data: existingReport, isLoading: reportLoading } = useReport(reportId);
  const { data: activities = [] } = useActivitiesForReport(reportId);

  const createReport = useCreateReport();
  const updateReport = useUpdateReport();
  const submitReport = useSubmitReport();

  const isNew = !reportId;
  const principalStr = identity?.getPrincipal().toString() ?? '';

  const [formData, setFormData] = useState<Partial<Report>>({});
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (initialized) return;
    if (isNew && userProfile && identity) {
      setFormData({
        referenceMonth: Month.february,
        year: BigInt(CURRENT_YEAR),
        professionalName: userProfile.name,
        role: userProfile.appRole,
        mainMuseum: userProfile.museum,
        workedAtOtherMuseum: false,
        executiveSummary: '',
        positivePoints: '',
        difficulties: '',
        suggestions: '',
        identifiedOpportunity: '',
        opportunityCategory: '',
        expectedImpact: '',
        status: Status.draft,
      });
      setInitialized(true);
    } else if (!isNew && existingReport) {
      setFormData(existingReport);
      setInitialized(true);
    }
  }, [isNew, existingReport, userProfile, identity, initialized]);

  // Determine if the form is read-only
  const isOwnReport = !existingReport || existingReport.authorId?.toString() === principalStr;
  const isSubmittedOrApproved =
    existingReport?.status === Status.submitted ||
    existingReport?.status === Status.approved ||
    existingReport?.status === Status.underReview;

  // Report fields are read-only when:
  // - coord/admin viewing someone else's report (they use Approvals page for that)
  // - non-coord/admin with a submitted/approved/underReview report
  const isReadOnly = !isNew && (
    (isCoordOrAdmin && !isOwnReport) ||
    (!isCoordOrAdmin && isSubmittedOrApproved)
  );

  const canEdit = isNew || !isReadOnly;

  // Coordinators can add/edit activities on any report (own or others'),
  // since the backend's canWrite allows coordination role on all reports.
  const canEditActivities = isCoordination || canEdit;

  const canSubmit =
    !isNew &&
    isOwnReport &&
    (existingReport?.status === Status.draft || existingReport?.status === Status.requiresAdjustment);

  const handleChange = (field: keyof Report, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData || !identity) return;

    try {
      const reportPayload: Report = {
        id: reportId ?? '',
        protocolNumber: existingReport?.protocolNumber ?? '',
        referenceMonth: (formData.referenceMonth ?? Month.february) as Month,
        year: formData.year ?? BigInt(CURRENT_YEAR),
        professionalName: formData.professionalName ?? userProfile?.name ?? '',
        role: formData.role ?? userProfile?.appRole ?? '',
        mainMuseum: (formData.mainMuseum ?? userProfile?.museum ?? MuseumLocation.equipePrincipal) as MuseumLocation,
        workedAtOtherMuseum: formData.workedAtOtherMuseum ?? false,
        otherMuseum: formData.otherMuseum,
        executiveSummary: formData.executiveSummary ?? '',
        positivePoints: formData.positivePoints ?? '',
        difficulties: formData.difficulties ?? '',
        suggestions: formData.suggestions ?? '',
        identifiedOpportunity: formData.identifiedOpportunity ?? '',
        opportunityCategory: formData.opportunityCategory ?? '',
        expectedImpact: formData.expectedImpact ?? '',
        status: formData.status ?? Status.draft,
        sendDate: formData.sendDate,
        signature: formData.signature,
        authorId: identity.getPrincipal() as unknown as Report['authorId'],
        generalExecutiveSummary: formData.generalExecutiveSummary,
        consolidatedGoals: formData.consolidatedGoals,
        institutionalObservations: formData.institutionalObservations,
        submittedAt: formData.submittedAt,
        approvedAt: formData.approvedAt,
        coordinatorComments: formData.coordinatorComments,
        coordinatorSignature: formData.coordinatorSignature,
      };

      if (isNew) {
        const newId = await createReport.mutateAsync(reportPayload);
        toast.success('Relatório criado com sucesso!');
        navigate({ to: '/reports/$reportId', params: { reportId: newId } });
      } else {
        await updateReport.mutateAsync({ reportId: reportId!, updated: reportPayload });
        toast.success('Relatório salvo com sucesso!');
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erro ao salvar relatório';
      toast.error(msg);
    }
  };

  const handleSubmit = async () => {
    if (!reportId) return;
    try {
      await submitReport.mutateAsync(reportId);
      toast.success('Relatório enviado para aprovação!');
      navigate({ to: '/reports' });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erro ao enviar relatório';
      toast.error(msg);
    }
  };

  if (reportLoading || (!initialized && !isNew)) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const isSaving = createReport.isPending || updateReport.isPending;
  const isSubmitting = submitReport.isPending;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/reports' })}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {isNew ? 'Novo Relatório' : 'Editar Relatório'}
            </h1>
            {existingReport && (
              <p className="text-sm text-muted-foreground font-mono">{existingReport.protocolNumber}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {existingReport && (
            <ExportReportPDFButton report={existingReport} activities={activities} />
          )}
          {canEdit && (
            <Button onClick={handleSave} disabled={isSaving} variant="outline">
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Salvando...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Salvar
                </span>
              )}
            </Button>
          )}
          {canSubmit && (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Enviando...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Enviar para Aprovação
                </span>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Read-only alerts */}
      {isReadOnly && isCoordOrAdmin && !isOwnReport && (
        <Alert className="mb-4">
          <Info className="h-4 w-4" />
          <AlertDescription>
            Você está visualizando o relatório de outro profissional. Para aprovar ou devolver, acesse a página de Aprovações. Você pode inserir atividades neste relatório.
          </AlertDescription>
        </Alert>
      )}
      {isReadOnly && !isCoordOrAdmin && isSubmittedOrApproved && (
        <Alert className="mb-4">
          <Info className="h-4 w-4" />
          <AlertDescription>
            Este relatório foi enviado e não pode mais ser editado. Aguarde o retorno do coordenador.
          </AlertDescription>
        </Alert>
      )}
      {existingReport?.coordinatorComments && (
        <Alert className="mb-4" variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Comentário do coordenador:</strong> {existingReport.coordinatorComments}
          </AlertDescription>
        </Alert>
      )}

      {/* Form */}
      <div className="space-y-6">
        {/* Basic Info */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Informações Básicas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="professionalName">Nome do Profissional</Label>
              <Input
                id="professionalName"
                value={formData.professionalName ?? ''}
                onChange={(e) => handleChange('professionalName', e.target.value)}
                disabled={isReadOnly}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="role">Cargo/Função</Label>
              <Input
                id="role"
                value={formData.role ?? ''}
                onChange={(e) => handleChange('role', e.target.value)}
                disabled={isReadOnly}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Mês de Referência</Label>
              <Select
                value={(formData.referenceMonth as string) ?? Month.february}
                onValueChange={(v) => handleChange('referenceMonth', v as Month)}
                disabled={isReadOnly}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m) => (
                    <SelectItem key={m} value={m}>{getMonthLabel(m)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Ano</Label>
              <Select
                value={formData.year?.toString() ?? CURRENT_YEAR.toString()}
                onValueChange={(v) => handleChange('year', BigInt(v))}
                disabled={isReadOnly}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {YEARS.map((y) => (
                    <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Equipe/Museu Principal</Label>
              <Select
                value={(formData.mainMuseum as string) ?? MuseumLocation.equipePrincipal}
                onValueChange={(v) => handleChange('mainMuseum', v as MuseumLocation)}
                disabled={isReadOnly}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MUSEUM_LOCATIONS.map((m) => (
                    <SelectItem key={m} value={m}>{getMuseumLabel(m)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Narrative Fields */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Narrativa do Relatório</h2>
          <div className="space-y-4">
            {[
              { field: 'executiveSummary', label: 'Resumo Executivo' },
              { field: 'positivePoints', label: 'Pontos Positivos' },
              { field: 'difficulties', label: 'Dificuldades' },
              { field: 'suggestions', label: 'Sugestões' },
            ].map(({ field, label }) => (
              <div key={field}>
                <Label htmlFor={field}>{label}</Label>
                <Textarea
                  id={field}
                  value={(formData[field as keyof Report] as string) ?? ''}
                  onChange={(e) => handleChange(field as keyof Report, e.target.value)}
                  disabled={isReadOnly}
                  className="mt-1 min-h-24"
                  placeholder={`Digite ${label.toLowerCase()}...`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Opportunities */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Oportunidades e Impacto</h2>
          <div className="space-y-4">
            {[
              { field: 'identifiedOpportunity', label: 'Oportunidade Identificada' },
              { field: 'opportunityCategory', label: 'Categoria da Oportunidade' },
              { field: 'expectedImpact', label: 'Impacto Esperado' },
            ].map(({ field, label }) => (
              <div key={field}>
                <Label htmlFor={field}>{label}</Label>
                <Textarea
                  id={field}
                  value={(formData[field as keyof Report] as string) ?? ''}
                  onChange={(e) => handleChange(field as keyof Report, e.target.value)}
                  disabled={isReadOnly}
                  className="mt-1 min-h-20"
                  placeholder={`Digite ${label.toLowerCase()}...`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Coordination Fields (only for coord/admin) */}
        {isCoordOrAdmin && existingReport && (
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Campos de Coordenação</h2>
            <div className="space-y-4">
              {[
                { field: 'generalExecutiveSummary', label: 'Resumo Executivo Geral' },
                { field: 'consolidatedGoals', label: 'Metas Consolidadas' },
                { field: 'institutionalObservations', label: 'Observações Institucionais' },
              ].map(({ field, label }) => (
                <div key={field}>
                  <Label htmlFor={field}>{label}</Label>
                  <Textarea
                    id={field}
                    value={(formData[field as keyof Report] as string) ?? ''}
                    onChange={(e) => handleChange(field as keyof Report, e.target.value)}
                    className="mt-1 min-h-20"
                    placeholder={`Digite ${label.toLowerCase()}...`}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Activities Section */}
        {!isNew && reportId && (
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">
                Atividades ({activities.length})
              </h2>
              {canEditActivities && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    navigate({
                      to: '/reports/$reportId/activities/new',
                      params: { reportId: reportId! },
                    })
                  }
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Atividade
                </Button>
              )}
            </div>
            <ActivitiesList reportId={reportId} canEdit={canEditActivities} />
          </div>
        )}
      </div>
    </div>
  );
}
