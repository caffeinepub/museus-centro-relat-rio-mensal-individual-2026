import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type {
  Report,
  Activity,
  UserProfile,
  FullUserProfile,
  DashboardFilter,
  CoordinationDashboard,
  Status,
  AppUserRole,
  ApprovalStatus,
} from '../backend';
import { ExternalBlob } from '../backend';
import type { Principal } from '@icp-sdk/core/principal';

// ── User Profile Hooks ─────────────────────────────────────────────────────

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

export function useListAllUserProfiles() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<FullUserProfile[]>({
    queryKey: ['allUserProfiles'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.listAllUserProfiles();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useUpdateUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user, updatedProfile }: { user: Principal; updatedProfile: UserProfile }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateUserProfile(user, updatedProfile);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['allUserProfiles'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile', variables.user.toString()] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useUpdateUserRole() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user, newRole }: { user: Principal; newRole: AppUserRole }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateUserRole(user, newRole);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUserProfiles'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
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
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
    },
  });
}

// ── Approval Hooks ─────────────────────────────────────────────────────────

export function useIsCallerApproved() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerApproved'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.isCallerApproved();
    },
    enabled: !!actor && !actorFetching,
    staleTime: 30_000,
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
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
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
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
      queryClient.invalidateQueries({ queryKey: ['isCallerApproved'] });
    },
  });
}

export function useSetApproval() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user, status }: { user: Principal; status: ApprovalStatus }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setApproval(user, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUserProfiles'] });
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
      queryClient.invalidateQueries({ queryKey: ['isCallerApproved'] });
    },
  });
}

export function useListApprovals() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['approvals'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.listApprovals();
    },
    enabled: !!actor && !actorFetching,
  });
}

// ── Report Hooks ───────────────────────────────────────────────────────────

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

export function useAllReports() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Report[]>({
    queryKey: ['allReports'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllReports();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useReport(reportId: string | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Report>({
    queryKey: ['report', reportId],
    queryFn: async () => {
      if (!actor || !reportId) throw new Error('Actor or reportId not available');
      return actor.getReport(reportId);
    },
    enabled: !!actor && !actorFetching && !!reportId,
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
      queryClient.invalidateQueries({ queryKey: ['allReports'] });
      queryClient.invalidateQueries({ queryKey: ['reportsForUser'] });
    },
  });
}

export function useUpdateReport() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reportId, updated }: { reportId: string; updated: Report }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateReport(reportId, updated);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['allReports'] });
      queryClient.invalidateQueries({ queryKey: ['reportsForUser'] });
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
    onSuccess: (_data, reportId) => {
      queryClient.invalidateQueries({ queryKey: ['allReports'] });
      queryClient.invalidateQueries({ queryKey: ['reportsForUser'] });
      queryClient.invalidateQueries({ queryKey: ['report', reportId] });
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
      queryClient.invalidateQueries({ queryKey: ['allReports'] });
      queryClient.invalidateQueries({ queryKey: ['reportsForUser'] });
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
      queryClient.invalidateQueries({ queryKey: ['allReports'] });
      queryClient.invalidateQueries({ queryKey: ['report', variables.reportId] });
    },
  });
}

// ── Activity Hooks ─────────────────────────────────────────────────────────

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
      if (!actor || !activityId) throw new Error('Actor or activityId not available');
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
      if (!actor) throw new Error('Actor not available');
      return actor.getAllActivities();
    },
    enabled: !!actor && !actorFetching,
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
    onSuccess: (_data, activity) => {
      queryClient.invalidateQueries({ queryKey: ['activitiesForReport', activity.reportId] });
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
      queryClient.invalidateQueries({ queryKey: ['activitiesForReport', variables.activity.reportId] });
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
      // Backend doesn't have deleteActivity, so we mark it as cancelled
      const activity = await actor.getActivity(activityId);
      return actor.updateActivity(activityId, {
        ...activity,
        status: 'cancelled' as Activity['status'],
        cancellationReason: 'Removido pelo usuário',
      });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['activitiesForReport', variables.reportId] });
      queryClient.invalidateQueries({ queryKey: ['activity', variables.activityId] });
      queryClient.invalidateQueries({ queryKey: ['allActivities'] });
    },
  });
}

// ── Goals Hooks ────────────────────────────────────────────────────────────

export function useListGoals() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['goals'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.listGoals();
    },
    enabled: !!actor && !actorFetching,
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

// ── Dashboard Hooks ────────────────────────────────────────────────────────

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
