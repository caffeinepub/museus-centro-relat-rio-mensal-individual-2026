import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams, useSearch } from '@tanstack/react-router';
import {
  useCreateReport,
  useUpdateReport,
  useSubmitReport,
  useGetReport,
  useGetCallerUserProfile,
  useActivitiesForReport,
} from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import {
  Status,
  Month,
  MuseumLocation,
  AppUserRole,
  ReportCreate,
  Report,
} from '../backend';
import {
  getMonthLabel,
  getMuseumLabel,
  MONTHS,
  MUSEUM_LOCATIONS,
  getCurrentMonth,
  getCurrentYear,
} from '../utils/labels';
import SignatureCanvas, { SignatureCanvasHandle } from '../components/SignatureCanvas';
import ActivitiesList from '../components/ActivitiesList';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save, Send, Loader2, FileText, Activity } from 'lucide-react';
import { statusLabel } from '../utils/labels';

interface ReportFormState {
  referenceMonth: Month;
  year: number;
  professionalName: string;
  role: string;
  mainMuseum: MuseumLocation;
  workedAtOtherMuseum: boolean;
  otherMuseum: string;
  executiveSummary: string;
  positivePoints: string;
  difficulties: string;
  suggestions: string;
  identifiedOpportunity: string;
  opportunityCategory: string;
  expectedImpact: string;
}

function getDefaultMonth(): Month {
  const m = getCurrentMonth();
  return m ?? Month.february;
}

