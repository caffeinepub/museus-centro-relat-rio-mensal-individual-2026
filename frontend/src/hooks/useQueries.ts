import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type {
  Report,
  ReportCreate,
  Activity,
  ActivityCreate,
  UserProfile,
  FullUserProfile,
  Goal,
  CoordinationDashboard,
  DashboardFilter,
  AudienceQueryType,
  FileAttachment,
  ReportId,
} from '../backend';
import { toast } from 'sonner';

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

export function useGetUserProfile(principal: string | undefined) {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<UserProfile | null>({
    queryKey: ['userProfile', principal],
    queryFn: async () => {
      if (!actor || !principal) return null;
      const { Principal } = await import('@dfinity/principal');
      return actor.getUserProfile(Principal.fromText(principal));
    },
    enabled: !!actor && !isFetching && !!principal && !!identity,
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
      queryClient.invalidateQueries({ queryKey: ['allUserProfiles'] });
      toast.success('Perfil salvo com sucesso');
    },
    onError: (error: Error) => {
      toast.error(`Falha ao salvar perfil: ${error.message}`);
    },
  });
}

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

// Alias for backwards compatibility
export const useAllUserProfiles = useListAllUserProfiles;

export function useUpdateUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ principal, profile }: { principal: string; profile: UserProfile }) => {
      if (!actor) throw new Error('Actor not available');
      const { Principal } = await import('@dfinity/principal');
      return actor.updateUserProfile(Principal.fromText(principal), profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUserProfiles'] });
      toast.success('Perfil atualizado com sucesso');
    },
    onError: (error: Error) => {
      toast.error(`Falha ao atualizar perfil: ${error.message}`);
    },
  });
}

export function useUpdateUserRole() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ principal, role }: { principal: string; role: import('../backend').AppUserRole }) => {
      if (!actor) throw new Error('Actor not available');
      const { Principal } = await import('@dfinity/principal');
      return actor.updateUserRole(Principal.fromText(principal), role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUserProfiles'] });
      toast.success('Função atualizada com sucesso');
    },
    onError: (error: Error) => {
      toast.error(`Falha ao atualizar função: ${error.message}`);
    },
  });
}

export function useDeleteUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (principal: string) => {
      if (!actor) throw new Error('Actor not available');
      const { Principal } = await import('@dfinity/principal');
      return actor.deleteUserProfile(Principal.fromText(principal));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUserProfiles'] });
      toast.success('Utilizador removido com sucesso');
    },
    onError: (error: Error) => {
      toast.error(`Falha ao remover utilizador: ${error.message}`);
    },
  });
}

// ── Approval Hooks ─────────────────────────────────────────────────────────

export function useIsCallerApproved() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<boolean>({
    queryKey: ['isCallerApproved'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerApproved();
    },
    enabled: !!actor && !isFetching && !!identity,
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
      toast.success('Pedido de aprovação enviado');
    },
    onError: (error: Error) => {
      toast.error(`Falha ao enviar pedido: ${error.message}`);
    },
  });
}

export function useApproveUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (principal: string) => {
      if (!actor) throw new Error('Actor not available');
      const { Principal } = await import('@dfinity/principal');
      return actor.approveUser(Principal.fromText(principal));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUserProfiles'] });
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
      toast.success('Utilizador aprovado');
    },
    onError: (error: Error) => {
      toast.error(`Falha ao aprovar utilizador: ${error.message}`);
    },
  });
}

export function useRejectUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (principal: string) => {
      if (!actor) throw new Error('Actor not available');
      const { Principal } = await import('@dfinity/principal');
      return actor.rejectUser(Principal.fromText(principal));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUserProfiles'] });
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
      toast.success('Utilizador rejeitado');
    },
    onError: (error: Error) => {
      toast.error(`Falha ao rejeitar utilizador: ${error.message}`);
    },
  });
}

// ── Report Hooks ───────────────────────────────────────────────────────────

export function useReportsForUser(userId: string | undefined) {
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

// Alias for compatibility
export const useGetReportsForUser = useReportsForUser;

// Alias accepting Principal-like object for backwards compat
export function useReports(userId: string | undefined) {
  return useReportsForUser(userId);
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

// Alias for compatibility
export const useGetReport = useReport;

export function useCreateReport() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (report: ReportCreate) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createReport(report);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['allReports'] });
    },
    onError: (error: Error) => {
      toast.error(`Falha ao criar relatório: ${error.message}`);
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
    onError: (error: Error) => {
      toast.error(`Falha ao atualizar relatório: ${error.message}`);
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
      toast.success('Relatório eliminado com sucesso');
    },
    onError: (error: Error) => {
      toast.error(`Falha ao eliminar relatório: ${error.message}`);
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
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['allReports'] });
      queryClient.invalidateQueries({ queryKey: ['report', reportId] });
      toast.success('Relatório submetido com sucesso');
    },
    onError: (error: Error) => {
      toast.error(`Falha ao submeter relatório: ${error.message}`);
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
      comments: string | null;
      signature: import('../backend').ExternalBlob | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.reviewReport(reportId, status, comments, signature);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['allReports'] });
      toast.success('Relatório revisto com sucesso');
    },
    onError: (error: Error) => {
      toast.error(`Falha ao rever relatório: ${error.message}`);
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
    onError: (error: Error) => {
      toast.error(`Falha ao guardar assinatura: ${error.message}`);
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
      toast.success('Campos de coordenação atualizados');
    },
    onError: (error: Error) => {
      toast.error(`Falha ao atualizar campos: ${error.message}`);
    },
  });
}

