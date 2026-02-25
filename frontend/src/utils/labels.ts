import {
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
} from '../backend';

export function getMuseumLabel(museum: MuseumLocation | string): string {
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

export const MUSEUM_LOCATIONS: MuseumLocation[] = [
  MuseumLocation.equipePrincipal,
  MuseumLocation.comunicacao,
  MuseumLocation.administracao,
  MuseumLocation.programacao,
  MuseumLocation.producaoGeral,
  MuseumLocation.coordenacao,
];

export function monthLabel(month: Month | string): string {
  const labels: Record<string, string> = {
    [Month.february]: 'Fevereiro',
    [Month.march]: 'Março',
    [Month.april]: 'Abril',
    [Month.may]: 'Maio',
    [Month.june]: 'Junho',
    [Month.july]: 'Julho',
    [Month.august]: 'Agosto',
    [Month.september]: 'Setembro',
    [Month.october]: 'Outubro',
    [Month.november]: 'Novembro',
  };
  return labels[month as string] ?? String(month);
}

/** Alias for monthLabel — accepts a string month key */
export function getMonthLabel(month: string): string {
  return monthLabel(month as Month);
}

export function statusLabel(status: Status | string): string {
  const labels: Record<string, string> = {
    [Status.draft]: 'Rascunho',
    [Status.submitted]: 'Enviado',
    [Status.underReview]: 'Em Revisão',
    [Status.approved]: 'Aprovado',
    [Status.analysis]: 'Em análise',
    [Status.requiresAdjustment]: 'Necessita ajustes',
  };
  return labels[status as string] ?? String(status);
}

/** Alias for statusLabel */
export function getStatusLabel(status: Status | string): string {
  return statusLabel(status);
}

export function activityStatusLabel(status: ActivityStatus): string {
  const labels: Record<ActivityStatus, string> = {
    [ActivityStatus.notStarted]: 'Não iniciada',
    [ActivityStatus.submitted]: 'Enviada',
    [ActivityStatus.completed]: 'Concluída',
    [ActivityStatus.rescheduled]: 'Reprogramada',
    [ActivityStatus.cancelled]: 'Cancelada',
  };
  return labels[status] ?? status;
}

export function classificationLabel(c: Classification): string {
  const labels: Record<Classification, string> = {
    [Classification.goalLinked]: 'Vinculada à Meta',
    [Classification.routine]: 'Rotina',
    [Classification.extra]: 'Extra',
  };
  return labels[c] ?? c;
}

export function goalStatusLabel(gs: GoalStatus): string {
  const labels: Record<GoalStatus, string> = {
    [GoalStatus.inProgress]: 'Em andamento',
    [GoalStatus.partiallyCumplied]: 'Parcialmente cumprida',
    [GoalStatus.achieved]: 'Alcançada',
    [GoalStatus.exceeded]: 'Superada',
  };
  return labels[gs] ?? gs;
}

export function accessibilityOptionLabel(opt: AccessibilityOption): string {
  const labels: Record<AccessibilityOption, string> = {
    [AccessibilityOption.none]: 'Nenhuma',
    [AccessibilityOption.libras]: 'Libras',
    [AccessibilityOption.audioDescription]: 'Audiodescrição',
    [AccessibilityOption.tactileMaterial]: 'Material tátil',
    [AccessibilityOption.other]: 'Outro',
  };
  return labels[opt] ?? opt;
}

export function evidenceTypeLabel(et: EvidenceType): string {
  const labels: Record<EvidenceType, string> = {
    [EvidenceType.photos]: 'Fotos',
    [EvidenceType.attendanceList]: 'Lista de presença',
    [EvidenceType.report]: 'Relatório',
    [EvidenceType.graphicMaterial]: 'Material gráfico',
    [EvidenceType.other]: 'Outro',
  };
  return labels[et] ?? et;
}

export function productRealisedLabel(pr: ProductRealised): string {
  const labels: Record<ProductRealised, string> = {
    [ProductRealised.oficinaRealizada]: 'Oficina realizada',
    [ProductRealised.relatorioEntregue]: 'Relatório entregue',
    [ProductRealised.exposicaoMontada]: 'Exposição montada',
    [ProductRealised.eventoExecutado]: 'Evento executado',
    [ProductRealised.planoDeAcaoElaborado]: 'Plano de ação elaborado',
    [ProductRealised.materialGraficoProduzido]: 'Material gráfico produzido',
    [ProductRealised.conteudoDigitalPublicado]: 'Conteúdo digital publicado',
    [ProductRealised.pesquisaConcluida]: 'Pesquisa concluída',
    [ProductRealised.reuniaoRegistrada]: 'Reunião registrada',
    [ProductRealised.naoSeAplica]: 'Não se aplica',
    [ProductRealised.outro]: 'Outro',
  };
  return labels[pr] ?? pr;
}

export function quantityLabel(q: Quantity): string {
  const labels: Record<Quantity, string> = {
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
  return labels[q] ?? q;
}

export function audienceRangeLabel(ar: AudienceRange): string {
  const labels: Record<AudienceRange, string> = {
    [AudienceRange.zeroToTwenty]: '0 a 20 pessoas',
    [AudienceRange.twentyOneToFifty]: '21 a 50 pessoas',
    [AudienceRange.fiftyOneToHundred]: '51 a 100 pessoas',
    [AudienceRange.hundredOneToTwoHundred]: '101 a 200 pessoas',
    [AudienceRange.twoHundredOneToFiveHundred]: '201 a 500 pessoas',
    [AudienceRange.aboveFiveHundred]: 'Acima de 500 pessoas',
    [AudienceRange.naoSeAplica]: 'Não se aplica',
  };
  return labels[ar] ?? ar;
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
    range === AudienceRange.hundredOneToTwoHundred ||
    range === AudienceRange.twoHundredOneToFiveHundred ||
    range === AudienceRange.aboveFiveHundred
  );
}

export const MONTH_ORDER: string[] = [
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
];

/** Ordered array of Month enum values (matches MONTH_ORDER) */
export const MONTHS: Month[] = [
  Month.february,
  Month.march,
  Month.april,
  Month.may,
  Month.june,
  Month.july,
  Month.august,
  Month.september,
  Month.october,
  Month.november,
];
