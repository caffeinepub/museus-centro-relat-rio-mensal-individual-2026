import type { Report, Activity } from '@/types';

function getMuseumLocationLabel(location: string): string {
  const labels: Record<string, string> = {
    equipePrincipal: 'Equipe Principal',
    comunicacao: 'Comunicação',
    administracao: 'Administração',
    programacao: 'Programação',
    producaoGeral: 'Produção Geral',
    coordenacao: 'Coordenação',
  };
  return labels[location] ?? location;
}

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

function escapeCsv(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function generateConsolidatedCsv(reports: Report[], activities: Activity[]): void {
  const activitiesByReport = new Map<string, Activity[]>();
  for (const activity of activities) {
    const existing = activitiesByReport.get(activity.reportId) ?? [];
    activitiesByReport.set(activity.reportId, [...existing, activity]);
  }

  const headers = [
    'Protocolo',
    'Mês de Referência',
    'Ano',
    'Nome do Profissional',
    'Função/Cargo',
    'Museu/Equipe Principal',
    'Resumo Executivo',
    'Pontos Positivos',
    'Dificuldades',
    'Sugestões',
    'Oportunidade Identificada',
    'Categoria da Oportunidade',
    'Impacto Esperado',
    'Status',
    'Total de Atividades',
    'Total de Horas',
    'Total de Público',
  ];

  let csvContent = headers.map(escapeCsv).join(',') + '\n';

  let totalActivities = 0;
  let totalHours = 0;
  let totalAudience = 0;

  for (const report of reports) {
    const reportActivities = activitiesByReport.get(report.id) ?? [];
    const hours = reportActivities.reduce((sum, a) => {
      if (a.hoursNotApplicable || a.dedicatedHours == null) return sum;
      return sum + Number(a.dedicatedHours);
    }, 0);
    const audience = reportActivities.reduce((sum, a) => sum + Number(a.totalAudience), 0);

    totalActivities += reportActivities.length;
    totalHours += hours;
    totalAudience += audience;

    const row = [
      report.protocolNumber,
      getMonthLabel(report.referenceMonth),
      report.year,
      report.professionalName,
      report.funcaoCargo,
      getMuseumLocationLabel(report.mainMuseum),
      report.executiveSummary,
      report.positivePoints,
      report.difficulties,
      report.suggestions,
      report.identifiedOpportunity,
      report.opportunityCategory,
      report.expectedImpact ?? '',
      getStatusLabel(report.status),
      reportActivities.length,
      hours,
      audience,
    ];
    csvContent += row.map(escapeCsv).join(',') + '\n';
  }

  // TOTAL row
  const totalRow = [
    'TOTAL',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    totalActivities,
    totalHours,
    totalAudience,
  ];
  csvContent += totalRow.map(escapeCsv).join(',') + '\n';

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `consolidado_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
