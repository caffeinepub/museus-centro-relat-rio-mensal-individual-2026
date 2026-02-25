import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type {
  Report,
  Activity,
  ActivityCreate,
  UserProfile,
  FullUserProfile,
  Goal,
  DashboardFilter,
  CoordinationDashboard,
  ActivitySearchResult,
  AppUserRole,
  AudienceQueryType,
} from '../backend';
import { ApprovalStatus } from '../backend';
import type { Principal } from '@dfinity/principal';

// ── User Profile ──────────────────────────────────────────────────────────────

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

export function useIsCoordinadorGeral(userProfile: UserProfile | null | undefined): boolean {
  return !!(userProfile && userProfile.appRole === 'coordination' && userProfile.name === 'Daniel Perini Santos');
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
    },
  });
}

export function useAllUserProfiles() {
  const { actor, isFetching } = useActor();

  return useQuery<FullUserProfile[]>({
    queryKey: ['allUserProfiles'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listAllUserProfiles();
    },
    enabled: !!actor && !isFetching,
  });
}

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

// ── Approval ──────────────────────────────────────────────────────────────────

export function useIsCallerApproved() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerApproved'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerApproved();
    },
    enabled: !!actor && !isFetching,
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
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
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
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
      queryClient.invalidateQueries({ queryKey: ['isCallerApproved'] });
    },
  });
}

// ── Reports ───────────────────────────────────────────────────────────────────

export function useReportsForUser(userId: Principal | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<Report[]>({
    queryKey: ['reports', userId?.toString()],
    queryFn: async () => {
      if (!actor || !userId) return [];
      return actor.getReportsForUser(userId);
    },
    enabled: !!actor && !isFetching && !!userId,
  });
}

export function useAllReports() {
  const { actor, isFetching } = useActor();

  return useQuery<Report[]>({
    queryKey: ['allReports'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllReports();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useReport(reportId: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<Report | null>({
    queryKey: ['report', reportId],
    queryFn: async () => {
      if (!actor || !reportId) return null;
      return actor.getReport(reportId);
    },
    enabled: !!actor && !isFetching && !!reportId,
  });
}

export function useCreateReport() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (report: Report) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createReport(report);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['allReports'] });
      queryClient.invalidateQueries({ queryKey: ['report'] });
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
      queryClient.invalidateQueries({ queryKey: ['reports'] });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['allReports'] });
      queryClient.invalidateQueries({ queryKey: ['report'] });
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
      comments: string | undefined;
      signature: import('../backend').ExternalBlob | undefined;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.reviewReport(reportId, status, comments ?? null, signature ?? null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['allReports'] });
      queryClient.invalidateQueries({ queryKey: ['report'] });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['allReports'] });
      queryClient.invalidateQueries({ queryKey: ['report'] });
    },
  });
}

// ── Activities ────────────────────────────────────────────────────────────────

export function useActivitiesForReport(reportId: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<Activity[]>({
    queryKey: ['activities', reportId],
    queryFn: async () => {
      if (!actor || !reportId) return [];
      return actor.getActivitiesForReport(reportId);
    },
    enabled: !!actor && !isFetching && !!reportId,
  });
}

export function useAllActivities() {
  const { actor, isFetching } = useActor();

  return useQuery<Activity[]>({
    queryKey: ['allActivities'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllActivities();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useActivity(activityId: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<Activity | null>({
    queryKey: ['activity', activityId],
    queryFn: async () => {
      if (!actor || !activityId) return null;
      return actor.getActivity(activityId);
    },
    enabled: !!actor && !isFetching && !!activityId,
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
      queryClient.invalidateQueries({ queryKey: ['activities', variables.reportId] });
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
      queryClient.invalidateQueries({ queryKey: ['activities', variables.activity.reportId] });
      queryClient.invalidateQueries({ queryKey: ['activity', variables.activityId] });
      queryClient.invalidateQueries({ queryKey: ['allActivities'] });
    },
  });
}

export function useDeleteActivity() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ activityId, reportId }: { activityId: string; reportId: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteActivity(activityId);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['activities', variables.reportId] });
      queryClient.invalidateQueries({ queryKey: ['allActivities'] });
    },
  });
}

export function useSearchActivities(searchTerm: string) {
  const { actor, isFetching } = useActor();

  return useQuery<ActivitySearchResult[]>({
    queryKey: ['searchActivities', searchTerm],
    queryFn: async () => {
      if (!actor || !searchTerm.trim()) return [];
      return actor.searchActivitiesByName(searchTerm);
    },
    enabled: !!actor && !isFetching && searchTerm.trim().length > 0,
  });
}

// ── Goals ─────────────────────────────────────────────────────────────────────

export function useGoals() {
  const { actor, isFetching } = useActor();

  return useQuery<Goal[]>({
    queryKey: ['goals'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listGoals();
    },
    enabled: !!actor && !isFetching,
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

// ── Dashboard ─────────────────────────────────────────────────────────────────

export function useCoordinationDashboard(filter: DashboardFilter) {
  const { actor, isFetching } = useActor();

  return useQuery<CoordinationDashboard>({
    queryKey: ['coordinationDashboard', filter],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCoordinationDashboardWithFilter(filter);
    },
    enabled: !!actor && !isFetching,
  });
}

// ── General Audience ──────────────────────────────────────────────────────────

/** Serialize an AudienceQueryType to a stable string key (avoids BigInt in query keys). */
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
  return 'unknown';
}

export function useGetTotalGeneralAudience(queryType: AudienceQueryType | null) {
  const { actor, isFetching } = useActor();

  const queryKey = ['totalGeneralAudience', serializeAudienceQueryType(queryType)];

  return useQuery<bigint>({
    queryKey,
    queryFn: async () => {
      if (!actor || !queryType) throw new Error('Actor or query type not available');
      return actor.getTotalGeneralAudience(queryType);
    },
    enabled: !!actor && !isFetching && queryType !== null,
  });
}
