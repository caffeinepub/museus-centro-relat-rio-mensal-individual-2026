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
  const isCoordinadorGeral = useIsCoordinadorGeral(currentUserProfile);
  const { data: profiles, isLoading } = useListAllUserProfiles();
  const updateProfile = useUpdateUserProfile();
  const deleteProfile = useDeleteUserProfile();
  const approveUser = useApproveUser();
  const rejectUser = useRejectUser();

  const [editingUser, setEditingUser] = useState<FullUserProfile | null>(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState<AppUserRole>(AppUserRole.professional);
  const [editMuseum, setEditMuseum] = useState<MuseumLocation>(MuseumLocation.equipePrincipal);
  const [userToDelete, setUserToDelete] = useState<FullUserProfile | null>(null);

  const pendingUsers = profiles?.filter(p => p.approvalStatus === ApprovalStatus.pending) ?? [];
  const allUsers = profiles ?? [];

  const openEdit = (profile: FullUserProfile) => {
    setEditingUser(profile);
    setEditName(profile.name);
    setEditRole(profile.appRole);
    setEditMuseum(profile.museum);
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;

    // UI-level guard: coordination role is reserved for Daniel Perini Santos
    let safeRole = editRole;
    if (editRole === AppUserRole.coordination && editName !== COORDINATION_RESERVED_NAME) {
      safeRole = AppUserRole.coordinator;
      toast.warning('O papel "Coordenação Geral" é reservado para Daniel Perini Santos. Foi atribuído "Coordenador".');
    }

    try {
      await updateProfile.mutateAsync({
        user: editingUser.principal,
        profile: { name: editName, appRole: safeRole, museum: editMuseum },
      });
      toast.success('Perfil atualizado com sucesso.');
      setEditingUser(null);
    } catch {
      toast.error('Erro ao atualizar perfil.');
    }
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    try {
      await deleteProfile.mutateAsync(userToDelete.principal);
      toast.success('Utilizador eliminado.');
      setUserToDelete(null);
    } catch {
      toast.error('Erro ao eliminar utilizador.');
    }
  };

  const handleApprove = async (profile: FullUserProfile) => {
    try {
      await approveUser.mutateAsync(profile.principal);
      toast.success(`${profile.name} aprovado.`);
    } catch {
      toast.error('Erro ao aprovar utilizador.');
    }
  };

  const handleReject = async (profile: FullUserProfile) => {
    try {
      await rejectUser.mutateAsync(profile.principal);
      toast.success(`${profile.name} rejeitado.`);
    } catch {
      toast.error('Erro ao rejeitar utilizador.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Gestão de Utilizadores</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {allUsers.length} utilizador(es) registado(s)
          {isCoordinadorGeral && ' — Coordenador Geral'}
        </p>
      </div>

      {/* Pending Approvals */}
      {pendingUsers.length > 0 && (
        <div className="card-section space-y-3">
          <h2 className="section-title flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-warning" />
            Aprovações Pendentes ({pendingUsers.length})
          </h2>
          <div className="space-y-2">
            {pendingUsers.map((profile) => (
              <div
                key={profile.principal.toString()}
                className="flex items-center justify-between p-3 rounded-lg border border-warning/30 bg-warning/5"
              >
                <div>
                  <p className="font-medium text-sm text-foreground">{profile.name}</p>
                  <p className="text-xs text-muted-foreground">{ROLE_LABELS[profile.appRole]}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1 border-success text-success hover:bg-success/10"
                    onClick={() => handleApprove(profile)}
                    disabled={approveUser.isPending}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Aprovar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1 border-destructive text-destructive hover:bg-destructive/10"
                    onClick={() => handleReject(profile)}
                    disabled={rejectUser.isPending}
                  >
                    <XCircle className="w-3.5 h-3.5" />
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
        <h2 className="section-title flex items-center gap-2">
          <Users className="w-4 h-4" />
          Todos os Utilizadores
        </h2>
        {allUsers.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhum utilizador registado.
          </p>
        ) : (
          <div className="space-y-2">
            {allUsers.map((profile) => (
              <div
                key={profile.principal.toString()}
                className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:border-primary/30 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm text-foreground">{profile.name}</span>
                    <Badge
                      variant={APPROVAL_VARIANTS[profile.approvalStatus] ?? 'secondary'}
                      className="text-xs"
                    >
                      {APPROVAL_LABELS[profile.approvalStatus] ?? profile.approvalStatus}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground flex-wrap">
                    <span>{ROLE_LABELS[profile.appRole]}</span>
                    <span>·</span>
                    <span>{getMuseumLabel(profile.museum)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-3 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => openEdit(profile)}
                    title="Editar utilizador"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => setUserToDelete(profile)}
                    title="Eliminar utilizador"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
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
              <Label htmlFor="editName">Nome</Label>
              <Input
                id="editName"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Nome completo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editRole">Papel</Label>
              <Select value={editRole} onValueChange={(v) => setEditRole(v as AppUserRole)}>
                <SelectTrigger id="editRole">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ROLE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {editRole === AppUserRole.coordination && editName !== COORDINATION_RESERVED_NAME && (
                <p className="text-xs text-warning">
                  ⚠️ O papel "Coordenação Geral" é reservado para {COORDINATION_RESERVED_NAME}. Será guardado como "Coordenador".
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="editMuseum">Museu / Área</Label>
              <Select value={editMuseum} onValueChange={(v) => setEditMuseum(v as MuseumLocation)}>
                <SelectTrigger id="editMuseum">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MUSEUM_LOCATIONS.map((loc) => (
                    <SelectItem key={loc} value={loc}>{getMuseumLabel(loc)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit} disabled={updateProfile.isPending}>
              {updateProfile.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Utilizador</AlertDialogTitle>
            <AlertDialogDescription>
              Tem a certeza que deseja eliminar <strong>{userToDelete?.name}</strong>?
              Esta ação não pode ser desfeita.
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
