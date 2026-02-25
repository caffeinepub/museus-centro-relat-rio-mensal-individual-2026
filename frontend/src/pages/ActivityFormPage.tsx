import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearch } from '@tanstack/react-router';
import {
  useCreateActivity,
  useUpdateActivity,
  useGetActivity,
  useGetCallerUserProfile,
  useSearchActivities,
  useGoals,
} from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import {
  ActivityCreate,
  Activity,
  ActivityStatus,
  Classification,
  GoalStatus,
  AccessibilityOption,
  EvidenceType,
  ProductRealised,
  AudienceRange,
  Quantity,
  MuseumLocation,
  ExternalBlob,
} from '../backend';
import {
  activityStatusLabel,
  classificationLabel,
  goalStatusLabel,
  accessibilityOptionLabel,
  evidenceTypeLabel,
  productRealisedLabel,
  audienceRangeLabel,
  quantityLabel,
  getMuseumLabel,
  MUSEUM_LOCATIONS,
} from '../utils/labels';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Save, Loader2, Search, X, Upload, FileText } from 'lucide-react';

// ── Constants ──────────────────────────────────────────────────────────────

const ALL_ACTIVITY_STATUSES: ActivityStatus[] = [
  ActivityStatus.notStarted,
  ActivityStatus.submitted,
  ActivityStatus.completed,
  ActivityStatus.rescheduled,
  ActivityStatus.cancelled,
];

const ALL_CLASSIFICATIONS: Classification[] = [
  Classification.goalLinked,
  Classification.routine,
  Classification.extra,
];

const ALL_GOAL_STATUSES: GoalStatus[] = [
  GoalStatus.inProgress,
  GoalStatus.partiallyCumplied,
  GoalStatus.achieved,
  GoalStatus.exceeded,
];

const ALL_ACCESSIBILITY_OPTIONS: AccessibilityOption[] = [
  AccessibilityOption.none,
  AccessibilityOption.libras,
  AccessibilityOption.audioDescription,
  AccessibilityOption.tactileMaterial,
  AccessibilityOption.other,
];

const ALL_EVIDENCE_TYPES: EvidenceType[] = [
  EvidenceType.photos,
  EvidenceType.attendanceList,
  EvidenceType.report,
  EvidenceType.graphicMaterial,
  EvidenceType.other,
];

const ALL_PRODUCTS: ProductRealised[] = [
  ProductRealised.naoSeAplica,
  ProductRealised.oficinaRealizada,
  ProductRealised.relatorioEntregue,
  ProductRealised.exposicaoMontada,
  ProductRealised.eventoExecutado,
  ProductRealised.planoDeAcaoElaborado,
  ProductRealised.materialGraficoProduzido,
  ProductRealised.conteudoDigitalPublicado,
  ProductRealised.pesquisaConcluida,
  ProductRealised.reuniaoRegistrada,
  ProductRealised.outro,
];

const ALL_AUDIENCE_RANGES: AudienceRange[] = [
  AudienceRange.naoSeAplica,
  AudienceRange.zeroToTwenty,
  AudienceRange.twentyOneToFifty,
  AudienceRange.fiftyOneToHundred,
  AudienceRange.hundredOneToTwoHundred,
  AudienceRange.twoHundredOneToFiveHundred,
  AudienceRange.aboveFiveHundred,
];

const ALL_QUANTITIES: Quantity[] = [
  Quantity.one,
  Quantity.two,
  Quantity.three,
  Quantity.four,
  Quantity.five,
  Quantity.six,
  Quantity.seven,
  Quantity.eight,
  Quantity.nine,
  Quantity.ten,
  Quantity.maisDeDez,
];

// ── Form State ─────────────────────────────────────────────────────────────

