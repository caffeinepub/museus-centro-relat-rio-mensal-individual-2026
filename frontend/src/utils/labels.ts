import type {
  MuseumLocation,
  Month,
  Status,
  ActivityStatus,
  Classification,
  GoalStatus,
  AccessibilityOption,
  EvidenceType,
  ProductRealised,
  Quantity,
  AudienceRange,
  LocalRealizado,
  ProdutoRealizado,
} from '../types';
import { AppUserRole } from '../backend';

export function getMuseumLabel(museum: MuseumLocation | string): string {
  const labels: Record<string, string> = {
    equipePrincipal: 'Equipe Principal',
    comunicacao: 'Comunicação',
    administracao: 'Administração',
    programacao: 'Programação',
    producaoGeral: 'Produção Geral',
    coordenacao: 'Coordenação',
  };
  return labels[museum] || String(museum);
}

export function getTeamLocationLabel(team: string): string {
  const labels: Record<string, string> = {
    comunicacao: 'Comunicação',
    administracao: 'Administração',
    mhab: 'MHAB',
    mumo: 'MUMO',
    mis: 'MIS',
    empty: '',
  };
  return labels[team] ?? String(team);
}

export const TEAM_LOCATIONS: { value: string; label: string }[] = [
  { value: 'comunicacao', label: 'Comunicação' },
  { value: 'administracao', label: 'Administração' },
  { value: 'mhab', label: 'MHAB' },
  { value: 'mumo', label: 'MUMO' },
  { value: 'mis', label: 'MIS' },
];

export const MUSEUM_LOCATIONS: MuseumLocation[] = [
  'equipePrincipal',
  'comunicacao',
  'administracao',
  'programacao',
  'producaoGeral',
  'coordenacao',
];

export function monthLabel(month: Month | string): string {
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

export function getMonthLabel(month: Month | string): string {
  return monthLabel(month);
}

export const MONTHS: Month[] = [
  'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november',
];

export function getMonthOptions(): { value: Month; label: string }[] {
  return MONTHS.map(m => ({ value: m, label: monthLabel(m) }));
}

export const MONTH_ORDER: string[] = [
  'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november',
];

export function statusLabel(status: Status | string): string {
  const labels: Record<string, string> = {
    draft: 'Rascunho',
    submitted: 'Enviado',
    underReview: 'Em Revisão',
    approved: 'Aprovado',
    analysis: 'Em Análise',
    requiresAdjustment: 'Devolvido',
  };
  return labels[status as string] ?? String(status);
}

export function getStatusLabel(status: Status | string): string {
  return statusLabel(status);
}

/**
 * Returns Tailwind CSS classes for status badge coloring.
 * submitted=yellow, approved=green, requiresAdjustment=orange, underReview/analysis=blue, draft=gray
 */
export function getStatusColor(status: Status | string): string {
  const colors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    submitted: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
    underReview: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    approved: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
    analysis: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    requiresAdjustment: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
  };
  return colors[status as string] ?? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
}

export function activityStatusLabel(status: ActivityStatus | string): string {
  const labels: Record<string, string> = {
    notStarted: 'Não Iniciado',
    submitted: 'Enviado',
    completed: 'Concluído',
    rescheduled: 'Reagendado',
    cancelled: 'Cancelado',
  };
  return labels[status as string] ?? String(status);
}

export function classificationLabel(classification: Classification | string): string {
  const labels: Record<string, string> = {
    goalLinked: 'Vinculada à Meta',
    routine: 'Rotina',
    extra: 'Extra',
  };
  return labels[classification as string] ?? String(classification);
}

export function goalStatusLabel(goalStatus: GoalStatus | string): string {
  const labels: Record<string, string> = {
    inProgress: 'Em Andamento',
    partiallyCumplied: 'Parcialmente Cumprida',
    achieved: 'Alcançada',
    exceeded: 'Superada',
  };
  return labels[goalStatus as string] ?? String(goalStatus);
}

export function accessibilityOptionLabel(option: AccessibilityOption | string): string {
  const labels: Record<string, string> = {
    none: 'Nenhuma',
    libras: 'Libras',
    audioDescription: 'Audiodescrição',
    tactileMaterial: 'Material Tátil',
    other: 'Outro',
  };
  return labels[option as string] ?? String(option);
}

export function evidenceTypeLabel(evidence: EvidenceType | string): string {
  const labels: Record<string, string> = {
    photos: 'Fotos',
    attendanceList: 'Lista de Presença',
    report: 'Relatório',
    graphicMaterial: 'Material Gráfico',
    other: 'Outro',
  };
  return labels[evidence as string] ?? String(evidence);
}

