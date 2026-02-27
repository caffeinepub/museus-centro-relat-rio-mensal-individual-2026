import React, { useState } from 'react';
import { toast } from 'sonner';
import { Search, Edit, Trash2, Check, X, Loader2, Users } from 'lucide-react';
import { Principal } from '@dfinity/principal';
import {
  useAllUserProfiles,
  useUpdateUserProfile,
  useDeleteUserProfile,
  useApproveUser,
  useRejectUser,
  useGetCallerUserProfile,
} from '../hooks/useQueries';
import { FullUserProfile, AppUserRole, TeamLocation, ApprovalStatus } from '../backend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Label } from '@/components/ui/label';

const ROLE_LABELS: Record<AppUserRole, string> = {
  [AppUserRole.professional]: 'Profissional',
  [AppUserRole.coordination]: 'Coordenação',
  [AppUserRole.coordinator]: 'Coordenador',
  [AppUserRole.administration]: 'Administração',
};

const TEAM_LABELS: Record<TeamLocation, string> = {
  [TeamLocation.mhab]: 'MHAB',
  [TeamLocation.mumo]: 'MUMO',
  [TeamLocation.mis]: 'MIS',
  [TeamLocation.comunicacao]: 'Comunicação',
  [TeamLocation.administracao]: 'Administração',
  [TeamLocation.empty]: '—',
};

const APPROVAL_LABELS: Record<ApprovalStatus, string> = {
  [ApprovalStatus.pending]: 'Pendente',
  [ApprovalStatus.approved]: 'Aprovado',
  [ApprovalStatus.rejected]: 'Rejeitado',
};

const APPROVAL_COLORS: Record<ApprovalStatus, string> = {
  [ApprovalStatus.pending]: 'bg-yellow-100 text-yellow-800',
  [ApprovalStatus.approved]: 'bg-green-100 text-green-800',
  [ApprovalStatus.rejected]: 'bg-red-100 text-red-800',
};

