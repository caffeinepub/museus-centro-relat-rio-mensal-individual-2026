import type { Principal } from '@dfinity/principal';

export type ReportId = string;
export type ActivityId = string;

export type Month =
  | 'february' | 'march' | 'april' | 'may' | 'june'
  | 'july' | 'august' | 'september' | 'october' | 'november';

export type Year = number;

export type MuseumLocation =
  | 'equipePrincipal' | 'comunicacao' | 'administracao'
  | 'programacao' | 'producaoGeral' | 'coordenacao';

export type Status =
  | 'draft' | 'submitted' | 'underReview' | 'approved' | 'analysis' | 'requiresAdjustment';

export type ActivityStatus =
  | 'notStarted' | 'submitted' | 'completed' | 'rescheduled' | 'cancelled';

export type Classification = 'goalLinked' | 'routine' | 'extra';

export type GoalStatus = 'inProgress' | 'partiallyCumplied' | 'achieved' | 'exceeded';

export type AccessibilityOption =
  | 'none' | 'libras' | 'audioDescription' | 'tactileMaterial' | 'other';

export type EvidenceType =
  | 'photos' | 'attendanceList' | 'report' | 'graphicMaterial' | 'other';

export type ProductRealised =
  | 'oficinaRealizada' | 'relatorioEntregue' | 'exposicaoMontada' | 'eventoExecutado'
  | 'planoDeAcaoElaborado' | 'materialGraficoProduzido' | 'conteudoDigitalPublicado'
  | 'pesquisaConcluida' | 'reuniaoRegistrada' | 'naoSeAplica' | 'outro';

export type Quantity =
  | 'one' | 'two' | 'three' | 'four' | 'five' | 'six'
  | 'seven' | 'eight' | 'nine' | 'ten' | 'maisDeDez';

export type AudienceRange =
  | 'zeroToTwenty' | 'twentyOneToFifty' | 'fiftyOneToHundred'
  | 'hundredOneToTwoHundred' | 'twoHundredOneToFiveHundred'
  | 'aboveFiveHundred' | 'naoSeAplica';

export type LocalRealizado = 'MHAB' | 'MUMO' | 'MIS' | 'Outro';

export type ProdutoRealizado =
  | 'coberturaFotografica' | 'posts' | 'releases' | 'textoExpografico'
  | 'textoCatalogo' | 'designCatalogo' | 'coberturaDeVideo' | 'outros';

export interface FileEvidence {
  fileId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploaderId: Principal;
  uploaderName: string;
  uploadedAt: bigint;
}

export interface AudienceBreakdown {
  children: bigint;
  youth: bigint;
  adults: bigint;
  elderly: bigint;
  pcd: bigint;
}

export interface Report {
  id: ReportId;
  protocolNumber: string;
  referenceMonth: Month;
  year: Year;
  professionalName: string;
  funcaoCargo: string;
  role: string;
  mainMuseum: MuseumLocation;
  workedAtOtherMuseum: boolean;
  otherMuseum: string | null;
  executiveSummary: string;
  positivePoints: string;
  difficulties: string;
  suggestions: string;
  identifiedOpportunity: string;
  opportunityCategory: string;
  expectedImpact: string;
  status: Status;
  sendDate: bigint | null;
  signature: string | null;
  authorId: Principal;
  generalExecutiveSummary: string | null;
  consolidatedGoals: string | null;
  institutionalObservations: string | null;
  submittedAt: bigint | null;
  approvedAt: bigint | null;
  coordinatorComments: string | null;
  coordinatorSignature: string | null;
}

export interface Activity {
  id: ActivityId;
  reportId: ReportId;
  date: bigint;
  startDate: bigint;
  endDate: bigint;
  startTime: bigint;
  endTime: bigint;
  museum: MuseumLocation;
  localRealizado: LocalRealizado;
  localOutroDescricao: string;
  actionType: string;
  activityName: string;
  dedicatedHours: number | null;
  hoursNotApplicable: boolean;
  classification: Classification;
  goalNumber: number | null;
  goalDescription: string | null;
  plannedIndicator: string | null;
  quantitativeGoal: number | null;
  achievedResult: number | null;
  contributionPercent: number | null;
  goalStatus: GoalStatus | null;
  technicalJustification: string | null;
  totalAudience: number;
  children: number;
  youth: number;
  adults: number;
  elderly: number;
  pcd: number;
  accessibilityOptions: AccessibilityOption[];
  hadPartnership: boolean;
  partnerName: string | null;
  partnerType: string | null;
  objective: string | null;
  executedDescription: string;
  achievedResults: string;
  qualitativeAssessment: string;
  evidences: EvidenceType[];
  attachmentsPrefix: string;
  productRealised: ProductRealised;
  quantity: Quantity | null;
  audienceRange: AudienceRange;
  partnershipsInvolved: string | null;
  status: ActivityStatus;
  cancellationReason: string | null;
  files: string[];
  linkedActivityId: ActivityId | null;
  evidencias: FileEvidence[];
  produtosRealizados: ProdutoRealizado[];
}

export interface StatusBreakdown {
  draft: bigint;
  submitted: bigint;
  underReview: bigint;
  approved: bigint;
  analysis: bigint;
  requiresAdjustment: bigint;
}

export interface CoordinationDashboard {
  totalActivitiesPerMuseum: [string, bigint][];
  totalAudience: bigint;
  audienceByProfile: AudienceBreakdown;
  totalLinkedGoals: bigint;
  goalsAchieved: bigint;
  goalsInProgress: bigint;
  plannedActivitiesCount: bigint;
  extraActivitiesCount: bigint;
  activitiesWithAccessibility: bigint;
  partnershipsCount: bigint;
  monthlyEvolution: [string, bigint][];
  totalDedicatedHours: bigint;
  reportStatusBreakdown: StatusBreakdown;
  reportsByMuseum: [string, bigint][];
  reportsByMonth: [string, bigint][];
}

export interface DashboardFilter {
  museum: MuseumLocation | null;
  month: string | null;
  professionalName: string | null;
}

export interface FileAttachment {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  uploadedAt: bigint;
  uploader: Principal;
  base64Content: string;
}

export type AudienceQueryType =
  | { __kind__: 'cumulativeTotal' }
  | { __kind__: 'specificMonth'; specificMonth: { month: Month; year: bigint } }
  | { __kind__: 'customRange'; customRange: { startMonth: Month; startYear: bigint; endMonth: Month; endYear: bigint } };