export function useGetReportWithActivities() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (reportId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.getReportWithActivities(reportId);
    },
    onError: (error: Error) => {
      toast.error(`Falha ao exportar relatório: ${error.message}`);
    },
  });
}

// ── Activity Hooks ─────────────────────────────────────────────────────────

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

// Alias for compatibility
export const useActivities = useActivitiesForReport;
export const useGetActivitiesForReport = useActivitiesForReport;

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
    onError: (error: Error) => {
      toast.error(`Falha ao criar atividade: ${error.message}`);
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
    onError: (error: Error) => {
      toast.error(`Falha ao atualizar atividade: ${error.message}`);
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
      toast.success('Atividade eliminada com sucesso');
    },
    onError: (error: Error) => {
      toast.error(`Falha ao eliminar atividade: ${error.message}`);
    },
  });
}

export function useSearchActivities(searchTerm: string) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['searchActivities', searchTerm],
    queryFn: async () => {
      if (!actor || !searchTerm) return [];
      return actor.searchActivitiesByName(searchTerm);
    },
    enabled: !!actor && !isFetching && searchTerm.length > 2,
  });
}

// ── Goals Hooks ────────────────────────────────────────────────────────────

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
    mutationFn: async ({ name, description }: { name: string; description: string | null }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addGoal(name, description);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success('Meta adicionada com sucesso');
    },
    onError: (error: Error) => {
      toast.error(`Falha ao adicionar meta: ${error.message}`);
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
    onError: (error: Error) => {
      toast.error(`Falha ao atualizar meta: ${error.message}`);
    },
  });
}

// ── Dashboard Hooks ────────────────────────────────────────────────────────

export function useCoordinationDashboard(filter: DashboardFilter) {
  const { actor, isFetching } = useActor();

  return useQuery<CoordinationDashboard | null>({
    queryKey: ['coordinationDashboard', filter],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCoordinationDashboardWithFilter(filter);
    },
    enabled: !!actor && !isFetching,
  });
}

/** Serialize AudienceQueryType to a stable string for use as a React Query key (no BigInt). */
function serializeAudienceQueryType(queryType: AudienceQueryType): string {
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

export function useGetTotalGeneralAudience(queryType: AudienceQueryType) {
  const { actor, isFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ['totalGeneralAudience', serializeAudienceQueryType(queryType)],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getTotalGeneralAudience(queryType);
    },
    enabled: !!actor && !isFetching,
  });
}

// ── Professionals Hooks ────────────────────────────────────────────────────

export function useListRegisteredProfessionals() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['registeredProfessionals'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listRegisteredProfessionals();
    },
    enabled: !!actor && !isFetching,
  });
}

// ── Role helpers ───────────────────────────────────────────────────────────

export function useIsCoordinadorGeral() {
  const { data: profile } = useGetCallerUserProfile();
  return profile?.appRole === 'coordination';
}

export function useIsCoordinator() {
  const { data: profile } = useGetCallerUserProfile();
  return profile?.appRole === 'coordination' || profile?.appRole === 'coordinator';
}

export function useIsAdministration() {
  const { data: profile } = useGetCallerUserProfile();
  return profile?.appRole === 'administration';
}

// ── File Management Hooks ──────────────────────────────────────────────────

export function useListFiles() {
  const { actor, isFetching } = useActor();

  return useQuery<FileAttachment[]>({
    queryKey: ['files'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listFiles();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUploadFile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: FileAttachment) => {
      if (!actor) throw new Error('Actor not available');
      return actor.uploadFile(file);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      toast.success('Arquivo enviado com sucesso');
    },
    onError: (error: Error) => {
      toast.error(`Falha ao enviar arquivo: ${error.message}`);
    },
  });
}

export function useDeleteFile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (fileId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteFile(fileId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      queryClient.invalidateQueries({ queryKey: ['reportFiles'] });
      toast.success('Arquivo eliminado com sucesso');
    },
    onError: (error: Error) => {
      toast.error(`Falha ao eliminar arquivo: ${error.message}`);
    },
  });
}

export function useGetFile(fileId: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<FileAttachment | null>({
    queryKey: ['file', fileId],
    queryFn: async () => {
      if (!actor || !fileId) return null;
      return actor.getFile(fileId);
    },
    enabled: !!actor && !isFetching && !!fileId,
  });
}

export function useFilesForReport(reportId: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<FileAttachment[]>({
    queryKey: ['reportFiles', reportId],
    queryFn: async () => {
      if (!actor || !reportId) return [];
      return actor.getFilesForReport(reportId);
    },
    enabled: !!actor && !isFetching && !!reportId,
  });
}

export function useLinkFileToReport() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ fileId, reportId }: { fileId: string; reportId: ReportId }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.linkFileToReport(fileId, reportId);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reportFiles', variables.reportId] });
      queryClient.invalidateQueries({ queryKey: ['files'] });
      toast.success('Arquivo vinculado ao relatório');
    },
    onError: (error: Error) => {
      toast.error(`Falha ao vincular arquivo: ${error.message}`);
    },
  });
}

export function useUnlinkFileFromReport() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ fileId, reportId }: { fileId: string; reportId: ReportId }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.unlinkFileFromReport(fileId, reportId);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reportFiles', variables.reportId] });
      queryClient.invalidateQueries({ queryKey: ['files'] });
      toast.success('Arquivo desvinculado do relatório');
    },
    onError: (error: Error) => {
      toast.error(`Falha ao desvincular arquivo: ${error.message}`);
    },
  });
}
