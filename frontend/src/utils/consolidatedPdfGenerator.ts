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
    notStarted: 'Não Iniciado',
    submitted: 'Submetido',
    completed: 'Concluído',
    rescheduled: 'Reagendado',
    cancelled: 'Cancelado',
  };
  return labels[status] ?? status;
}

export function generateConsolidatedPdf(reports: Report[], activities: Activity[]): void {
  const activitiesByReport = new Map<string, Activity[]>();
  for (const activity of activities) {
    const existing = activitiesByReport.get(activity.reportId) ?? [];
    activitiesByReport.set(activity.reportId, [...existing, activity]);
  }

  const totalActivities = activities.length;
  const totalHours = activities.reduce((sum, a) => {
    if (a.hoursNotApplicable || a.dedicatedHours == null) return sum;
    return sum + Number(a.dedicatedHours);
  }, 0);
  const totalAudience = activities.reduce((sum, a) => sum + Number(a.totalAudience), 0);

  const reportsHtml = reports
    .map((report) => {
      const reportActivities = activitiesByReport.get(report.id) ?? [];
      const reportHours = reportActivities.reduce((sum, a) => {
        if (a.hoursNotApplicable || a.dedicatedHours == null) return sum;
        return sum + Number(a.dedicatedHours);
      }, 0);
      const reportAudience = reportActivities.reduce((sum, a) => sum + Number(a.totalAudience), 0);

      const activitiesHtml = reportActivities
        .map(
          (activity) => `
          <div class="activity-item">
            <div class="activity-header">
              <strong>${activity.activityName}</strong>
              <span class="badge">${getActivityStatusLabel(activity.status)}</span>
            </div>
            <div class="activity-details">
              <div class="detail-row">
                <span class="detail-label">Tipo:</span>
                <span>${activity.actionType}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Classificação:</span>
                <span>${getClassificationLabel(activity.classification)}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Museu:</span>
                <span>${getMuseumLocationLabel(activity.museum)}</span>
              </div>
              ${
                activity.dedicatedHours != null && !activity.hoursNotApplicable
                  ? `<div class="detail-row">
                  <span class="detail-label">Horas:</span>
                  <span>${activity.dedicatedHours}h</span>
                </div>`
                  : ''
              }
              <div class="detail-row">
                <span class="detail-label">Público Total:</span>
                <span>${activity.totalAudience}</span>
              </div>
              ${
                activity.executedDescription
                  ? `<div class="detail-row">
                  <span class="detail-label">Descrição:</span>
                  <span>${activity.executedDescription}</span>
                </div>`
                  : ''
              }
              ${
                activity.achievedResults
                  ? `<div class="detail-row">
                  <span class="detail-label">Resultados:</span>
                  <span>${activity.achievedResults}</span>
                </div>`
                  : ''
              }
            </div>
          </div>
        `
        )
        .join('');

      return `
        <div class="report-section">
          <div class="report-header">
            <div class="report-title">
              <h2>${report.professionalName}</h2>
              <span class="protocol">${report.protocolNumber}</span>
            </div>
            <span class="status-badge status-${report.status}">${getStatusLabel(report.status)}</span>
          </div>

          <div class="report-meta">
            <div class="meta-item">
              <span class="meta-label">Mês/Ano:</span>
              <span>${getMonthLabel(report.referenceMonth)} / ${report.year}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Função/Cargo:</span>
              <span>${report.funcaoCargo}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Museu/Equipe:</span>
              <span>${getMuseumLocationLabel(report.mainMuseum)}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Atividades:</span>
              <span>${reportActivities.length}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Horas:</span>
              <span>${reportHours}h</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Público:</span>
              <span>${reportAudience}</span>
            </div>
          </div>

          ${
            report.executiveSummary
              ? `<div class="narrative-section">
              <h3>Resumo Executivo</h3>
              <p>${report.executiveSummary}</p>
            </div>`
              : ''
          }

          ${
            report.positivePoints
              ? `<div class="narrative-section">
              <h3>Pontos Positivos</h3>
              <p>${report.positivePoints}</p>
            </div>`
              : ''
          }

          ${
            report.difficulties
              ? `<div class="narrative-section">
              <h3>Dificuldades</h3>
              <p>${report.difficulties}</p>
            </div>`
              : ''
          }

          ${
            report.suggestions
              ? `<div class="narrative-section">
              <h3>Sugestões</h3>
              <p>${report.suggestions}</p>
            </div>`
              : ''
          }

          ${
            report.identifiedOpportunity
              ? `<div class="narrative-section">
              <h3>Oportunidade Identificada</h3>
              <p>${report.identifiedOpportunity}</p>
            </div>`
              : ''
          }

          ${
            report.opportunityCategory
              ? `<div class="narrative-section">
              <h3>Categoria da Oportunidade</h3>
              <p>${report.opportunityCategory}</p>
            </div>`
              : ''
          }

          ${
            report.expectedImpact
              ? `<div class="narrative-section">
              <h3>Impacto Esperado</h3>
              <p>${report.expectedImpact}</p>
            </div>`
              : ''
          }

          ${
            reportActivities.length > 0
              ? `<div class="activities-section">
              <h3>Atividades (${reportActivities.length})</h3>
              ${activitiesHtml}
            </div>`
              : ''
          }
        </div>
      `;
    })
    .join('');

  const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8" />
      <title>Relatório Consolidado - Museus Centro</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: 'Segoe UI', Arial, sans-serif;
          font-size: 11pt;
          color: #1a1a2e;
          background: #fff;
          padding: 20px;
        }
        .page-header {
          text-align: center;
          border-bottom: 3px solid #1a1a2e;
          padding-bottom: 16px;
          margin-bottom: 24px;
        }
        .page-header h1 {
          font-size: 20pt;
          font-weight: 700;
          color: #1a1a2e;
        }
        .page-header p {
          color: #555;
          margin-top: 4px;
        }
        .summary-box {
          background: #f0f4ff;
          border: 1px solid #c0cfe8;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 24px;
          display: flex;
          gap: 32px;
          flex-wrap: wrap;
        }
        .summary-item {
          text-align: center;
        }
        .summary-item .value {
          font-size: 22pt;
          font-weight: 700;
          color: #1a1a2e;
        }
        .summary-item .label {
          font-size: 9pt;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .report-section {
          border: 1px solid #dde3f0;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 24px;
          page-break-inside: avoid;
        }
        .report-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }
        .report-title h2 {
          font-size: 14pt;
          font-weight: 700;
          color: #1a1a2e;
        }
        .protocol {
          font-size: 9pt;
          color: #888;
          display: block;
          margin-top: 2px;
        }
        .status-badge {
          font-size: 9pt;
          font-weight: 600;
          padding: 3px 10px;
          border-radius: 12px;
          white-space: nowrap;
        }
        .status-approved { background: #d1fae5; color: #065f46; }
        .status-submitted { background: #dbeafe; color: #1e40af; }
        .status-underReview { background: #fef3c7; color: #92400e; }
        .status-draft { background: #f3f4f6; color: #374151; }
        .status-analysis { background: #ede9fe; color: #5b21b6; }
        .status-requiresAdjustment { background: #fee2e2; color: #991b1b; }
        .report-meta {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          background: #f8f9fc;
          border-radius: 6px;
          padding: 12px;
          margin-bottom: 16px;
        }
        .meta-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .meta-label {
          font-size: 8pt;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .narrative-section {
          margin-bottom: 12px;
        }
        .narrative-section h3 {
          font-size: 10pt;
          font-weight: 600;
          color: #444;
          margin-bottom: 4px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .narrative-section p {
          font-size: 10pt;
          color: #333;
          line-height: 1.5;
        }
        .activities-section h3 {
          font-size: 11pt;
          font-weight: 700;
          color: #1a1a2e;
          margin-bottom: 10px;
          padding-top: 12px;
          border-top: 1px solid #eee;
        }
        .activity-item {
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          padding: 10px 14px;
          margin-bottom: 8px;
        }
        .activity-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
        }
        .activity-header strong {
          font-size: 10pt;
          color: #1a1a2e;
        }
        .badge {
          font-size: 8pt;
          padding: 2px 8px;
          background: #e5e7eb;
          border-radius: 10px;
          color: #374151;
        }
        .activity-details {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 4px 16px;
        }
        .detail-row {
          display: flex;
          gap: 6px;
          font-size: 9pt;
        }
        .detail-label {
          font-weight: 600;
          color: #555;
          white-space: nowrap;
        }
        @media print {
          body { padding: 0; }
          .report-section { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="page-header">
        <h1>Relatório Consolidado</h1>
        <p>Museus Centro — Gerado em ${new Date().toLocaleDateString('pt-BR')}</p>
      </div>

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
          <div class="value">${totalHours}h</div>
          <div class="label">Horas Totais</div>
        </div>
        <div class="summary-item">
          <div class="value">${totalAudience.toLocaleString('pt-BR')}</div>
          <div class="label">Público Total</div>
        </div>
      </div>

      ${reportsHtml}
    </body>
    </html>
  `;

  const newWindow = window.open('', '_blank');
  if (newWindow) {
    newWindow.document.write(html);
    newWindow.document.close();
    newWindow.focus();
    setTimeout(() => newWindow.print(), 500);
  }
}
