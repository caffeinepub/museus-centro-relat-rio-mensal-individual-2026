import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type Time = bigint;
export interface DashboardFilter {
    month?: string;
    museum?: MuseumLocation;
    professionalName?: string;
}
export interface Report {
    id: ReportId;
    difficulties: string;
    status: Status;
    signature?: string;
    coordinatorSignature?: ExternalBlob;
    expectedImpact: string;
    suggestions: string;
    authorId: Principal;
    otherMuseum?: string;
    identifiedOpportunity: string;
    professionalName: string;
    protocolNumber: string;
    approvedAt?: Time;
    role: string;
    year: Year;
    workedAtOtherMuseum: boolean;
    submittedAt?: Time;
    positivePoints: string;
    generalExecutiveSummary?: string;
    mainMuseum: MuseumLocation;
    executiveSummary: string;
    coordinatorComments?: string;
    institutionalObservations?: string;
    referenceMonth: Month;
    opportunityCategory: string;
    consolidatedGoals?: string;
    sendDate?: Time;
}
export type ReportId = string;
export interface CoordinationDashboard {
    totalDedicatedHours: bigint;
    activitiesWithAccessibility: bigint;
    extraActivitiesCount: bigint;
    goalsAchieved: bigint;
    partnershipsCount: bigint;
    reportStatusBreakdown: StatusBreakdown;
    goalsInProgress: bigint;
    reportsByMuseum: Array<[string, bigint]>;
    audienceByProfile: AudienceBreakdown;
    plannedActivitiesCount: bigint;
    totalLinkedGoals: bigint;
    reportsByMonth: Array<[string, bigint]>;
    totalAudience: bigint;
    monthlyEvolution: Array<[string, bigint]>;
    totalActivitiesPerMuseum: Array<[string, bigint]>;
}
export interface AudienceBreakdown {
    pcd: bigint;
    elderly: bigint;
    children: bigint;
    adults: bigint;
    youth: bigint;
}
export interface FullUserProfile {
    principal: Principal;
    appRole: AppUserRole;
    museum: MuseumLocation;
    name: string;
    approvalStatus: ApprovalStatus;
}
export type Year = bigint;
export type Date_ = bigint;
export interface UserApprovalInfo {
    status: ApprovalStatus;
    principal: Principal;
}
export interface Activity {
    id: ActivityId;
    pcd: bigint;
    status: ActivityStatus;
    evidences: Array<EvidenceType>;
    activityName: string;
    executedDescription: string;
    plannedIndicator?: string;
    hoursNotApplicable: boolean;
    partnerName?: string;
    partnerType?: string;
    cancellationReason?: string;
    museum: MuseumLocation;
    date: Date_;
    objective?: string;
    goalStatus?: GoalStatus;
    achievedResults: string;
    actionType: string;
    hadPartnership: boolean;
    audienceRange: AudienceRange;
    elderly: bigint;
    children: bigint;
    dedicatedHours?: bigint;
    achievedResult?: bigint;
    totalAudience: bigint;
    productRealised: ProductRealised;
    partnershipsInvolved?: string;
    adults: bigint;
    quantity?: Quantity;
    attachmentsPrefix: string;
    technicalJustification?: string;
    goalDescription?: string;
    reportId: ReportId;
    goalNumber?: bigint;
    qualitativeAssessment: string;
    quantitativeGoal?: bigint;
    youth: bigint;
    contributionPercent?: number;
    accessibilityOptions: Array<AccessibilityOption>;
    classification: Classification;
}
export type ActivityId = string;
export interface StatusBreakdown {
    submitted: bigint;
    underReview: bigint;
    requiresAdjustment: bigint;
    approved: bigint;
    analysis: bigint;
    draft: bigint;
}
export interface UserProfile {
    appRole: AppUserRole;
    museum: MuseumLocation;
    name: string;
}
export interface Goal {
    id: bigint;
    active: boolean;
    name: string;
    description?: string;
}
export enum AccessibilityOption {
    tactileMaterial = "tactileMaterial",
    other = "other",
    none = "none",
    libras = "libras",
    audioDescription = "audioDescription"
}
export enum ActivityStatus {
    notStarted = "notStarted",
    cancelled = "cancelled",
    submitted = "submitted",
    rescheduled = "rescheduled",
    completed = "completed"
}
export enum AppUserRole {
    coordination = "coordination",
    administration = "administration",
    professional = "professional"
}
export enum ApprovalStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum AudienceRange {
    fiftyOneToHundred = "fiftyOneToHundred",
    twoHundredOneToFiveHundred = "twoHundredOneToFiveHundred",
    twentyOneToFifty = "twentyOneToFifty",
    naoSeAplica = "naoSeAplica",
    zeroToTwenty = "zeroToTwenty",
    hundredOneToTwoHundred = "hundredOneToTwoHundred",
    aboveFiveHundred = "aboveFiveHundred"
}
export enum Classification {
    goalLinked = "goalLinked",
    extra = "extra",
    routine = "routine"
}
export enum EvidenceType {
    report = "report",
    other = "other",
    graphicMaterial = "graphicMaterial",
    attendanceList = "attendanceList",
    photos = "photos"
}
export enum GoalStatus {
    achieved = "achieved",
    exceeded = "exceeded",
    partiallyCumplied = "partiallyCumplied",
    inProgress = "inProgress"
}
export enum Month {
    may = "may",
    march = "march",
    april = "april",
    november = "november",
    july = "july",
    june = "june",
    february = "february",
    september = "september",
    august = "august",
    october = "october"
}
export enum MuseumLocation {
    comunicacao = "comunicacao",
    coordenacao = "coordenacao",
    equipePrincipal = "equipePrincipal",
    producaoGeral = "producaoGeral",
    programacao = "programacao",
    administracao = "administracao"
}
export enum ProductRealised {
    outro = "outro",
    pesquisaConcluida = "pesquisaConcluida",
    conteudoDigitalPublicado = "conteudoDigitalPublicado",
    eventoExecutado = "eventoExecutado",
    planoDeAcaoElaborado = "planoDeAcaoElaborado",
    naoSeAplica = "naoSeAplica",
    oficinaRealizada = "oficinaRealizada",
    materialGraficoProduzido = "materialGraficoProduzido",
    exposicaoMontada = "exposicaoMontada",
    relatorioEntregue = "relatorioEntregue",
    reuniaoRegistrada = "reuniaoRegistrada"
}
export enum Quantity {
    one = "one",
    six = "six",
    ten = "ten",
    two = "two",
    three = "three",
    five = "five",
    four = "four",
    nine = "nine",
    eight = "eight",
    seven = "seven",
    maisDeDez = "maisDeDez"
}
export enum Status {
    submitted = "submitted",
    underReview = "underReview",
    requiresAdjustment = "requiresAdjustment",
    approved = "approved",
    analysis = "analysis",
    draft = "draft"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
/**
 * / This file imports "administrative" components:
 * / * Authorization
 * / * External blob storage
 */
export interface backendInterface {
    addGoal(name: string, description: string | null): Promise<void>;
    approveUser(user: Principal): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createActivity(activity: Activity): Promise<ActivityId>;
    createReport(report: Report): Promise<ReportId>;
    /**
     * / Delete any user profile.
     * / Callable by coordinator or admin.
     */
    deleteUserProfile(user: Principal): Promise<void>;
    getActivitiesForReport(reportId: ReportId): Promise<Array<Activity>>;
    getActivity(activityId: ActivityId): Promise<Activity>;
    getAllActivities(): Promise<Array<Activity>>;
    getAllReports(): Promise<Array<Report>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCoordinationDashboardWithFilter(filter: DashboardFilter): Promise<CoordinationDashboard>;
    getReport(reportId: ReportId): Promise<Report>;
    getReportsForUser(userId: Principal): Promise<Array<Report>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    /**
     * / Returns true for admins, coordinators (Daniel Perini Santos), and
     * / explicitly approved users — no approval gate for the coordinator.
     */
    isCallerApproved(): Promise<boolean>;
    listAllUserProfiles(): Promise<Array<FullUserProfile>>;
    listApprovals(): Promise<Array<UserApprovalInfo>>;
    listGoals(): Promise<Array<Goal>>;
    requestApproval(): Promise<void>;
    reviewReport(reportId: ReportId, newStatus: Status, comments: string | null, signature: ExternalBlob | null): Promise<void>;
    /**
     * / Save the caller's own profile.
     * / The #coordination role is only permitted when the profile name is
     * / exactly COORDINATION_RESERVED_NAME; otherwise it is downgraded to
     * / #professional.
     */
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setApproval(user: Principal, status: ApprovalStatus): Promise<void>;
    submitReport(reportId: ReportId): Promise<void>;
    toggleGoalActive(goalId: bigint): Promise<void>;
    updateActivity(activityId: ActivityId, updated: Activity): Promise<void>;
    updateCoordinationFields(reportId: ReportId, executiveSummary: string, consolidatedGoals: string, institutionalObservations: string): Promise<void>;
    updateReport(reportId: ReportId, updated: Report): Promise<void>;
    /**
     * / Update any user's profile fields (name, role, museum).
     * / Callable by coordinator or admin.
     * / The #coordination role is only permitted when the target profile name is
     * / exactly COORDINATION_RESERVED_NAME; otherwise it is downgraded to
     * / #professional.
     */
    updateUserProfile(user: Principal, updatedProfile: UserProfile): Promise<void>;
    /**
     * / Update only the role of a user.
     * / Callable by coordinator or admin.
     * / The #coordination role is only permitted when the target user's registered
     * / name is exactly COORDINATION_RESERVED_NAME; otherwise it is downgraded to
     * / #professional.
     */
    updateUserRole(user: Principal, newRole: AppUserRole): Promise<void>;
    uploadSignature(reportId: ReportId, signatureBase64: string): Promise<void>;
}
