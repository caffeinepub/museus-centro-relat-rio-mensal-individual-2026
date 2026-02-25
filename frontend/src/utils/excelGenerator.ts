import { Report, Activity, MuseumLocation, Month } from '../backend';

function getMuseumLocationLabel(museum: MuseumLocation | string): string {
  switch (museum) {
    case MuseumLocation.equipePrincipal:
    case 'equipePrincipal':
      return 'Equipe Principal';
    case MuseumLocation.comunicacao:
    case 'comunicacao':
      return 'Comunicação';
    case MuseumLocation.administracao:
    case 'administracao':
      return 'Administração';
    case MuseumLocation.programacao:
    case 'programacao':
      return 'Programação';
    case MuseumLocation.producaoGeral:
    case 'producaoGeral':
      return 'Produção Geral';
    case MuseumLocation.coordenacao:
    case 'coordenacao':
      return 'Coordenação';
    default:
      return String(museum);
  }
}

function getMonthLabel(month: Month | string): string {
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
  return labels[month as string] ?? String(month);
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    draft: 'Rascunho',
    submitted: 'Enviado',
    underReview: 'Em Revisão',
    approved: 'Aprovado',
    analysis: 'Em Análise',
    requiresAdjustment: 'Requer Ajuste',
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

function getActivityStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    notStarted: 'Não Iniciada',
    submitted: 'Enviada',
    completed: 'Concluída',
    rescheduled: 'Reagendada',
    cancelled: 'Cancelada',
  };
  return labels[status] ?? status;
}

function hoursDisplay(activity: Activity): string {
  if (activity.hoursNotApplicable) {
    return 'Não se aplica';
  }
  if (activity.dedicatedHours !== undefined && activity.dedicatedHours !== null) {
    return String(activity.dedicatedHours);
  }
  return '-';
}

function formatDate(timestamp: bigint | number): string {
  const ms = typeof timestamp === 'bigint' ? Number(timestamp) / 1_000_000 : timestamp;
  const date = new Date(ms);
  return date.toLocaleDateString('pt-BR');
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
  const headers = [
    'Protocolo',
    'Profissional',
    'Função',
    'Equipe/Museu',
    'Mês',
    'Ano',
    'Status',
    'Atividade',
    'Data Atividade',
    'Equipe Atividade',
    'Tipo de Ação',
    'Classificação',
    'Status Atividade',
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
  ];

  const rows: string[][] = [headers];

  for (const report of reports) {
    const activities = activitiesByReport.get(report.id) ?? [];

    if (activities.length === 0) {
      rows.push([
        report.protocolNumber,
        report.professionalName,
        report.role,
        getMuseumLocationLabel(report.mainMuseum),
        getMonthLabel(report.referenceMonth),
        String(report.year),
        getStatusLabel(report.status as string),
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
        '',
        '',
        '',
      ]);
    } else {
      for (const activity of activities) {
        rows.push([
          report.protocolNumber,
          report.professionalName,
          report.role,
          getMuseumLocationLabel(report.mainMuseum),
          getMonthLabel(report.referenceMonth),
          String(report.year),
          getStatusLabel(report.status as string),
          activity.activityName,
          formatDate(activity.date),
          getMuseumLocationLabel(activity.museum),
          activity.actionType,
          getClassificationLabel(activity.classification as string),
          getActivityStatusLabel(activity.status as string),
          hoursDisplay(activity),
          String(activity.totalAudience),
          String(activity.children),
          String(activity.youth),
          String(activity.adults),
          String(activity.elderly),
          String(activity.pcd),
          activity.executedDescription,
          activity.achievedResults,
          activity.qualitativeAssessment,
        ]);
      }
    }
  }

  // Add TOTAL row
  let totalAudience = 0;
  let totalChildren = 0;
  let totalYouth = 0;
  let totalAdults = 0;
  let totalElderly = 0;
  let totalPcd = 0;
  let totalHours = 0;

  for (const report of reports) {
    const activities = activitiesByReport.get(report.id) ?? [];
    for (const activity of activities) {
      totalAudience += Number(activity.totalAudience);
      totalChildren += Number(activity.children);
      totalYouth += Number(activity.youth);
      totalAdults += Number(activity.adults);
      totalElderly += Number(activity.elderly);
      totalPcd += Number(activity.pcd);
      if (!activity.hoursNotApplicable && activity.dedicatedHours !== undefined && activity.dedicatedHours !== null) {
        totalHours += Number(activity.dedicatedHours);
      }
    }
  }

  rows.push([
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
    String(totalHours),
    String(totalAudience),
    String(totalChildren),
    String(totalYouth),
    String(totalAdults),
    String(totalElderly),
    String(totalPcd),
    '',
    '',
    '',
  ]);

  const csvContent = rows.map((row) => row.map(escapeCsv).join(',')).join('\n');
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `relatorio-consolidado-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
