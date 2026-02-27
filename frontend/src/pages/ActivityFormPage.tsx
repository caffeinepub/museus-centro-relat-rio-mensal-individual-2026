import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { toast } from 'sonner';
import { ArrowLeft, Save, Loader2, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useGetActivity,
  useCreateActivity,
  useUpdateActivity,
} from '../hooks/useQueries';
import { getMuseumLabel } from '../utils/labels';

const MUSEUM_LOCATIONS = [
  'equipePrincipal',
  'comunicacao',
  'administracao',
  'programacao',
  'producaoGeral',
  'coordenacao',
] as const;

const LOCAL_REALIZADO_OPTIONS = [
  { value: 'MHAB', label: 'MHAB' },
  { value: 'MUMO', label: 'MUMO' },
  { value: 'MIS', label: 'MIS' },
  { value: 'Outro', label: 'Outro' },
];

const PRODUTO_REALIZADO_OPTIONS = [
  { value: 'coberturaFotografica', label: 'Cobertura Fotográfica' },
  { value: 'posts', label: 'Posts' },
  { value: 'releases', label: 'Releases' },
  { value: 'textoExpografico', label: 'Texto Expográfico' },
  { value: 'textoCatalogo', label: 'Texto Catálogo' },
  { value: 'designCatalogo', label: 'Design Catálogo' },
  { value: 'coberturaDeVideo', label: 'Cobertura de Vídeo' },
  { value: 'outros', label: 'Outros' },
];

const ACTIVITY_STATUS_OPTIONS = [
  { value: 'notStarted', label: 'Não Iniciada' },
  { value: 'submitted', label: 'Enviada' },
  { value: 'completed', label: 'Concluída' },
  { value: 'rescheduled', label: 'Reagendada' },
  { value: 'cancelled', label: 'Cancelada' },
];

const CLASSIFICATION_OPTIONS = [
  { value: 'goalLinked', label: 'Vinculada à Meta' },
  { value: 'routine', label: 'Rotina' },
  { value: 'extra', label: 'Extra' },
];

interface ActivityFormData {
  activityName: string;
  actionType: string;
  museum: string;
  localRealizado: string;
  localOutroDescricao: string;
  date: string;
  startTime: string;
  endTime: string;
  executedDescription: string;
  achievedResults: string;
  qualitativeAssessment: string;
  totalAudience: number;
  classification: string;
  status: string;
  cancellationReason: string;
  produtosRealizados: string[];
  hoursNotApplicable: boolean;
  dedicatedHours: number | null;
}

const defaultForm: ActivityFormData = {
  activityName: '',
  actionType: '',
  museum: 'equipePrincipal',
  localRealizado: 'MHAB',
  localOutroDescricao: '',
  date: new Date().toISOString().split('T')[0],
  startTime: '09:00',
  endTime: '10:00',
  executedDescription: '',
  achievedResults: '',
  qualitativeAssessment: '',
  totalAudience: 0,
  classification: 'routine',
  status: 'completed',
  cancellationReason: '',
  produtosRealizados: [],
  hoursNotApplicable: false,
  dedicatedHours: null,
};

