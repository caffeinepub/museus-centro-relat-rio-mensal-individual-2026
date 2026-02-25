import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import {
  useGetCallerUserProfile,
  useActivity,
  useCreateActivity,
  useUpdateActivity,
} from '../hooks/useQueries';
import {
  Activity,
  ActivityStatus,
  Classification,
  AccessibilityOption,
  EvidenceType,
  ProductRealised,
  Quantity,
  AudienceRange,
  GoalStatus,
  MuseumLocation,
} from '../backend';
import { getMuseumLabel, MUSEUM_LOCATIONS } from '../utils/labels';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const ACTIVITY_STATUS_LABELS: Record<ActivityStatus, string> = {
  [ActivityStatus.notStarted]: 'Não Iniciada',
  [ActivityStatus.submitted]: 'Submetida',
  [ActivityStatus.completed]: 'Concluída',
  [ActivityStatus.rescheduled]: 'Reagendada',
  [ActivityStatus.cancelled]: 'Cancelada',
};

const CLASSIFICATION_LABELS: Record<Classification, string> = {
  [Classification.goalLinked]: 'Vinculada à Meta',
  [Classification.routine]: 'Rotina',
  [Classification.extra]: 'Extra',
};

const PRODUCT_REALISED_LABELS: Record<ProductRealised, string> = {
  [ProductRealised.oficinaRealizada]: 'Oficina Realizada',
  [ProductRealised.relatorioEntregue]: 'Relatório Entregue',
  [ProductRealised.exposicaoMontada]: 'Exposição Montada',
  [ProductRealised.eventoExecutado]: 'Evento Executado',
  [ProductRealised.planoDeAcaoElaborado]: 'Plano de Ação Elaborado',
  [ProductRealised.materialGraficoProduzido]: 'Material Gráfico Produzido',
  [ProductRealised.conteudoDigitalPublicado]: 'Conteúdo Digital Publicado',
  [ProductRealised.pesquisaConcluida]: 'Pesquisa Concluída',
  [ProductRealised.reuniaoRegistrada]: 'Reunião Registrada',
  [ProductRealised.naoSeAplica]: 'Não se Aplica',
  [ProductRealised.outro]: 'Outro',
};

const QUANTITY_LABELS: Record<Quantity, string> = {
  [Quantity.one]: '1',
  [Quantity.two]: '2',
  [Quantity.three]: '3',
  [Quantity.four]: '4',
  [Quantity.five]: '5',
  [Quantity.six]: '6',
  [Quantity.seven]: '7',
  [Quantity.eight]: '8',
  [Quantity.nine]: '9',
  [Quantity.ten]: '10',
  [Quantity.maisDeDez]: 'Mais de 10',
};

const AUDIENCE_RANGE_LABELS: Record<AudienceRange, string> = {
  [AudienceRange.zeroToTwenty]: '0 a 20',
  [AudienceRange.twentyOneToFifty]: '21 a 50',
  [AudienceRange.fiftyOneToHundred]: '51 a 100',
  [AudienceRange.hundredOneToTwoHundred]: '101 a 200',
  [AudienceRange.twoHundredOneToFiveHundred]: '201 a 500',
  [AudienceRange.aboveFiveHundred]: 'Acima de 500',
  [AudienceRange.naoSeAplica]: 'Não se Aplica',
};

const GOAL_STATUS_LABELS: Record<GoalStatus, string> = {
  [GoalStatus.inProgress]: 'Em Andamento',
  [GoalStatus.partiallyCumplied]: 'Parcialmente Cumprida',
  [GoalStatus.achieved]: 'Alcançada',
  [GoalStatus.exceeded]: 'Superada',
};

const ACCESSIBILITY_LABELS: Record<AccessibilityOption, string> = {
  [AccessibilityOption.none]: 'Nenhuma',
  [AccessibilityOption.libras]: 'Libras',
  [AccessibilityOption.audioDescription]: 'Audiodescrição',
  [AccessibilityOption.tactileMaterial]: 'Material Tátil',
  [AccessibilityOption.other]: 'Outro',
};

