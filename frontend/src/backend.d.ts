import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface FullUserProfile {
    principal: Principal;
    appRole: AppUserRole;
    name: string;
    team: TeamLocation;
    approvalStatus: ApprovalStatus;
}
export interface UserApprovalInfo {
    status: ApprovalStatus;
    principal: Principal;
}
export type ReportId = string;
export interface ProfessionalOption {
    principal: Principal;
    name: string;
}
export interface UserProfile {
    appRole: AppUserRole;
    name: string;
    team: TeamLocation;
}
export enum AppUserRole {
    coordination = "coordination",
    administration = "administration",
    professional = "professional",
    coordinator = "coordinator"
}
export enum ApprovalStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum ReviewAction {
    returnReport = "returnReport",
    approve = "approve"
}
export enum TeamLocation {
    mis = "mis",
    comunicacao = "comunicacao",
    mhab = "mhab",
    mumo = "mumo",
    empty = "empty",
    administracao = "administracao"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    approveUser(user: Principal): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteUserProfile(user: Principal): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isCallerApproved(): Promise<boolean>;
    listAllUserProfiles(): Promise<Array<FullUserProfile>>;
    listApprovals(): Promise<Array<UserApprovalInfo>>;
    listRegisteredProfessionals(): Promise<Array<ProfessionalOption>>;
    rejectUser(user: Principal): Promise<void>;
    requestApproval(): Promise<void>;
    reviewReport(reportId: ReportId, action: ReviewAction, comment: string | null): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setApproval(user: Principal, status: ApprovalStatus): Promise<void>;
    updateUserProfile(user: Principal, updatedProfile: UserProfile): Promise<void>;
    updateUserRole(user: Principal, newRole: AppUserRole): Promise<void>;
}
