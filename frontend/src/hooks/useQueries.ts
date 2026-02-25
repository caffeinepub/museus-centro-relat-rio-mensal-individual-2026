import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Report, Activity, UserProfile, DashboardFilter, Status, ExternalBlob, FullUserProfile, AppUserRole } from '../backend';

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
    },
  });
}

export function useGetReportsForUser(userId: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<Report[]>({
    queryKey: ['reports', userId],
    queryFn: async () => {
      if (!actor || !userId) return [];
      const { Principal } = await import('@dfinity/principal');
      return actor.getReportsForUser(Principal.fromText(userId));
    },
    enabled: !!actor && !isFetching && !!userId,
  });
}

export function useGetAllReports() {
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
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['allReports'] });
      queryClient.invalidateQueries({ queryKey: ['report', variables.reportId] });
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
    },
  });
}

export function useReviewReport() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      reportId,
      newStatus,
      comments,
      signature,
    }: {
      reportId: string;
      newStatus: Status;
      comments: string | null;
      signature: ExternalBlob | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.reviewReport(reportId, newStatus, comments, signature);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['allReports'] });
      queryClient.invalidateQueries({ queryKey: ['report', variables.reportId] });
    },
  });
}

export function useUploadSignature() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reportId, signatureBase64 }: { reportId: string; signatureBase64: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.uploadSignature(reportId, signatureBase64);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['report', variables.reportId] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
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

export function useGetActivitiesForReport(reportId: string | undefined) {
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

export function useGetAllActivities() {
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

  return useMutation({
    mutationFn: async (activity: Activity) => {
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
      queryClient.invalidateQueries({ queryKey: ['allActivities'] });
    },
  });
}

// useListMuseums is replaced by a static list since the backend no longer has a museums collection.
export function useListMuseums() {
  return {
    data: [] as never[],
    isLoading: false,
    isFetching: false,
    isError: false,
  };
}

export function useListGoals() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['goals'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listGoals();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddMuseum() {
  return useMutation({
    mutationFn: async (_name: string) => {
      // No-op: museums are now a fixed enum
    },
  });
}

export function useToggleMuseumActive() {
  return useMutation({
    mutationFn: async (_museumId: bigint) => {
      // No-op: museums are now a fixed enum
    },
  });
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

export function useGetDashboardIndicators(filter: DashboardFilter) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['dashboardIndicators', filter],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCoordinationDashboardWithFilter(filter);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCoordinationDashboard(filter: DashboardFilter) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['coordinationDashboard', filter.museum, filter.month, filter.professionalName],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCoordinationDashboardWithFilter(filter);
    },
    enabled: !!actor && !isFetching,
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

export function useSetApproval() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user, status }: { user: string; status: import('../backend').ApprovalStatus }) => {
      if (!actor) throw new Error('Actor not available');
      const { Principal } = await import('@dfinity/principal');
      return actor.setApproval(Principal.fromText(user), status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
    },
  });
}

export function useIsCallerApproved() {
  const { actor, isFetching } = useActor();

  return useQuery({
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

export function useAssignCallerUserRole() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user, role }: { user: string; role: import('../backend').UserRole }) => {
      if (!actor) throw new Error('Actor not available');
      const { Principal } = await import('@dfinity/principal');
      return actor.assignCallerUserRole(Principal.fromText(user), role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
    },
  });
}

// ── User Management Hooks (Coordination/Admin only) ────────────────────────

/**
 * Lists all user profiles. Only enabled when the caller is confirmed as
 * coordinator or admin (profile loaded and role verified) to avoid
 * permission errors.
 */
export function useListAllUserProfiles(isAuthorized?: boolean) {
  const { actor, isFetching } = useActor();

  return useQuery<FullUserProfile[]>({
    queryKey: ['allUserProfiles'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listAllUserProfiles();
    },
    // Only run when actor is ready AND caller is confirmed coordinator/admin
    enabled: !!actor && !isFetching && (isAuthorized === undefined ? true : isAuthorized),
    retry: false,
  });
}

export function useUpdateUserRole() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user, newRole }: { user: string; newRole: AppUserRole }) => {
      if (!actor) throw new Error('Actor not available');
      const { Principal } = await import('@dfinity/principal');
      return actor.updateUserRole(Principal.fromText(user), newRole);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUserProfiles'] });
    },
  });
}

export function useUpdateUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user, updatedProfile }: { user: string; updatedProfile: UserProfile }) => {
      if (!actor) throw new Error('Actor not available');
      const { Principal } = await import('@dfinity/principal');
      return actor.updateUserProfile(Principal.fromText(user), updatedProfile);
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
    mutationFn: async (user: string) => {
      if (!actor) throw new Error('Actor not available');
      const { Principal } = await import('@dfinity/principal');
      return actor.deleteUserProfile(Principal.fromText(user));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUserProfiles'] });
    },
  });
}

/**
 * Approves a user by their principal string.
 * Only callable by coordination or admin roles.
 * Invalidates allUserProfiles and approvals caches on success.
 */
export function useApproveUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userPrincipal: string) => {
      if (!actor) throw new Error('Actor not available');
      const { Principal } = await import('@dfinity/principal');
      return actor.approveUser(Principal.fromText(userPrincipal));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUserProfiles'] });
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
      queryClient.invalidateQueries({ queryKey: ['isCallerApproved'] });
    },
  });
}
