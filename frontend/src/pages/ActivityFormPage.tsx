import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useGetActivity, useCreateActivity, useUpdateActivity } from '../hooks/useQueries';
import {
  Activity,
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ArrowLeft, Save } from 'lucide-react';
import { getMuseumLabel, MUSEUM_LOCATIONS } from '../utils/labels';

interface ActivityFormData {
  date: string;
  museum: MuseumLocation | '';
  actionType: string;
  activityName: string;
  dedicatedHours: string;
  hoursNotApplicable: boolean;
  classification: Classification;
  goalNumber: string;
  goalDescription: string;
  plannedIndicator: string;
  quantitativeGoal: string;
  achievedResult: string;
  contributionPercent: string;
  goalStatus: GoalStatus | '';
  technicalJustification: string;
  totalAudience: string;
  children: string;
  youth: string;
  adults: string;
  elderly: string;
  pcd: string;
  accessibilityOptions: AccessibilityOption[];
  hadPartnership: boolean;
  partnerName: string;
  partnerType: string;
  objective: string;
  executedDescription: string;
  achievedResults: string;
  qualitativeAssessment: string;
  evidences: EvidenceType[];
  attachmentsPrefix: string;
  productRealised: ProductRealised;
  quantity: Quantity | '';
  audienceRange: AudienceRange;
  partnershipsInvolved: string;
  status: ActivityStatus;
  cancellationReason: string;
}

const defaultFormData: ActivityFormData = {
  date: new Date().toISOString().split('T')[0],
  museum: '',
  actionType: '',
  activityName: '',
  dedicatedHours: '',
  hoursNotApplicable: false,
  classification: Classification.routine,
  goalNumber: '',
  goalDescription: '',
  plannedIndicator: '',
  quantitativeGoal: '',
  achievedResult: '',
  contributionPercent: '',
  goalStatus: '',
  technicalJustification: '',
  totalAudience: '0',
  children: '0',
  youth: '0',
  adults: '0',
  elderly: '0',
  pcd: '0',
  accessibilityOptions: [AccessibilityOption.none],
  hadPartnership: false,
  partnerName: '',
  partnerType: '',
  objective: '',
  executedDescription: '',
  achievedResults: '',
  qualitativeAssessment: '',
  evidences: [],
  attachmentsPrefix: '',
  productRealised: ProductRealised.naoSeAplica,
  quantity: '',
  audienceRange: AudienceRange.naoSeAplica,
  partnershipsInvolved: '',
  status: ActivityStatus.notStarted,
  cancellationReason: '',
};

function dateToTimestamp(dateStr: string): bigint {
  return BigInt(new Date(dateStr).getTime()) * BigInt(1_000_000);
}

function timestampToDate(ts: bigint): string {
  const ms = Number(ts) / 1_000_000;
  return new Date(ms).toISOString().split('T')[0];
}

