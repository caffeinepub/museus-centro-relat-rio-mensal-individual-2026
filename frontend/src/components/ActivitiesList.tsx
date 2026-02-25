import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useActivitiesForReport } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Report, Activity, Status, AppUserRole, ActivityStatus, Classification } from '../backend';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Clock, Users, Target, Edit2, AlertCircle } from 'lucide-react';
import {
  activityStatusLabel,
  classificationLabel,
  getMuseumLabel,
  productRealisedLabel,
  audienceRangeLabel,
} from '../utils/labels';

interface ActivitiesListProps {
  report: Report;
  userRole?: AppUserRole;
}

function getActivityStatusBadgeVariant(status: ActivityStatus): 'default' | 'secondary' | 'outline' | 'destructive' {
  switch (status) {
    case ActivityStatus.completed: return 'default';
    case ActivityStatus.submitted: return 'secondary';
    case ActivityStatus.notStarted: return 'outline';
    case ActivityStatus.rescheduled: return 'outline';
    case ActivityStatus.cancelled: return 'destructive';
    default: return 'outline';
  }
}

function getClassificationBadgeVariant(classification: Classification): 'default' | 'secondary' | 'outline' | 'destructive' {
  switch (classification) {
    case Classification.goalLinked: return 'default';
    case Classification.routine: return 'secondary';
    case Classification.extra: return 'outline';
    default: return 'outline';
  }
}

export default function ActivitiesList({ report, userRole }: ActivitiesListProps) {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: activities, isLoading, isError } = useActivitiesForReport(report.id);

  const isCoordinatorOrAdmin =
    userRole === AppUserRole.coordination ||
    userRole === AppUserRole.coordinator ||
    userRole === AppUserRole.administration;

  const isOwner = identity?.getPrincipal().toString() === report.authorId.toString();

  const canEdit =
    isCoordinatorOrAdmin ||
    (isOwner && (report.status === Status.draft || report.status === Status.requiresAdjustment));

  const handleAddActivity = () => {
    navigate({ to: '/reports/$reportId/activities/new', params: { reportId: report.id } });
  };

  const handleEditActivity = (activityId: string) => {
    navigate({ to: '/reports/$reportId/activities/$activityId', params: { reportId: report.id, activityId } });
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center gap-2 text-destructive text-sm p-3 bg-destructive/10 rounded-lg">
        <AlertCircle className="h-4 w-4" />
        Erro ao carregar atividades.
      </div>
    );
  }

  const activityList = activities ?? [];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground text-sm">
          Atividades ({activityList.length})
        </h3>
        {canEdit && (
          <Button size="sm" onClick={handleAddActivity} className="flex items-center gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            Nova Atividade
          </Button>
        )}
      </div>

      {activityList.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Target className="h-8 w-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">Nenhuma atividade registrada</p>
          {canEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddActivity}
              className="mt-3 flex items-center gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              Adicionar Atividade
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {activityList.map((activity: Activity) => (
            <Card key={activity.id} className="hover:border-primary/30 transition-colors">
              <CardContent className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <span className="font-medium text-sm text-foreground truncate">
                        {activity.activityName}
                      </span>
                      <Badge variant={getActivityStatusBadgeVariant(activity.status)} className="text-xs">
                        {activityStatusLabel(activity.status)}
                      </Badge>
                      <Badge variant={getClassificationBadgeVariant(activity.classification)} className="text-xs">
                        {classificationLabel(activity.classification)}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {activity.hoursNotApplicable
                          ? 'N/A'
                          : activity.dedicatedHours != null
                          ? `${activity.dedicatedHours.toString()}h`
                          : '—'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {activity.totalAudience.toString()} pessoas
                      </span>
                      <span>{getMuseumLabel(activity.museum)}</span>
                      <span>{productRealisedLabel(activity.productRealised)}</span>
                    </div>

                    {Number(activity.totalAudience) > 0 && (
                      <div className="flex flex-wrap gap-2 mt-1.5 text-xs text-muted-foreground/80">
                        {Number(activity.children) > 0 && <span>Crianças: {activity.children.toString()}</span>}
                        {Number(activity.youth) > 0 && <span>Jovens: {activity.youth.toString()}</span>}
                        {Number(activity.adults) > 0 && <span>Adultos: {activity.adults.toString()}</span>}
                        {Number(activity.elderly) > 0 && <span>Idosos: {activity.elderly.toString()}</span>}
                        {Number(activity.pcd) > 0 && <span>PCD: {activity.pcd.toString()}</span>}
                      </div>
                    )}

                    {activity.classification === Classification.goalLinked && activity.goalNumber != null && (
                      <div className="mt-1.5 text-xs text-muted-foreground">
                        <span className="font-medium">Meta #{activity.goalNumber.toString()}</span>
                        {activity.goalDescription && (
                          <span className="ml-1">— {activity.goalDescription}</span>
                        )}
                      </div>
                    )}

                    {activity.status === ActivityStatus.cancelled && activity.cancellationReason && (
                      <div className="mt-1.5 text-xs text-destructive/80">
                        Motivo: {activity.cancellationReason}
                      </div>
                    )}

                    {activity.hadPartnership && activity.partnerName && (
                      <div className="mt-1.5 text-xs text-muted-foreground">
                        Parceria: {activity.partnerName}
                        {activity.partnerType && ` (${activity.partnerType})`}
                      </div>
                    )}
                  </div>

                  {canEdit && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0"
                      onClick={() => handleEditActivity(activity.id)}
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
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
