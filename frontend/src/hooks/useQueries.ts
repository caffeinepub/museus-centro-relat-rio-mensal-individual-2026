import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Principal } from '@dfinity/principal';
import {
  UserProfile,
  AppUserRole,
  FullUserProfile,
  ReviewAction,
} from '../backend';

// ─── AudienceQueryType (local type for dashboard) ────────────────────────────
export type AudienceQueryType =
  | { __kind__: 'specificMonth'; month: string; year: number }
  | { __kind__: 'cumulativeTotal' }
  | { __kind__: 'customRange'; startMonth: string; startYear: number; endMonth: string; endYear: number };

// ─── User Profile ────────────────────────────────────────────────────────────

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
      try {
        await actor.deleteUserProfile(user);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        throw new Error(message || 'Erro ao excluir usuário');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUserProfiles'] });
    },
  });
}

// ─── Approval ────────────────────────────────────────────────────────────────

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

// ─── Reports ─────────────────────────────────────────────────────────────────

export function useAllReports() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['reports'],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).listAllReports?.() ?? [];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMyReports() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['myReports'],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).listMyReports?.() ?? [];
    },
    enabled: !!actor && !isFetching,
  });
}

// Alias for components that import useGetReportsForUser
export function useGetReportsForUser() {
  return useMyReports();
}

export function useGetReport(reportId: string | null | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['report', reportId],
    queryFn: async () => {
      if (!actor || !reportId) return null;
      return (actor as any).getReport?.(reportId) ?? null;
    },
    enabled: !!actor && !isFetching && !!reportId,
  });
}

export function useGetReportWithActivities(reportId: string | null | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['reportWithActivities', reportId],
    queryFn: async () => {
      if (!actor || !reportId) return null;
      return (actor as any).getReportWithActivities?.(reportId) ?? null;
    },
    enabled: !!actor && !isFetching && !!reportId,
  });
}

export function useCreateReport() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (report: any) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).createReport(report);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['myReports'] });
    },
  });
}

export function useUpdateReport() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, report }: { id: string; report: any }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).updateReport(id, report);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['myReports'] });
    },
  });
}

export function useDeleteReport() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reportId: string) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).deleteReport(reportId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['myReports'] });
    },
  });
}

export function useSubmitReport() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, signature }: { id: string; signature?: string }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).submitReport(id, signature ?? '');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['myReports'] });
      queryClient.invalidateQueries({ queryKey: ['pendingReports'] });
    },
  });
}

export function usePendingReports() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['pendingReports'],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).listPendingReports?.() ?? [];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useReviewReport() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      reportId,
      action,
      comment,
    }: {
      reportId: string;
      action: ReviewAction;
      comment?: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.reviewReport(reportId, action, comment ?? null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingReports'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['myReports'] });
    },
  });
}

// ─── Activities ───────────────────────────────────────────────────────────────

export function useActivitiesForReport(reportId: string | null | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['activities', reportId],
    queryFn: async () => {
      if (!actor || !reportId) return [];
      return (actor as any).listActivitiesForReport?.(reportId) ?? [];
    },
    enabled: !!actor && !isFetching && !!reportId,
  });
}

export function useGetActivity(activityId: string | null | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['activity', activityId],
    queryFn: async () => {
      if (!actor || !activityId) return null;
      return (actor as any).getActivity?.(activityId) ?? null;
    },
    enabled: !!actor && !isFetching && !!activityId,
  });
}

export function useAllActivities() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['allActivities'],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).listAllActivities?.() ?? [];
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateActivity() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (activity: any) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).createActivity(activity);
    },
    onSuccess: (_data: any, variables: any) => {
      queryClient.invalidateQueries({ queryKey: ['activities', variables.reportId] });
      queryClient.invalidateQueries({ queryKey: ['allActivities'] });
    },
  });
}

export function useUpdateActivity() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ activityId, activity }: { activityId: string; activity: any }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).updateActivity(activityId, activity);
    },
    onSuccess: (_data: any, variables: any) => {
      queryClient.invalidateQueries({ queryKey: ['activities', variables.activity.reportId] });
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
      return (actor as any).deleteActivity(activityId);
    },
    onSuccess: (_data: any, variables: any) => {
      queryClient.invalidateQueries({ queryKey: ['activities', variables.reportId] });
      queryClient.invalidateQueries({ queryKey: ['allActivities'] });
    },
  });
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export function useCoordinationDashboard(filter: any) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['coordinationDashboard', filter],
    queryFn: async () => {
      if (!actor) return null;
      return (actor as any).getCoordinationDashboard?.(filter) ?? null;
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePublicoGeralAudience(queryType: any) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['publicoGeralAudience', queryType],
    queryFn: async () => {
      if (!actor) return null;
      return (actor as any).getPublicoGeralAudience?.(queryType) ?? null;
    },
    enabled: !!actor && !isFetching,
  });
}

// Alias used by PublicoGeralCard
export function useGetTotalGeneralAudience(queryType: AudienceQueryType) {
  return usePublicoGeralAudience(queryType);
}

// ─── Files ────────────────────────────────────────────────────────────────────

export function useListFiles() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['files'],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).listFiles?.() ?? [];
    },
    enabled: !!actor && !isFetching,
  });
}

// Alias kept for backward compatibility
export { useListFiles as useFileList };

export function useUploadFile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: any) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).uploadFile(file);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
  });
}

export function useDeleteFile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (fileId: string) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).deleteFile(fileId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
  });
}

export function useReportFiles(reportId: string) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['reportFiles', reportId],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getReportFiles?.(reportId) ?? [];
    },
    enabled: !!actor && !isFetching && !!reportId,
  });
}

export function useLinkFileToReport() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reportId, fileId }: { reportId: string; fileId: string }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).linkFileToReport(reportId, fileId);
    },
    onSuccess: (_data: any, variables: any) => {
      queryClient.invalidateQueries({ queryKey: ['reportFiles', variables.reportId] });
    },
  });
}

export function useUnlinkFileFromReport() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reportId, fileId }: { reportId: string; fileId: string }) => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).unlinkFileFromReport(reportId, fileId);
    },
    onSuccess: (_data: any, variables: any) => {
      queryClient.invalidateQueries({ queryKey: ['reportFiles', variables.reportId] });
    },
  });
}
