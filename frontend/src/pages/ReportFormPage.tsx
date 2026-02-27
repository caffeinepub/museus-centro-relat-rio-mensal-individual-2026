import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { toast } from 'sonner';
import { Save, Send, ArrowLeft, Loader2, Plus } from 'lucide-react';
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
  useGetReport,
  useCreateReport,
  useUpdateReport,
  useSubmitReport,
  useActivitiesForReport,
} from '@/hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import SignatureCanvas, { type SignatureCanvasHandle } from '../components/SignatureCanvas';
import ActivitiesList from '../components/ActivitiesList';
import { getMuseumLabel, getMonthLabel } from '../utils/labels';

const MUSEUM_LOCATIONS = [
  'equipePrincipal',
  'comunicacao',
  'administracao',
  'programacao',
  'producaoGeral',
  'coordenacao',
] as const;

const MONTHS = [
  'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november',
] as const;

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = [CURRENT_YEAR - 1, CURRENT_YEAR, CURRENT_YEAR + 1];

interface ReportFormData {
  referenceMonth: string;
  year: number;
  professionalName: string;
  funcaoCargo: string;
  role: string;
  mainMuseum: string;
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

const defaultForm: ReportFormData = {
  referenceMonth: 'march',
  year: CURRENT_YEAR,
  professionalName: '',
  funcaoCargo: '',
  role: '',
  mainMuseum: 'equipePrincipal',
  workedAtOtherMuseum: false,
  otherMuseum: '',
  executiveSummary: '',
  positivePoints: '',
  difficulties: '',
  suggestions: '',
  identifiedOpportunity: '',
  opportunityCategory: '',
  expectedImpact: '',
};

export default function ReportFormPage() {
  const { reportId } = useParams({ strict: false }) as { reportId?: string };
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const signatureRef = useRef<SignatureCanvasHandle>(null);

  const isEditing = !!reportId;

  const { data: existingReport, isLoading: reportLoading } = useGetReport(reportId);
  const { data: activities = [], isLoading: activitiesLoading } = useActivitiesForReport(reportId);

  const createReport = useCreateReport();
  const updateReport = useUpdateReport();
  const submitReport = useSubmitReport();

  const [form, setForm] = useState<ReportFormData>(defaultForm);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (existingReport && !initialized) {
      setForm({
        referenceMonth: String(existingReport.referenceMonth ?? 'march'),
        year: Number(existingReport.year ?? CURRENT_YEAR),
        professionalName: existingReport.professionalName ?? '',
        funcaoCargo: existingReport.funcaoCargo ?? '',
        role: existingReport.role ?? '',
        mainMuseum: String(existingReport.mainMuseum ?? 'equipePrincipal'),
        workedAtOtherMuseum: existingReport.workedAtOtherMuseum ?? false,
        otherMuseum: existingReport.otherMuseum ?? '',
        executiveSummary: existingReport.executiveSummary ?? '',
        positivePoints: existingReport.positivePoints ?? '',
        difficulties: existingReport.difficulties ?? '',
        suggestions: existingReport.suggestions ?? '',
        identifiedOpportunity: existingReport.identifiedOpportunity ?? '',
        opportunityCategory: existingReport.opportunityCategory ?? '',
        expectedImpact: existingReport.expectedImpact ?? '',
      });
      setInitialized(true);
    }
  }, [existingReport, initialized]);

  const buildFullReport = (status: any) => ({
    referenceMonth: { [form.referenceMonth]: null },
    year: form.year,
    professionalName: form.professionalName,
    funcaoCargo: form.funcaoCargo,
    role: form.role,
    mainMuseum: { [form.mainMuseum]: null },
    workedAtOtherMuseum: form.workedAtOtherMuseum,
    otherMuseum: form.otherMuseum ? [form.otherMuseum] : [],
    executiveSummary: form.executiveSummary,
    positivePoints: form.positivePoints,
    difficulties: form.difficulties,
    suggestions: form.suggestions,
    identifiedOpportunity: form.identifiedOpportunity,
    opportunityCategory: form.opportunityCategory,
    expectedImpact: form.expectedImpact,
    status: { [status]: null },
    authorId: identity?.getPrincipal(),
  });

  const handleSaveDraft = async () => {
    try {
      const fullReport = buildFullReport('draft');
      if (isEditing && reportId) {
        await updateReport.mutateAsync({ id: reportId, report: fullReport });
        toast.success('Rascunho salvo com sucesso!');
      } else {
        const created = await createReport.mutateAsync(fullReport);
        toast.success('Relatório criado com sucesso!');
        if (created?.id) {
          navigate({ to: `/reports/${created.id}/edit` });
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao salvar rascunho';
      toast.error(message);
    }
  };

  const handleSubmit = async () => {
    const signature = signatureRef.current?.getSignature() ?? '';
    try {
      const fullReport = buildFullReport('submitted');
      if (isEditing && reportId) {
        await updateReport.mutateAsync({ id: reportId, report: fullReport });
        await submitReport.mutateAsync({ id: reportId, signature });
        toast.success('Relatório enviado com sucesso!');
        navigate({ to: '/reports' });
      } else {
        const created = await createReport.mutateAsync(fullReport);
        if (created?.id) {
          const createdId: string = created.id;
          await submitReport.mutateAsync({ id: createdId, signature });
          toast.success('Relatório enviado com sucesso!');
          navigate({ to: '/reports' });
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao enviar relatório';
      toast.error(message);
    }
  };

  const setField = <K extends keyof ReportFormData>(key: K, value: ReportFormData[K]) => {
    setForm(f => ({ ...f, [key]: value }));
  };

  const isSaving = createReport.isPending || updateReport.isPending;
  const isSubmitting = submitReport.isPending;

  if (isEditing && reportLoading) {
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
        <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/reports' })}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-bold text-foreground">
          {isEditing ? 'Editar Relatório' : 'Novo Relatório'}
        </h1>
      </div>

      {/* Section 1: Identificação */}
      <Card>
        <CardHeader>
          <CardTitle>1. Identificação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Mês de Referência</Label>
              <Select value={form.referenceMonth} onValueChange={v => setField('referenceMonth', v)}>
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {MONTHS.map(m => (
                    <SelectItem key={m} value={m}>{getMonthLabel(m)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Ano</Label>
              <Select value={String(form.year)} onValueChange={v => setField('year', Number(v))}>
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {YEARS.map(y => (
                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1">
            <Label>Nome do Profissional</Label>
            <Input value={form.professionalName} onChange={e => setField('professionalName', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Função / Cargo</Label>
              <Input value={form.funcaoCargo} onChange={e => setField('funcaoCargo', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Papel</Label>
              <Input value={form.role} onChange={e => setField('role', e.target.value)} />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Museu Principal</Label>
            <Select value={form.mainMuseum} onValueChange={v => setField('mainMuseum', v)}>
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
        </CardContent>
      </Card>

      {/* Section 2: Narrativa */}
      <Card>
        <CardHeader>
          <CardTitle>2. Narrativa do Mês</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: 'executiveSummary' as const, label: 'Resumo Executivo' },
            { key: 'positivePoints' as const, label: 'Pontos Positivos' },
            { key: 'difficulties' as const, label: 'Dificuldades' },
            { key: 'suggestions' as const, label: 'Sugestões' },
          ].map(({ key, label }) => (
            <div key={key} className="space-y-1">
              <Label>{label}</Label>
              <Textarea
                value={form[key]}
                onChange={e => setField(key, e.target.value)}
                rows={3}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Section 3: Oportunidades */}
      <Card>
        <CardHeader>
          <CardTitle>3. Oportunidades e Impacto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label>Oportunidade Identificada</Label>
            <Textarea
              value={form.identifiedOpportunity}
              onChange={e => setField('identifiedOpportunity', e.target.value)}
              rows={3}
            />
          </div>
          <div className="space-y-1">
            <Label>Categoria da Oportunidade</Label>
            <Input
              value={form.opportunityCategory}
              onChange={e => setField('opportunityCategory', e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label>Impacto Esperado</Label>
            <Textarea
              value={form.expectedImpact}
              onChange={e => setField('expectedImpact', e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Section 4: Activities */}
      {isEditing && reportId && (
        <Card>
          <CardHeader>
            <CardTitle>4. Atividades</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivitiesList
              reportId={reportId}
              activities={activities}
              isLoading={activitiesLoading}
              canEdit={true}
            />
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => navigate({ to: `/reports/${reportId}/activities/new` })}
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Atividade
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Section 5: Signature */}
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? '5.' : '4.'} Assinatura</CardTitle>
        </CardHeader>
        <CardContent>
          <SignatureCanvas ref={signatureRef} />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center gap-3 pb-6">
        <Button
          variant="outline"
          onClick={handleSaveDraft}
          disabled={isSaving || isSubmitting}
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          Salvar Rascunho
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSaving || isSubmitting}
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
          Enviar Relatório
        </Button>
      </div>
    </div>
  );
}
