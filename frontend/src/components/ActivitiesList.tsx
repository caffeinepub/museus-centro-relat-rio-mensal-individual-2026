import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetActivitiesForReport } from '../hooks/useQueries';
import { Activity, ActivityStatus, Classification } from '../backend';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Pencil, Clock, Users, Target, Calendar } from 'lucide-react';

interface ActivitiesListProps {
  reportId: string;
  canEdit?: boolean;
}

function activityStatusLabel(status: ActivityStatus): string {
  const labels: Record<ActivityStatus, string> = {
    [ActivityStatus.notStarted]: 'Não iniciada',
    [ActivityStatus.submitted]: 'Submetida',
    [ActivityStatus.completed]: 'Concluída',
    [ActivityStatus.rescheduled]: 'Reagendada',
    [ActivityStatus.cancelled]: 'Cancelada',
  };
  return labels[status] ?? status;
}

function activityStatusVariant(status: ActivityStatus): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case ActivityStatus.completed: return 'default';
    case ActivityStatus.cancelled: return 'destructive';
    case ActivityStatus.submitted: return 'secondary';
    default: return 'outline';
  }
}

function classificationLabel(c: Classification): string {
  switch (c) {
    case Classification.routine: return 'Rotina';
    case Classification.goalLinked: return 'Meta';
    case Classification.extra: return 'Extra';
    default: return c;
  }
}

function formatDate(ts: bigint): string {
  const ms = Number(ts) / 1_000_000;
  return new Date(ms).toLocaleDateString('pt-BR');
}

function hoursDisplay(activity: Activity): string {
  if (activity.hoursNotApplicable) return 'Não se aplica';
  if (activity.dedicatedHours != null) {
    const h = Number(activity.dedicatedHours);
    return `${h} hora${h === 1 ? '' : 's'}`;
  }
  return '—';
}

export default function ActivitiesList({ reportId, canEdit = true }: ActivitiesListProps) {
  const navigate = useNavigate();
  const { data: activities, isLoading } = useGetActivitiesForReport(reportId);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {canEdit && (
        <div className="flex justify-end">
          <Button
            onClick={() => navigate({ to: `/reports/${reportId}/activities/new` })}
            size="sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nova Atividade
          </Button>
        </div>
      )}

      {(!activities || activities.length === 0) ? (
        <div className="text-center py-10 text-muted-foreground">
          <p>Nenhuma atividade registrada.</p>
          {canEdit && (
            <p className="text-sm mt-1">Clique em "Nova Atividade" para adicionar.</p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((activity: Activity) => (
            <Card key={activity.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="font-semibold text-sm truncate">{activity.activityName}</h3>
                      <Badge variant={activityStatusVariant(activity.status)} className="text-xs shrink-0">
                        {activityStatusLabel(activity.status)}
                      </Badge>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {classificationLabel(activity.classification)}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 shrink-0" />
                        <span>{formatDate(activity.date)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 shrink-0" />
                        <span>Horas: {hoursDisplay(activity)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 shrink-0" />
                        <span>{String(activity.totalAudience)} pessoas</span>
                      </div>
                      {activity.museum && (
                        <div className="flex items-center gap-1">
                          <Target className="h-3 w-3 shrink-0" />
                          <span className="truncate">{activity.museum}</span>
                        </div>
                      )}
                    </div>

                    {activity.executedDescription && (
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                        {activity.executedDescription}
                      </p>
                    )}
                  </div>

                  {canEdit && (
                    <div className="flex gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          navigate({ to: `/reports/${reportId}/activities/${activity.id}/edit` })
                        }
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