interface ActivityFormState {
  activityName: string;
  actionType: string;
  museum: MuseumLocation;
  date: string;
  classification: Classification;
  status: ActivityStatus;
  dedicatedHours: string;
  hoursNotApplicable: boolean;
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
  audienceRange: AudienceRange;
  accessibilityOptions: AccessibilityOption[];
  hadPartnership: boolean;
  partnerName: string;
  partnerType: string;
  partnershipsInvolved: string;
  objective: string;
  executedDescription: string;
  achievedResults: string;
  qualitativeAssessment: string;
  evidences: EvidenceType[];
  attachmentsPrefix: string;
  productRealised: ProductRealised;
  quantity: Quantity | '';
  cancellationReason: string;
  linkedActivityId: string;
}

function getDefaultFormState(): ActivityFormState {
  return {
    activityName: '',
    actionType: '',
    museum: MuseumLocation.equipePrincipal,
    date: new Date().toISOString().split('T')[0],
    classification: Classification.routine,
    status: ActivityStatus.notStarted,
    dedicatedHours: '',
    hoursNotApplicable: false,
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
    audienceRange: AudienceRange.naoSeAplica,
    accessibilityOptions: [AccessibilityOption.none],
    hadPartnership: false,
    partnerName: '',
    partnerType: '',
    partnershipsInvolved: '',
    objective: '',
    executedDescription: '',
    achievedResults: '',
    qualitativeAssessment: '',
    evidences: [],
    attachmentsPrefix: '',
    productRealised: ProductRealised.naoSeAplica,
    quantity: '',
    cancellationReason: '',
    linkedActivityId: '',
  };
}

// ── Component ──────────────────────────────────────────────────────────────

