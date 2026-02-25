import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams, useSearch } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import {
  useActivitiesForReport,
  useCreateActivity,
  useUpdateActivity,
  useGetCallerUserProfile,
  useSearchActivities,
} from '../hooks/useQueries';
import {
  AccessibilityOption,
  ActivityStatus,
  AudienceRange,
  Classification,
  EvidenceType,
  GoalStatus,
  MuseumLocation,
  ProductRealised,
  Quantity,
  type Activity,
  type ActivityCreate,
  ExternalBlob,
} from '../backend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ArrowLeft, Save, Loader2, Upload, X, FileText, Image, Video, File, Check, ChevronsUpDown, Plus } from 'lucide-react';
import { MUSEUM_LOCATIONS, getMuseumLabel } from '../utils/labels';

const CLASSIFICATION_LABELS: Record<Classification, string> = {
  [Classification.goalLinked]: 'Vinculada a Meta',
  [Classification.routine]: 'Rotina',
  [Classification.extra]: 'Extra',
};

const GOAL_STATUS_LABELS: Record<GoalStatus, string> = {
  [GoalStatus.inProgress]: 'Em Andamento',
  [GoalStatus.partiallyCumplied]: 'Parcialmente Cumprida',
  [GoalStatus.achieved]: 'Alcançada',
  [GoalStatus.exceeded]: 'Superada',
};

const ACTIVITY_STATUS_LABELS: Record<ActivityStatus, string> = {
  [ActivityStatus.notStarted]: 'Não Iniciada',
  [ActivityStatus.submitted]: 'Submetida',
  [ActivityStatus.completed]: 'Concluída',
  [ActivityStatus.rescheduled]: 'Reagendada',
  [ActivityStatus.cancelled]: 'Cancelada',
};

