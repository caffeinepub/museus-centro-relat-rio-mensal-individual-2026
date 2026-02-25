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
    return `${activity.dedicatedHours} horas`;
  }
  return '-';
}

function formatDate(timestamp: bigint | number): string {
  const ms = typeof timestamp === 'bigint' ? Number(timestamp) / 1_000_000 : timestamp;
  const date = new Date(ms);
  return date.toLocaleDateString('pt-BR');
}

export function generateConsolidatedPDF(
  reports: Report[],
  activitiesByReport: Map<string, Activity[]>
): void {
  let totalAudience = 0;
  let totalActivities = 0;
  let totalHours = 0;

  const reportSections = reports
    .map((report) => {
      const activities = activitiesByReport.get(report.id) ?? [];
      totalActivities += activities.length;

      const reportAudience = activities.reduce((sum, a) => sum + Number(a.totalAudience), 0);
      totalAudience += reportAudience;

      for (const activity of activities) {
        if (!activity.hoursNotApplicable && activity.dedicatedHours !== undefined && activity.dedicatedHours !== null) {
          totalHours += Number(activity.dedicatedHours);
        }
      }

      const activitiesHTML = activities
        .map(
          (activity, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${activity.activityName}</td>
            <td>${formatDate(activity.date)}</td>
            <td>${getMuseumLocationLabel(activity.museum)}</td>
            <td>${activity.actionType}</td>
            <td>${getClassificationLabel(activity.classification as string)}</td>
            <td>${getActivityStatusLabel(activity.status as string)}</td>
            <td>${hoursDisplay(activity)}</td>
            <td>${activity.totalAudience}</td>
          </tr>
        `
        )
        .join('');

      return `
        <div class="report-section">
          <h2>${report.professionalName} — ${getMonthLabel(report.referenceMonth)} ${report.year}</h2>
          <table class="info-table">
            <tr><td class="label">Protocolo:</td><td>${report.protocolNumber}</td></tr>
            <tr><td class="label">Função:</td><td>${report.role}</td></tr>
            <tr><td class="label">Equipe/Museu:</td><td>${getMuseumLocationLabel(report.mainMuseum)}</td></tr>
            <tr><td class="label">Status:</td><td>${getStatusLabel(report.status as string)}</td></tr>
          </table>

          <h3>Resumo Executivo</h3>
          <p>${report.executiveSummary}</p>

          ${
            activities.length > 0
              ? `
            <h3>Atividades (${activities.length})</h3>
            <table class="activities-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Atividade</th>
                  <th>Data</th>
                  <th>Equipe</th>
                  <th>Tipo</th>
                  <th>Classificação</th>
                  <th>Status</th>
                  <th>Horas Dedicadas</th>
                  <th>Público</th>
                </tr>
              </thead>
              <tbody>${activitiesHTML}</tbody>
            </table>
          `
              : '<p><em>Nenhuma atividade registrada.</em></p>'
          }
        </div>
        <div class="page-break"></div>
      `;
    })
    .join('');

  const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>Relatório Consolidado — ${new Date().toLocaleDateString('pt-BR')}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; color: #333; font-size: 12px; }
        h1 { color: #1a1a2e; border-bottom: 2px solid #1a1a2e; padding-bottom: 8px; }
        h2 { color: #16213e; margin-top: 20px; border-bottom: 1px solid #ccc; padding-bottom: 4px; font-size: 14px; }
        h3 { color: #0f3460; margin-top: 12px; font-size: 12px; }
        .summary-box { background: #f5f5f5; padding: 12px; border-radius: 4px; margin-bottom: 20px; display: flex; gap: 24px; }
        .summary-item { text-align: center; }
        .summary-item .value { font-size: 24px; font-weight: bold; color: #1a1a2e; }
        .summary-item .label { font-size: 11px; color: #666; }
        .info-table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
        .info-table td { padding: 4px 8px; border: 1px solid #ddd; }
        .info-table td.label { font-weight: bold; background: #f9f9f9; width: 180px; }
        .activities-table { width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 11px; }
        .activities-table th { background: #1a1a2e; color: white; padding: 4px 6px; text-align: left; }
        .activities-table td { padding: 3px 6px; border: 1px solid #ddd; }
        .activities-table tr:nth-child(even) { background: #f9f9f9; }
        .report-section { margin-bottom: 24px; }
        .page-break { page-break-after: always; }
        @media print { body { margin: 0; } .page-break { page-break-after: always; } }
      </style>
    </head>
    <body>
      <h1>Relatório Consolidado</h1>
      <p>Gerado em: ${new Date().toLocaleDateString('pt-BR')} — Total de relatórios: ${reports.length}</p>

      <div class="summary-box">
        <div class="summary-item">
          <div class="value">${reports.length}</div>
          <div class="label">Relatórios</div>
        </div>
        <div class="summary-item">
          <div class="value">${totalActivities}</div>
          <div class="label">Atividades</div>
        </div>
        <div class="summary-item">
          <div class="value">${totalAudience}</div>
          <div class="label">Público Total</div>
        </div>
        <div class="summary-item">
          <div class="value">${totalHours}</div>
          <div class="label">Horas Dedicadas</div>
        </div>
      </div>

      ${reportSections || '<p>Nenhum relatório encontrado.</p>'}

      <script>window.onload = function() { window.print(); }</script>
    </body>
    </html>
  `;

  const newWindow = window.open('', '_blank');
  if (newWindow) {
    newWindow.document.write(html);
    newWindow.document.close();
  }
}
