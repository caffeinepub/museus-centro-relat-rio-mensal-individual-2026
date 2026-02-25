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

// Only Daniel Perini Santos can hold the coordination role
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
        user: editingUser.principal,
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
      await approveUser.mutateAsync(profile.principal);
      toast.success(`${profile.name} aprovado com sucesso`);
    } catch (err) {
      toast.error('Erro ao aprovar utilizador');
    }
  };

  const handleReject = async (profile: FullUserProfile) => {
    try {
      await rejectUser.mutateAsync(profile.principal);
      toast.success(`${profile.name} rejeitado`);
    } catch (err) {
      toast.error('Erro ao rejeitar utilizador');
    }
  };

  const handleDelete = async () => {
    if (!deletingUser) return;
    try {
      await deleteProfile.mutateAsync(deletingUser.principal);
      toast.success('Utilizador eliminado');
      setDeletingUser(null);
    } catch (err) {
      toast.error('Erro ao eliminar utilizador');
    }
  };

  // Determine which roles are available for editing
  const getAvailableRoles = (targetName: string): AppUserRole[] => {
    const roles = [AppUserRole.professional, AppUserRole.coordinator, AppUserRole.administration];
    if (targetName === COORDINATION_RESERVED_NAME) {
      roles.push(AppUserRole.coordination);
    }
    return roles;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center gap-3">
        <Users className="w-6 h-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestão de Utilizadores</h1>
          <p className="text-sm text-muted-foreground">
            Gerir perfis, funções e aprovações
          </p>
        </div>
      </div>

      {/* Pending Approvals */}
      {isCoordinadorGeral && pendingProfiles.length > 0 && (
        <div className="card-section space-y-3">
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-warning" />
            Aprovações Pendentes ({pendingProfiles.length})
          </h2>
          <div className="space-y-2">
            {pendingProfiles.map((profile) => (
              <div
                key={profile.principal.toString()}
                className="flex items-center justify-between p-3 rounded-lg bg-warning/10 border border-warning/30"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{profile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {ROLE_LABELS[profile.appRole]} · {getMuseumLabel(profile.museum)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-success border-success/40 hover:bg-success/10"
                    onClick={() => handleApprove(profile)}
                    disabled={approveUser.isPending}
                  >
                    {approveUser.isPending ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <CheckCircle className="w-3 h-3 mr-1" />
                    )}
                    Aprovar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive border-destructive/40 hover:bg-destructive/10"
                    onClick={() => handleReject(profile)}
                    disabled={rejectUser.isPending}
                  >
                    {rejectUser.isPending ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <XCircle className="w-3 h-3 mr-1" />
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
      <div className="card-section space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          Todos os Utilizadores ({allProfiles.length})
        </h2>
        {allProfiles.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            Nenhum utilizador registado
          </p>
        ) : (
          <div className="space-y-2">
            {allProfiles.map((profile) => (
              <div
                key={profile.principal.toString()}
                className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
                    {profile.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{profile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {ROLE_LABELS[profile.appRole]} · {getMuseumLabel(profile.museum)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={APPROVAL_VARIANTS[profile.approvalStatus] ?? 'outline'}>
                    {APPROVAL_LABELS[profile.approvalStatus] ?? profile.approvalStatus}
                  </Badge>
                  {isCoordinadorGeral && (
                    <>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="w-7 h-7"
                        onClick={() => handleEditOpen(profile)}
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="w-7 h-7 text-destructive hover:bg-destructive/10"
                        onClick={() => setDeletingUser(profile)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Utilizador</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Função</Label>
              <Select
                value={editRole}
                onValueChange={(v) => setEditRole(v as AppUserRole)}
              >
                <SelectTrigger id="edit-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableRoles(editName).map((role) => (
                    <SelectItem key={role} value={role}>
                      {ROLE_LABELS[role]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-museum">Equipe/Museu</Label>
              <Select
                value={editMuseum}
                onValueChange={(v) => setEditMuseum(v as MuseumLocation)}
              >
                <SelectTrigger id="edit-museum">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MUSEUM_LOCATIONS.map((loc) => (
                    <SelectItem key={loc} value={loc}>
                      {getMuseumLabel(loc)}
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
              {updateProfile.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingUser} onOpenChange={(open) => !open && setDeletingUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Utilizador</AlertDialogTitle>
            <AlertDialogDescription>
              Tem a certeza que deseja eliminar <strong>{deletingUser?.name}</strong>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteProfile.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Eliminar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
