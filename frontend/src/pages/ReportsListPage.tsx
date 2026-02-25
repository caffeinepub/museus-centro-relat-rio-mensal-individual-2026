import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  useReportsForUser,
  useDeleteReport,
  useGetCallerUserProfile,
} from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Report, Status, AppUserRole } from '../backend';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
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
import {
  Plus,
  FileText,
  Calendar,
  Building2,
  Trash2,
  Edit2,
  Activity,
  ChevronDown,
  ChevronUp,
  Loader2,
} from 'lucide-react';
import { statusLabel, getMuseumLabel, getMonthLabel } from '../utils/labels';
import ActivitiesList from '../components/ActivitiesList';

function getStatusBadgeVariant(status: Status): 'default' | 'secondary' | 'outline' | 'destructive' {
  switch (status) {
    case Status.approved: return 'default';
    case Status.submitted: return 'secondary';
    case Status.underReview: return 'outline';
    case Status.requiresAdjustment: return 'destructive';
    default: return 'outline';
  }
}

function ReportCard({
  report,
  userRole,
  onEdit,
  onDelete,
  onAddActivity,
}: {
  report: Report;
  userRole?: AppUserRole;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onAddActivity: (id: string) => void;
}) {
  const { identity } = useInternetIdentity();
  const [showActivities, setShowActivities] = useState(false);

  const isCoordinatorOrAdmin =
    userRole === AppUserRole.coordination ||
    userRole === AppUserRole.coordinator ||
    userRole === AppUserRole.administration;

  const isOwner = identity?.getPrincipal().toString() === report.authorId.toString();

  const canEdit =
    isCoordinatorOrAdmin ||
    (isOwner && (report.status === Status.draft || report.status === Status.requiresAdjustment));

  const canAddActivity =
    isCoordinatorOrAdmin ||
    (isOwner && (report.status === Status.draft || report.status === Status.requiresAdjustment));

  return (
    <Card className="hover:border-primary/30 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-medium text-sm text-foreground">{report.professionalName}</span>
              <Badge variant={getStatusBadgeVariant(report.status)} className="text-xs">
                {statusLabel(report.status)}
              </Badge>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {getMonthLabel(report.referenceMonth)} / {report.year.toString()}
              </span>
              <span className="flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                {getMuseumLabel(report.mainMuseum)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground/60 mt-1">{report.protocolNumber}</p>

            {/* Coordinator comments */}
            {report.coordinatorComments && (
              <div className="mt-2 p-2 bg-warning/10 rounded text-xs border border-warning/20">
                <span className="font-medium">Comentário: </span>
                {report.coordinatorComments}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            {canAddActivity && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                title="Adicionar Atividade"
                onClick={() => onAddActivity(report.id)}
              >
                <Activity className="h-3.5 w-3.5" />
              </Button>
            )}
            {canEdit && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => onEdit(report.id)}
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={() => onDelete(report.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setShowActivities((v) => !v)}
              title="Ver atividades"
            >
              {showActivities ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </div>

        {/* Activities section */}
        {showActivities && (
          <div className="mt-3 pt-3 border-t border-border">
            <ActivitiesList report={report} userRole={userRole} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ReportsListPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: reports, isLoading } = useReportsForUser(
    identity?.getPrincipal()
  );
  const deleteMutation = useDeleteReport();

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const userRole = userProfile?.appRole;

  const handleEdit = (reportId: string) => {
    navigate({ to: '/reports/$reportId', params: { reportId } });
  };

  const handleDelete = (reportId: string) => {
    setDeleteConfirmId(reportId);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmId) {
      deleteMutation.mutate(deleteConfirmId, {
        onSuccess: () => setDeleteConfirmId(null),
      });
    }
  };

  const handleAddActivity = (reportId: string) => {
    navigate({ to: '/activities/new', search: { reportId } });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Meus Relatórios</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gerencie seus relatórios mensais de atividades
          </p>
        </div>
        <Button onClick={() => navigate({ to: '/reports/new' })} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Novo Relatório
        </Button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))
        ) : !reports || reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="h-12 w-12 text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground font-medium">Nenhum relatório encontrado</p>
            <p className="text-muted-foreground/60 text-sm mt-1">
              Crie seu primeiro relatório para começar
            </p>
            <Button
              onClick={() => navigate({ to: '/reports/new' })}
              className="mt-4 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Criar Relatório
            </Button>
          </div>
        ) : (
          reports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              userRole={userRole}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onAddActivity={handleAddActivity}
            />
          ))
        )}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => { if (!open) setDeleteConfirmId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Relatório</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este relatório? Esta ação não pode ser desfeita e todas as
              atividades associadas também serão removidas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : null}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
