import { useNavigate } from '@tanstack/react-router';
import type { Activity } from '../types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Clock } from 'lucide-react';

interface Props {
  reportId: string;
  activities: Activity[];
  isLoading?: boolean;
  canEdit?: boolean;
}

function getActivityStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    notStarted: 'Não Iniciado',
    submitted: 'Enviado',
    completed: 'Concluído',
    rescheduled: 'Reagendado',
    cancelled: 'Cancelado',
  };
  return labels[status] ?? status;
}

function getActivityStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (status === 'completed') return 'default';
  if (status === 'cancelled') return 'destructive';
  if (status === 'submitted') return 'default';
  return 'secondary';
}

export default function ActivitiesList({ reportId, activities, isLoading, canEdit = true }: Props) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-3 bg-card">
      {canEdit && (
        <div className="flex justify-end">
          <Button
            onClick={() =>
              navigate({ to: `/reports/$reportId/activities/new`, params: { reportId } })
            }
            size="sm"
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Nova Atividade
          </Button>
        </div>
      )}

      {activities.length === 0 ? (
        <div className="bg-background border border-border rounded-lg p-8 text-center">
          <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground text-sm">Nenhuma atividade cadastrada</p>
          {canEdit && (
            <p className="text-muted-foreground text-xs mt-1">
              Clique em "Nova Atividade" para adicionar
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="bg-background border border-border rounded-lg p-4 flex items-start justify-between gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-foreground text-sm font-medium truncate">
                    {activity.activityName}
                  </span>
                  <Badge variant={getActivityStatusVariant(activity.status)} className="shrink-0 text-xs">
                    {getActivityStatusLabel(activity.status)}
                  </Badge>
                </div>
                {activity.executedDescription && (
                  <p className="text-muted-foreground text-xs line-clamp-2">
                    {activity.executedDescription}
                  </p>
                )}
                {activity.totalAudience > 0 && (
                  <p className="text-muted-foreground text-xs mt-1">
                    Público: {activity.totalAudience}
                  </p>
                )}
              </div>

              {canEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-muted-foreground hover:text-foreground hover:bg-muted"
                  onClick={() =>
                    navigate({
                      to: `/reports/$reportId/activities/$activityId`,
                      params: { reportId, activityId: activity.id },
                    })
                  }
                >
                  <Edit className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
