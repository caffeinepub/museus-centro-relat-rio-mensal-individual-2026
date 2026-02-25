import React, { useState } from 'react';
import { UserCheck, UserX, Edit, Trash2, Shield, AlertCircle, Users } from 'lucide-react';
import {
  useListAllUserProfiles,
  useApproveUser,
  useUpdateUserProfile,
  useDeleteUserProfile,
} from '../hooks/useQueries';
import { AppUserRole, MuseumLocation, ApprovalStatus } from '../backend';
import type { FullUserProfile, UserProfile } from '../backend';
import { getMuseumLabel, MUSEUM_LOCATIONS } from '../utils/labels';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
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
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const ROLE_LABELS: Record<AppUserRole, string> = {
  [AppUserRole.professional]: 'Profissional',
  [AppUserRole.coordination]: 'Coordenação',
  [AppUserRole.administration]: 'Administração',
};

const APPROVAL_STATUS_LABELS: Record<ApprovalStatus, string> = {
  [ApprovalStatus.pending]: 'Pendente',
  [ApprovalStatus.approved]: 'Aprovado',
  [ApprovalStatus.rejected]: 'Rejeitado',
};

function getApprovalBadgeClass(status: ApprovalStatus): string {
  switch (status) {
    case ApprovalStatus.approved: return 'bg-success/10 text-success border-success/20';
    case ApprovalStatus.pending: return 'bg-warning/10 text-warning border-warning/20';
    case ApprovalStatus.rejected: return 'bg-destructive/10 text-destructive border-destructive/20';
    default: return 'bg-muted text-muted-foreground border-border';
  }
}

function PendingUsersSection({ profiles }: { profiles: FullUserProfile[] }) {
  const approveUser = useApproveUser();
  const pendingUsers = profiles.filter((p) => p.approvalStatus === ApprovalStatus.pending);

  if (pendingUsers.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-success" />
          Aprovações Pendentes
        </h2>
        <p className="text-muted-foreground text-sm">Nenhum usuário aguardando aprovação.</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-warning/30 rounded-xl p-6 mb-6">
      <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <AlertCircle className="w-5 h-5 text-warning" />
        Aprovações Pendentes ({pendingUsers.length})
      </h2>
      <div className="space-y-3">
        {pendingUsers.map((user) => (
          <div
            key={user.principal.toString()}
            className="flex items-center justify-between p-3 bg-warning/5 border border-warning/20 rounded-lg"
          >
            <div>
              <p className="font-medium text-foreground">{user.name}</p>
              <p className="text-sm text-muted-foreground">
                {ROLE_LABELS[user.appRole]} · {getMuseumLabel(user.museum)}
              </p>
            </div>
            <Button
              size="sm"
              onClick={async () => {
                try {
                  await approveUser.mutateAsync(user.principal);
                  toast.success(`${user.name} aprovado com sucesso!`);
                } catch {
                  toast.error('Erro ao aprovar usuário.');
                }
              }}
              disabled={approveUser.isPending}
            >
              <UserCheck className="w-4 h-4 mr-2" />
              Aprovar
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function UserManagementPage() {
  const { data: profiles = [], isLoading } = useListAllUserProfiles();
  const updateUserProfile = useUpdateUserProfile();
  const deleteUserProfile = useDeleteUserProfile();

  const [editingUser, setEditingUser] = useState<FullUserProfile | null>(null);
  const [editForm, setEditForm] = useState<UserProfile | null>(null);
  const [deletingUser, setDeletingUser] = useState<FullUserProfile | null>(null);

  const handleEditOpen = (user: FullUserProfile) => {
    setEditingUser(user);
    setEditForm({ name: user.name, appRole: user.appRole, museum: user.museum });
  };

  const handleEditSave = async () => {
    if (!editingUser || !editForm) return;
    try {
      await updateUserProfile.mutateAsync({ user: editingUser.principal, updatedProfile: editForm });
      toast.success('Perfil atualizado com sucesso!');
      setEditingUser(null);
      setEditForm(null);
    } catch {
      toast.error('Erro ao atualizar perfil.');
    }
  };

  const handleDelete = async () => {
    if (!deletingUser) return;
    try {
      await deleteUserProfile.mutateAsync(deletingUser.principal);
      toast.success('Usuário removido com sucesso!');
      setDeletingUser(null);
    } catch {
      toast.error('Erro ao remover usuário.');
    }
  };

  const activeProfiles = profiles.filter((p) => p.approvalStatus !== ApprovalStatus.pending);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Users className="w-6 h-6" />
          Gestão de Usuários
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Gerencie usuários, aprovações e permissões do sistema.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
        </div>
      ) : (
        <>
          <PendingUsersSection profiles={profiles} />

          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">
                Todos os Usuários ({profiles.length})
              </h2>
            </div>
            {profiles.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                Nenhum usuário cadastrado.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {profiles.map((user) => (
                  <div key={user.principal.toString()} className="p-4 flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-foreground truncate">{user.name}</p>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getApprovalBadgeClass(user.approvalStatus)}`}
                        >
                          {APPROVAL_STATUS_LABELS[user.approvalStatus]}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {ROLE_LABELS[user.appRole]} · {getMuseumLabel(user.museum)}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono truncate mt-0.5">
                        {user.principal.toString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button variant="ghost" size="icon" onClick={() => handleEditOpen(user)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeletingUser(user)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingUser} onOpenChange={(open) => { if (!open) { setEditingUser(null); setEditForm(null); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>Atualize as informações do usuário.</DialogDescription>
          </DialogHeader>
          {editForm && (
            <div className="space-y-4 py-2">
              <div>
                <Label htmlFor="editName">Nome</Label>
                <Input
                  id="editName"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Função</Label>
                <Select
                  value={editForm.appRole}
                  onValueChange={(v) => setEditForm({ ...editForm, appRole: v as AppUserRole })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(AppUserRole).map((r) => (
                      <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Equipe/Museu</Label>
                <Select
                  value={editForm.museum}
                  onValueChange={(v) => setEditForm({ ...editForm, museum: v as MuseumLocation })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MUSEUM_LOCATIONS.map((m) => (
                      <SelectItem key={m} value={m}>{getMuseumLabel(m)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditingUser(null); setEditForm(null); }}>
              Cancelar
            </Button>
            <Button onClick={handleEditSave} disabled={updateUserProfile.isPending}>
              {updateUserProfile.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingUser} onOpenChange={(open) => { if (!open) setDeletingUser(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover o usuário <strong>{deletingUser?.name}</strong>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteUserProfile.isPending ? 'Removendo...' : 'Remover'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
