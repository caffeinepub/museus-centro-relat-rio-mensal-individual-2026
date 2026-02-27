import type { Report, Activity } from '../types';

function getMuseumLabel(museum: string): string {
  const labels: Record<string, string> = {
    equipePrincipal: 'Equipe Principal',
    comunicacao: 'Comunicação',
    administracao: 'Administração',
    programacao: 'Programação',
    producaoGeral: 'Produção Geral',
    coordenacao: 'Coordenação',
  };
  return labels[museum] ?? museum;
}

function getMonthLabel(month: string): string {
  const labels: Record<string, string> = {
    february: 'Fevereiro', march: 'Março', april: 'Abril', may: 'Maio',
    june: 'Junho', july: 'Julho', august: 'Agosto', september: 'Setembro',
    october: 'Outubro', november: 'Novembro',
  };
  return labels[month] ?? month;
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    draft: 'Rascunho', submitted: 'Enviado', underReview: 'Em Revisão',
    approved: 'Aprovado', analysis: 'Em Análise', requiresAdjustment: 'Requer Ajuste',
  };
  return labels[status] ?? status;
}

function getClassificationLabel(classification: string): string {
  const labels: Record<string, string> = {
    goalLinked: 'Vinculada à Meta', routine: 'Rotina', extra: 'Extra',
  };
  return labels[classification] ?? classification;
}

function getActivityStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    notStarted: 'Não Iniciada', submitted: 'Enviada', completed: 'Concluída',
    rescheduled: 'Reagendada', cancelled: 'Cancelada',
  };
  return labels[status] ?? status;
}

function getLocalRealizadoLabel(local: string): string {
  const labels: Record<string, string> = { MHAB: 'MHAB', MUMO: 'MUMO', MIS: 'MIS', Outro: 'Outro' };
  return labels[local] ?? local;
}

function getProdutoRealizadoLabel(produto: string): string {
  const labels: Record<string, string> = {
    coberturaFotografica: 'Cobertura Fotográfica', posts: 'Posts', releases: 'Releases',
    textoExpografico: 'Texto Expográfico', textoCatalogo: 'Texto Catálogo',
    designCatalogo: 'Design Catálogo', coberturaDeVideo: 'Cobertura de Vídeo', outros: 'Outros',
  };
  return labels[produto] ?? produto;
}

function hoursDisplay(activity: Activity): string {
  if (activity.hoursNotApplicable) return 'Não se aplica';
  if (activity.dedicatedHours !== undefined && activity.dedicatedHours !== null) {
    return `${activity.dedicatedHours} horas`;
  }
  return '-';
}

function formatDate(timestamp: bigint | number | null | undefined): string {
  if (!timestamp) return '-';
  try {
    const ms = typeof timestamp === 'bigint' ? Number(timestamp) / 1_000_000 : timestamp;
    const d = ms < 1e10 ? new Date(ms * 1000) : new Date(ms);
    return d.toLocaleDateString('pt-BR');
  } catch { return '-'; }
}

function formatTime(timestamp: bigint | number | null | undefined): string {
  if (!timestamp) return '';
  try {
    const ms = typeof timestamp === 'bigint' ? Number(timestamp) / 1_000_000 : timestamp;
    const d = ms < 1e10 ? new Date(ms * 1000) : new Date(ms);
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  } catch { return ''; }
}

