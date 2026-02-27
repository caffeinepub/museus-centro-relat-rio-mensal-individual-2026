import type { Report, Activity } from '@/types';
import { getMuseumLabel } from './labels';

function getMonthLabel(month: string): string {
  const labels: Record<string, string> = {
    february: 'Fevereiro',
    march: 'Março',
    april: 'Abril',
    may: 'Maio',
    june: 'Junho',
    july: 'Julho',
    august: 'Agosto',
    september: 'Setembro',
    october: 'Outubro',
    november: 'Novembro',
  };
  return labels[month] ?? month;
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    draft: 'Rascunho',
    submitted: 'Submetido',
    underReview: 'Em Revisão',
    approved: 'Aprovado',
    analysis: 'Em Análise',
    requiresAdjustment: 'Requer Ajuste',
  };
  return labels[status] ?? status;
}

function getActivityStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    notStarted: 'Não Iniciado',
    submitted: 'Submetido',
    completed: 'Concluído',
    rescheduled: 'Reagendado',
    cancelled: 'Cancelado',
  };
  return labels[status] ?? status;
}

function getClassificationLabel(classification: string): string {
  const labels: Record<string, string> = {
    goalLinked: 'Vinculada à Meta',
    routine: 'Rotina',
    extra: 'Extra',
  };
  return labels[classification] ?? classification;
}

function escapeCsv(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function generateExcelExport(
  reports: Report[],
  activitiesByReport: Map<string, Activity[]>
): void {
  const reportHeaders = [
    'Protocolo',
    'Mês de Referência',
    'Ano',
    'Nome do Profissional',
    'Função/Cargo',
    'Museu Principal',
    'Atuou em Outro Museu',
    'Outro Museu',
    'Resumo Executivo',
    'Pontos Positivos',
    'Dificuldades',
    'Sugestões',
    'Oportunidade Identificada',
    'Categoria da Oportunidade',
    'Impacto Esperado',
    'Status',
    'Data de Envio',
  ];

  const activityHeaders = [
    'Protocolo do Relatório',
    'Nome da Atividade',
    'Tipo de Ação',
    'Data',
    'Museu',
    'Classificação',
    'Horas Dedicadas',
    'Público Total',
    'Crianças',
    'Jovens',
    'Adultos',
    'Idosos',
    'PCD',
    'Descrição Executada',
    'Resultados Alcançados',
    'Avaliação Qualitativa',
    'Status da Atividade',
  ];

  let csvContent = 'RELATÓRIOS\n';
  csvContent += reportHeaders.map(escapeCsv).join(',') + '\n';

  for (const report of reports) {
    const row = [
      report.protocolNumber,
      getMonthLabel(report.referenceMonth),
      report.year,
      report.professionalName,
      report.funcaoCargo,
      getMuseumLabel(report.mainMuseum),
      report.workedAtOtherMuseum ? 'Sim' : 'Não',
      report.otherMuseum ?? '',
      report.executiveSummary,
      report.positivePoints,
      report.difficulties,
      report.suggestions,
      report.identifiedOpportunity,
      report.opportunityCategory,
      report.expectedImpact ?? '',
      getStatusLabel(report.status),
      report.sendDate ? new Date(Number(report.sendDate) / 1_000_000).toLocaleDateString('pt-BR') : '',
    ];
    csvContent += row.map(escapeCsv).join(',') + '\n';
  }

  csvContent += '\nATIVIDADES\n';
  csvContent += activityHeaders.map(escapeCsv).join(',') + '\n';

  for (const report of reports) {
    const reportActivities = activitiesByReport.get(report.id) ?? [];
    for (const activity of reportActivities) {
      const row = [
        report.protocolNumber,
        activity.activityName,
        activity.actionType,
        activity.date ? new Date(Number(activity.date) / 1_000_000).toLocaleDateString('pt-BR') : '',
        getMuseumLabel(activity.museum),
        getClassificationLabel(activity.classification),
        activity.dedicatedHours != null ? activity.dedicatedHours : '',
        activity.totalAudience,
        activity.children,
        activity.youth,
        activity.adults,
        activity.elderly,
        activity.pcd,
        activity.executedDescription,
        activity.achievedResults,
        activity.qualitativeAssessment,
        getActivityStatusLabel(activity.status),
      ];
      csvContent += row.map(escapeCsv).join(',') + '\n';
    }
  }

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `relatorios_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function generateConsolidatedExcel(reports: Report[], activities: Activity[]): void {
  const activitiesByReport = new Map<string, Activity[]>();
  for (const activity of activities) {
    const existing = activitiesByReport.get(activity.reportId) ?? [];
    activitiesByReport.set(activity.reportId, [...existing, activity]);
  }
  generateExcelExport(reports, activitiesByReport);
}