export default function ActivityFormPage() {
  const navigate = useNavigate();
  const params = useParams({ strict: false }) as { reportId?: string; activityId?: string };
  const reportId = params.reportId ?? '';
  const activityId = params.activityId as string | undefined;
  const isEditing = !!activityId;

  const { data: existingActivity, isLoading: loadingActivity } = useGetActivity(activityId);
  const createActivity = useCreateActivity();
  const updateActivity = useUpdateActivity();

  const [formData, setFormData] = useState<ActivityFormData>(defaultFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string>('');

  useEffect(() => {
    if (existingActivity) {
      setFormData({
        date: timestampToDate(existingActivity.date),
        museum: existingActivity.museum as MuseumLocation,
        actionType: existingActivity.actionType,
        activityName: existingActivity.activityName,
        dedicatedHours: existingActivity.dedicatedHours != null ? String(existingActivity.dedicatedHours) : '',
        hoursNotApplicable: existingActivity.hoursNotApplicable,
        classification: existingActivity.classification,
        goalNumber: existingActivity.goalNumber != null ? String(existingActivity.goalNumber) : '',
        goalDescription: existingActivity.goalDescription ?? '',
        plannedIndicator: existingActivity.plannedIndicator ?? '',
        quantitativeGoal: existingActivity.quantitativeGoal != null ? String(existingActivity.quantitativeGoal) : '',
        achievedResult: existingActivity.achievedResult != null ? String(existingActivity.achievedResult) : '',
        contributionPercent: existingActivity.contributionPercent != null ? String(existingActivity.contributionPercent) : '',
        goalStatus: existingActivity.goalStatus ?? '',
        technicalJustification: existingActivity.technicalJustification ?? '',
        totalAudience: String(existingActivity.totalAudience),
        children: String(existingActivity.children),
        youth: String(existingActivity.youth),
        adults: String(existingActivity.adults),
        elderly: String(existingActivity.elderly),
        pcd: String(existingActivity.pcd),
        accessibilityOptions: existingActivity.accessibilityOptions,
        hadPartnership: existingActivity.hadPartnership,
        partnerName: existingActivity.partnerName ?? '',
        partnerType: existingActivity.partnerType ?? '',
        objective: existingActivity.objective ?? '',
        executedDescription: existingActivity.executedDescription,
        achievedResults: existingActivity.achievedResults,
        qualitativeAssessment: existingActivity.qualitativeAssessment,
        evidences: existingActivity.evidences,
        attachmentsPrefix: existingActivity.attachmentsPrefix,
        productRealised: existingActivity.productRealised,
        quantity: existingActivity.quantity ?? '',
        audienceRange: existingActivity.audienceRange,
        partnershipsInvolved: existingActivity.partnershipsInvolved ?? '',
        status: existingActivity.status,
        cancellationReason: existingActivity.cancellationReason ?? '',
      });
    }
  }, [existingActivity]);

  const handleChange = (field: keyof ActivityFormData, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Mutual exclusion logic for hours fields
  const handleDedicatedHoursChange = (value: string) => {
    const numVal = parseInt(value, 10);
    if (value !== '' && !isNaN(numVal) && numVal >= 1) {
      setFormData(prev => ({ ...prev, dedicatedHours: value, hoursNotApplicable: false }));
    } else {
      setFormData(prev => ({ ...prev, dedicatedHours: value }));
    }
    if (errors['dedicatedHours'] || errors['hoursNotApplicable']) {
      setErrors(prev => ({ ...prev, dedicatedHours: '', hoursNotApplicable: '' }));
    }
  };

  const handleHoursNotApplicableChange = (checked: boolean) => {
    if (checked) {
      setFormData(prev => ({ ...prev, hoursNotApplicable: true, dedicatedHours: '' }));
    } else {
      setFormData(prev => ({ ...prev, hoursNotApplicable: false }));
    }
    if (errors['dedicatedHours'] || errors['hoursNotApplicable']) {
      setErrors(prev => ({ ...prev, dedicatedHours: '', hoursNotApplicable: '' }));
    }
  };

  const handleAccessibilityChange = (option: AccessibilityOption, checked: boolean) => {
    setFormData(prev => {
      let opts = [...prev.accessibilityOptions];
      if (checked) {
        if (option === AccessibilityOption.none) {
          opts = [AccessibilityOption.none];
        } else {
          opts = opts.filter(o => o !== AccessibilityOption.none);
          if (!opts.includes(option)) opts.push(option);
        }
      } else {
        opts = opts.filter(o => o !== option);
        if (opts.length === 0) opts = [AccessibilityOption.none];
      }
      return { ...prev, accessibilityOptions: opts };
    });
  };

  const handleEvidenceChange = (evidence: EvidenceType, checked: boolean) => {
    setFormData(prev => {
      let evs = [...prev.evidences];
      if (checked) {
        if (!evs.includes(evidence)) evs.push(evidence);
      } else {
        evs = evs.filter(e => e !== evidence);
      }
      return { ...prev, evidences: evs };
    });
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.date) newErrors.date = 'Data é obrigatória';
    if (!formData.museum) newErrors.museum = 'Equipe/Museu é obrigatório';
    if (!formData.actionType.trim()) newErrors.actionType = 'Tipo de ação é obrigatório';
    if (!formData.activityName.trim()) newErrors.activityName = 'Nome da atividade é obrigatório';

    const hoursVal = parseInt(formData.dedicatedHours, 10);
    const hasValidHours = formData.dedicatedHours !== '' && !isNaN(hoursVal) && hoursVal >= 1;
    if (!hasValidHours && !formData.hoursNotApplicable) {
      newErrors.dedicatedHours = 'Informe as horas dedicadas ou marque "Não se aplica"';
    }
    if (hasValidHours && formData.hoursNotApplicable) {
      newErrors.dedicatedHours = 'Não é possível preencher horas e marcar "Não se aplica" simultaneamente';
    }
    if (formData.dedicatedHours !== '' && (isNaN(hoursVal) || hoursVal < 1)) {
      newErrors.dedicatedHours = 'Horas dedicadas deve ser um número inteiro positivo (≥ 1)';
    }

    if (!formData.executedDescription.trim()) newErrors.executedDescription = 'Descrição executada é obrigatória';
    if (!formData.achievedResults.trim()) newErrors.achievedResults = 'Resultados alcançados são obrigatórios';
    if (!formData.qualitativeAssessment.trim()) newErrors.qualitativeAssessment = 'Avaliação qualitativa é obrigatória';

    if (formData.status === ActivityStatus.cancelled && !formData.cancellationReason.trim()) {
      newErrors.cancellationReason = 'Motivo de cancelamento é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildActivity = (id: string): Activity => {
    const hoursVal = parseInt(formData.dedicatedHours, 10);
    const hasValidHours = formData.dedicatedHours !== '' && !isNaN(hoursVal) && hoursVal >= 1;

    return {
      id,
      reportId,
      date: dateToTimestamp(formData.date),
      museum: formData.museum as MuseumLocation,
      actionType: formData.actionType,
      activityName: formData.activityName,
      dedicatedHours: hasValidHours ? BigInt(hoursVal) : undefined,
      hoursNotApplicable: formData.hoursNotApplicable,
      classification: formData.classification,
      goalNumber: formData.goalNumber ? BigInt(parseInt(formData.goalNumber, 10)) : undefined,
      goalDescription: formData.goalDescription || undefined,
      plannedIndicator: formData.plannedIndicator || undefined,
      quantitativeGoal: formData.quantitativeGoal ? BigInt(parseInt(formData.quantitativeGoal, 10)) : undefined,
      achievedResult: formData.achievedResult ? BigInt(parseInt(formData.achievedResult, 10)) : undefined,
      contributionPercent: formData.contributionPercent ? parseFloat(formData.contributionPercent) : undefined,
      goalStatus: formData.goalStatus || undefined,
      technicalJustification: formData.technicalJustification || undefined,
      totalAudience: BigInt(parseInt(formData.totalAudience, 10) || 0),
      children: BigInt(parseInt(formData.children, 10) || 0),
      youth: BigInt(parseInt(formData.youth, 10) || 0),
      adults: BigInt(parseInt(formData.adults, 10) || 0),
      elderly: BigInt(parseInt(formData.elderly, 10) || 0),
      pcd: BigInt(parseInt(formData.pcd, 10) || 0),
      accessibilityOptions: formData.accessibilityOptions,
      hadPartnership: formData.hadPartnership,
      partnerName: formData.partnerName || undefined,
      partnerType: formData.partnerType || undefined,
      objective: formData.objective || undefined,
      executedDescription: formData.executedDescription,
      achievedResults: formData.achievedResults,
      qualitativeAssessment: formData.qualitativeAssessment,
      evidences: formData.evidences,
      attachmentsPrefix: formData.attachmentsPrefix,
      productRealised: formData.productRealised,
      quantity: formData.quantity || undefined,
      audienceRange: formData.audienceRange,
      partnershipsInvolved: formData.partnershipsInvolved || undefined,
      status: formData.status,
      cancellationReason: formData.cancellationReason || undefined,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (!validate()) return;

    try {
      if (isEditing && activityId) {
        const activity = buildActivity(activityId);
        await updateActivity.mutateAsync({ activityId, activity });
      } else {
        const activity = buildActivity('');
        await createActivity.mutateAsync(activity);
      }
      navigate({ to: `/reports/${reportId}` });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao salvar atividade';
      setSubmitError(msg);
    }
  };

  const isSubmitting = createActivity.isPending || updateActivity.isPending;

  if (loadingActivity && isEditing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const hoursVal = parseInt(formData.dedicatedHours, 10);
  const hasValidHours = formData.dedicatedHours !== '' && !isNaN(hoursVal) && hoursVal >= 1;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate({ to: `/reports/${reportId}` })}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">
          {isEditing ? 'Editar Atividade' : 'Nova Atividade'}
        </h1>
      </div>

      {submitError && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Data *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={e => handleChange('date', e.target.value)}
                  className={errors.date ? 'border-destructive' : ''}
                />
                {errors.date && <p className="text-sm text-destructive">{errors.date}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="museum">Equipe/Museu *</Label>
                <Select
                  value={formData.museum}
                  onValueChange={v => handleChange('museum', v as MuseumLocation)}
                >
                  <SelectTrigger className={errors.museum ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Selecionar equipe/museu..." />
                  </SelectTrigger>
                  <SelectContent>
                    {MUSEUM_LOCATIONS.map(loc => (
                      <SelectItem key={loc} value={loc}>
                        {getMuseumLabel(loc)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.museum && <p className="text-sm text-destructive">{errors.museum}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="actionType">Tipo de Ação *</Label>
                <Input
                  id="actionType"
                  value={formData.actionType}
                  onChange={e => handleChange('actionType', e.target.value)}
                  placeholder="Ex: Oficina, Palestra, Exposição"
                  className={errors.actionType ? 'border-destructive' : ''}
                />
                {errors.actionType && <p className="text-sm text-destructive">{errors.actionType}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="activityName">Nome da Atividade *</Label>
                <Input
                  id="activityName"
                  value={formData.activityName}
                  onChange={e => handleChange('activityName', e.target.value)}
                  placeholder="Nome da atividade"
                  className={errors.activityName ? 'border-destructive' : ''}
                />
                {errors.activityName && <p className="text-sm text-destructive">{errors.activityName}</p>}
              </div>
            </div>

            {/* Hybrid Hours Field */}
            <div className="space-y-2">
              <Label>Horas dedicadas à atividade *</Label>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 max-w-xs">
                  <Input
                    id="dedicatedHours"
                    type="number"
                    min={1}
                    step={1}
                    value={formData.dedicatedHours}
                    onChange={e => handleDedicatedHoursChange(e.target.value)}
                    placeholder="Ex: 1, 2, 4, 6, 10"
                    disabled={formData.hoursNotApplicable}
                    className={errors.dedicatedHours ? 'border-destructive' : ''}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="hoursNotApplicable"
                    checked={formData.hoursNotApplicable}
                    onCheckedChange={(checked) => handleHoursNotApplicableChange(checked === true)}
                    disabled={hasValidHours}
                  />
                  <Label htmlFor="hoursNotApplicable" className="font-normal cursor-pointer">
                    Não se aplica
                  </Label>
                </div>
              </div>
              {errors.dedicatedHours && (
                <p className="text-sm text-destructive">{errors.dedicatedHours}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Classification */}
        <Card>
          <CardHeader>
            <CardTitle>Classificação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Classificação *</Label>
              <Select
                value={formData.classification}
                onValueChange={v => handleChange('classification', v as Classification)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={Classification.routine}>Rotina</SelectItem>
                  <SelectItem value={Classification.goalLinked}>Vinculada à Meta</SelectItem>
                  <SelectItem value={Classification.extra}>Extra</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.classification === Classification.goalLinked && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
                <div className="space-y-2">
                  <Label htmlFor="goalNumber">Nº da Meta</Label>
                  <Input
                    id="goalNumber"
                    type="number"
                    value={formData.goalNumber}
                    onChange={e => handleChange('goalNumber', e.target.value)}
                    placeholder="Ex: 1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="goalStatus">Status da Meta</Label>
                  <Select
                    value={formData.goalStatus}
                    onValueChange={v => handleChange('goalStatus', v as GoalStatus)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={GoalStatus.inProgress}>Em andamento</SelectItem>
                      <SelectItem value={GoalStatus.partiallyCumplied}>Parcialmente cumprida</SelectItem>
                      <SelectItem value={GoalStatus.achieved}>Alcançada</SelectItem>
                      <SelectItem value={GoalStatus.exceeded}>Superada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="goalDescription">Descrição da Meta</Label>
                  <Textarea
                    id="goalDescription"
                    value={formData.goalDescription}
                    onChange={e => handleChange('goalDescription', e.target.value)}
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plannedIndicator">Indicador Planejado</Label>
                  <Input
                    id="plannedIndicator"
                    value={formData.plannedIndicator}
                    onChange={e => handleChange('plannedIndicator', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantitativeGoal">Meta Quantitativa</Label>
                  <Input
                    id="quantitativeGoal"
                    type="number"
                    value={formData.quantitativeGoal}
                    onChange={e => handleChange('quantitativeGoal', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="achievedResult">Resultado Alcançado</Label>
                  <Input
                    id="achievedResult"
                    type="number"
                    value={formData.achievedResult}
                    onChange={e => handleChange('achievedResult', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contributionPercent">% Contribuição</Label>
                  <Input
                    id="contributionPercent"
                    type="number"
                    step="0.1"
                    value={formData.contributionPercent}
                    onChange={e => handleChange('contributionPercent', e.target.value)}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="technicalJustification">Justificativa Técnica</Label>
                  <Textarea
                    id="technicalJustification"
                    value={formData.technicalJustification}
                    onChange={e => handleChange('technicalJustification', e.target.value)}
                    rows={2}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Audience */}
        <Card>
          <CardHeader>
            <CardTitle>Público</CardTitle>
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
                  onChange={e => handleChange('totalAudience', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="children">Crianças</Label>
                <Input
                  id="children"
                  type="number"
                  min={0}
                  value={formData.children}
                  onChange={e => handleChange('children', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="youth">Jovens</Label>
                <Input
                  id="youth"
                  type="number"
                  min={0}
                  value={formData.youth}
                  onChange={e => handleChange('youth', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adults">Adultos</Label>
                <Input
                  id="adults"
                  type="number"
                  min={0}
                  value={formData.adults}
                  onChange={e => handleChange('adults', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="elderly">Idosos</Label>
                <Input
                  id="elderly"
                  type="number"
                  min={0}
                  value={formData.elderly}
                  onChange={e => handleChange('elderly', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pcd">PCD</Label>
                <Input
                  id="pcd"
                  type="number"
                  min={0}
                  value={formData.pcd}
                  onChange={e => handleChange('pcd', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Faixa de Público</Label>
              <Select
                value={formData.audienceRange}
                onValueChange={v => handleChange('audienceRange', v as AudienceRange)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={AudienceRange.naoSeAplica}>Não se aplica</SelectItem>
                  <SelectItem value={AudienceRange.zeroToTwenty}>0 a 20 pessoas</SelectItem>
                  <SelectItem value={AudienceRange.twentyOneToFifty}>21 a 50 pessoas</SelectItem>
                  <SelectItem value={AudienceRange.fiftyOneToHundred}>51 a 100 pessoas</SelectItem>
                  <SelectItem value={AudienceRange.hundredOneToTwoHundred}>101 a 200 pessoas</SelectItem>
                  <SelectItem value={AudienceRange.twoHundredOneToFiveHundred}>201 a 500 pessoas</SelectItem>
                  <SelectItem value={AudienceRange.aboveFiveHundred}>Acima de 500 pessoas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(formData.audienceRange === AudienceRange.hundredOneToTwoHundred ||
              formData.audienceRange === AudienceRange.twoHundredOneToFiveHundred ||
              formData.audienceRange === AudienceRange.aboveFiveHundred) && (
              <div className="space-y-2">
                <Label htmlFor="partnershipsInvolved">Parcerias Envolvidas *</Label>
                <Textarea
                  id="partnershipsInvolved"
                  value={formData.partnershipsInvolved}
                  onChange={e => handleChange('partnershipsInvolved', e.target.value)}
                  placeholder="Descreva as parcerias envolvidas"
                  rows={2}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Accessibility */}
        <Card>
          <CardHeader>
            <CardTitle>Acessibilidade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.values(AccessibilityOption).map(opt => (
                <div key={opt} className="flex items-center gap-2">
                  <Checkbox
                    id={`acc-${opt}`}
                    checked={formData.accessibilityOptions.includes(opt)}
                    onCheckedChange={checked => handleAccessibilityChange(opt, checked === true)}
                  />
                  <Label htmlFor={`acc-${opt}`} className="font-normal cursor-pointer">
                    {opt === AccessibilityOption.none ? 'Nenhuma' :
                     opt === AccessibilityOption.libras ? 'Libras' :
                     opt === AccessibilityOption.audioDescription ? 'Audiodescrição' :
                     opt === AccessibilityOption.tactileMaterial ? 'Material Tátil' : 'Outro'}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Partnership */}
        <Card>
          <CardHeader>
            <CardTitle>Parceria</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="hadPartnership"
                checked={formData.hadPartnership}
                onCheckedChange={checked => handleChange('hadPartnership', checked === true)}
              />
              <Label htmlFor="hadPartnership" className="font-normal cursor-pointer">
                Houve parceria nesta atividade?
              </Label>
            </div>
            {formData.hadPartnership && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="partnerName">Nome do Parceiro</Label>
                  <Input
                    id="partnerName"
                    value={formData.partnerName}
                    onChange={e => handleChange('partnerName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="partnerType">Tipo de Parceiro</Label>
                  <Input
                    id="partnerType"
                    value={formData.partnerType}
                    onChange={e => handleChange('partnerType', e.target.value)}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Product */}
        <Card>
          <CardHeader>
            <CardTitle>Produto Realizado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Produto Realizado</Label>
                <Select
                  value={formData.productRealised}
                  onValueChange={v => handleChange('productRealised', v as ProductRealised)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ProductRealised.naoSeAplica}>Não se aplica</SelectItem>
                    <SelectItem value={ProductRealised.oficinaRealizada}>Oficina realizada</SelectItem>
                    <SelectItem value={ProductRealised.relatorioEntregue}>Relatório entregue</SelectItem>
                    <SelectItem value={ProductRealised.exposicaoMontada}>Exposição montada</SelectItem>
                    <SelectItem value={ProductRealised.eventoExecutado}>Evento executado</SelectItem>
                    <SelectItem value={ProductRealised.planoDeAcaoElaborado}>Plano de ação elaborado</SelectItem>
                    <SelectItem value={ProductRealised.materialGraficoProduzido}>Material gráfico produzido</SelectItem>
                    <SelectItem value={ProductRealised.conteudoDigitalPublicado}>Conteúdo digital publicado</SelectItem>
                    <SelectItem value={ProductRealised.pesquisaConcluida}>Pesquisa concluída</SelectItem>
                    <SelectItem value={ProductRealised.reuniaoRegistrada}>Reunião registrada</SelectItem>
                    <SelectItem value={ProductRealised.outro}>Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.productRealised !== ProductRealised.naoSeAplica && (
                <div className="space-y-2">
                  <Label>Quantidade</Label>
                  <Select
                    value={formData.quantity}
                    onValueChange={v => handleChange('quantity', v as Quantity)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={Quantity.one}>1</SelectItem>
                      <SelectItem value={Quantity.two}>2</SelectItem>
                      <SelectItem value={Quantity.three}>3</SelectItem>
                      <SelectItem value={Quantity.four}>4</SelectItem>
                      <SelectItem value={Quantity.five}>5</SelectItem>
                      <SelectItem value={Quantity.six}>6</SelectItem>
                      <SelectItem value={Quantity.seven}>7</SelectItem>
                      <SelectItem value={Quantity.eight}>8</SelectItem>
                      <SelectItem value={Quantity.nine}>9</SelectItem>
                      <SelectItem value={Quantity.ten}>10</SelectItem>
                      <SelectItem value={Quantity.maisDeDez}>Mais de 10</SelectItem>
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
            <CardTitle>Descrição e Resultados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="objective">Objetivo</Label>
              <Textarea
                id="objective"
                value={formData.objective}
                onChange={e => handleChange('objective', e.target.value)}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="executedDescription">Descrição Executada *</Label>
              <Textarea
                id="executedDescription"
                value={formData.executedDescription}
                onChange={e => handleChange('executedDescription', e.target.value)}
                rows={3}
                className={errors.executedDescription ? 'border-destructive' : ''}
              />
              {errors.executedDescription && (
                <p className="text-sm text-destructive">{errors.executedDescription}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="achievedResults">Resultados Alcançados *</Label>
              <Textarea
                id="achievedResults"
                value={formData.achievedResults}
                onChange={e => handleChange('achievedResults', e.target.value)}
                rows={3}
                className={errors.achievedResults ? 'border-destructive' : ''}
              />
              {errors.achievedResults && (
                <p className="text-sm text-destructive">{errors.achievedResults}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="qualitativeAssessment">Avaliação Qualitativa *</Label>
              <Textarea
                id="qualitativeAssessment"
                value={formData.qualitativeAssessment}
                onChange={e => handleChange('qualitativeAssessment', e.target.value)}
                rows={3}
                className={errors.qualitativeAssessment ? 'border-destructive' : ''}
              />
              {errors.qualitativeAssessment && (
                <p className="text-sm text-destructive">{errors.qualitativeAssessment}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Evidences */}
        <Card>
          <CardHeader>
            <CardTitle>Evidências</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.values(EvidenceType).map(ev => (
                <div key={ev} className="flex items-center gap-2">
                  <Checkbox
                    id={`ev-${ev}`}
                    checked={formData.evidences.includes(ev)}
                    onCheckedChange={checked => handleEvidenceChange(ev, checked === true)}
                  />
                  <Label htmlFor={`ev-${ev}`} className="font-normal cursor-pointer">
                    {ev === EvidenceType.photos ? 'Fotos' :
                     ev === EvidenceType.attendanceList ? 'Lista de presença' :
                     ev === EvidenceType.report ? 'Relatório' :
                     ev === EvidenceType.graphicMaterial ? 'Material gráfico' : 'Outro'}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Status */}
        <Card>
          <CardHeader>
            <CardTitle>Status da Atividade</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={v => handleChange('status', v as ActivityStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ActivityStatus.notStarted}>Não iniciada</SelectItem>
                  <SelectItem value={ActivityStatus.submitted}>Enviada</SelectItem>
                  <SelectItem value={ActivityStatus.completed}>Concluída</SelectItem>
                  <SelectItem value={ActivityStatus.rescheduled}>Reagendada</SelectItem>
                  <SelectItem value={ActivityStatus.cancelled}>Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.status === ActivityStatus.cancelled && (
              <div className="space-y-2">
                <Label htmlFor="cancellationReason">Motivo do Cancelamento *</Label>
                <Textarea
                  id="cancellationReason"
                  value={formData.cancellationReason}
                  onChange={e => handleChange('cancellationReason', e.target.value)}
                  rows={2}
                  className={errors.cancellationReason ? 'border-destructive' : ''}
                />
                {errors.cancellationReason && (
                  <p className="text-sm text-destructive">{errors.cancellationReason}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex gap-3 pb-8">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate({ to: `/reports/${reportId}` })}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting} className="gap-2">
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isEditing ? 'Salvar Alterações' : 'Criar Atividade'}
          </Button>
        </div>
      </form>
    </div>
  );
}