export default function ActivityFormPage() {
  const navigate = useNavigate();
  const params = useParams({ strict: false }) as { activityId?: string };
  const search = useSearch({ strict: false }) as { reportId?: string };

  const activityId = params.activityId;
  const reportId = search.reportId;
  const isEditing = !!activityId && activityId !== 'new';

  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: existingActivity, isLoading: activityLoading } = useGetActivity(
    isEditing ? activityId! : undefined
  );

  const createMutation = useCreateActivity();
  const updateMutation = useUpdateActivity();

  const [form, setForm] = useState<ActivityFormState>(getDefaultFormState());
  const [uploadedFiles, setUploadedFiles] = useState<ExternalBlob[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Activity search for deduplication
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const { data: searchResults } = useSearchActivities(searchTerm);

  // Populate form when editing
  useEffect(() => {
    if (existingActivity && isEditing) {
      setForm({
        activityName: existingActivity.activityName,
        actionType: existingActivity.actionType,
        museum: existingActivity.museum,
        date: new Date(Number(existingActivity.date) / 1_000_000).toISOString().split('T')[0],
        classification: existingActivity.classification,
        status: existingActivity.status,
        dedicatedHours: existingActivity.dedicatedHours != null ? existingActivity.dedicatedHours.toString() : '',
        hoursNotApplicable: existingActivity.hoursNotApplicable,
        goalNumber: existingActivity.goalNumber != null ? existingActivity.goalNumber.toString() : '',
        goalDescription: existingActivity.goalDescription ?? '',
        plannedIndicator: existingActivity.plannedIndicator ?? '',
        quantitativeGoal: existingActivity.quantitativeGoal != null ? existingActivity.quantitativeGoal.toString() : '',
        achievedResult: existingActivity.achievedResult != null ? existingActivity.achievedResult.toString() : '',
        contributionPercent: existingActivity.contributionPercent != null ? existingActivity.contributionPercent.toString() : '',
        goalStatus: existingActivity.goalStatus ?? '',
        technicalJustification: existingActivity.technicalJustification ?? '',
        totalAudience: existingActivity.totalAudience.toString(),
        children: existingActivity.children.toString(),
        youth: existingActivity.youth.toString(),
        adults: existingActivity.adults.toString(),
        elderly: existingActivity.elderly.toString(),
        pcd: existingActivity.pcd.toString(),
        audienceRange: existingActivity.audienceRange,
        accessibilityOptions: existingActivity.accessibilityOptions.length > 0
          ? existingActivity.accessibilityOptions
          : [AccessibilityOption.none],
        hadPartnership: existingActivity.hadPartnership,
        partnerName: existingActivity.partnerName ?? '',
        partnerType: existingActivity.partnerType ?? '',
        partnershipsInvolved: existingActivity.partnershipsInvolved ?? '',
        objective: existingActivity.objective ?? '',
        executedDescription: existingActivity.executedDescription,
        achievedResults: existingActivity.achievedResults,
        qualitativeAssessment: existingActivity.qualitativeAssessment,
        evidences: existingActivity.evidences,
        attachmentsPrefix: existingActivity.attachmentsPrefix,
        productRealised: existingActivity.productRealised,
        quantity: existingActivity.quantity ?? '',
        cancellationReason: existingActivity.cancellationReason ?? '',
        linkedActivityId: existingActivity.linkedActivityId ?? '',
      });
    }
  }, [existingActivity, isEditing]);

  // Populate museum from profile on create
  useEffect(() => {
    if (!isEditing && userProfile) {
      setForm((prev) => ({ ...prev, museum: userProfile.museum }));
    }
  }, [userProfile, isEditing]);

  const handleChange = (field: keyof ActivityFormState, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = <T,>(arr: T[], item: T): T[] => {
    return arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploading(true);
    const newBlobs: ExternalBlob[] = [];
    for (const file of Array.from(files)) {
      const buf = await file.arrayBuffer();
      const blob = ExternalBlob.fromBytes(new Uint8Array(buf)).withUploadProgress((pct) => {
        setUploadProgress(pct);
      });
      newBlobs.push(blob);
    }
    setUploadedFiles((prev) => [...prev, ...newBlobs]);
    setIsUploading(false);
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = async () => {
    const effectiveReportId = isEditing ? existingActivity?.reportId ?? reportId ?? '' : reportId ?? '';
    if (!effectiveReportId) {
      alert('ID do relatório não encontrado.');
      return;
    }

    const dateMs = new Date(form.date).getTime();
    const dateNs = BigInt(dateMs) * BigInt(1_000_000);

    const activityData: ActivityCreate = {
      id: isEditing ? activityId! : '',
      reportId: effectiveReportId,
      date: dateNs,
      museum: form.museum,
      actionType: form.actionType,
      activityName: form.activityName,
      dedicatedHours: form.hoursNotApplicable
        ? undefined
        : form.dedicatedHours
        ? BigInt(parseInt(form.dedicatedHours))
        : undefined,
      hoursNotApplicable: form.hoursNotApplicable,
      classification: form.classification,
      goalNumber: form.goalNumber ? BigInt(parseInt(form.goalNumber)) : undefined,
      goalDescription: form.goalDescription || undefined,
      plannedIndicator: form.plannedIndicator || undefined,
      quantitativeGoal: form.quantitativeGoal ? BigInt(parseInt(form.quantitativeGoal)) : undefined,
      achievedResult: form.achievedResult ? BigInt(parseInt(form.achievedResult)) : undefined,
      contributionPercent: form.contributionPercent ? parseFloat(form.contributionPercent) : undefined,
      goalStatus: form.goalStatus || undefined,
      technicalJustification: form.technicalJustification || undefined,
      totalAudience: BigInt(parseInt(form.totalAudience) || 0),
      children: BigInt(parseInt(form.children) || 0),
      youth: BigInt(parseInt(form.youth) || 0),
      adults: BigInt(parseInt(form.adults) || 0),
      elderly: BigInt(parseInt(form.elderly) || 0),
      pcd: BigInt(parseInt(form.pcd) || 0),
      accessibilityOptions: form.accessibilityOptions,
      hadPartnership: form.hadPartnership,
      partnerName: form.partnerName || undefined,
      partnerType: form.partnerType || undefined,
      objective: form.objective || undefined,
      executedDescription: form.executedDescription,
      achievedResults: form.achievedResults,
      qualitativeAssessment: form.qualitativeAssessment,
      evidences: form.evidences,
      attachmentsPrefix: form.attachmentsPrefix,
      productRealised: form.productRealised,
      quantity: form.quantity || undefined,
      audienceRange: form.audienceRange,
      partnershipsInvolved: form.partnershipsInvolved || undefined,
      status: form.status,
      cancellationReason: form.cancellationReason || undefined,
      files: [],
      linkedActivityId: form.linkedActivityId || undefined,
    };

    if (isEditing && existingActivity) {
      const updatedActivity: Activity = {
        ...existingActivity,
        ...activityData,
        id: activityId!,
      };
      await updateMutation.mutateAsync({ activityId: activityId!, activity: updatedActivity });
    } else {
      await createMutation.mutateAsync(activityData);
    }

    navigate({ to: '/reports' });
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  if (isEditing && activityLoading) {
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
          <h1 className="font-semibold text-foreground">
            {isEditing ? 'Editar Atividade' : 'Nova Atividade'}
          </h1>
        </div>
        <Button onClick={handleSave} disabled={isSaving} size="sm">
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
          Salvar
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Activity Search / Deduplication */}
        {!isEditing && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Buscar Atividade Existente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome de atividade..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowSearchResults(true);
                  }}
                  className="pl-9"
                />
              </div>
              {showSearchResults && searchResults && searchResults.length > 0 && (
                <div className="mt-2 border border-border rounded-lg overflow-hidden">
                  {searchResults.slice(0, 5).map((result) => (
                    <button
                      key={result.id}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors border-b border-border last:border-0"
                      onClick={() => {
                        handleChange('linkedActivityId', result.id);
                        handleChange('activityName', result.activityName);
                        setShowSearchResults(false);
                        setSearchTerm('');
                      }}
                    >
                      {result.activityName}
                    </button>
                  ))}
                </div>
              )}
              {form.linkedActivityId && (
                <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Vinculada a: {form.linkedActivityId}</span>
                  <button onClick={() => handleChange('linkedActivityId', '')} className="text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Basic Info */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Informações Básicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs">Nome da Atividade *</Label>
              <Input
                value={form.activityName}
                onChange={(e) => handleChange('activityName', e.target.value)}
                className="mt-1"
                placeholder="Ex: Oficina de Arte"
              />
            </div>

            <div>
              <Label className="text-xs">Tipo de Ação</Label>
              <Input
                value={form.actionType}
                onChange={(e) => handleChange('actionType', e.target.value)}
                className="mt-1"
                placeholder="Ex: Educativo, Cultural..."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Data</Label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Museu</Label>
                <Select
                  value={form.museum}
                  onValueChange={(v) => handleChange('museum', v as MuseumLocation)}
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
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Classificação *</Label>
                <Select
                  value={form.classification}
                  onValueChange={(v) => handleChange('classification', v as Classification)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_CLASSIFICATIONS.map((c) => (
                      <SelectItem key={c} value={c}>
                        {classificationLabel(c)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Status *</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => handleChange('status', v as ActivityStatus)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_ACTIVITY_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {activityStatusLabel(s)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Cancellation reason */}
            {form.status === ActivityStatus.cancelled && (
              <div>
                <Label className="text-xs">Motivo do Cancelamento *</Label>
                <Textarea
                  value={form.cancellationReason}
                  onChange={(e) => handleChange('cancellationReason', e.target.value)}
                  rows={2}
                  className="mt-1"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Hours */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Horas Dedicadas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Switch
                checked={form.hoursNotApplicable}
                onCheckedChange={(v) => {
                  handleChange('hoursNotApplicable', v);
                  if (v) handleChange('dedicatedHours', '');
                }}
              />
              <Label className="text-xs">Não se aplica (horas)</Label>
            </div>
            {!form.hoursNotApplicable && (
              <div>
                <Label className="text-xs">Horas dedicadas à atividade</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.dedicatedHours}
                  onChange={(e) => handleChange('dedicatedHours', e.target.value)}
                  className="mt-1"
                  placeholder="Ex: 4"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Goal Fields (when goalLinked) */}
        {form.classification === Classification.goalLinked && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Informações da Meta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Número da Meta</Label>
                  <Input
                    type="number"
                    value={form.goalNumber}
                    onChange={(e) => handleChange('goalNumber', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Status da Meta</Label>
                  <Select
                    value={form.goalStatus}
                    onValueChange={(v) => handleChange('goalStatus', v as GoalStatus)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {ALL_GOAL_STATUSES.map((gs) => (
                        <SelectItem key={gs} value={gs}>
                          {goalStatusLabel(gs)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-xs">Descrição da Meta</Label>
                <Textarea
                  value={form.goalDescription}
                  onChange={(e) => handleChange('goalDescription', e.target.value)}
                  rows={2}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs">Indicador Planejado</Label>
                <Input
                  value={form.plannedIndicator}
                  onChange={(e) => handleChange('plannedIndicator', e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Meta Quantitativa</Label>
                  <Input
                    type="number"
                    value={form.quantitativeGoal}
                    onChange={(e) => handleChange('quantitativeGoal', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Resultado Alcançado</Label>
                  <Input
                    type="number"
                    value={form.achievedResult}
                    onChange={(e) => handleChange('achievedResult', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">% Contribuição</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={form.contributionPercent}
                    onChange={(e) => handleChange('contributionPercent', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs">Justificativa Técnica</Label>
                <Textarea
                  value={form.technicalJustification}
                  onChange={(e) => handleChange('technicalJustification', e.target.value)}
                  rows={2}
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Audience */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Público</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Total de Público *</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.totalAudience}
                  onChange={(e) => handleChange('totalAudience', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Faixa de Público</Label>
                <Select
                  value={form.audienceRange}
                  onValueChange={(v) => handleChange('audienceRange', v as AudienceRange)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_AUDIENCE_RANGES.map((ar) => (
                      <SelectItem key={ar} value={ar}>
                        {audienceRangeLabel(ar)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label className="text-xs">Crianças</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.children}
                  onChange={(e) => handleChange('children', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Jovens</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.youth}
                  onChange={(e) => handleChange('youth', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Adultos</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.adults}
                  onChange={(e) => handleChange('adults', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Idosos</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.elderly}
                  onChange={(e) => handleChange('elderly', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">PCD</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.pcd}
                  onChange={(e) => handleChange('pcd', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Partnerships involved (required for large audiences) */}
            {(form.audienceRange === AudienceRange.hundredOneToTwoHundred ||
              form.audienceRange === AudienceRange.twoHundredOneToFiveHundred ||
              form.audienceRange === AudienceRange.aboveFiveHundred) && (
              <div>
                <Label className="text-xs">Parcerias Envolvidas *</Label>
                <Textarea
                  value={form.partnershipsInvolved}
                  onChange={(e) => handleChange('partnershipsInvolved', e.target.value)}
                  rows={2}
                  className="mt-1"
                  placeholder="Descreva as parcerias envolvidas..."
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Accessibility */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Acessibilidade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {ALL_ACCESSIBILITY_OPTIONS.map((opt) => (
                <div key={opt} className="flex items-center gap-2">
                  <Checkbox
                    id={`acc-${opt}`}
                    checked={form.accessibilityOptions.includes(opt)}
                    onCheckedChange={() => {
                      handleChange('accessibilityOptions', toggleArrayItem(form.accessibilityOptions, opt));
                    }}
                  />
                  <Label htmlFor={`acc-${opt}`} className="text-xs cursor-pointer">
                    {accessibilityOptionLabel(opt)}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Partnership */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Parceria</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Switch
                checked={form.hadPartnership}
                onCheckedChange={(v) => handleChange('hadPartnership', v)}
              />
              <Label className="text-xs">Houve parceria?</Label>
            </div>
            {form.hadPartnership && (
              <>
                <div>
                  <Label className="text-xs">Nome do Parceiro</Label>
                  <Input
                    value={form.partnerName}
                    onChange={(e) => handleChange('partnerName', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Tipo de Parceiro</Label>
                  <Input
                    value={form.partnerType}
                    onChange={(e) => handleChange('partnerType', e.target.value)}
                    className="mt-1"
                    placeholder="Ex: ONG, Empresa, Governo..."
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Content */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Descrição e Resultados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs">Objetivo</Label>
              <Textarea
                value={form.objective}
                onChange={(e) => handleChange('objective', e.target.value)}
                rows={2}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Descrição Executada *</Label>
              <Textarea
                value={form.executedDescription}
                onChange={(e) => handleChange('executedDescription', e.target.value)}
                rows={3}
                className="mt-1"
                placeholder="Descreva como a atividade foi executada..."
              />
            </div>
            <div>
              <Label className="text-xs">Resultados Alcançados *</Label>
              <Textarea
                value={form.achievedResults}
                onChange={(e) => handleChange('achievedResults', e.target.value)}
                rows={3}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Avaliação Qualitativa *</Label>
              <Textarea
                value={form.qualitativeAssessment}
                onChange={(e) => handleChange('qualitativeAssessment', e.target.value)}
                rows={3}
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Product & Quantity */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Produto Realizado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs">Produto *</Label>
              <Select
                value={form.productRealised}
                onValueChange={(v) => handleChange('productRealised', v as ProductRealised)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ALL_PRODUCTS.map((p) => (
                    <SelectItem key={p} value={p}>
                      {productRealisedLabel(p)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {form.productRealised !== ProductRealised.naoSeAplica && (
              <div>
                <Label className="text-xs">Quantidade *</Label>
                <Select
                  value={form.quantity}
                  onValueChange={(v) => handleChange('quantity', v as Quantity)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_QUANTITIES.map((q) => (
                      <SelectItem key={q} value={q}>
                        {quantityLabel(q)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Evidences */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Evidências</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {ALL_EVIDENCE_TYPES.map((ev) => (
                <div key={ev} className="flex items-center gap-2">
                  <Checkbox
                    id={`ev-${ev}`}
                    checked={form.evidences.includes(ev)}
                    onCheckedChange={() => {
                      handleChange('evidences', toggleArrayItem(form.evidences, ev));
                    }}
                  />
                  <Label htmlFor={`ev-${ev}`} className="text-xs cursor-pointer">
                    {evidenceTypeLabel(ev)}
                  </Label>
                </div>
              ))}
            </div>

            <Separator />

            {/* File Upload */}
            <div>
              <Label className="text-xs">Anexos</Label>
              <div className="mt-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex items-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Enviando... {uploadProgress}%
                    </>
                  ) : (
                    <>
                      <Upload className="h-3.5 w-3.5" />
                      Adicionar Arquivo
                    </>
                  )}
                </Button>
              </div>
              {uploadedFiles.length > 0 && (
                <div className="mt-2 space-y-1">
                  {uploadedFiles.map((_blob, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <FileText className="h-3 w-3" />
                      <span>Arquivo {idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => setUploadedFiles((prev) => prev.filter((_, i) => i !== idx))}
                        className="text-destructive ml-auto"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label className="text-xs">Prefixo dos Anexos</Label>
              <Input
                value={form.attachmentsPrefix}
                onChange={(e) => handleChange('attachmentsPrefix', e.target.value)}
                className="mt-1"
                placeholder="Ex: oficina-arte-2025"
              />
            </div>
          </CardContent>
        </Card>

        {/* Error display */}
        {(createMutation.isError || updateMutation.isError) && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
            Erro ao salvar atividade. Verifique os campos obrigatórios e tente novamente.
          </div>
        )}
      </div>
    </div>
  );
}
