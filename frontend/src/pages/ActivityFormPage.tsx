import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearch } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import {
  useCreateActivity,
  useUpdateActivity,
  useActivity,
  useGoals,
  useListRegisteredProfessionals,
} from '../hooks/useQueries';
import {
  ActivityStatus,
  Classification,
  GoalStatus,
  AccessibilityOption,
  EvidenceType,
  ProductRealised,
  Quantity,
  AudienceRange,
  MuseumLocation,
} from '../backend';
import {
  activityStatusLabel,
  classificationLabel,
  goalStatusLabel,
  accessibilityOptionLabel,
  evidenceTypeLabel,
  productRealisedLabel,
  quantityLabel,
  audienceRangeLabel,
  getMuseumLabel,
} from '../utils/labels';

interface ActivityFormData {
  activityName: string;
  actionType: string;
  professionalName: string;
  date: string;
  startTime: string;
  endTime: string;
  museum: MuseumLocation | '';
  status: ActivityStatus;
  classification: Classification;
  executedDescription: string;
  achievedResults: string;
  qualitativeAssessment: string;
  totalAudience: number;
  children: number;
  elderly: number;
  pcd: number;
  youth: number;
  adults: number;
  dedicatedHours: string;
  hoursNotApplicable: boolean;
  goalNumber: string;
  goalDescription: string;
  plannedIndicator: string;
  quantitativeGoal: string;
  achievedResult: string;
  goalStatus: GoalStatus | '';
  technicalJustification: string;
  hadPartnership: boolean;
  partnerName: string;
  partnerType: string;
  objective: string;
  accessibilityOptions: AccessibilityOption[];
  evidences: EvidenceType[];
  productRealised: ProductRealised;
  quantity: Quantity | '';
  audienceRange: AudienceRange;
  partnershipsInvolved: string;
  cancellationReason: string;
  linkedActivityId: string;
}

const defaultFormData: ActivityFormData = {
  activityName: '',
  actionType: '',
  professionalName: '',
  date: '',
  startTime: '',
  endTime: '',
  museum: '',
  status: ActivityStatus.notStarted,
  classification: Classification.routine,
  executedDescription: '',
  achievedResults: '',
  qualitativeAssessment: '',
  totalAudience: 0,
  children: 0,
  elderly: 0,
  pcd: 0,
  youth: 0,
  adults: 0,
  dedicatedHours: '',
  hoursNotApplicable: true,
  goalNumber: '',
  goalDescription: '',
  plannedIndicator: '',
  quantitativeGoal: '',
  achievedResult: '',
  goalStatus: '',
  technicalJustification: '',
  hadPartnership: false,
  partnerName: '',
  partnerType: '',
  objective: '',
  accessibilityOptions: [],
  evidences: [],
  productRealised: ProductRealised.naoSeAplica,
  quantity: '',
  audienceRange: AudienceRange.naoSeAplica,
  partnershipsInvolved: '',
  cancellationReason: '',
  linkedActivityId: '',
};

const ACTION_TYPE_OPTIONS = [
  'Educativo',
  'Exposição',
  'Catálogo',
  'Oficina',
  'Outros',
];

const MUSEUM_OPTIONS: MuseumLocation[] = [
  MuseumLocation.equipePrincipal,
  MuseumLocation.comunicacao,
  MuseumLocation.administracao,
  MuseumLocation.programacao,
  MuseumLocation.producaoGeral,
  MuseumLocation.coordenacao,
];

