import React, { useState } from 'react';
import {
  useGetCallerUserProfile,
  useListAllUserProfiles,
  useUpdateUserRole,
  useUpdateUserProfile,
  useDeleteUserProfile,
  useApproveUser,
} from '../hooks/useQueries';
import { AppUserRole, ApprovalStatus, MuseumLocation } from '../backend';
import type { FullUserProfile, UserProfile } from '../backend';
import {
  ShieldOff,
  Users,
  Search,
  Loader2,
  RefreshCw,
  UserCog,
  Trash2,
  Pencil,
  UserCheck,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

// ── Label helpers ──────────────────────────────────────────────────────────

function roleLabel(role: AppUserRole): string {
  switch (role) {
    case AppUserRole.coordination: return 'Coordenação';
    case AppUserRole.administration: return 'Administração';
    case AppUserRole.professional: return 'Profissional';
    default: return 'Profissional';
  }
}

function museumLabel(museum: MuseumLocation): string {
  switch (museum) {
    case MuseumLocation.equipePrincipal: return 'Equipe Principal';
    case MuseumLocation.comunicacao: return 'Comunicação';
    case MuseumLocation.administracao: return 'Administração';
    case MuseumLocation.programacao: return 'Programação';
    case MuseumLocation.producaoGeral: return 'Produção Geral';
    case MuseumLocation.coordenacao: return 'Coordenação';
    default: return museum;
  }
}

function approvalStatusLabel(status: ApprovalStatus): string {
  switch (status) {
    case ApprovalStatus.approved: return 'Aprovado';
    case ApprovalStatus.pending: return 'Pendente';
    case ApprovalStatus.rejected: return 'Rejeitado';
    default: return 'Pendente';
  }
}

function approvalStatusVariant(status: ApprovalStatus): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case ApprovalStatus.approved: return 'default';
    case ApprovalStatus.pending: return 'secondary';
    case ApprovalStatus.rejected: return 'destructive';
    default: return 'secondary';
  }
}

function roleBadgeVariant(role: AppUserRole): 'default' | 'secondary' | 'outline' {
  switch (role) {
    case AppUserRole.coordination: return 'default';
    case AppUserRole.administration: return 'secondary';
    case AppUserRole.professional: return 'outline';
    default: return 'outline';
  }
}

// ── Edit User Dialog ───────────────────────────────────────────────────────

interface EditUserDialogProps {
  user: FullUserProfile | null;
  open: boolean;
  onClose: () => void;
}