const EVIDENCE_LABELS: Record<EvidenceType, string> = {
  [EvidenceType.photos]: 'Fotos',
  [EvidenceType.attendanceList]: 'Lista de Presença',
  [EvidenceType.report]: 'Relatório',
  [EvidenceType.graphicMaterial]: 'Material Gráfico',
  [EvidenceType.other]: 'Outro',
};

function emptyActivity(reportId: string, museum: MuseumLocation): Activity {
  return {
    id: '',
    reportId,
    date: BigInt(Date.now()) * BigInt(1_000_000),
    museum,
    actionType: '',
    activityName: '',
    dedicatedHours: undefined,
    hoursNotApplicable: false,
    classification: Classification.routine,
    goalNumber: undefined,
    goalDescription: undefined,
    plannedIndicator: undefined,
    quantitativeGoal: undefined,
    achievedResult: undefined,
    contributionPercent: undefined,
    goalStatus: undefined,
    technicalJustification: undefined,
    totalAudience: BigInt(0),
    children: BigInt(0),
    youth: BigInt(0),
    adults: BigInt(0),
    elderly: BigInt(0),
    pcd: BigInt(0),
    accessibilityOptions: [AccessibilityOption.none],
    hadPartnership: false,
    partnerName: undefined,
    partnerType: undefined,
    objective: undefined,
    executedDescription: '',
    achievedResults: '',
    qualitativeAssessment: '',
    evidences: [],
    attachmentsPrefix: '',
    productRealised: ProductRealised.naoSeAplica,
    quantity: undefined,
    audienceRange: AudienceRange.naoSeAplica,
    partnershipsInvolved: undefined,
    status: ActivityStatus.notStarted,
    cancellationReason: undefined,
  };
}

