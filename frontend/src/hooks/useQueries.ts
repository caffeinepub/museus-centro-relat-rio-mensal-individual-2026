import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type {
  Report,
  ReportCreate,
  Activity,
  ActivityCreate,
  ActivityId,
  ReportId,
  UserProfile,
  FullUserProfile,
  Goal,
  DashboardFilter,
  CoordinationDashboard,
  AudienceQueryType,
  AppUserRole,
  ProfessionalOption,
  ReportActivityExport,
} from '../backend';
import { AppUserRole as AppUserRoleEnum } from '../backend';
import { ExternalBlob } from '../backend';
import { Principal } from '@dfinity/principal';

// ── Actor helpers ──────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['allUserProfiles'] });
    },
  });
}

export function useIsCallerApproved() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<boolean>({
    queryKey: ['isCallerApproved'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerApproved();
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

export function useRequestApproval() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.requestApproval();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isCallerApproved'] });
    },
  });
}

// ── Reports ────────────────────────────────────────────────────────────────

export function useReportsForUser(userId: Principal | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Report[]>({
    queryKey: ['reportsForUser', userId?.toString()],
    queryFn: async () => {
      if (!actor || !userId) return [];
      return actor.getReportsForUser(userId);
    },
    enabled: !!actor && !actorFetching && !!userId,
  });
}

export function useReport(reportId: string | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Report>({
    queryKey: ['report', reportId],
    queryFn: async () => {
      if (!actor || !reportId) throw new Error('Missing actor or reportId');
      return actor.getReport(reportId);
    },
    enabled: !!actor && !actorFetching && !!reportId,
  });
}

// Alias for backwards compatibility
export const useGetReport = useReport;

export function useAllReports() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Report[]>({
    queryKey: ['allReports'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllReports();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useCreateReport() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (report: ReportCreate) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createReport(report);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reportsForUser'] });
      queryClient.invalidateQueries({ queryKey: ['allReports'] });
    },
  });
}

export function useUpdateReport() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reportId, report }: { reportId: string; report: Report }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateReport(reportId, report);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['report', variables.reportId] });
      queryClient.invalidateQueries({ queryKey: ['reportsForUser'] });
      queryClient.invalidateQueries({ queryKey: ['allReports'] });
    },
  });
}

export function useDeleteReport() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reportId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteReport(reportId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reportsForUser'] });
      queryClient.invalidateQueries({ queryKey: ['allReports'] });
    },
  });
}

export function useSubmitReport() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reportId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitReport(reportId);
    },
    onSuccess: (_data, reportId) => {
      queryClient.invalidateQueries({ queryKey: ['report', reportId] });
      queryClient.invalidateQueries({ queryKey: ['reportsForUser'] });
      queryClient.invalidateQueries({ queryKey: ['allReports'] });
    },
  });
}

export function useReviewReport() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      reportId,
      status,
      comments,
      signature,
    }: {
      reportId: string;
      status: import('../backend').Status;
      comments?: string;
      signature?: ExternalBlob;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.reviewReport(reportId, status, comments ?? null, signature ?? null);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['report', variables.reportId] });
      queryClient.invalidateQueries({ queryKey: ['allReports'] });
    },
  });
}

export function useUploadSignature() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reportId, signature }: { reportId: string; signature: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.uploadSignature(reportId, signature);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['report', variables.reportId] });
    },
  });
}

export function useUpdateCoordinationFields() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      reportId,
      executiveSummary,
      consolidatedGoals,
      institutionalObservations,
    }: {
      reportId: string;
      executiveSummary: string;
      consolidatedGoals: string;
      institutionalObservations: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateCoordinationFields(reportId, executiveSummary, consolidatedGoals, institutionalObservations);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['report', variables.reportId] });
    },
  });
}

// ── Activities ─────────────────────────────────────────────────────────────

export function useActivitiesForReport(reportId: string | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Activity[]>({
    queryKey: ['activitiesForReport', reportId],
    queryFn: async () => {
      if (!actor || !reportId) return [];
      return actor.getActivitiesForReport(reportId);
    },
    enabled: !!actor && !actorFetching && !!reportId,
  });
}

export function useActivity(activityId: string | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Activity>({
    queryKey: ['activity', activityId],
    queryFn: async () => {
      if (!actor || !activityId) throw new Error('Missing actor or activityId');
      return actor.getActivity(activityId);
    },
    enabled: !!actor && !actorFetching && !!activityId,
  });
}

export function useAllActivities() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Activity[]>({
    queryKey: ['allActivities'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllActivities();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useCreateActivity() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (activity: ActivityCreate) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createActivity(activity);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['activitiesForReport', variables.reportId] });
      queryClient.invalidateQueries({ queryKey: ['allActivities'] });
    },
  });
}