export function generateReportPDF(report: Report, activities: Activity[]): void {
  const museumLabel = getMuseumLabel(report.mainMuseum);
  const monthLabel = getMonthLabel(report.referenceMonth);
  const statusLabel = getStatusLabel(report.status);

  const activitiesHTML = activities.map((activity, index) => {
    const localLabel = activity.localRealizado
      ? getLocalRealizadoLabel(activity.localRealizado)
      : getMuseumLabel(activity.museum);
    const localExtra = activity.localRealizado === 'Outro' && activity.localOutroDescricao
      ? ` — ${activity.localOutroDescricao}` : '';
    const produtosHTML = activity.produtosRealizados && activity.produtosRealizados.length > 0
      ? `<tr><td class="label">Produtos Realizados:</td><td>${activity.produtosRealizados.map(getProdutoRealizadoLabel).join(', ')}</td></tr>`
      : '';
    const evidenciasHTML = activity.evidencias && activity.evidencias.length > 0
      ? `<tr><td class="label">Evidências (${activity.evidencias.length}):</td><td>${activity.evidencias.map(e => `${e.fileName} (${e.uploaderName})`).join('; ')}</td></tr>`
      : '';
    const startDateStr = formatDate(activity.startDate || activity.date);
    const endDateStr = activity.endDate && activity.endDate !== activity.startDate ? ` – ${formatDate(activity.endDate)}` : '';
    const startTimeStr = formatTime(activity.startTime);
    const endTimeStr = activity.endTime ? ` – ${formatTime(activity.endTime)}` : '';

    return `
      <div class="activity-card">
        <h3>Atividade ${index + 1}: ${activity.activityName}</h3>
        <table class="info-table">
          <tr><td class="label">Data:</td><td>${startDateStr}${endDateStr}</td></tr>
          ${startTimeStr ? `<tr><td class="label">Horário:</td><td>${startTimeStr}${endTimeStr}</td></tr>` : ''}
          <tr><td class="label">Local Realizado:</td><td>${localLabel}${localExtra}</td></tr>
          <tr><td class="label">Equipe/Museu:</td><td>${getMuseumLabel(activity.museum)}</td></tr>
          <tr><td class="label">Tipo de Ação:</td><td>${activity.actionType}</td></tr>
          <tr><td class="label">Classificação:</td><td>${getClassificationLabel(activity.classification)}</td></tr>
          <tr><td class="label">Status:</td><td>${getActivityStatusLabel(activity.status)}</td></tr>
          <tr><td class="label">Horas Dedicadas:</td><td>${hoursDisplay(activity)}</td></tr>
          <tr><td class="label">Público Total:</td><td>${activity.totalAudience}</td></tr>
          <tr><td class="label">Crianças:</td><td>${activity.children}</td></tr>
          <tr><td class="label">Jovens:</td><td>${activity.youth}</td></tr>
          <tr><td class="label">Adultos:</td><td>${activity.adults}</td></tr>
          <tr><td class="label">Idosos:</td><td>${activity.elderly}</td></tr>
          <tr><td class="label">PCD:</td><td>${activity.pcd}</td></tr>
          <tr><td class="label">Descrição Executada:</td><td>${activity.executedDescription}</td></tr>
          <tr><td class="label">Resultados Alcançados:</td><td>${activity.achievedResults}</td></tr>
          <tr><td class="label">Avaliação Qualitativa:</td><td>${activity.qualitativeAssessment}</td></tr>
          ${produtosHTML}
          ${evidenciasHTML}
          ${activity.cancellationReason ? `<tr><td class="label">Motivo de Cancelamento:</td><td>${activity.cancellationReason}</td></tr>` : ''}
        </table>
      </div>
    `;
  }).join('');

  const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>Relatório - ${report.professionalName} - ${monthLabel} ${report.year}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; color: #333; font-size: 12px; }
        h1 { color: #1a1a2e; border-bottom: 2px solid #1a1a2e; padding-bottom: 8px; }
        h2 { color: #16213e; margin-top: 20px; border-bottom: 1px solid #ccc; padding-bottom: 4px; }
        h3 { color: #0f3460; margin-top: 12px; }
        .header-info { background: #f5f5f5; padding: 12px; border-radius: 4px; margin-bottom: 16px; }
        .info-table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
        .info-table td { padding: 4px 8px; border: 1px solid #ddd; }
        .info-table td.label { font-weight: bold; background: #f9f9f9; width: 200px; }
        .activity-card { border: 1px solid #ddd; padding: 12px; margin-bottom: 16px; border-radius: 4px; }
        .status-badge { display: inline-block; padding: 2px 8px; border-radius: 12px; background: #e0e0e0; font-size: 11px; }
        @media print { body { margin: 0; } }
      </style>
    </head>
    <body>
      <h1>Relatório Mensal Individual</h1>
      <div class="header-info">
        <strong>Protocolo:</strong> ${report.protocolNumber} &nbsp;|&nbsp;
        <strong>Status:</strong> <span class="status-badge">${statusLabel}</span>
      </div>
      <h2>Informações do Profissional</h2>
      <table class="info-table">
        <tr><td class="label">Nome:</td><td>${report.professionalName}</td></tr>
        <tr><td class="label">Função/Cargo:</td><td>${report.funcaoCargo || '-'}</td></tr>
        <tr><td class="label">Função:</td><td>${report.role}</td></tr>
        <tr><td class="label">Equipe/Museu Principal:</td><td>${museumLabel}</td></tr>
        <tr><td class="label">Mês de Referência:</td><td>${monthLabel}</td></tr>
        <tr><td class="label">Ano:</td><td>${report.year}</td></tr>
        ${report.workedAtOtherMuseum ? `<tr><td class="label">Outro Museu:</td><td>${report.otherMuseum ?? '-'}</td></tr>` : ''}
      </table>
      <h2>Resumo Executivo</h2>
      <p>${report.executiveSummary}</p>
      <h2>Pontos Positivos</h2>
      <p>${report.positivePoints}</p>
      <h2>Dificuldades</h2>
      <p>${report.difficulties}</p>
      <h2>Sugestões</h2>
      <p>${report.suggestions}</p>
      <h2>Oportunidade Identificada</h2>
      <table class="info-table">
        <tr><td class="label">Oportunidade:</td><td>${report.identifiedOpportunity}</td></tr>
        <tr><td class="label">Categoria:</td><td>${report.opportunityCategory}</td></tr>
        <tr><td class="label">Impacto Esperado:</td><td>${report.expectedImpact}</td></tr>
      </table>
      ${report.coordinatorComments ? `<h2>Comentários do Coordenador</h2><p>${report.coordinatorComments}</p>` : ''}
      <h2>Atividades (${activities.length})</h2>
      ${activitiesHTML || '<p>Nenhuma atividade registrada.</p>'}
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