export default function ActivityFormPage() {
  const { reportId, activityId } = useParams({ strict: false }) as {
    reportId?: string;
    activityId?: string;
  };
  const navigate = useNavigate();
  const { data: userProfile } = useGetCallerUserProfile();

  const isNew = !activityId || activityId === 'new';
  const { data: existingActivity, isLoading: activityLoading } = useActivity(
    isNew ? undefined : activityId
  );

  const createActivity = useCreateActivity();
  const updateActivity = useUpdateActivity();

  const [formData, setFormData] = useState<Activity | null>(null);
  const [audienceError, setAudienceError] = useState('');
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (initialized) return;
    if (isNew && reportId && userProfile) {
      setFormData(emptyActivity(reportId, userProfile.museum));
      setInitialized(true);
    } else if (!isNew && existingActivity) {
      setFormData(existingActivity);
      setInitialized(true);
    }
  }, [isNew, existingActivity, reportId, userProfile, initialized]);

  const handleChange = <K extends keyof Activity>(field: K, value: Activity[K]) => {
    setFormData((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const validateAudience = (data: Activity): boolean => {
    const total =
      Number(data.children) +
      Number(data.youth) +
      Number(data.adults) +
      Number(data.elderly) +
      Number(data.pcd);
    if (total > Number(data.totalAudience)) {
      setAudienceError(
        'A soma dos subgrupos não pode exceder o total de público.'
      );
      return false;
    }
    setAudienceError('');
    return true;
  };

  const handleSave = async () => {
    if (!formData || !reportId) return;

    if (!validateAudience(formData)) return;

    // Validate hours
    if (!formData.hoursNotApplicable && formData.dedicatedHours === undefined) {
      toast.error('Informe as horas dedicadas ou marque "Não se aplica".');
      return;
    }

    // Validate product quantity
    if (formData.productRealised !== ProductRealised.naoSeAplica && !formData.quantity) {
      toast.error('Informe a quantidade do produto realizado.');
      return;
    }

    // Validate cancellation reason
    if (formData.status === ActivityStatus.cancelled && !formData.cancellationReason) {
      toast.error('Informe o motivo do cancelamento.');
      return;
    }

    // Validate partnerships for large audiences
    const largeAudience = [
      AudienceRange.hundredOneToTwoHundred,
      AudienceRange.twoHundredOneToFiveHundred,
      AudienceRange.aboveFiveHundred,
    ].includes(formData.audienceRange);
    if (largeAudience && !formData.partnershipsInvolved) {
      toast.error('Informe as parcerias envolvidas para público acima de 100.');
      return;
    }

    try {
      if (isNew) {
        await createActivity.mutateAsync(formData);
        toast.success('Atividade criada com sucesso!');
      } else {
        await updateActivity.mutateAsync({ activityId: activityId!, activity: formData });
        toast.success('Atividade atualizada com sucesso!');
      }
      navigate({ to: '/reports/$reportId', params: { reportId: reportId! } });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erro ao salvar atividade';
      toast.error(msg);
    }
  };

  if (activityLoading || (!initialized && !isNew)) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Erro ao carregar atividade.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const isSaving = createActivity.isPending || updateActivity.isPending;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              navigate({ to: '/reports/$reportId', params: { reportId: reportId! } })
            }
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">
            {isNew ? 'Nova Atividade' : 'Editar Atividade'}
          </h1>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
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
              Salvar Atividade
            </span>
          )}
        </Button>
      </div>

      <div className="space-y-6">
        {/* Basic Info */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Informações da Atividade</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="activityName">Nome da Atividade *</Label>
              <Input
                id="activityName"
                value={formData.activityName}
                onChange={(e) => handleChange('activityName', e.target.value)}
                className="mt-1"
                placeholder="Nome da atividade"
              />
            </div>
            <div>
              <Label htmlFor="actionType">Tipo de Ação *</Label>
              <Input
                id="actionType"
                value={formData.actionType}
                onChange={(e) => handleChange('actionType', e.target.value)}
                className="mt-1"
                placeholder="Tipo de ação"
              />
            </div>
            <div>
              <Label htmlFor="date">Data *</Label>
              <Input
                id="date"
                type="date"
                value={
                  formData.date
                    ? new Date(Number(formData.date) / 1_000_000).toISOString().split('T')[0]
                    : ''
                }
                onChange={(e) => {
                  const d = new Date(e.target.value);
                  handleChange('date', BigInt(d.getTime()) * BigInt(1_000_000));
                }}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Equipe/Museu</Label>
              <Select
                value={formData.museum}
                onValueChange={(v) => handleChange('museum', v as MuseumLocation)}
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
            <div>
              <Label>Status da Atividade</Label>
              <Select
                value={formData.status}
                onValueChange={(v) => handleChange('status', v as ActivityStatus)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(ActivityStatus).map((s) => (
                    <SelectItem key={s} value={s}>{ACTIVITY_STATUS_LABELS[s]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Classificação</Label>
              <Select
                value={formData.classification}
                onValueChange={(v) => handleChange('classification', v as Classification)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(Classification).map((c) => (
                    <SelectItem key={c} value={c}>{CLASSIFICATION_LABELS[c]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Cancellation reason */}
          {formData.status === ActivityStatus.cancelled && (
            <div className="mt-4">
              <Label htmlFor="cancellationReason">Motivo do Cancelamento *</Label>
              <Textarea
                id="cancellationReason"
                value={formData.cancellationReason ?? ''}
                onChange={(e) => handleChange('cancellationReason', e.target.value)}
                className="mt-1"
                placeholder="Descreva o motivo do cancelamento"
              />
            </div>
          )}
        </div>

        {/* Hours */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Horas Dedicadas</h2>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="dedicatedHours">Horas Dedicadas à Atividade</Label>
              <Input
                id="dedicatedHours"
                type="number"
                min="0"
                value={formData.dedicatedHours !== undefined ? Number(formData.dedicatedHours) : ''}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '') {
                    handleChange('dedicatedHours', undefined);
                  } else {
                    handleChange('dedicatedHours', BigInt(parseInt(val, 10)));
                    handleChange('hoursNotApplicable', false);
                  }
                }}
                disabled={formData.hoursNotApplicable}
                className="mt-1"
                placeholder="Número de horas"
              />
            </div>
            <div className="flex items-center gap-2 mt-6">
              <Checkbox
                id="hoursNotApplicable"
                checked={formData.hoursNotApplicable}
                onCheckedChange={(checked) => {
                  handleChange('hoursNotApplicable', !!checked);
                  if (checked) handleChange('dedicatedHours', undefined);
                }}
              />
              <Label htmlFor="hoursNotApplicable">Não se aplica</Label>
            </div>
          </div>
        </div>

        {/* Goal-linked fields */}
        {formData.classification === Classification.goalLinked && (
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Informações da Meta</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="goalNumber">Número da Meta</Label>
                <Input
                  id="goalNumber"
                  type="number"
                  value={formData.goalNumber !== undefined ? Number(formData.goalNumber) : ''}
                  onChange={(e) =>
                    handleChange('goalNumber', e.target.value ? BigInt(e.target.value) : undefined)
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Status da Meta</Label>
                <Select
                  value={formData.goalStatus ?? ''}
                  onValueChange={(v) => handleChange('goalStatus', v as GoalStatus)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(GoalStatus).map((g) => (
                      <SelectItem key={g} value={g}>{GOAL_STATUS_LABELS[g]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="quantitativeGoal">Meta Quantitativa</Label>
                <Input
                  id="quantitativeGoal"
                  type="number"
                  value={formData.quantitativeGoal !== undefined ? Number(formData.quantitativeGoal) : ''}
                  onChange={(e) =>
                    handleChange('quantitativeGoal', e.target.value ? BigInt(e.target.value) : undefined)
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="achievedResult">Resultado Alcançado</Label>
                <Input
                  id="achievedResult"
                  type="number"
                  value={formData.achievedResult !== undefined ? Number(formData.achievedResult) : ''}
                  onChange={(e) =>
                    handleChange('achievedResult', e.target.value ? BigInt(e.target.value) : undefined)
                  }
                  className="mt-1"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="goalDescription">Descrição da Meta</Label>
                <Textarea
                  id="goalDescription"
                  value={formData.goalDescription ?? ''}
                  onChange={(e) => handleChange('goalDescription', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="technicalJustification">Justificativa Técnica</Label>
                <Textarea
                  id="technicalJustification"
                  value={formData.technicalJustification ?? ''}
                  onChange={(e) => handleChange('technicalJustification', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        )}

        {/* Audience */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Público</h2>
          {audienceError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{audienceError}</AlertDescription>
            </Alert>
          )}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { field: 'totalAudience', label: 'Total de Público *' },
              { field: 'children', label: 'Crianças' },
              { field: 'youth', label: 'Jovens' },
              { field: 'adults', label: 'Adultos' },
              { field: 'elderly', label: 'Idosos' },
              { field: 'pcd', label: 'PCD' },
            ].map(({ field, label }) => (
              <div key={field}>
                <Label htmlFor={field}>{label}</Label>
                <Input
                  id={field}
                  type="number"
                  min="0"
                  value={Number(formData[field as keyof Activity] ?? 0)}
                  onChange={(e) =>
                    handleChange(field as keyof Activity, BigInt(parseInt(e.target.value, 10) || 0) as Activity[keyof Activity])
                  }
                  className="mt-1"
                />
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Label>Faixa de Público</Label>
            <Select
              value={formData.audienceRange}
              onValueChange={(v) => handleChange('audienceRange', v as AudienceRange)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(AudienceRange).map((a) => (
                  <SelectItem key={a} value={a}>{AUDIENCE_RANGE_LABELS[a]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {[
            AudienceRange.hundredOneToTwoHundred,
            AudienceRange.twoHundredOneToFiveHundred,
            AudienceRange.aboveFiveHundred,
          ].includes(formData.audienceRange) && (
            <div className="mt-4">
              <Label htmlFor="partnershipsInvolved">Parcerias Envolvidas *</Label>
              <Textarea
                id="partnershipsInvolved"
                value={formData.partnershipsInvolved ?? ''}
                onChange={(e) => handleChange('partnershipsInvolved', e.target.value)}
                className="mt-1"
                placeholder="Descreva as parcerias envolvidas"
              />
            </div>
          )}
        </div>

        {/* Product & Quantity */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Produto Realizado</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Produto Realizado</Label>
              <Select
                value={formData.productRealised}
                onValueChange={(v) => handleChange('productRealised', v as ProductRealised)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(ProductRealised).map((p) => (
                    <SelectItem key={p} value={p}>{PRODUCT_REALISED_LABELS[p]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {formData.productRealised !== ProductRealised.naoSeAplica && (
              <div>
                <Label>Quantidade *</Label>
                <Select
                  value={formData.quantity ?? ''}
                  onValueChange={(v) => handleChange('quantity', v as Quantity)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(Quantity).map((q) => (
                      <SelectItem key={q} value={q}>{QUANTITY_LABELS[q]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>

        {/* Accessibility */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Acessibilidade</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.values(AccessibilityOption).map((opt) => (
              <div key={opt} className="flex items-center gap-2">
                <Checkbox
                  id={`acc-${opt}`}
                  checked={formData.accessibilityOptions.includes(opt)}
                  onCheckedChange={(checked) => {
                    const current = formData.accessibilityOptions.filter((o) => o !== AccessibilityOption.none);
                    if (opt === AccessibilityOption.none) {
                      handleChange('accessibilityOptions', checked ? [AccessibilityOption.none] : []);
                    } else {
                      const updated = checked
                        ? [...current.filter((o) => o !== opt), opt]
                        : current.filter((o) => o !== opt);
                      handleChange('accessibilityOptions', updated.length === 0 ? [AccessibilityOption.none] : updated);
                    }
                  }}
                />
                <Label htmlFor={`acc-${opt}`}>{ACCESSIBILITY_LABELS[opt]}</Label>
              </div>
            ))}
          </div>
        </div>

        {/* Evidences */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Evidências</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.values(EvidenceType).map((ev) => (
              <div key={ev} className="flex items-center gap-2">
                <Checkbox
                  id={`ev-${ev}`}
                  checked={formData.evidences.includes(ev)}
                  onCheckedChange={(checked) => {
                    const updated = checked
                      ? [...formData.evidences, ev]
                      : formData.evidences.filter((e) => e !== ev);
                    handleChange('evidences', updated);
                  }}
                />
                <Label htmlFor={`ev-${ev}`}>{EVIDENCE_LABELS[ev]}</Label>
              </div>
            ))}
          </div>
        </div>

        {/* Partnership */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Parceria</h2>
          <div className="flex items-center gap-2 mb-4">
            <Checkbox
              id="hadPartnership"
              checked={formData.hadPartnership}
              onCheckedChange={(checked) => handleChange('hadPartnership', !!checked)}
            />
            <Label htmlFor="hadPartnership">Houve parceria nesta atividade?</Label>
          </div>
          {formData.hadPartnership && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="partnerName">Nome do Parceiro</Label>
                <Input
                  id="partnerName"
                  value={formData.partnerName ?? ''}
                  onChange={(e) => handleChange('partnerName', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="partnerType">Tipo de Parceiro</Label>
                <Input
                  id="partnerType"
                  value={formData.partnerType ?? ''}
                  onChange={(e) => handleChange('partnerType', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          )}
        </div>

        {/* Descriptions */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Descrições e Avaliação</h2>
          <div className="space-y-4">
            {[
              { field: 'objective', label: 'Objetivo' },
              { field: 'executedDescription', label: 'Descrição do Executado *' },
              { field: 'achievedResults', label: 'Resultados Alcançados *' },
              { field: 'qualitativeAssessment', label: 'Avaliação Qualitativa *' },
            ].map(({ field, label }) => (
              <div key={field}>
                <Label htmlFor={field}>{label}</Label>
                <Textarea
                  id={field}
                  value={(formData[field as keyof Activity] as string) ?? ''}
                  onChange={(e) => handleChange(field as keyof Activity, e.target.value as Activity[keyof Activity])}
                  className="mt-1 min-h-20"
                  placeholder={`Digite ${label.replace(' *', '').toLowerCase()}...`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