function EditUserDialog({ user, open, onClose }: EditUserDialogProps) {
  const [name, setName] = useState(user?.name ?? '');
  const [selectedRole, setSelectedRole] = useState<AppUserRole>(user?.appRole ?? AppUserRole.professional);
  const [selectedMuseum, setSelectedMuseum] = useState<MuseumLocation>(user?.museum ?? MuseumLocation.equipePrincipal);
  const updateUserProfile = useUpdateUserProfile();

  React.useEffect(() => {
    if (user) {
      setName(user.name);
      setSelectedRole(user.appRole);
      setSelectedMuseum(user.museum);
    }
  }, [user]);

  const handleConfirm = async () => {
    if (!user || !name.trim()) return;
    const updatedProfile: UserProfile = {
      name: name.trim(),
      appRole: selectedRole,
      museum: selectedMuseum,
    };
    try {
      await updateUserProfile.mutateAsync({ user: user.principal.toString(), updatedProfile });
      toast.success(`Perfil de ${name.trim()} atualizado com sucesso.`);
      onClose();
    } catch {
      toast.error('Erro ao atualizar o perfil do usuário.');
    }
  };

  const hasChanges =
    name.trim() !== user?.name ||
    selectedRole !== user?.appRole ||
    selectedMuseum !== user?.museum;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Editar Usuário</DialogTitle>
          <DialogDescription>
            Edite as informações de <strong>{user?.name}</strong>.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nome completo</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome do usuário..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-role">Função</Label>
            <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as AppUserRole)}>
              <SelectTrigger id="edit-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={AppUserRole.professional}>Profissional</SelectItem>
                <SelectItem value={AppUserRole.coordination}>Coordenação</SelectItem>
                <SelectItem value={AppUserRole.administration}>Administração</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-museum">Equipe / Museu</Label>
            <Select value={selectedMuseum} onValueChange={(v) => setSelectedMuseum(v as MuseumLocation)}>
              <SelectTrigger id="edit-museum">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={MuseumLocation.equipePrincipal}>Equipe Principal</SelectItem>
                <SelectItem value={MuseumLocation.comunicacao}>Comunicação</SelectItem>
                <SelectItem value={MuseumLocation.administracao}>Administração</SelectItem>
                <SelectItem value={MuseumLocation.programacao}>Programação</SelectItem>
                <SelectItem value={MuseumLocation.producaoGeral}>Produção Geral</SelectItem>
                <SelectItem value={MuseumLocation.coordenacao}>Coordenação</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={updateUserProfile.isPending}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={updateUserProfile.isPending || !name.trim() || !hasChanges}
          >
            {updateUserProfile.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Change Role Dialog ─────────────────────────────────────────────────────

interface ChangeRoleDialogProps {
  user: FullUserProfile | null;
  open: boolean;
  onClose: () => void;
}

function ChangeRoleDialog({ user, open, onClose }: ChangeRoleDialogProps) {
  const [selectedRole, setSelectedRole] = useState<AppUserRole>(user?.appRole ?? AppUserRole.professional);
  const updateUserRole = useUpdateUserRole();

  React.useEffect(() => {
    if (user) setSelectedRole(user.appRole);
  }, [user]);

  const handleConfirm = async () => {
    if (!user) return;
    try {
      await updateUserRole.mutateAsync({ user: user.principal.toString(), newRole: selectedRole });
      toast.success(`Função de ${user.name} atualizada para ${roleLabel(selectedRole)}.`);
      onClose();
    } catch {
      toast.error('Erro ao atualizar a função do usuário.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Alterar Função</DialogTitle>
          <DialogDescription>
            Altere a função de <strong>{user?.name}</strong> no sistema.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <Label htmlFor="role-select">Nova função</Label>
          <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as AppUserRole)}>
            <SelectTrigger id="role-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={AppUserRole.professional}>Profissional</SelectItem>
              <SelectItem value={AppUserRole.coordination}>Coordenação</SelectItem>
              <SelectItem value={AppUserRole.administration}>Administração</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={updateUserRole.isPending}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={updateUserRole.isPending || selectedRole === user?.appRole}>
            {updateUserRole.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Delete User Alert Dialog ───────────────────────────────────────────────

interface DeleteUserDialogProps {
  user: FullUserProfile | null;
  open: boolean;
  onClose: () => void;
}

function DeleteUserDialog({ user, open, onClose }: DeleteUserDialogProps) {
  const deleteUser = useDeleteUserProfile();

  const handleConfirm = async () => {
    if (!user) return;
    try {
      await deleteUser.mutateAsync(user.principal.toString());
      toast.success(`Usuário ${user.name} removido com sucesso.`);
      onClose();
    } catch {
      toast.error('Erro ao remover o usuário.');
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remover Usuário</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja remover <strong>{user?.name}</strong>? Esta ação não pode ser desfeita e o usuário perderá acesso ao sistema.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteUser.isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={deleteUser.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteUser.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Remover
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ── Pending Users Section ──────────────────────────────────────────────────

interface PendingUsersSectionProps {
  users: FullUserProfile[];
  isLoading: boolean;
}

function PendingUsersSection({ users, isLoading }: PendingUsersSectionProps) {
  const approveUser = useApproveUser();
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const pendingUsers = users.filter((u) => u.approvalStatus === ApprovalStatus.pending);

  const handleApprove = async (user: FullUserProfile) => {
    const principalStr = user.principal.toString();
    setApprovingId(principalStr);
    try {
      await approveUser.mutateAsync(principalStr);
      toast.success(`${user.name} aprovado com sucesso! O usuário já pode acessar o sistema.`);
    } catch {
      toast.error(`Erro ao aprovar ${user.name}. Tente novamente.`);
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-800/40 dark:bg-amber-950/20 overflow-hidden">
      {/* Section header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-amber-200 dark:border-amber-800/40">
        <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/40">
          <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-amber-900 dark:text-amber-100">
            Usuários Aguardando Aprovação
          </h2>
          <p className="text-xs text-amber-700 dark:text-amber-400">
            Novos usuários que precisam de aprovação para acessar o sistema
          </p>
        </div>
        {!isLoading && pendingUsers.length > 0 && (
          <Badge className="ml-auto bg-amber-500 text-white hover:bg-amber-600">
            {pendingUsers.length}
          </Badge>
        )}
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow className="bg-amber-100/60 dark:bg-amber-900/20 hover:bg-amber-100/60">
            <TableHead className="font-semibold text-amber-900 dark:text-amber-200">Nome</TableHead>
            <TableHead className="font-semibold text-amber-900 dark:text-amber-200">Função</TableHead>
            <TableHead className="font-semibold text-amber-900 dark:text-amber-200">Equipe / Museu</TableHead>
            <TableHead className="font-semibold text-amber-900 dark:text-amber-200 text-right">Ação</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                <TableCell><Skeleton className="h-5 w-24 rounded-full" /></TableCell>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
              </TableRow>
            ))
          ) : pendingUsers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-10">
                <div className="flex flex-col items-center gap-2 text-amber-700 dark:text-amber-400">
                  <UserCheck className="w-8 h-8 opacity-50" />
                  <p className="text-sm font-medium">Nenhum usuário aguardando aprovação</p>
                  <p className="text-xs opacity-70">Todos os usuários cadastrados já foram aprovados.</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            pendingUsers.map((user) => {
              const principalStr = user.principal.toString();
              const isApproving = approvingId === principalStr;
              return (
                <TableRow
                  key={principalStr}
                  className="hover:bg-amber-100/40 dark:hover:bg-amber-900/20 transition-colors"
                >
                  <TableCell className="font-medium text-foreground">{user.name}</TableCell>
                  <TableCell>
                    <Badge variant={roleBadgeVariant(user.appRole)}>
                      {roleLabel(user.appRole)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {museumLabel(user.museum) || (
                      <span className="italic text-muted-foreground/60">Não informado</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      onClick={() => handleApprove(user)}
                      disabled={isApproving || approveUser.isPending}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {isApproving ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                      ) : (
                        <UserCheck className="w-4 h-4 mr-1.5" />
                      )}
                      Aprovar
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function UserManagementPage() {
  const { data: userProfile, isLoading: profileLoading, isFetched: profileFetched } = useGetCallerUserProfile();

  const isCoordination = userProfile?.appRole === AppUserRole.coordination;
  const isAdministration = userProfile?.appRole === AppUserRole.administration;
  const isAuthorized = isCoordination || isAdministration;

  // Only fetch user list once we know the caller is authorized
  const {
    data: users,
    isLoading: usersLoading,
    error,
    refetch,
  } = useListAllUserProfiles(profileFetched && isAuthorized);

  const [search, setSearch] = useState('');
  const [editUser, setEditUser] = useState<FullUserProfile | null>(null);
  const [changeRoleUser, setChangeRoleUser] = useState<FullUserProfile | null>(null);
  const [deleteUser, setDeleteUser] = useState<FullUserProfile | null>(null);

  // Access denied for non-authorized users
  if (!profileLoading && profileFetched && userProfile && !isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[60vh] gap-4 text-center p-8">
        <ShieldOff className="w-16 h-16 text-muted-foreground" />
        <h2 className="text-2xl font-bold text-foreground">Acesso Negado</h2>
        <p className="text-muted-foreground max-w-sm">
          Esta área é exclusiva para usuários com a função de <strong>Coordenação</strong> ou <strong>Administração</strong>.
        </p>
      </div>
    );
  }

  const allUsers = users ?? [];

  const approvedUsers = allUsers.filter((u) => u.approvalStatus !== ApprovalStatus.pending);

  const filteredUsers = approvedUsers.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      museumLabel(u.museum).toLowerCase().includes(q) ||
      roleLabel(u.appRole).toLowerCase().includes(q)
    );
  });

  const isPageLoading = profileLoading || (isAuthorized && usersLoading);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gestão de Usuários</h1>
            <p className="text-sm text-muted-foreground">
              Gerencie funções, acesso e aprovações dos usuários cadastrados no sistema.
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isPageLoading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isPageLoading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Pending Users Section — visible to coordination and administration */}
      <PendingUsersSection users={allUsers} isLoading={isPageLoading} />

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
          Usuários Ativos
        </span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, função ou equipe..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Error state — only show if user is authorized (permission errors shouldn't appear) */}
      {error && isAuthorized && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          Erro ao carregar usuários. Tente atualizar a página.
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="font-semibold">Nome</TableHead>
              <TableHead className="font-semibold">Função</TableHead>
              <TableHead className="font-semibold">Equipe / Museu</TableHead>
              <TableHead className="font-semibold">Status de Aprovação</TableHead>
              <TableHead className="font-semibold text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPageLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-32 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                  {search ? 'Nenhum usuário encontrado para a busca.' : 'Nenhum usuário ativo cadastrado.'}
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.principal.toString()} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-medium text-foreground">{user.name}</TableCell>
                  <TableCell>
                    <Badge variant={roleBadgeVariant(user.appRole)}>
                      {roleLabel(user.appRole)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {museumLabel(user.museum) || <span className="italic text-muted-foreground/60">Não informado</span>}
                  </TableCell>
                  <TableCell>
                    <Badge variant={approvalStatusVariant(user.approvalStatus)}>
                      {approvalStatusLabel(user.approvalStatus)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditUser(user)}
                        title="Editar usuário"
                      >
                        <Pencil className="w-4 h-4 mr-1.5" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setChangeRoleUser(user)}
                        title="Alterar função"
                      >
                        <UserCog className="w-4 h-4 mr-1.5" />
                        Função
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteUser(user)}
                        title="Remover usuário"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                      >
                        <Trash2 className="w-4 h-4 mr-1.5" />
                        Remover
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Summary */}
      {!isPageLoading && !error && filteredUsers.length > 0 && (
        <p className="text-xs text-muted-foreground text-right">
          {filteredUsers.length} usuário{filteredUsers.length !== 1 ? 's' : ''} encontrado{filteredUsers.length !== 1 ? 's' : ''}
          {search ? ` para "${search}"` : ''}
        </p>
      )}

      {/* Dialogs */}
      <EditUserDialog
        user={editUser}
        open={!!editUser}
        onClose={() => setEditUser(null)}
      />
      <ChangeRoleDialog
        user={changeRoleUser}
        open={!!changeRoleUser}
        onClose={() => setChangeRoleUser(null)}
      />
      <DeleteUserDialog
        user={deleteUser}
        open={!!deleteUser}
        onClose={() => setDeleteUser(null)}
      />
    </div>
  );
}
