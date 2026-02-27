import { useState } from 'react';
import { useAllReports, useAllActivities } from '../hooks/useQueries';
import { MUSEUM_LOCATIONS, getMuseumLabel } from '../utils/labels';
import type { MuseumLocation } from '../types';
import ExportConsolidatedExcelButton from '../components/ExportConsolidatedExcelButton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, FileText, Activity, Clock } from 'lucide-react';

export default function ConsolidatedMuseumPage() {
  const { data: reports = [], isLoading: reportsLoading } = useAllReports();
  const { data: activities = [], isLoading: activitiesLoading } = useAllActivities();
  const [selectedMuseum, setSelectedMuseum] = useState<string>('all');

  const isLoading = reportsLoading || activitiesLoading;

  const filteredReports = selectedMuseum === 'all'
    ? reports
    : reports.filter((r) => r.mainMuseum === selectedMuseum);

  const filteredActivities = activities.filter((a) =>
    filteredReports.some((r) => r.id === a.reportId)
  );

  const totalHours = filteredActivities.reduce((sum, a) => {
    return sum + (a.dedicatedHours ?? 0);
  }, 0);

  const totalAudience = filteredActivities.reduce((sum, a) => sum + a.totalAudience, 0);

  return (
    <div className="p-6 bg-background min-h-screen">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Relatório Consolidado</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Visão consolidada por museu/equipe
            </p>
          </div>
          <ExportConsolidatedExcelButton />
        </div>

        {/* Filter */}
        <div className="bg-card border border-border rounded-lg p-4 mb-6">
          <Select value={selectedMuseum} onValueChange={setSelectedMuseum}>
            <SelectTrigger className="w-64 bg-background border-input text-foreground">
              <SelectValue placeholder="Selecionar Museu/Equipe" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="all" className="text-foreground">Todos</SelectItem>
              {MUSEUM_LOCATIONS.map((loc) => (
                <SelectItem key={loc} value={loc} className="text-foreground">
                  {getMuseumLabel(loc)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                    Relatórios
                  </span>
                </div>
                <span className="text-2xl font-bold text-foreground">{filteredReports.length}</span>
              </div>

              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center">
                    <Activity className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                    Atividades
                  </span>
                </div>
                <span className="text-2xl font-bold text-foreground">{filteredActivities.length}</span>
              </div>

              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                    Horas
                  </span>
                </div>
                <span className="text-2xl font-bold text-foreground">{totalHours}</span>
              </div>

              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                    Público
                  </span>
                </div>
                <span className="text-2xl font-bold text-foreground">{totalAudience}</span>
              </div>
            </div>

            {/* Reports Table */}
            {filteredReports.length === 0 ? (
              <div className="bg-card border border-border rounded-lg p-12 text-center">
                <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Nenhum relatório encontrado</p>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="p-4 border-b border-border bg-card">
                  <h2 className="text-foreground font-semibold text-sm">
                    Relatórios ({filteredReports.length})
                  </h2>
                </div>
                <div className="divide-y divide-border">
                  {filteredReports.map((report) => {
                    const reportActivities = filteredActivities.filter(
                      (a) => a.reportId === report.id
                    );
                    return (
                      <div key={report.id} className="p-4 bg-card hover:bg-muted/50 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="text-foreground text-sm font-medium">
                              {report.professionalName}
                            </p>
                            <p className="text-muted-foreground text-xs mt-0.5">
                              {getMuseumLabel(report.mainMuseum)} •{' '}
                              {reportActivities.length} atividades
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-foreground text-sm font-medium">
                              {report.protocolNumber}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