export default function UserManagementPage() {
  const { data: users = [], isLoading } = useAllUserProfiles();
  const { data: currentUserProfile } = useGetCallerUserProfile();
  const updateProfile = useUpdateUserProfile();
  const deleteProfile = useDeleteUserProfile();
  const approveUser = useApproveUser();
  const rejectUser = useRejectUser();

  const [search, setSearch] = useState('');
  const [editingUser, setEditingUser] = useState<FullUserProfile | null>(null);
  const [editForm, setEditForm] = useState<{ name: string; appRole: AppUserRole; team: TeamLocation } | null>(null);
  const [deletingUser, setDeletingUser] = useState<FullUserProfile | null>(null);

  // Allow delete for administration, coordination, and coordinator roles
  const canDelete =
    currentUserProfile?.appRole === AppUserRole.administration ||
    currentUserProfile?.appRole === AppUserRole.coordination ||
    currentUserProfile?.appRole === AppUserRole.coordinator;

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleEditOpen = (user: FullUserProfile) => {
    setEditingUser(user);
    setEditForm({ name: user.name, appRole: user.appRole, team: user.team });
  };

  const handleEditSave = async () => {
    if (!editingUser || !editForm) return;
    try {
      const principal = typeof editingUser.principal === 'string'
        ? Principal.fromText(editingUser.principal as unknown as string)
        : editingUser.principal as unknown as Principal;

      await updateProfile.mutateAsync({
        user: principal,
        profile: {
          name: editForm.name,
          appRole: editForm.appRole,
          team: editForm.team,
        },
      });
      toast.success('Perfil atualizado com sucesso!');
      setEditingUser(null);
      setEditForm(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar perfil';
      toast.error(message);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingUser) return;
    try {
      const principal = typeof deletingUser.principal === 'string'
        ? Principal.fromText(deletingUser.principal as unknown as string)
        : deletingUser.principal as unknown as Principal;

      await deleteProfile.mutateAsync(principal);
      toast.success('Usuário excluído com sucesso!');
      setDeletingUser(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao excluir usuário';
      toast.error(message);
      setDeletingUser(null);
    }
  };

  const handleApprove = async (user: FullUserProfile) => {
    try {
      const principal = typeof user.principal === 'string'
        ? Principal.fromText(user.principal as unknown as string)
        : user.principal as unknown as Principal;

      await approveUser.mutateAsync(principal);
      toast.success(`${user.name} aprovado com sucesso!`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao aprovar usuário';
      toast.error(message);
    }
  };

  const handleReject = async (user: FullUserProfile) => {
    try {
      const principal = typeof user.principal === 'string'
        ? Principal.fromText(user.principal as unknown as string)
        : user.principal as unknown as Principal;

      await rejectUser.mutateAsync(principal);
      toast.success(`${user.name} rejeitado.`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao rejeitar usuário';
      toast.error(message);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Users className="w-7 h-7 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Gerenciamento de Usuários</h1>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Buscar por nome..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">Nenhum usuário encontrado.</div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Nome</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Função</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Equipe</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Status</th>
                <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(user => (
                <tr key={user.principal.toString()} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{user.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{ROLE_LABELS[user.appRole] ?? user.appRole}</td>
                  <td className="px-4 py-3 text-muted-foreground">{TEAM_LABELS[user.team] ?? user.team}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${APPROVAL_COLORS[user.approvalStatus]}`}>
                      {APPROVAL_LABELS[user.approvalStatus] ?? user.approvalStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {user.approvalStatus === ApprovalStatus.pending && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-700 border-green-300 hover:bg-green-50"
                            onClick={() => handleApprove(user)}
                            disabled={approveUser.isPending}
                          >
                            {approveUser.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-700 border-red-300 hover:bg-red-50"
                            onClick={() => handleReject(user)}
                            disabled={rejectUser.isPending}
                          >
                            {rejectUser.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditOpen(user)}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      {canDelete && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-700 border-red-300 hover:bg-red-50"
                          onClick={() => setDeletingUser(user)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingUser} onOpenChange={open => { if (!open) { setEditingUser(null); setEditForm(null); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>Atualize as informações do usuário abaixo.</DialogDescription>
          </DialogHeader>
          {editForm && (
            <div className="space-y-4 py-2">
              <div className="space-y-1">
                <Label>Nome</Label>
                <Input
                  value={editForm.name}
                  onChange={e => setEditForm(f => f ? { ...f, name: e.target.value } : f)}
                />
              </div>
              <div className="space-y-1">
                <Label>Função</Label>
                <Select
                  value={editForm.appRole}
                  onValueChange={val => setEditForm(f => f ? { ...f, appRole: val as AppUserRole } : f)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a função" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={AppUserRole.coordination}>Coordenação</SelectItem>
                    <SelectItem value={AppUserRole.coordinator}>Coordenador</SelectItem>
                    <SelectItem value={AppUserRole.administration}>Administração</SelectItem>
                    <SelectItem value={AppUserRole.professional}>Profissional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Equipe</Label>
                <Select
                  value={editForm.team}
                  onValueChange={val => setEditForm(f => f ? { ...f, team: val as TeamLocation } : f)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a equipe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={TeamLocation.mhab}>MHAB</SelectItem>
                    <SelectItem value={TeamLocation.mumo}>MUMO</SelectItem>
                    <SelectItem value={TeamLocation.mis}>MIS</SelectItem>
                    <SelectItem value={TeamLocation.comunicacao}>Comunicação</SelectItem>
                    <SelectItem value={TeamLocation.administracao}>Administração</SelectItem>
                    <SelectItem value={TeamLocation.empty}>—</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditingUser(null); setEditForm(null); }}>
              Cancelar
            </Button>
            <Button onClick={handleEditSave} disabled={updateProfile.isPending}>
              {updateProfile.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingUser} onOpenChange={open => { if (!open) setDeletingUser(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Usuário</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir <strong>{deletingUser?.name}</strong>? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingUser(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={deleteProfile.isPending}>
              {deleteProfile.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