export default function ActivityFormPage() {
  const navigate = useNavigate();
  const { activityId } = useParams({ strict: false }) as { activityId?: string };
  const searchParams = useSearch({ strict: false }) as { reportId?: string };
  const reportId = searchParams?.reportId;

  const isEditing = !!activityId;

  const { data: existingActivity, isLoading: loadingActivity } = useActivity(
    isEditing ? activityId : undefined
  );
  const { data: goals } = useGoals();
  const { data: professionals, isLoading: loadingProfessionals } = useListRegisteredProfessionals();

  const createActivity = useCreateActivity();
  const updateActivity = useUpdateActivity();

  const [formData, setFormData] = useState<ActivityFormData>(defaultFormData);

  useEffect(() => {
    if (existingActivity && isEditing) {
      const dateObj = existingActivity.date
        ? new Date(Number(existingActivity.date) / 1_000_000)
        : null;
      const dateStr = dateObj ? dateObj.toISOString().split('T')[0] : '';

      setFormData({
        activityName: existingActivity.activityName || '',
        actionType: existingActivity.actionType || '',
        professionalName: existingActivity.actionType || '',
        date: dateStr,
        startTime: '',
        endTime: '',
        museum: existingActivity.museum || '',
        status: existingActivity.status || ActivityStatus.notStarted,
        classification: existingActivity.classification || Classification.routine,
        executedDescription: existingActivity.executedDescription || '',
        achievedResults: existingActivity.achievedResults || '',
        qualitativeAssessment: existingActivity.qualitativeAssessment || '',
        totalAudience: Number(existingActivity.totalAudience) || 0,
        children: Number(existingActivity.children) || 0,
        elderly: Number(existingActivity.elderly) || 0,
        pcd: Number(existingActivity.pcd) || 0,
        youth: Number(existingActivity.youth) || 0,
        adults: Number(existingActivity.adults) || 0,
        dedicatedHours: existingActivity.dedicatedHours != null
          ? String(existingActivity.dedicatedHours)
          : '',
        hoursNotApplicable: existingActivity.hoursNotApplicable ?? true,
        goalNumber: existingActivity.goalNumber != null
          ? String(existingActivity.goalNumber)
          : '',
        goalDescription: existingActivity.goalDescription || '',
        plannedIndicator: existingActivity.plannedIndicator || '',
        quantitativeGoal: existingActivity.quantitativeGoal != null
          ? String(existingActivity.quantitativeGoal)
          : '',
        achievedResult: existingActivity.achievedResult != null
          ? String(existingActivity.achievedResult)
          : '',
        goalStatus: existingActivity.goalStatus || '',
        technicalJustification: existingActivity.technicalJustification || '',
        hadPartnership: existingActivity.hadPartnership || false,
        partnerName: existingActivity.partnerName || '',
        partnerType: existingActivity.partnerType || '',
        objective: existingActivity.objective || '',
        accessibilityOptions: existingActivity.accessibilityOptions || [],
        evidences: existingActivity.evidences || [],
        productRealised: existingActivity.productRealised || ProductRealised.naoSeAplica,
        quantity: existingActivity.quantity || '',
        audienceRange: existingActivity.audienceRange || AudienceRange.naoSeAplica,
        partnershipsInvolved: existingActivity.partnershipsInvolved || '',
        cancellationReason: existingActivity.cancellationReason || '',
        linkedActivityId: existingActivity.linkedActivityId || '',
      });
    }
  }, [existingActivity, isEditing]);

  const updateField = <K extends keyof ActivityFormData>(
    field: K,
    value: ActivityFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = <T,>(array: T[], item: T): T[] => {
    return array.includes(item) ? array.filter((i) => i !== item) : [...array, item];
  };

  const handleSave = async () => {
    if (!reportId && !isEditing) return;

    const targetReportId = isEditing
      ? existingActivity?.reportId || reportId || ''
      : reportId || '';

    // Parse date
    let dateTimestamp: bigint = BigInt(0);
    if (formData.date) {
      const dateStr = formData.startTime
        ? `${formData.date}T${formData.startTime}:00`
        : `${formData.date}T00:00:00`;
      dateTimestamp = BigInt(new Date(dateStr).getTime()) * BigInt(1_000_000);
    }

    // Resolve hours
    let dedicatedHours: bigint | undefined = undefined;
    let hoursNotApplicable = formData.hoursNotApplicable;

    if (!hoursNotApplicable && formData.dedicatedHours !== '') {
      dedicatedHours = BigInt(parseInt(formData.dedicatedHours, 10) || 0);
    } else {
      hoursNotApplicable = true;
      dedicatedHours = undefined;
    }

    const activityPayload = {
      id: isEditing ? activityId! : '',
      reportId: targetReportId,
      date: dateTimestamp,
      museum: formData.museum || MuseumLocation.equipePrincipal,
      actionType: formData.actionType || '',
      activityName: formData.activityName || '',
      dedicatedHours: dedicatedHours,
      hoursNotApplicable,
      classification: formData.classification,
      goalNumber: formData.goalNumber ? BigInt(parseInt(formData.goalNumber, 10)) : undefined,
      goalDescription: formData.goalDescription || undefined,
      plannedIndicator: formData.plannedIndicator || undefined,
      quantitativeGoal: formData.quantitativeGoal
        ? BigInt(parseInt(formData.quantitativeGoal, 10))
        : undefined,
      achievedResult: formData.achievedResult
        ? BigInt(parseInt(formData.achievedResult, 10))
        : undefined,
      contributionPercent: undefined,
      goalStatus: formData.goalStatus || undefined,
      technicalJustification: formData.technicalJustification || undefined,
      totalAudience: BigInt(formData.totalAudience),
      children: BigInt(formData.children),
      youth: BigInt(formData.youth),
      adults: BigInt(formData.adults),
      elderly: BigInt(formData.elderly),
      pcd: BigInt(formData.pcd),
      accessibilityOptions: formData.accessibilityOptions,
      hadPartnership: formData.hadPartnership,
      partnerName: formData.partnerName || undefined,
      partnerType: formData.partnerType || undefined,
      objective: formData.objective || undefined,
      executedDescription: formData.executedDescription || '',
      achievedResults: formData.achievedResults || '',
      qualitativeAssessment: formData.qualitativeAssessment || '',
      evidences: formData.evidences,
      attachmentsPrefix: '',
      productRealised: formData.productRealised,
      quantity: formData.quantity || undefined,
      audienceRange: formData.audienceRange,
      partnershipsInvolved: formData.partnershipsInvolved || undefined,
      status: formData.status,
      cancellationReason: formData.cancellationReason || undefined,
      files: [],
      linkedActivityId: formData.linkedActivityId || undefined,
    };

    try {
      if (isEditing) {
        await updateActivity.mutateAsync({
          activityId: activityId!,
          activity: activityPayload as any,
        });
      } else {
        await createActivity.mutateAsync(activityPayload as any);
      }
      navigate({ to: `/reports/${targetReportId}` });
    } catch (error) {
      console.error('Error saving activity:', error);
    }
  };

  const isSaving = createActivity.isPending || updateActivity.isPending;

  if (loadingActivity && isEditing) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate({ to: reportId ? `/reports/${reportId}` : '/reports' })}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isEditing ? 'Editar Atividade' : 'Nova Atividade'}
          </h1>
          <p className="text-muted-foreground text-sm">
            {isEditing ? 'Atualize os dados da atividade' : 'Preencha os dados da nova atividade'}
          </p>
        </div>
      </div>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Informações Básicas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="activityName">Nome da Atividade</Label>
              <Input
                id="activityName"
                value={formData.activityName}
                onChange={(e) => updateField('activityName', e.target.value)}
                placeholder="Nome da atividade"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="actionType">Tipo de Ação</Label>
              <Select
                value={formData.actionType}
                onValueChange={(val) => updateField('actionType', val)}
              >
                <SelectTrigger id="actionType" className="bg-background border-border">
                  <SelectValue placeholder="Selecione o tipo de ação" />
                </SelectTrigger>
                <SelectContent className="bg-background border-border">
                  {ACTION_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Profissional - dropdown from registered users */}
            <div className="space-y-2">
              <Label htmlFor="professionalName">Profissional</Label>
              <Select
                value={formData.professionalName}
                onValueChange={(val) => updateField('professionalName', val)}
                disabled={loadingProfessionals}
              >
                <SelectTrigger id="professionalName" className="bg-background border-border">
                  <SelectValue
                    placeholder={
                      loadingProfessionals ? 'Carregando...' : 'Selecione o profissional'
                    }
                  />
                </SelectTrigger>
                <SelectContent className="bg-background border-border">
                  {professionals && professionals.length > 0 ? (
                    professionals.map((p) => (
                      <SelectItem key={p.principal.toString()} value={p.name}>
                        {p.name}
                      </SelectItem>
                    ))
                  ) : (
                    !loadingProfessionals && (
                      <SelectItem value="__none__" disabled>
                        Nenhum profissional registado
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="museum">Local Realizado</Label>
              <Select
                value={formData.museum}
                onValueChange={(val) => updateField('museum', val as MuseumLocation)}
              >
                <SelectTrigger id="museum" className="bg-background border-border">
                  <SelectValue placeholder="Selecione o local" />
                </SelectTrigger>
                <SelectContent className="bg-background border-border">
                  {MUSEUM_OPTIONS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {getMuseumLabel(m)}
                    </SelectItem>
                  ))}
                  <SelectItem value="outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Data de Início</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => updateField('date', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startTime">Horário de Início</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => updateField('startTime', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">Horário de Fim</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => updateField('endTime', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(val) => updateField('status', val as ActivityStatus)}
              >
                <SelectTrigger id="status" className="bg-background border-border">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent className="bg-background border-border">
                  {Object.values(ActivityStatus).map((s) => (
                    <SelectItem key={s} value={s}>
                      {activityStatusLabel(s)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="classification">Classificação</Label>
              <Select
                value={formData.classification}
                onValueChange={(val) => updateField('classification', val as Classification)}
              >
                <SelectTrigger id="classification" className="bg-background border-border">
                  <SelectValue placeholder="Selecione a classificação" />
                </SelectTrigger>
                <SelectContent className="bg-background border-border">
                  {Object.values(Classification).map((c) => (
                    <SelectItem key={c} value={c}>
                      {classificationLabel(c)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cancellation */}
      {formData.status === ActivityStatus.cancelled && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Motivo do Cancelamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="cancellationReason">Motivo</Label>
              <Textarea
                id="cancellationReason"
                value={formData.cancellationReason}
                onChange={(e) => updateField('cancellationReason', e.target.value)}
                placeholder="Descreva o motivo do cancelamento"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Goal Info */}
      {formData.classification === Classification.goalLinked && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informações da Meta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="goalNumber">Número da Meta</Label>
                <Select
                  value={formData.goalNumber}
                  onValueChange={(val) => updateField('goalNumber', val)}
                >
                  <SelectTrigger id="goalNumber" className="bg-background border-border">
                    <SelectValue placeholder="Selecione a meta" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border">
                    {goals?.map((g) => (
                      <SelectItem key={String(g.id)} value={String(g.id)}>
                        {String(g.id)} - {g.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="goalStatus">Status da Meta</Label>
                <Select
                  value={formData.goalStatus}
                  onValueChange={(val) => updateField('goalStatus', val as GoalStatus)}
                >
                  <SelectTrigger id="goalStatus" className="bg-background border-border">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border">
                    {Object.values(GoalStatus).map((gs) => (
                      <SelectItem key={gs} value={gs}>
                        {goalStatusLabel(gs)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="goalDescription">Descrição da Meta</Label>
              <Textarea
                id="goalDescription"
                value={formData.goalDescription}
                onChange={(e) => updateField('goalDescription', e.target.value)}
                placeholder="Descrição da meta"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="plannedIndicator">Indicador Planejado</Label>
                <Input
                  id="plannedIndicator"
                  value={formData.plannedIndicator}
                  onChange={(e) => updateField('plannedIndicator', e.target.value)}
                  placeholder="Indicador"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantitativeGoal">Meta Quantitativa</Label>
                <Input
                  id="quantitativeGoal"
                  type="number"
                  value={formData.quantitativeGoal}
                  onChange={(e) => updateField('quantitativeGoal', e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="achievedResult">Resultado Alcançado</Label>
                <Input
                  id="achievedResult"
                  type="number"
                  value={formData.achievedResult}
                  onChange={(e) => updateField('achievedResult', e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="technicalJustification">Justificativa Técnica</Label>
              <Textarea
                id="technicalJustification"
                value={formData.technicalJustification}
                onChange={(e) => updateField('technicalJustification', e.target.value)}
                placeholder="Justificativa técnica"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Audience */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Público</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="totalAudience">Total de Público</Label>
              <Input
                id="totalAudience"
                type="number"
                min={0}
                value={formData.totalAudience}
                onChange={(e) => updateField('totalAudience', parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="children">Crianças</Label>
              <Input
                id="children"
                type="number"
                min={0}
                value={formData.children}
                onChange={(e) => updateField('children', parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="elderly">Idosos</Label>
              <Input
                id="elderly"
                type="number"
                min={0}
                value={formData.elderly}
                onChange={(e) => updateField('elderly', parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="youth">Jovens</Label>
              <Input
                id="youth"
                type="number"
                min={0}
                value={formData.youth}
                onChange={(e) => updateField('youth', parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adults">Adultos</Label>
              <Input
                id="adults"
                type="number"
                min={0}
                value={formData.adults}
                onChange={(e) => updateField('adults', parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pcd">PCD</Label>
              <Input
                id="pcd"
                type="number"
                min={0}
                value={formData.pcd}
                onChange={(e) => updateField('pcd', parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="audienceRange">Faixa de Público</Label>
            <Select
              value={formData.audienceRange}
              onValueChange={(val) => updateField('audienceRange', val as AudienceRange)}
            >
              <SelectTrigger id="audienceRange" className="bg-background border-border">
                <SelectValue placeholder="Selecione a faixa" />
              </SelectTrigger>
              <SelectContent className="bg-background border-border">
                {Object.values(AudienceRange).map((ar) => (
                  <SelectItem key={ar} value={ar}>
                    {audienceRangeLabel(ar)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {(formData.audienceRange === AudienceRange.hundredOneToTwoHundred ||
            formData.audienceRange === AudienceRange.twoHundredOneToFiveHundred ||
            formData.audienceRange === AudienceRange.aboveFiveHundred) && (
            <div className="space-y-2">
              <Label htmlFor="partnershipsInvolved">Parcerias Envolvidas</Label>
              <Textarea
                id="partnershipsInvolved"
                value={formData.partnershipsInvolved}
                onChange={(e) => updateField('partnershipsInvolved', e.target.value)}
                placeholder="Descreva as parcerias envolvidas"
                rows={2}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Horas Dedicadas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id="hoursNotApplicable"
              checked={formData.hoursNotApplicable}
              onCheckedChange={(checked) => {
                updateField('hoursNotApplicable', !!checked);
                if (checked) updateField('dedicatedHours', '');
              }}
            />
            <Label htmlFor="hoursNotApplicable">Não se aplica</Label>
          </div>
          {!formData.hoursNotApplicable && (
            <div className="space-y-2">
              <Label htmlFor="dedicatedHours">Horas Dedicadas</Label>
              <Input
                id="dedicatedHours"
                type="number"
                min={0}
                value={formData.dedicatedHours}
                onChange={(e) => updateField('dedicatedHours', e.target.value)}
                placeholder="Número de horas"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Product Realised */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Produto Realizado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="productRealised">Produto</Label>
              <Select
                value={formData.productRealised}
                onValueChange={(val) => updateField('productRealised', val as ProductRealised)}
              >
                <SelectTrigger id="productRealised" className="bg-background border-border">
                  <SelectValue placeholder="Selecione o produto" />
                </SelectTrigger>
                <SelectContent className="bg-background border-border">
                  {Object.values(ProductRealised).map((pr) => (
                    <SelectItem key={pr} value={pr}>
                      {productRealisedLabel(pr)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.productRealised !== ProductRealised.naoSeAplica && (
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantidade</Label>
                <Select
                  value={formData.quantity}
                  onValueChange={(val) => updateField('quantity', val as Quantity)}
                >
                  <SelectTrigger id="quantity" className="bg-background border-border">
                    <SelectValue placeholder="Selecione a quantidade" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border">
                    {Object.values(Quantity).map((q) => (
                      <SelectItem key={q} value={q}>
                        {quantityLabel(q)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Descrição e Resultados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="objective">Objetivo</Label>
            <Textarea
              id="objective"
              value={formData.objective}
              onChange={(e) => updateField('objective', e.target.value)}
              placeholder="Objetivo da atividade"
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="executedDescription">Descrição da Execução</Label>
            <Textarea
              id="executedDescription"
              value={formData.executedDescription}
              onChange={(e) => updateField('executedDescription', e.target.value)}
              placeholder="Descreva como a atividade foi executada"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="achievedResults">Resultados Alcançados</Label>
            <Textarea
              id="achievedResults"
              value={formData.achievedResults}
              onChange={(e) => updateField('achievedResults', e.target.value)}
              placeholder="Descreva os resultados alcançados"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="qualitativeAssessment">Avaliação Qualitativa</Label>
            <Textarea
              id="qualitativeAssessment"
              value={formData.qualitativeAssessment}
              onChange={(e) => updateField('qualitativeAssessment', e.target.value)}
              placeholder="Avaliação qualitativa da atividade"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Partnership */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Parceria</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Checkbox
              id="hadPartnership"
              checked={formData.hadPartnership}
              onCheckedChange={(checked) => updateField('hadPartnership', !!checked)}
            />
            <Label htmlFor="hadPartnership">Houve parceria</Label>
          </div>
          {formData.hadPartnership && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="partnerName">Nome do Parceiro</Label>
                <Input
                  id="partnerName"
                  value={formData.partnerName}
                  onChange={(e) => updateField('partnerName', e.target.value)}
                  placeholder="Nome do parceiro"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="partnerType">Tipo de Parceiro</Label>
                <Input
                  id="partnerType"
                  value={formData.partnerType}
                  onChange={(e) => updateField('partnerType', e.target.value)}
                  placeholder="Tipo de parceiro"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Accessibility */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Acessibilidade</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.values(AccessibilityOption).map((opt) => (
              <div key={opt} className="flex items-center gap-2">
                <Checkbox
                  id={`accessibility-${opt}`}
                  checked={formData.accessibilityOptions.includes(opt)}
                  onCheckedChange={() =>
                    updateField(
                      'accessibilityOptions',
                      toggleArrayItem(formData.accessibilityOptions, opt)
                    )
                  }
                />
                <Label htmlFor={`accessibility-${opt}`} className="text-sm">
                  {accessibilityOptionLabel(opt)}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Evidences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Evidências</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.values(EvidenceType).map((ev) => (
              <div key={ev} className="flex items-center gap-2">
                <Checkbox
                  id={`evidence-${ev}`}
                  checked={formData.evidences.includes(ev)}
                  onCheckedChange={() =>
                    updateField('evidences', toggleArrayItem(formData.evidences, ev))
                  }
                />
                <Label htmlFor={`evidence-${ev}`} className="text-sm">
                  {evidenceTypeLabel(ev)}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3 pb-8">
        <Button
          variant="outline"
          onClick={() => navigate({ to: reportId ? `/reports/${reportId}` : '/reports' })}
          disabled={isSaving}
        >
          Cancelar
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              A guardar...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Guardar
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