export function productRealisedLabel(product: ProductRealised | string): string {
  const labels: Record<string, string> = {
    oficinaRealizada: 'Oficina Realizada',
    relatorioEntregue: 'Relatório Entregue',
    exposicaoMontada: 'Exposição Montada',
    eventoExecutado: 'Evento Executado',
    planoDeAcaoElaborado: 'Plano de Ação Elaborado',
    materialGraficoProduzido: 'Material Gráfico Produzido',
    conteudoDigitalPublicado: 'Conteúdo Digital Publicado',
    pesquisaConcluida: 'Pesquisa Concluída',
    reuniaoRegistrada: 'Reunião Registrada',
    naoSeAplica: 'Não se Aplica',
    outro: 'Outro',
  };
  return labels[product as string] ?? String(product);
}

export function quantityLabel(quantity: Quantity | string): string {
  const labels: Record<string, string> = {
    one: '1', two: '2', three: '3', four: '4', five: '5',
    six: '6', seven: '7', eight: '8', nine: '9', ten: '10',
    maisDeDez: 'Mais de 10',
  };
  return labels[quantity as string] ?? String(quantity);
}

export function audienceRangeLabel(range: AudienceRange | string): string {
  const labels: Record<string, string> = {
    zeroToTwenty: '0 a 20',
    twentyOneToFifty: '21 a 50',
    fiftyOneToHundred: '51 a 100',
    hundredOneToTwoHundred: '101 a 200',
    twoHundredOneToFiveHundred: '201 a 500',
    aboveFiveHundred: 'Acima de 500',
    naoSeAplica: 'Não se Aplica',
  };
  return labels[range as string] ?? String(range);
}

export function getLocalRealizadoLabel(local: LocalRealizado | string): string {
  const labels: Record<string, string> = {
    MHAB: 'MHAB',
    MUMO: 'MUMO',
    MIS: 'MIS',
    Outro: 'Outro',
  };
  return labels[local as string] ?? String(local);
}

export function getProdutoRealizadoLabel(produto: ProdutoRealizado | string): string {
  const labels: Record<string, string> = {
    coberturaFotografica: 'Cobertura Fotográfica',
    posts: 'Posts',
    releases: 'Releases',
    textoExpografico: 'Texto Expográfico',
    textoCatalogo: 'Texto Catálogo',
    designCatalogo: 'Design Catálogo',
    coberturaDeVideo: 'Cobertura de Vídeo',
    outros: 'Outros',
  };
  return labels[produto as string] ?? String(produto);
}

export function getRoleLabel(role: AppUserRole | string): string {
  const labels: Record<string, string> = {
    [AppUserRole.coordination]: 'Coordenação',
    [AppUserRole.coordinator]: 'Coordenador',
    [AppUserRole.administration]: 'Administração',
    [AppUserRole.professional]: 'Profissional',
  };
  return labels[role as string] ?? String(role);
}

export const PROFESSIONAL_ROLES = [
  'Coordenação Geral (Daniel Perini)',
  'Coordenação de Programação',
  'Coordenação de Produção',
  'Coordenação de Comunicação',
  'Educador(a)',
  'Produtor(a) Cultural',
  'Assistente de Produção',
  'Redator(a)',
  'Designer',
  'Técnico(a) de Som',
  'Técnico(a) de Iluminação',
  'Mediador(a) Cultural',
  'Outro',
] as const;

export const COORDINATION_GENERAL_ROLE = 'Coordenação Geral (Daniel Perini)';

export function isAbove100Audience(range: AudienceRange): boolean {
  return (
    range === 'hundredOneToTwoHundred' ||
    range === 'twoHundredOneToFiveHundred' ||
    range === 'aboveFiveHundred'
  );
}

export function getCurrentMonth(): Month | null {
  const jsMonth = new Date().getMonth() + 1;
  const monthMap: Record<number, Month> = {
    2: 'february', 3: 'march', 4: 'april', 5: 'may', 6: 'june',
    7: 'july', 8: 'august', 9: 'september', 10: 'october', 11: 'november',
  };
  return monthMap[jsMonth] ?? null;
}

export function getCurrentYear(): number {
  return new Date().getFullYear();
}

export function formatAudienceNumber(audience: number | bigint): string {
  return Number(audience).toLocaleString('pt-BR');
}