const AUDIENCE_RANGE_LABELS: Record<AudienceRange, string> = {
  [AudienceRange.zeroToTwenty]: '0–20',
  [AudienceRange.twentyOneToFifty]: '21–50',
  [AudienceRange.fiftyOneToHundred]: '51–100',
  [AudienceRange.hundredOneToTwoHundred]: '101–200',
  [AudienceRange.twoHundredOneToFiveHundred]: '201–500',
  [AudienceRange.aboveFiveHundred]: 'Acima de 500',
  [AudienceRange.naoSeAplica]: 'Não se aplica',
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
  [ProductRealised.naoSeAplica]: 'Não se aplica',
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

const EVIDENCE_LABELS: Record<EvidenceType, string> = {
  [EvidenceType.photos]: 'Fotos',
  [EvidenceType.attendanceList]: 'Lista de Presença',
  [EvidenceType.report]: 'Relatório',
  [EvidenceType.graphicMaterial]: 'Material Gráfico',
  [EvidenceType.other]: 'Outro',
};

const ACCESSIBILITY_LABELS: Record<AccessibilityOption, string> = {
  [AccessibilityOption.none]: 'Nenhuma',
  [AccessibilityOption.libras]: 'Libras',
  [AccessibilityOption.audioDescription]: 'Audiodescrição',
  [AccessibilityOption.tactileMaterial]: 'Material Tátil',
  [AccessibilityOption.other]: 'Outro',
};

interface UploadedFile {
  name: string;
  type: string;
  size: number;
  blob: ExternalBlob;
  progress: number;
  uploaded: boolean;
  error?: string;
  previewUrl?: string;
}

function getFileIcon(type: string) {
  if (type.startsWith('image/')) return <Image className="w-4 h-4" />;
  if (type.startsWith('video/')) return <Video className="w-4 h-4" />;
  if (type === 'application/pdf' || type.includes('document') || type.includes('text')) return <FileText className="w-4 h-4" />;
  return <File className="w-4 h-4" />;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function ActivityFormPage() {
  const navigate = useNavigate();
  const { reportId, activityId } = useParams({ strict: false }) as { reportId?: string; activityId?: string };
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();

  const { data: activities } = useActivitiesForReport(reportId);
  const createActivity = useCreateActivity();
  const updateActivity = useUpdateActivity();

  const isEditing = !!activityId;
  const existingActivity = activities?.find((a) => a.id === activityId);

  // Activity search state
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [linkedActivityId, setLinkedActivityId] = useState<string | undefined>(undefined);
  const { data: searchResults } = useSearchActivities(searchTerm);

  // File upload state
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [form, setForm] = useState<Partial<ActivityCreate>>({
    reportId: reportId ?? '',
    date: BigInt(Date.now()) * BigInt(1_000_000),
    museum: MuseumLocation.equipePrincipal,
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
    audienceRange: AudienceRange.zeroToTwenty,
    partnershipsInvolved: undefined,
    status: ActivityStatus.notStarted,
    cancellationReason: undefined,
    files: [],
    linkedActivityId: undefined,
  });

  const [hoursNotApplicable, setHoursNotApplicable] = useState(false);
  const [dedicatedHoursInput, setDedicatedHoursInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isEditing && existingActivity) {
      setForm({
        ...existingActivity,
        id: existingActivity.id,
      });
      setHoursNotApplicable(existingActivity.hoursNotApplicable);
      if (existingActivity.dedicatedHours !== undefined && existingActivity.dedicatedHours !== null) {
        setDedicatedHoursInput(existingActivity.dedicatedHours.toString());
      }
      setLinkedActivityId(existingActivity.linkedActivityId ?? undefined);
    }
  }, [isEditing, existingActivity]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const newFiles: UploadedFile[] = [];

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        setError(`Arquivo "${file.name}" excede o limite de 10MB.`);
        continue;
      }

      const previewUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined;

      const uploadedFile: UploadedFile = {
        name: file.name,
        type: file.type,
        size: file.size,
        blob: ExternalBlob.fromBytes(new Uint8Array(0)),
        progress: 0,
        uploaded: false,
        previewUrl,
      };

      newFiles.push(uploadedFile);
    }

    setUploadedFiles((prev) => [...prev, ...newFiles]);

    // Process each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > MAX_FILE_SIZE) continue;

      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);

      const idx = uploadedFiles.length + i;

      const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((percentage) => {
        setUploadedFiles((prev) =>
          prev.map((f, fi) => (fi === idx ? { ...f, progress: percentage } : f))
        );
      });

      setUploadedFiles((prev) =>
        prev.map((f, fi) =>
          fi === idx ? { ...f, blob, uploaded: true, progress: 100 } : f
        )
      );
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [uploadedFiles.length]);

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => {
      const file = prev[index];
      if (file.previewUrl) URL.revokeObjectURL(file.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSelectExistingActivity = (result: { id: string; activityName: string }) => {
    setLinkedActivityId(result.id);
    setForm((prev) => ({ ...prev, activityName: result.activityName, linkedActivityId: result.id }));
    setSearchOpen(false);
    setSearchTerm('');
  };

  const handleClearLinkedActivity = () => {
    setLinkedActivityId(undefined);
    setForm((prev) => ({ ...prev, linkedActivityId: undefined }));
  };

  const updateField = <K extends keyof ActivityCreate>(key: K, value: ActivityCreate[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleAccessibility = (option: AccessibilityOption) => {
    setForm((prev) => {
      const current = prev.accessibilityOptions ?? [];
      if (option === AccessibilityOption.none) {
        return { ...prev, accessibilityOptions: [AccessibilityOption.none] };
      }
      const withoutNone = current.filter((o) => o !== AccessibilityOption.none);
      if (withoutNone.includes(option)) {
        const updated = withoutNone.filter((o) => o !== option);
        return { ...prev, accessibilityOptions: updated.length ? updated : [AccessibilityOption.none] };
      }
      return { ...prev, accessibilityOptions: [...withoutNone, option] };
    });
  };

  const toggleEvidence = (ev: EvidenceType) => {
    setForm((prev) => {
      const current = prev.evidences ?? [];
      if (current.includes(ev)) {
        return { ...prev, evidences: current.filter((e) => e !== ev) };
      }
      return { ...prev, evidences: [...current, ev] };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!reportId) {
      setError('ID do relatório não encontrado.');
      return;
    }

    const fileAttachments = uploadedFiles
      .filter((f) => f.uploaded)
      .map((f) => f.blob as unknown as Uint8Array);

    const activityData: ActivityCreate = {
      id: isEditing ? activityId! : '',
      reportId: reportId,
      date: form.date ?? BigInt(Date.now()) * BigInt(1_000_000),
      museum: form.museum ?? MuseumLocation.equipePrincipal,
      actionType: form.actionType ?? '',
      activityName: form.activityName ?? '',
      dedicatedHours: hoursNotApplicable ? undefined : (dedicatedHoursInput ? BigInt(parseInt(dedicatedHoursInput)) : undefined),
      hoursNotApplicable,
      classification: form.classification ?? Classification.routine,
      goalNumber: form.goalNumber,
      goalDescription: form.goalDescription,
      plannedIndicator: form.plannedIndicator,
      quantitativeGoal: form.quantitativeGoal,
      achievedResult: form.achievedResult,
      contributionPercent: form.contributionPercent,
      goalStatus: form.goalStatus,
      technicalJustification: form.technicalJustification,
      totalAudience: form.totalAudience ?? BigInt(0),
      children: form.children ?? BigInt(0),
      youth: form.youth ?? BigInt(0),
      adults: form.adults ?? BigInt(0),
      elderly: form.elderly ?? BigInt(0),
      pcd: form.pcd ?? BigInt(0),
      accessibilityOptions: form.accessibilityOptions ?? [AccessibilityOption.none],
      hadPartnership: form.hadPartnership ?? false,
      partnerName: form.partnerName,
      partnerType: form.partnerType,
      objective: form.objective,
      executedDescription: form.executedDescription ?? '',
      achievedResults: form.achievedResults ?? '',
      qualitativeAssessment: form.qualitativeAssessment ?? '',
      evidences: form.evidences ?? [],
      attachmentsPrefix: form.attachmentsPrefix ?? '',
      productRealised: form.productRealised ?? ProductRealised.naoSeAplica,
      quantity: form.productRealised === ProductRealised.naoSeAplica ? undefined : form.quantity,
      audienceRange: form.audienceRange ?? AudienceRange.zeroToTwenty,
      partnershipsInvolved: form.partnershipsInvolved,
      status: form.status ?? ActivityStatus.notStarted,
      cancellationReason: form.status === ActivityStatus.cancelled ? form.cancellationReason : undefined,
      files: fileAttachments,
      linkedActivityId: linkedActivityId,
    };

    try {
      if (isEditing && activityId) {
        await updateActivity.mutateAsync({
          activityId,
          activity: { ...activityData, id: activityId } as Activity,
        });
      } else {
        await createActivity.mutateAsync(activityData);
      }
      navigate({ to: `/reports/${reportId}` });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar atividade.');
    }
  };

  const isLoading = createActivity.isPending || updateActivity.isPending;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: `/reports/${reportId}` })}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {isEditing ? 'Editar Atividade' : 'Nova Atividade'}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {isEditing ? 'Atualize os dados da atividade' : 'Preencha os dados da nova atividade'}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Activity Deduplication Section */}
          <div className="card-section">
            <h2 className="section-title">Vincular a Atividade Existente</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Pesquise se esta atividade já foi cadastrada por outro usuário para evitar duplicidade.
            </p>

            {linkedActivityId ? (
              <div className="flex items-center gap-3 p-3 bg-success/10 border border-success/20 rounded-lg">
                <Check className="w-4 h-4 text-success" />
                <span className="text-sm font-medium text-foreground flex-1">
                  Vinculada: {form.activityName}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClearLinkedActivity}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                  Desvincular
                </Button>
              </div>
            ) : (
              <Popover open={searchOpen} onOpenChange={setSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={searchOpen}
                    className="w-full justify-between"
                  >
                    <span className="text-muted-foreground">Pesquisar atividades existentes...</span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput
                      placeholder="Digite o nome da atividade..."
                      value={searchTerm}
                      onValueChange={setSearchTerm}
                    />
                    <CommandList>
                      <CommandEmpty>
                        {searchTerm.length > 0 ? 'Nenhuma atividade encontrada.' : 'Digite para pesquisar.'}
                      </CommandEmpty>
                      {searchResults && searchResults.length > 0 && (
                        <CommandGroup heading="Atividades encontradas">
                          {searchResults.map((result) => (
                            <CommandItem
                              key={result.id}
                              value={result.activityName}
                              onSelect={() => handleSelectExistingActivity(result)}
                            >
                              <Check className="mr-2 h-4 w-4 opacity-0" />
                              {result.activityName}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            )}
          </div>

          {/* Basic Info */}
          <div className="card-section">
            <h2 className="section-title">Informações Básicas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="activityName">Nome da Atividade *</Label>
                <Input
                  id="activityName"
                  value={form.activityName ?? ''}
                  onChange={(e) => updateField('activityName', e.target.value)}
                  placeholder="Nome da atividade"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="actionType">Tipo de Ação *</Label>
                <Input
                  id="actionType"
                  value={form.actionType ?? ''}
                  onChange={(e) => updateField('actionType', e.target.value)}
                  placeholder="Ex: Oficina, Palestra, Exposição..."
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="date">Data *</Label>
                <Input
                  id="date"
                  type="date"
                  value={form.date ? new Date(Number(form.date) / 1_000_000).toISOString().split('T')[0] : ''}
                  onChange={(e) => {
                    const ms = new Date(e.target.value).getTime();
                    updateField('date', BigInt(ms) * BigInt(1_000_000));
                  }}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="museum">Equipe/Museu *</Label>
                <Select
                  value={form.museum ?? MuseumLocation.equipePrincipal}
                  onValueChange={(v) => updateField('museum', v as MuseumLocation)}
                >
                  <SelectTrigger id="museum">
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
                <Label htmlFor="status">Status da Atividade *</Label>
                <Select
                  value={form.status ?? ActivityStatus.notStarted}
                  onValueChange={(v) => updateField('status', v as ActivityStatus)}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ACTIVITY_STATUS_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {form.status === ActivityStatus.cancelled && (
                <div className="space-y-1.5 md:col-span-2">
                  <Label htmlFor="cancellationReason">Motivo do Cancelamento *</Label>
                  <Textarea
                    id="cancellationReason"
                    value={form.cancellationReason ?? ''}
                    onChange={(e) => updateField('cancellationReason', e.target.value)}
                    placeholder="Descreva o motivo do cancelamento..."
                    rows={3}
                    required
                  />
                </div>
              )}
            </div>
          </div>

          {/* Hours */}
          <div className="card-section">
            <h2 className="section-title">Horas Dedicadas à Atividade</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Input
                  id="dedicatedHours"
                  type="number"
                  min="0"
                  value={dedicatedHoursInput}
                  onChange={(e) => {
                    setDedicatedHoursInput(e.target.value);
                    if (e.target.value) {
                      setHoursNotApplicable(false);
                    }
                  }}
                  disabled={hoursNotApplicable}
                  placeholder="Número de horas"
                  className="w-40"
                />
                <span className="text-sm text-muted-foreground">horas</span>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="hoursNotApplicable"
                  checked={hoursNotApplicable}
                  onCheckedChange={(checked) => {
                    const val = checked === true;
                    setHoursNotApplicable(val);
                    if (val) {
                      setDedicatedHoursInput('');
                    }
                  }}
                />
                <Label htmlFor="hoursNotApplicable" className="cursor-pointer text-sm">
                  Não se aplica
                </Label>
              </div>
            </div>
          </div>

          {/* Classification */}
          <div className="card-section">
            <h2 className="section-title">Classificação</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Classificação *</Label>
                <Select
                  value={form.classification ?? Classification.routine}
                  onValueChange={(v) => updateField('classification', v as Classification)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CLASSIFICATION_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {form.classification === Classification.goalLinked && (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="goalNumber">Número da Meta</Label>
                    <Input
                      id="goalNumber"
                      type="number"
                      value={form.goalNumber !== undefined ? Number(form.goalNumber) : ''}
                      onChange={(e) => updateField('goalNumber', e.target.value ? BigInt(e.target.value) : undefined)}
                      placeholder="Ex: 1"
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <Label htmlFor="goalDescription">Descrição da Meta</Label>
                    <Textarea
                      id="goalDescription"
                      value={form.goalDescription ?? ''}
                      onChange={(e) => updateField('goalDescription', e.target.value || undefined)}
                      placeholder="Descreva a meta..."
                      rows={2}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="plannedIndicator">Indicador Planejado</Label>
                    <Input
                      id="plannedIndicator"
                      value={form.plannedIndicator ?? ''}
                      onChange={(e) => updateField('plannedIndicator', e.target.value || undefined)}
                      placeholder="Indicador planejado"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="quantitativeGoal">Meta Quantitativa</Label>
                    <Input
                      id="quantitativeGoal"
                      type="number"
                      value={form.quantitativeGoal !== undefined ? Number(form.quantitativeGoal) : ''}
                      onChange={(e) => updateField('quantitativeGoal', e.target.value ? BigInt(e.target.value) : undefined)}
                      placeholder="Valor numérico"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="achievedResult">Resultado Alcançado</Label>
                    <Input
                      id="achievedResult"
                      type="number"
                      value={form.achievedResult !== undefined ? Number(form.achievedResult) : ''}
                      onChange={(e) => updateField('achievedResult', e.target.value ? BigInt(e.target.value) : undefined)}
                      placeholder="Valor alcançado"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="contributionPercent">% de Contribuição</Label>
                    <Input
                      id="contributionPercent"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={form.contributionPercent ?? ''}
                      onChange={(e) => updateField('contributionPercent', e.target.value ? parseFloat(e.target.value) : undefined)}
                      placeholder="0–100"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label>Status da Meta</Label>
                    <Select
                      value={form.goalStatus ?? ''}
                      onValueChange={(v) => updateField('goalStatus', v ? v as GoalStatus : undefined)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(GOAL_STATUS_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <Label htmlFor="technicalJustification">Justificativa Técnica</Label>
                    <Textarea
                      id="technicalJustification"
                      value={form.technicalJustification ?? ''}
                      onChange={(e) => updateField('technicalJustification', e.target.value || undefined)}
                      placeholder="Justificativa técnica..."
                      rows={3}
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Audience */}
          <div className="card-section">
            <h2 className="section-title">Público</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="totalAudience">Total de Público *</Label>
                <Input
                  id="totalAudience"
                  type="number"
                  min="0"
                  value={form.totalAudience !== undefined ? Number(form.totalAudience) : ''}
                  onChange={(e) => updateField('totalAudience', BigInt(e.target.value || '0'))}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="children">Crianças</Label>
                <Input
                  id="children"
                  type="number"
                  min="0"
                  value={form.children !== undefined ? Number(form.children) : ''}
                  onChange={(e) => updateField('children', BigInt(e.target.value || '0'))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="youth">Jovens</Label>
                <Input
                  id="youth"
                  type="number"
                  min="0"
                  value={form.youth !== undefined ? Number(form.youth) : ''}
                  onChange={(e) => updateField('youth', BigInt(e.target.value || '0'))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="adults">Adultos</Label>
                <Input
                  id="adults"
                  type="number"
                  min="0"
                  value={form.adults !== undefined ? Number(form.adults) : ''}
                  onChange={(e) => updateField('adults', BigInt(e.target.value || '0'))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="elderly">Idosos</Label>
                <Input
                  id="elderly"
                  type="number"
                  min="0"
                  value={form.elderly !== undefined ? Number(form.elderly) : ''}
                  onChange={(e) => updateField('elderly', BigInt(e.target.value || '0'))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pcd">PCD</Label>
                <Input
                  id="pcd"
                  type="number"
                  min="0"
                  value={form.pcd !== undefined ? Number(form.pcd) : ''}
                  onChange={(e) => updateField('pcd', BigInt(e.target.value || '0'))}
                />
              </div>
            </div>

            <div className="mt-4 space-y-1.5">
              <Label>Faixa de Público *</Label>
              <Select
                value={form.audienceRange ?? AudienceRange.zeroToTwenty}
                onValueChange={(v) => updateField('audienceRange', v as AudienceRange)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(AUDIENCE_RANGE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {(form.audienceRange === AudienceRange.hundredOneToTwoHundred ||
              form.audienceRange === AudienceRange.twoHundredOneToFiveHundred ||
              form.audienceRange === AudienceRange.aboveFiveHundred) && (
              <div className="mt-4 space-y-1.5">
                <Label htmlFor="partnershipsInvolved">Parcerias Envolvidas *</Label>
                <Textarea
                  id="partnershipsInvolved"
                  value={form.partnershipsInvolved ?? ''}
                  onChange={(e) => updateField('partnershipsInvolved', e.target.value || undefined)}
                  placeholder="Descreva as parcerias envolvidas..."
                  rows={2}
                  required
                />
              </div>
            )}
          </div>

          {/* Accessibility */}
          <div className="card-section">
            <h2 className="section-title">Acessibilidade</h2>
            <div className="flex flex-wrap gap-2">
              {Object.entries(ACCESSIBILITY_LABELS).map(([value, label]) => {
                const isSelected = (form.accessibilityOptions ?? []).includes(value as AccessibilityOption);
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => toggleAccessibility(value as AccessibilityOption)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      isSelected
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background text-foreground border-border hover:border-primary/50'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Partnership */}
          <div className="card-section">
            <h2 className="section-title">Parceria</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="hadPartnership"
                  checked={form.hadPartnership ?? false}
                  onCheckedChange={(checked) => updateField('hadPartnership', checked === true)}
                />
                <Label htmlFor="hadPartnership" className="cursor-pointer">
                  Esta atividade teve parceria
                </Label>
              </div>

              {form.hadPartnership && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="partnerName">Nome do Parceiro</Label>
                    <Input
                      id="partnerName"
                      value={form.partnerName ?? ''}
                      onChange={(e) => updateField('partnerName', e.target.value || undefined)}
                      placeholder="Nome da organização parceira"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="partnerType">Tipo de Parceiro</Label>
                    <Input
                      id="partnerType"
                      value={form.partnerType ?? ''}
                      onChange={(e) => updateField('partnerType', e.target.value || undefined)}
                      placeholder="Ex: ONG, Empresa, Governo..."
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Product & Quantity */}
          <div className="card-section">
            <h2 className="section-title">Produto Realizado</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Produto Realizado *</Label>
                <Select
                  value={form.productRealised ?? ProductRealised.naoSeAplica}
                  onValueChange={(v) => updateField('productRealised', v as ProductRealised)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PRODUCT_REALISED_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {form.productRealised !== ProductRealised.naoSeAplica && (
                <div className="space-y-1.5">
                  <Label>Quantidade *</Label>
                  <Select
                    value={form.quantity ?? ''}
                    onValueChange={(v) => updateField('quantity', v ? v as Quantity : undefined)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(QUANTITY_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="card-section">
            <h2 className="section-title">Descrição e Resultados</h2>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="objective">Objetivo</Label>
                <Textarea
                  id="objective"
                  value={form.objective ?? ''}
                  onChange={(e) => updateField('objective', e.target.value || undefined)}
                  placeholder="Objetivo da atividade..."
                  rows={2}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="executedDescription">Descrição Executada *</Label>
                <Textarea
                  id="executedDescription"
                  value={form.executedDescription ?? ''}
                  onChange={(e) => updateField('executedDescription', e.target.value)}
                  placeholder="Descreva como a atividade foi executada..."
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="achievedResults">Resultados Alcançados *</Label>
                <Textarea
                  id="achievedResults"
                  value={form.achievedResults ?? ''}
                  onChange={(e) => updateField('achievedResults', e.target.value)}
                  placeholder="Descreva os resultados alcançados..."
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="qualitativeAssessment">Avaliação Qualitativa *</Label>
                <Textarea
                  id="qualitativeAssessment"
                  value={form.qualitativeAssessment ?? ''}
                  onChange={(e) => updateField('qualitativeAssessment', e.target.value)}
                  placeholder="Avaliação qualitativa da atividade..."
                  rows={3}
                  required
                />
              </div>
            </div>
          </div>

          {/* Evidences */}
          <div className="card-section">
            <h2 className="section-title">Evidências</h2>
            <div className="flex flex-wrap gap-2">
              {Object.entries(EVIDENCE_LABELS).map(([value, label]) => {
                const isSelected = (form.evidences ?? []).includes(value as EvidenceType);
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => toggleEvidence(value as EvidenceType)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      isSelected
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background text-foreground border-border hover:border-primary/50'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* File Attachments */}
          <div className="card-section">
            <h2 className="section-title">Anexos</h2>
            <div className="space-y-4">
              <div
                className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Clique para selecionar arquivos ou arraste aqui
                </p>
                <p className="text-xs text-muted-foreground mt-1">Máximo 10MB por arquivo</p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileSelect}
                accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
              />

              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-border">
                      {file.previewUrl ? (
                        <img src={file.previewUrl} alt={file.name} className="w-10 h-10 object-cover rounded" />
                      ) : (
                        <div className="w-10 h-10 flex items-center justify-center bg-background rounded border border-border text-muted-foreground">
                          {getFileIcon(file.type)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                        {!file.uploaded && (
                          <Progress value={file.progress} className="h-1 mt-1" />
                        )}
                      </div>
                      {file.uploaded && (
                        <Badge variant="secondary" className="text-xs shrink-0">
                          <Check className="w-3 h-3 mr-1" />
                          Pronto
                        </Badge>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFile(index)}
                        className="shrink-0 text-muted-foreground hover:text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 justify-end pb-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate({ to: `/reports/${reportId}` })}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {isEditing ? 'Salvar Alterações' : 'Criar Atividade'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
