import React, { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import {
  useAllUserProfiles,
  useApproveUser,
  useRejectUser,
  useUpdateUserRole,
  useDeleteUserProfile,
  useGetCallerUserProfile,
  useIsCoordinadorGeral,
} from '../hooks/useQueries';
import { AppUserRole, MuseumLocation, type FullUserProfile } from '../backend';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Loader2, UserCheck, UserX, Trash2, Edit, Shield, ShieldAlert } from 'lucide-react';
import { MUSEUM_LOCATIONS, getMuseumLabel } from '../utils/labels';
import type { Principal } from '@dfinity/principal';

const ROLE_LABELS: Record<AppUserRole, string> = {
  [AppUserRole.professional]: 'Profissional',
  [AppUserRole.coordination]: 'Coordenação Geral',
  [AppUserRole.coordinator]: 'Coordenador',
  [AppUserRole.administration]: 'Administração',
};

const APPROVAL_STATUS_LABELS: Record<string, string> = {
  pending: 'Pendente',
  approved: 'Aprovado',
  rejected: 'Rejeitado',
};

const APPROVAL_STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'secondary',
  approved: 'default',
  rejected: 'destructive',
};

export default function UserManagementPage() {
  const { identity } = useInternetIdentity();
  const { data: currentUserProfile } = useGetCallerUserProfile();
  const isCoordinadorGeral = useIsCoordinadorGeral(currentUserProfile);

  const { data: users, isLoading } = useAllUserProfiles();
  const approveUser = useApproveUser();
  const rejectUser = useRejectUser();
  const updateUserRole = useUpdateUserRole();
  const deleteUserProfile = useDeleteUserProfile();

  const [editingUser, setEditingUser] = useState<FullUserProfile | null>(null);
  const [selectedRole, setSelectedRole] = useState<AppUserRole>(AppUserRole.professional);
  const [selectedMuseum, setSelectedMuseum] = useState<MuseumLocation>(MuseumLocation.equipePrincipal);
  const [deletingUser, setDeletingUser] = useState<FullUserProfile | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleApprove = async (user: FullUserProfile) => {
    setActionError(null);
    try {
      await approveUser.mutateAsync(user.principal as unknown as Principal);
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Erro ao aprovar usuário.');
    }
  };

  const handleReject = async (user: FullUserProfile) => {
    setActionError(null);
    try {
      await rejectUser.mutateAsync(user.principal as unknown as Principal);
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Erro ao rejeitar usuário.');
    }
  };

  const handleEditRole = (user: FullUserProfile) => {
    setEditingUser(user);
    setSelectedRole(user.appRole);
    setSelectedMuseum(user.museum);
    setActionError(null);
  };

  const handleSaveRole = async () => {
    if (!editingUser) return;
    setActionError(null);

    // Prevent assigning coordination role to non-Daniel users
    if (selectedRole === AppUserRole.coordination && editingUser.name !== 'Daniel Perini Santos') {
      setActionError('O papel de Coordenação Geral só pode ser atribuído a Daniel Perini Santos.');
      return;
    }

    try {
      await updateUserRole.mutateAsync({
        user: editingUser.principal as unknown as Principal,
        role: selectedRole,
      });
      setEditingUser(null);
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Erro ao atualizar papel.');
    }
  };

  const handleDelete = async () => {
    if (!deletingUser) return;
    setActionError(null);
    try {
      await deleteUserProfile.mutateAsync(deletingUser.principal as unknown as Principal);
      setDeletingUser(null);
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Erro ao excluir usuário.');
    }
  };

  const canApproveCoordinator = (user: FullUserProfile): boolean => {
    if (user.appRole === AppUserRole.coordinator || user.appRole === AppUserRole.coordination) {
      return isCoordinadorGeral;
    }
    return isCoordinadorGeral;
  };

  const pendingUsers = users?.filter((u) => u.approvalStatus === 'pending') ?? [];
  const allUsers = users ?? [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gestão de Usuários</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Gerencie aprovações, papéis e permissões dos usuários
            </p>
          </div>
          {isCoordinadorGeral && (
            <Badge variant="default" className="flex items-center gap-1.5 px-3 py-1.5">
              <Shield className="w-3.5 h-3.5" />
              Coordenador Geral
            </Badge>
          )}
        </div>

        {actionError && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
            {actionError}
          </div>
        )}

        {/* Pending Approvals */}
        {pendingUsers.length > 0 && (
          <div className="card-section">
            <h2 className="section-title flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-warning" />
              Aprovações Pendentes
              <Badge variant="secondary">{pendingUsers.length}</Badge>
            </h2>
            <div className="space-y-3">
              {pendingUsers.map((user) => (
                <div
                  key={user.principal.toString()}
                  className="flex items-center justify-between p-4 bg-warning/5 border border-warning/20 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-foreground">{user.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {ROLE_LABELS[user.appRole]} · {getMuseumLabel(user.museum)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {canApproveCoordinator(user) ? (
                      <>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleApprove(user)}
                          disabled={approveUser.isPending}
                        >
                          {approveUser.isPending ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <UserCheck className="w-3.5 h-3.5 mr-1.5" />
                          )}
                          Aprovar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(user)}
                          disabled={rejectUser.isPending}
                        >
                          {rejectUser.isPending ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <UserX className="w-3.5 h-3.5 mr-1.5" />
                          )}
                          Rejeitar
                        </Button>
                      </>
                    ) : (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span>
                            <Button size="sm" variant="outline" disabled>
                              <Shield className="w-3.5 h-3.5 mr-1.5" />
                              Restrito
                            </Button>
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          Apenas o Coordenador Geral pode aprovar usuários
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Users */}
        <div className="card-section">
          <h2 className="section-title">Todos os Usuários</h2>
          <div className="space-y-2">
            {allUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhum usuário cadastrado.
              </p>
            ) : (
              allUsers.map((user) => (
                <div
                  key={user.principal.toString()}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground text-sm">{user.name}</p>
                        {user.name === 'Daniel Perini Santos' && (
                          <Badge variant="default" className="text-xs px-1.5 py-0">
                            <Shield className="w-2.5 h-2.5 mr-1" />
                            Coord. Geral
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {ROLE_LABELS[user.appRole]} · {getMuseumLabel(user.museum)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={APPROVAL_STATUS_VARIANTS[user.approvalStatus as string] ?? 'secondary'}>
                      {APPROVAL_STATUS_LABELS[user.approvalStatus as string] ?? user.approvalStatus}
                    </Badge>
                    {isCoordinadorGeral && (
                      <>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEditRole(user)}
                          className="w-8 h-8"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setDeletingUser(user)}
                          className="w-8 h-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Edit Role Dialog */}
        <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Papel do Usuário</DialogTitle>
              <DialogDescription>
                Altere o papel de {editingUser?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              {actionError && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded text-destructive text-sm">
                  {actionError}
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Papel</label>
                <Select
                  value={selectedRole}
                  onValueChange={(v) => setSelectedRole(v as AppUserRole)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(AppUserRole).map((role) => (
                      <SelectItem
                        key={role}
                        value={role}
                        disabled={role === AppUserRole.coordination && editingUser?.name !== 'Daniel Perini Santos'}
                      >
                        {ROLE_LABELS[role]}
                        {role === AppUserRole.coordination && editingUser?.name !== 'Daniel Perini Santos' && ' (restrito)'}
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
              <Button onClick={handleSaveRole} disabled={updateUserRole.isPending}>
                {updateUserRole.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!deletingUser} onOpenChange={(open) => !open && setDeletingUser(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Exclusão</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja excluir o usuário <strong>{deletingUser?.name}</strong>? Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeletingUser(null)}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteUserProfile.isPending}
              >
                {deleteUserProfile.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                Excluir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