export function useUpdateActivity() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ activityId, activity }: { activityId: string; activity: Activity }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateActivity(activityId, activity);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['activity', variables.activityId] });
      queryClient.invalidateQueries({ queryKey: ['activitiesForReport'] });
      queryClient.invalidateQueries({ queryKey: ['allActivities'] });
    },
  });
}

export function useDeleteActivity() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (activityId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteActivity(activityId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activitiesForReport'] });
      queryClient.invalidateQueries({ queryKey: ['allActivities'] });
    },
  });
}

// ── Report with Activities (for export) ───────────────────────────────────

export function useGetReportWithActivities() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (reportId: ReportId): Promise<ReportActivityExport | null> => {
      if (!actor) throw new Error('Actor not available');
      return actor.getReportWithActivities(reportId);
    },
  });
}

// ── Goals ──────────────────────────────────────────────────────────────────

export function useGoals() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Goal[]>({
    queryKey: ['goals'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listGoals();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useAddGoal() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, description }: { name: string; description?: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addGoal(name, description ?? null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });
}

export function useToggleGoalActive() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (goalId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.toggleGoalActive(goalId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });
}

// ── User Management ────────────────────────────────────────────────────────

export function useAllUserProfiles() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<FullUserProfile[]>({
    queryKey: ['allUserProfiles'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listAllUserProfiles();
    },
    enabled: !!actor && !actorFetching,
  });
}

// Alias for backwards compatibility
export const useListAllUserProfiles = useAllUserProfiles;

export function useUpdateUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user, profile }: { user: Principal; profile: UserProfile }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateUserProfile(user, profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUserProfiles'] });
    },
  });
}

export function useUpdateUserRole() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user, role }: { user: Principal; role: AppUserRole }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateUserRole(user, role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUserProfiles'] });
    },
  });
}

export function useDeleteUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (user: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteUserProfile(user);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUserProfiles'] });
    },
  });
}

export function useApproveUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (user: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.approveUser(user);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUserProfiles'] });
      queryClient.invalidateQueries({ queryKey: ['isCallerApproved'] });
    },
  });
}

export function useRejectUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (user: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.rejectUser(user);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUserProfiles'] });
    },
  });
}

// ── Dashboard ──────────────────────────────────────────────────────────────

export function useCoordinationDashboard(filter: DashboardFilter) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<CoordinationDashboard>({
    queryKey: ['coordinationDashboard', filter],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCoordinationDashboardWithFilter(filter);
    },
    enabled: !!actor && !actorFetching,
  });
}

/** Serialize an AudienceQueryType to a string safe for use as a React Query key. */
function serializeAudienceQueryType(queryType: AudienceQueryType | null): string {
  if (!queryType) return 'null';
  if (queryType.__kind__ === 'cumulativeTotal') return 'cumulativeTotal';
  if (queryType.__kind__ === 'specificMonth') {
    const { month, year } = queryType.specificMonth;
    return `specificMonth:${month}:${year.toString()}`;
  }
  if (queryType.__kind__ === 'customRange') {
    const { startMonth, startYear, endMonth, endYear } = queryType.customRange;
    return `customRange:${startMonth}:${startYear.toString()}:${endMonth}:${endYear.toString()}`;
  }
  return JSON.stringify(queryType);
}

export function useGetTotalGeneralAudience(queryType: AudienceQueryType | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ['totalGeneralAudience', serializeAudienceQueryType(queryType)],
    queryFn: async () => {
      if (!actor || !queryType) throw new Error('Actor not available or queryType is null');
      return actor.getTotalGeneralAudience(queryType);
    },
    enabled: !!actor && !actorFetching && !!queryType,
  });
}

// ── Role helpers ───────────────────────────────────────────────────────────

export function useIsCoordinadorGeral() {
  const { data: profile } = useGetCallerUserProfile();
  return profile?.appRole === AppUserRoleEnum.coordination;
}

export function useIsCoordinator() {
  const { data: profile } = useGetCallerUserProfile();
  return (
    profile?.appRole === AppUserRoleEnum.coordination ||
    profile?.appRole === AppUserRoleEnum.coordinator
  );
}

export function useIsAdministration() {
  const { data: profile } = useGetCallerUserProfile();
  return profile?.appRole === AppUserRoleEnum.administration;
}

// ── Professionals list ─────────────────────────────────────────────────────

export function useListRegisteredProfessionals() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<ProfessionalOption[]>({
    queryKey: ['registeredProfessionals'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listRegisteredProfessionals();
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

// ── Search ─────────────────────────────────────────────────────────────────

export function useSearchActivities(searchTerm: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['searchActivities', searchTerm],
    queryFn: async () => {
      if (!actor || !searchTerm) return [];
      return actor.searchActivitiesByName(searchTerm);
    },
    enabled: !!actor && !actorFetching && searchTerm.length > 0,
  });
}

// Backwards-compat aliases
export const useGetReportsForUser = useReportsForUser;
export const useGetActivitiesForReport = useActivitiesForReport;