function generateId(): string {
  return `act_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function dateStringToNanoseconds(dateStr: string): bigint {
  return BigInt(new Date(dateStr).getTime()) * BigInt(1_000_000);
}

function timeStringToNanoseconds(timeStr: string, dateStr: string): bigint {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const d = new Date(dateStr);
  d.setHours(hours, minutes, 0, 0);
  return BigInt(d.getTime()) * BigInt(1_000_000);
}

export default function ActivityFormPage() {
  const { reportId, activityId } = useParams({ strict: false }) as {
    reportId?: string;
    activityId?: string;
  };
  const navigate = useNavigate();
  const isEditing = !!activityId;

  const { data: existingActivity, isLoading: activityLoading } = useGetActivity(activityId);
  const createActivity = useCreateActivity();
  const updateActivity = useUpdateActivity();

  const [form, setForm] = useState<ActivityFormData>(defaultForm);
  const [initialized, setInitialized] = useState(false);
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);

  useEffect(() => {
    if (existingActivity && !initialized) {
      setForm({
        activityName: existingActivity.activityName ?? '',
        actionType: existingActivity.actionType ?? '',
        museum: String(existingActivity.museum ?? 'equipePrincipal'),
        localRealizado: String(existingActivity.localRealizado ?? 'MHAB'),
        localOutroDescricao: existingActivity.localOutroDescricao ?? '',
        date: existingActivity.date
          ? new Date(Number(existingActivity.date) / 1_000_000).toISOString().split('T')[0]
          : defaultForm.date,
        startTime: existingActivity.startTime
          ? new Date(Number(existingActivity.startTime) / 1_000_000).toTimeString().slice(0, 5)
          : defaultForm.startTime,
        endTime: existingActivity.endTime
          ? new Date(Number(existingActivity.endTime) / 1_000_000).toTimeString().slice(0, 5)
          : defaultForm.endTime,
        executedDescription: existingActivity.executedDescription ?? '',
        achievedResults: existingActivity.achievedResults ?? '',
        qualitativeAssessment: existingActivity.qualitativeAssessment ?? '',
        totalAudience: Number(existingActivity.totalAudience ?? 0),
        classification: String(existingActivity.classification ?? 'routine'),
        status: String(existingActivity.status ?? 'completed'),
        cancellationReason: existingActivity.cancellationReason ?? '',
        produtosRealizados: existingActivity.produtosRealizados?.map(String) ?? [],
        hoursNotApplicable: existingActivity.hoursNotApplicable ?? false,
        dedicatedHours: existingActivity.dedicatedHours != null ? Number(existingActivity.dedicatedHours) : null,
      });
      setInitialized(true);
    }
  }, [existingActivity, initialized]);

  const buildActivity = () => {
    const dateNs = dateStringToNanoseconds(form.date);
    const startNs = timeStringToNanoseconds(form.startTime, form.date);
    const endNs = timeStringToNanoseconds(form.endTime, form.date);

    return {
      id: activityId ?? generateId(),
      reportId: reportId ?? '',
      date: dateNs,
      startDate: dateNs,
      endDate: dateNs,
      startTime: startNs,
      endTime: endNs,
      museum: { [form.museum]: null },
      localRealizado: { [form.localRealizado]: null },
      localOutroDescricao: form.localOutroDescricao,
      actionType: form.actionType,
      activityName: form.activityName,
      dedicatedHours: form.dedicatedHours != null ? [form.dedicatedHours] : [],
      hoursNotApplicable: form.hoursNotApplicable,
      classification: { [form.classification]: null },
      goalNumber: [],
      goalDescription: [],
      plannedIndicator: [],
      quantitativeGoal: [],
      achievedResult: [],
      contributionPercent: [],
      goalStatus: [],
      technicalJustification: [],
      totalAudience: form.totalAudience,
      children: 0,
      youth: 0,
      adults: 0,
      elderly: 0,
      pcd: 0,
      accessibilityOptions: [],
      hadPartnership: false,
      partnerName: [],
      partnerType: [],
      objective: [],
      executedDescription: form.executedDescription,
      achievedResults: form.achievedResults,
      qualitativeAssessment: form.qualitativeAssessment,
      evidences: [],
      attachmentsPrefix: '',
      productRealised: { naoSeAplica: null },
      quantity: [],
      audienceRange: { naoSeAplica: null },
      partnershipsInvolved: [],
      status: { [form.status]: null },
      cancellationReason: form.cancellationReason ? [form.cancellationReason] : [],
      files: [],
      linkedActivityId: [],
      evidencias: [],
      produtosRealizados: form.produtosRealizados.map(p => ({ [p]: null })),
    };
  };

  const handleSave = async () => {
    try {
      const activity = buildActivity();
      if (isEditing && activityId) {
        await updateActivity.mutateAsync({ activityId, activity });
        toast.success('Atividade atualizada com sucesso!');
      } else {
        await createActivity.mutateAsync(activity);
        toast.success('Atividade criada com sucesso!');
      }
      navigate({ to: `/reports/${reportId}/edit` });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao salvar atividade';
      toast.error(message);
    }
  };

  const toggleProduto = (value: string) => {
    setForm(f => ({
      ...f,
      produtosRealizados: f.produtosRealizados.includes(value)
        ? f.produtosRealizados.filter(p => p !== value)
        : [...f.produtosRealizados, value],
    }));
  };

  const setField = <K extends keyof ActivityFormData>(key: K, value: ActivityFormData[K]) => {
    setForm(f => ({ ...f, [key]: value }));
  };

  const isSaving = createActivity.isPending || updateActivity.isPending;

  if (isEditing && activityLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate({ to: `/reports/${reportId}/edit` })}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-bold text-foreground">
          {isEditing ? 'Editar Atividade' : 'Nova Atividade'}
        </h1>
      </div>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Básicas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label>Nome da Atividade</Label>
            <Input value={form.activityName} onChange={e => setField('activityName', e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Tipo de Ação</Label>
            <Input value={form.actionType} onChange={e => setField('actionType', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Museu</Label>
              <Select value={form.museum} onValueChange={v => setField('museum', v)}>
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {MUSEUM_LOCATIONS.map(m => (
                    <SelectItem key={m} value={m}>{getMuseumLabel(m)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Local Realizado</Label>
              <Select value={form.localRealizado} onValueChange={v => setField('localRealizado', v)}>
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {LOCAL_REALIZADO_OPTIONS.map(o => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {form.localRealizado === 'Outro' && (
            <div className="space-y-1">
              <Label>Descrição do Local</Label>
              <Input
                value={form.localOutroDescricao}
                onChange={e => setField('localOutroDescricao', e.target.value)}
              />
            </div>
          )}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label>Data</Label>
              <Input
                type="date"
                value={form.date}
                onChange={e => setField('date', e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Hora Início</Label>
              <Input
                type="time"
                value={form.startTime}
                onChange={e => setField('startTime', e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Hora Fim</Label>
              <Input
                type="time"
                value={form.endTime}
                onChange={e => setField('endTime', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Classification & Status */}
      <Card>
        <CardHeader>
          <CardTitle>Classificação e Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Classificação</Label>
              <Select value={form.classification} onValueChange={v => setField('classification', v)}>
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {CLASSIFICATION_OPTIONS.map(o => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => setField('status', v)}>
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {ACTIVITY_STATUS_OPTIONS.map(o => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {form.status === 'cancelled' && (
            <div className="space-y-1">
              <Label>Motivo do Cancelamento</Label>
              <Textarea
                value={form.cancellationReason}
                onChange={e => setField('cancellationReason', e.target.value)}
                rows={2}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle>Descrição e Resultados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label>Descrição Executada</Label>
            <Textarea
              value={form.executedDescription}
              onChange={e => setField('executedDescription', e.target.value)}
              rows={3}
            />
          </div>
          <div className="space-y-1">
            <Label>Resultados Alcançados</Label>
            <Textarea
              value={form.achievedResults}
              onChange={e => setField('achievedResults', e.target.value)}
              rows={3}
            />
          </div>
          <div className="space-y-1">
            <Label>Avaliação Qualitativa</Label>
            <Textarea
              value={form.qualitativeAssessment}
              onChange={e => setField('qualitativeAssessment', e.target.value)}
              rows={3}
            />
          </div>
          <div className="space-y-1">
            <Label>Público Total</Label>
            <Input
              type="number"
              min={0}
              value={form.totalAudience}
              onChange={e => setField('totalAudience', Number(e.target.value))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Produtos Realizados */}
      <Card>
        <CardHeader>
          <CardTitle>Produtos Realizados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {PRODUTO_REALIZADO_OPTIONS.map(o => (
              <label key={o.value} className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={form.produtosRealizados.includes(o.value)}
                  onChange={() => toggleProduto(o.value)}
                  className="rounded"
                />
                {o.label}
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Evidence Files */}
      <Card>
        <CardHeader>
          <CardTitle>Evidências</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <label className="cursor-pointer">
              <input
                type="file"
                multiple
                className="hidden"
                onChange={e => {
                  const files = Array.from(e.target.files ?? []);
                  setEvidenceFiles(prev => [...prev, ...files]);
                }}
              />
              <Button variant="outline" type="button" asChild>
                <span>
                  <Upload className="w-4 h-4 mr-2" />
                  Adicionar Arquivos
                </span>
              </Button>
            </label>
          </div>
          {evidenceFiles.length > 0 && (
            <div className="space-y-1">
              {evidenceFiles.map((file, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm p-2 bg-muted/30 rounded">
                  <span className="flex-1 truncate">{file.name}</span>
                  <span className="text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEvidenceFiles(prev => prev.filter((_, i) => i !== idx))}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center gap-3 pb-6">
        <Button
          variant="outline"
          onClick={() => navigate({ to: `/reports/${reportId}/edit` })}
          disabled={isSaving}
        >
          Cancelar
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          Salvar Atividade
        </Button>
      </div>
    </div>
  );
}