export default function ReportFormPage() {
  const navigate = useNavigate();
  const params = useParams({ strict: false }) as { reportId?: string };
  const reportId = params.reportId;
  const isEditing = !!reportId;

  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: existingReport, isLoading: reportLoading } = useGetReport(reportId ?? '');

  const createMutation = useCreateReport();
  const updateMutation = useUpdateReport();
  const submitMutation = useSubmitReport();

  const signatureRef = useRef<SignatureCanvasHandle>(null);

  const [activeTab, setActiveTab] = useState('form');
  const [form, setForm] = useState<ReportFormState>({
    referenceMonth: getDefaultMonth(),
    year: getCurrentYear(),
    professionalName: userProfile?.name ?? '',
    role: userProfile?.appRole ?? '',
    mainMuseum: userProfile?.museum ?? MuseumLocation.equipePrincipal,
    workedAtOtherMuseum: false,
    otherMuseum: '',
    executiveSummary: '',
    positivePoints: '',
    difficulties: '',
    suggestions: '',
    identifiedOpportunity: '',
    opportunityCategory: '',
    expectedImpact: '',
  });

  // Populate form when editing
  useEffect(() => {
    if (existingReport) {
      setForm({
        referenceMonth: existingReport.referenceMonth,
        year: Number(existingReport.year),
        professionalName: existingReport.professionalName,
        role: existingReport.role,
        mainMuseum: existingReport.mainMuseum,
        workedAtOtherMuseum: existingReport.workedAtOtherMuseum,
        otherMuseum: existingReport.otherMuseum ?? '',
        executiveSummary: existingReport.executiveSummary,
        positivePoints: existingReport.positivePoints,
        difficulties: existingReport.difficulties,
        suggestions: existingReport.suggestions,
        identifiedOpportunity: existingReport.identifiedOpportunity,
        opportunityCategory: existingReport.opportunityCategory,
        expectedImpact: existingReport.expectedImpact,
      });
    }
  }, [existingReport]);

  // Populate name/role/museum from profile on create
  useEffect(() => {
    if (!isEditing && userProfile) {
      setForm((prev) => ({
        ...prev,
        professionalName: userProfile.name,
        role: prev.role || userProfile.appRole,
        mainMuseum: userProfile.museum,
      }));
    }
  }, [userProfile, isEditing]);

  const isCoordinatorOrAdmin =
    userProfile?.appRole === AppUserRole.coordination ||
    userProfile?.appRole === AppUserRole.coordinator ||
    userProfile?.appRole === AppUserRole.administration;

  const canEdit =
    isCoordinatorOrAdmin ||
    !isEditing ||
    (existingReport &&
      (existingReport.status === Status.draft ||
        existingReport.status === Status.requiresAdjustment));

  const handleChange = (field: keyof ReportFormState, value: string | boolean | number | Month | MuseumLocation) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (submitAfter = false) => {
    if (!identity) return;
    const principal = identity.getPrincipal();

    const reportData: ReportCreate = {
      referenceMonth: form.referenceMonth,
      year: BigInt(form.year),
      professionalName: form.professionalName,
      role: form.role,
      mainMuseum: form.mainMuseum,
      workedAtOtherMuseum: form.workedAtOtherMuseum,
      otherMuseum: form.otherMuseum || undefined,
      executiveSummary: form.executiveSummary,
      positivePoints: form.positivePoints,
      difficulties: form.difficulties,
      suggestions: form.suggestions,
      identifiedOpportunity: form.identifiedOpportunity,
      opportunityCategory: form.opportunityCategory,
      expectedImpact: form.expectedImpact,
      status: Status.draft,
      authorId: principal,
    };

    if (isEditing && existingReport) {
      const signatureBase64 = signatureRef.current?.getSignatureBase64();
      const updatedReport: Report = {
        ...existingReport,
        ...reportData,
        id: reportId!,
        protocolNumber: existingReport.protocolNumber,
        authorId: existingReport.authorId,
        signature: signatureBase64 ?? existingReport.signature,
        sendDate: existingReport.sendDate,
        submittedAt: existingReport.submittedAt,
        approvedAt: existingReport.approvedAt,
        coordinatorComments: existingReport.coordinatorComments,
        coordinatorSignature: existingReport.coordinatorSignature,
        generalExecutiveSummary: existingReport.generalExecutiveSummary,
        consolidatedGoals: existingReport.consolidatedGoals,
        institutionalObservations: existingReport.institutionalObservations,
      };
      await updateMutation.mutateAsync({ reportId: reportId!, report: updatedReport });
      if (submitAfter) {
        await submitMutation.mutateAsync(reportId!);
      }
      navigate({ to: '/reports' });
    } else {
      const newId = await createMutation.mutateAsync(reportData);
      if (submitAfter) {
        await submitMutation.mutateAsync(newId);
      }
      navigate({ to: '/reports' });
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const isSubmitting = submitMutation.isPending;

  if (isEditing && reportLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/reports' })}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="font-semibold text-foreground">
              {isEditing ? 'Editar Relatório' : 'Novo Relatório'}
            </h1>
            {existingReport && (
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant="outline" className="text-xs">
                  {statusLabel(existingReport.status)}
                </Badge>
                <span className="text-xs text-muted-foreground">{existingReport.protocolNumber}</span>
              </div>
            )}
          </div>
        </div>

        {canEdit && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSave(false)}
              disabled={isSaving || isSubmitting}
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
              Salvar
            </Button>
            <Button
              size="sm"
              onClick={() => handleSave(true)}
              disabled={isSaving || isSubmitting}
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Send className="h-4 w-4 mr-1" />}
              Submeter
            </Button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="mx-4 mt-3 w-fit">
          <TabsTrigger value="form" className="flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            Relatório
          </TabsTrigger>
          {isEditing && (
            <TabsTrigger value="activities" className="flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5" />
              Atividades
            </TabsTrigger>
          )}
        </TabsList>

        {/* Form Tab */}
        <TabsContent value="form" className="flex-1 overflow-y-auto p-4 space-y-4 mt-0">
          {/* Basic Info */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Mês de Referência</Label>
                  <Select
                    value={form.referenceMonth}
                    onValueChange={(v) => handleChange('referenceMonth', v as Month)}
                    disabled={!canEdit}
                  >
                    <SelectTrigger className="mt-1">
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
                <div>
                  <Label className="text-xs">Ano</Label>
                  <Input
                    type="number"
                    value={form.year}
                    onChange={(e) => handleChange('year', parseInt(e.target.value))}
                    className="mt-1"
                    disabled={!canEdit}
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs">Nome do Profissional</Label>
                <Input
                  value={form.professionalName}
                  onChange={(e) => handleChange('professionalName', e.target.value)}
                  className="mt-1"
                  disabled={!canEdit}
                />
              </div>

              <div>
                <Label className="text-xs">Cargo / Função</Label>
                <Input
                  value={form.role}
                  onChange={(e) => handleChange('role', e.target.value)}
                  className="mt-1"
                  disabled={!canEdit}
                />
              </div>

              <div>
                <Label className="text-xs">Museu Principal</Label>
                <Select
                  value={form.mainMuseum}
                  onValueChange={(v) => handleChange('mainMuseum', v as MuseumLocation)}
                  disabled={!canEdit}
                >
                  <SelectTrigger className="mt-1">
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

              <div className="flex items-center gap-3">
                <Switch
                  checked={form.workedAtOtherMuseum}
                  onCheckedChange={(v) => handleChange('workedAtOtherMuseum', v)}
                  disabled={!canEdit}
                />
                <Label className="text-xs">Atuou em outro museu?</Label>
              </div>

              {form.workedAtOtherMuseum && (
                <div>
                  <Label className="text-xs">Outro Museu</Label>
                  <Input
                    value={form.otherMuseum}
                    onChange={(e) => handleChange('otherMuseum', e.target.value)}
                    className="mt-1"
                    disabled={!canEdit}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Report Content */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Conteúdo do Relatório</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs">Resumo Executivo *</Label>
                <Textarea
                  value={form.executiveSummary}
                  onChange={(e) => handleChange('executiveSummary', e.target.value)}
                  rows={4}
                  className="mt-1"
                  disabled={!canEdit}
                  placeholder="Descreva as principais atividades e resultados do período..."
                />
              </div>

              <div>
                <Label className="text-xs">Pontos Positivos</Label>
                <Textarea
                  value={form.positivePoints}
                  onChange={(e) => handleChange('positivePoints', e.target.value)}
                  rows={3}
                  className="mt-1"
                  disabled={!canEdit}
                />
              </div>

              <div>
                <Label className="text-xs">Dificuldades</Label>
                <Textarea
                  value={form.difficulties}
                  onChange={(e) => handleChange('difficulties', e.target.value)}
                  rows={3}
                  className="mt-1"
                  disabled={!canEdit}
                />
              </div>

              <div>
                <Label className="text-xs">Sugestões</Label>
                <Textarea
                  value={form.suggestions}
                  onChange={(e) => handleChange('suggestions', e.target.value)}
                  rows={3}
                  className="mt-1"
                  disabled={!canEdit}
                />
              </div>
            </CardContent>
          </Card>

          {/* Opportunity */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Oportunidade Identificada</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs">Oportunidade</Label>
                <Textarea
                  value={form.identifiedOpportunity}
                  onChange={(e) => handleChange('identifiedOpportunity', e.target.value)}
                  rows={3}
                  className="mt-1"
                  disabled={!canEdit}
                />
              </div>
              <div>
                <Label className="text-xs">Categoria</Label>
                <Input
                  value={form.opportunityCategory}
                  onChange={(e) => handleChange('opportunityCategory', e.target.value)}
                  className="mt-1"
                  disabled={!canEdit}
                />
              </div>
              <div>
                <Label className="text-xs">Impacto Esperado</Label>
                <Textarea
                  value={form.expectedImpact}
                  onChange={(e) => handleChange('expectedImpact', e.target.value)}
                  rows={2}
                  className="mt-1"
                  disabled={!canEdit}
                />
              </div>
            </CardContent>
          </Card>

          {/* Signature */}
          {canEdit && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Assinatura</CardTitle>
              </CardHeader>
              <CardContent>
                <SignatureCanvas ref={signatureRef} />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Activities Tab */}
        {isEditing && existingReport && (
          <TabsContent value="activities" className="flex-1 overflow-y-auto p-4 mt-0">
            <ActivitiesList report={existingReport} userRole={userProfile?.appRole} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
