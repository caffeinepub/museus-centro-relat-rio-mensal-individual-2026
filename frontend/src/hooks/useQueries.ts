import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type {
  Report,
  ReportCreate,
  Activity,
  ActivityCreate,
  UserProfile,
  FullUserProfile,
  DashboardFilter,
  CoordinationDashboard,
  AudienceQueryType,
  Goal,
  ActivitySearchResult,
  ActivityId,
  ReportId,
  ExternalBlob,
} from '../backend';
import { Status, ApprovalStatus, AppUserRole } from '../backend';
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

/** Returns true if the given user profile is the exclusive Coordenador Geral (Daniel Perini Santos). */
export function useIsCoordinadorGeral(userProfile: UserProfile | null | undefined): boolean {
  return !!(
    userProfile &&
    userProfile.appRole === AppUserRole.coordination &&
    userProfile.name === 'Daniel Perini Santos'
  );
}

export function useGetUserProfile(user: Principal | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<UserProfile | null>({
    queryKey: ['userProfile', user?.toString()],
    queryFn: async () => {
      if (!actor || !user) return null;
      return actor.getUserProfile(user);
    },
    enabled: !!actor && !isFetching && !!user,
  });
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

/** List all user profiles (coordinator/admin only). */
export function useListAllUserProfiles() {
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

/** Alias for useListAllUserProfiles for backwards compatibility. */
export function useAllUserProfiles() {
  return useListAllUserProfiles();
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

export function useListApprovals() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['approvals'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listApprovals();
    },
    enabled: !!actor && !isFetching,
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
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
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
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
      queryClient.invalidateQueries({ queryKey: ['allUserProfiles'] });
      queryClient.invalidateQueries({ queryKey: ['isCallerApproved'] });
    },
  });
}

// ── Reports ───────────────────────────────────────────────────────────────────

export function useReportsForUser(userId: Principal | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<Report[]>({
    queryKey: ['reportsForUser', userId?.toString()],
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

/** Fetch a single report by ID. */
export function useGetReport(reportId: string | undefined) {
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

/** Alias for useGetReport for backwards compatibility. */
export function useReport(reportId: string | undefined) {
  return useGetReport(reportId);
}

/**
 * Creates a new report. Accepts a ReportCreate payload and passes only the
 * required fields to the backend, avoiding extra fields from the full Report type.
 */
export function useCreateReport() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<ReportId, Error, ReportCreate>({
    mutationFn: async (reportCreate: ReportCreate) => {
      if (!actor) throw new Error('Actor não disponível. Tente novamente.');

      // Explicitly build the payload with only ReportCreate fields
      const payload: ReportCreate = {
        referenceMonth: reportCreate.referenceMonth,
        year: reportCreate.year,
        professionalName: reportCreate.professionalName,
        role: reportCreate.role,
        mainMuseum: reportCreate.mainMuseum,
        workedAtOtherMuseum: reportCreate.workedAtOtherMuseum,
        otherMuseum: reportCreate.otherMuseum,
        executiveSummary: reportCreate.executiveSummary,
        positivePoints: reportCreate.positivePoints,
        difficulties: reportCreate.difficulties,
        suggestions: reportCreate.suggestions,
        identifiedOpportunity: reportCreate.identifiedOpportunity,
        opportunityCategory: reportCreate.opportunityCategory,
        expectedImpact: reportCreate.expectedImpact,
        status: reportCreate.status,
        authorId: reportCreate.authorId,
      };

      return actor.createReport(payload);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reportsForUser', variables.authorId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['allReports'] });
    },
    onError: (error) => {
      console.error('Failed to create report:', error);
    },
  });
}

export function useUpdateReport() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reportId, report }: { reportId: string; report: Report }) => {
      if (!actor) throw new Error('Actor não disponível. Tente novamente.');
      return actor.updateReport(reportId, report);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['report', variables.reportId] });
      queryClient.invalidateQueries({ queryKey: ['reportsForUser'] });
      queryClient.invalidateQueries({ queryKey: ['allReports'] });
    },
    onError: (error) => {
      console.error('Failed to update report:', error);
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
      status: Status;
      comments: string | undefined;
      signature: ExternalBlob | undefined;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.reviewReport(reportId, status, comments ?? null, signature ?? null);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['report', variables.reportId] });
      queryClient.invalidateQueries({ queryKey: ['allReports'] });
      queryClient.invalidateQueries({ queryKey: ['reportsForUser'] });
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
      queryClient.invalidateQueries({ queryKey: ['allReports'] });
    },
  });
}

// ── Activities ────────────────────────────────────────────────────────────────

export function useActivitiesForReport(reportId: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<Activity[]>({
    queryKey: ['activitiesForReport', reportId],
    queryFn: async () => {
      if (!actor || !reportId) return [];
      return actor.getActivitiesForReport(reportId);
    },
    enabled: !!actor && !isFetching && !!reportId,
  });
}

export function useGetActivity(activityId: string | undefined) {
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

/** Alias for useGetActivity for backwards compatibility. */
export function useActivity(activityId: string | undefined) {
  return useGetActivity(activityId);
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

export function useCreateActivity() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<ActivityId, Error, ActivityCreate>({
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
      queryClient.invalidateQueries({ queryKey: ['activitiesForReport', variables.activity.reportId] });
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

// ── Goals ─────────────────────────────────────────────────────────────────────

export function useListGoals() {
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

/** Alias for useListGoals for backwards compatibility. */
export function useGoals() {
  return useListGoals();
}

export function useAddGoal() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, description }: { name: string; description: string | null }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addGoal(name, description);
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

// ── General Audience ──────────────────────────────────────────────────────────

function serializeAudienceQueryType(queryType: AudienceQueryType): string {
  return JSON.stringify(queryType, (_key, value) =>
    typeof value === 'bigint' ? value.toString() + 'n' : value
  );
}

export function useGetTotalGeneralAudience(queryType: AudienceQueryType | null) {
  const { actor, isFetching } = useActor();
  const serialized = queryType ? serializeAudienceQueryType(queryType) : 'null';

  return useQuery<bigint>({
    queryKey: ['totalGeneralAudience', serialized],
    queryFn: async () => {
      if (!actor || !queryType) throw new Error('Actor or query type not available');
      return actor.getTotalGeneralAudience(queryType);
    },
    enabled: !!actor && !isFetching && queryType !== null,
  });
}
