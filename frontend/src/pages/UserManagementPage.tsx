import React, { useState } from 'react';
import {
  useListAllUserProfiles,
  useUpdateUserProfile,
  useDeleteUserProfile,
  useApproveUser,
  useRejectUser,
  useIsCoordinadorGeral,
  useGetCallerUserProfile,
} from '../hooks/useQueries';
import { AppUserRole, MuseumLocation, type FullUserProfile } from '../backend';
import { ApprovalStatus } from '../backend';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Loader2, Users, CheckCircle, XCircle, Edit, Trash2, ShieldCheck } from 'lucide-react';
import { getMuseumLabel, MUSEUM_LOCATIONS } from '../utils/labels';
import { toast } from 'sonner';

const ROLE_LABELS: Record<AppUserRole, string> = {
  [AppUserRole.professional]: 'Profissional',
  [AppUserRole.coordination]: 'Coordenação Geral',
  [AppUserRole.coordinator]: 'Coordenador',
  [AppUserRole.administration]: 'Administração',
};

const APPROVAL_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  approved: 'default',
  pending: 'secondary',
  rejected: 'destructive',
};

const APPROVAL_LABELS: Record<string, string> = {
  approved: 'Aprovado',
  pending: 'Pendente',
  rejected: 'Rejeitado',
};

const COORDINATION_RESERVED_NAME = 'Daniel Perini Santos';

export default function UserManagementPage() {
  const { data: currentUserProfile } = useGetCallerUserProfile();
  const isCoordinadorGeral = useIsCoordinadorGeral();
  const { data: profiles, isLoading } = useListAllUserProfiles();
  const updateProfile = useUpdateUserProfile();
  const deleteProfile = useDeleteUserProfile();
  const approveUser = useApproveUser();
  const rejectUser = useRejectUser();

  const [editingUser, setEditingUser] = useState<FullUserProfile | null>(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState<AppUserRole>(AppUserRole.professional);
  const [editMuseum, setEditMuseum] = useState<MuseumLocation>(MuseumLocation.equipePrincipal);
  const [deletingUser, setDeletingUser] = useState<FullUserProfile | null>(null);

  const pendingProfiles = profiles?.filter(
    (p) => p.approvalStatus === ApprovalStatus.pending
  ) ?? [];

  const allProfiles = profiles ?? [];

  const handleEditOpen = (profile: FullUserProfile) => {
    setEditingUser(profile);
    setEditName(profile.name);
    setEditRole(profile.appRole);
    setEditMuseum(profile.museum);
  };

  const handleEditSave = async () => {
    if (!editingUser) return;
    try {
      await updateProfile.mutateAsync({
        principal: editingUser.principal.toString(),
        profile: {
          name: editName,
          appRole: editRole,
          museum: editMuseum,
        },
      });
      toast.success('Perfil atualizado com sucesso');
      setEditingUser(null);
    } catch (err) {
      toast.error('Erro ao atualizar perfil');
    }
  };

  const handleApprove = async (profile: FullUserProfile) => {
    try {
      await approveUser.mutateAsync(profile.principal.toString());
      toast.success(`${profile.name} aprovado com sucesso`);
    } catch (err) {
      toast.error('Erro ao aprovar utilizador');
    }
  };

  const handleReject = async (profile: FullUserProfile) => {
    try {
      await rejectUser.mutateAsync(profile.principal.toString());
      toast.success(`${profile.name} rejeitado`);
    } catch (err) {
      toast.error('Erro ao rejeitar utilizador');
    }
  };

  const handleDelete = async () => {
    if (!deletingUser) return;
    try {
      await deleteProfile.mutateAsync(deletingUser.principal.toString());
      toast.success('Utilizador eliminado');
      setDeletingUser(null);
    } catch (err) {
      toast.error('Erro ao eliminar utilizador');
    }
  };

  const getAvailableRoles = (targetName: string): AppUserRole[] => {
    const roles = [AppUserRole.professional, AppUserRole.coordinator, AppUserRole.administration];
    if (targetName === COORDINATION_RESERVED_NAME) {
      roles.push(AppUserRole.coordination);
    }
    return roles;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Gestão de Utilizadores</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie utilizadores, aprovações e funções
        </p>
      </div>

      {/* Pending Approvals */}
      {pendingProfiles.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-warning" />
            Aprovações Pendentes ({pendingProfiles.length})
          </h2>
          <div className="space-y-2">
            {pendingProfiles.map((profile) => (
              <div
                key={profile.principal.toString()}
                className="flex items-center justify-between p-4 rounded-lg border border-warning/30 bg-warning/5"
              >
                <div>
                  <p className="font-medium text-foreground">{profile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {ROLE_LABELS[profile.appRole]} · {getMuseumLabel(profile.museum)}
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-0.5">
                    {profile.principal.toString().slice(0, 20)}...
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleApprove(profile)}
                    disabled={approveUser.isPending}
                    className="gap-1 bg-success text-success-foreground hover:bg-success/90"
                  >
                    {approveUser.isPending ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <CheckCircle className="h-3 w-3" />
                    )}
                    Aprovar
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleReject(profile)}
                    disabled={rejectUser.isPending}
                    className="gap-1"
                  >
                    {rejectUser.isPending ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <XCircle className="h-3 w-3" />
                    )}
                    Rejeitar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Users */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Users className="h-5 w-5" />
          Todos os Utilizadores ({allProfiles.length})
        </h2>
        {allProfiles.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Nenhum utilizador registado</p>
          </div>
        ) : (
          <div className="space-y-2">
            {allProfiles.map((profile) => (
              <div
                key={profile.principal.toString()}
                className="flex items-center justify-between p-4 rounded-lg border border-border bg-card"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-foreground">{profile.name}</p>
                    <Badge
                      variant={APPROVAL_VARIANTS[profile.approvalStatus] ?? 'outline'}
                      className="text-xs"
                    >
                      {APPROVAL_LABELS[profile.approvalStatus] ?? profile.approvalStatus}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {ROLE_LABELS[profile.appRole]} · {getMuseumLabel(profile.museum)}
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-0.5 truncate">
                    {profile.principal.toString()}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0 ml-3">
                  {isCoordinadorGeral && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleEditOpen(profile)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  {isCoordinadorGeral && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => setDeletingUser(profile)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingUser} onOpenChange={(open) => { if (!open) setEditingUser(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Utilizador</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Nome completo"
              />
            </div>
            <div className="space-y-2">
              <Label>Função</Label>
              <Select
                value={editRole}
                onValueChange={(v) => setEditRole(v as AppUserRole)}
              >
                <SelectTrigger className="bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border-border">
                  {getAvailableRoles(editName).map((role) => (
                    <SelectItem key={role} value={role}>
                      {ROLE_LABELS[role]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Museu / Equipe</Label>
              <Select
                value={editMuseum}
                onValueChange={(v) => setEditMuseum(v as MuseumLocation)}
              >
                <SelectTrigger className="bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border-border">
                  {MUSEUM_LOCATIONS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {getMuseumLabel(m)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>
              Cancelar
            </Button>
            <Button onClick={handleEditSave} disabled={updateProfile.isPending}>
              {updateProfile.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingUser} onOpenChange={(open) => { if (!open) setDeletingUser(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Utilizador</AlertDialogTitle>
            <AlertDialogDescription>
              Tem a certeza que deseja eliminar "{deletingUser?.name}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteProfile.isPending}
            >
              {deleteProfile.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : null}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
