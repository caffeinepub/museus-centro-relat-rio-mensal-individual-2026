import React, { useState, useMemo } from 'react';
import { useGetAllReports, useGetAllActivities, useGetCallerUserProfile } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart3, Download, FileText, Users, Activity, Lightbulb } from 'lucide-react';
import { Month, Status, type Activity as ActivityType } from '../backend';
import { monthLabel, statusLabel, productRealisedLabel } from '../utils/labels';
import { generateConsolidatedPDF } from '../utils/consolidatedPdfGenerator';
import { generateConsolidatedCsv } from '../utils/consolidatedCsvGenerator';
import { toast } from 'sonner';

const MONTHS = [
  { value: Month.february, label: 'Fevereiro' },
  { value: Month.march, label: 'Março' },
  { value: Month.april, label: 'Abril' },
  { value: Month.may, label: 'Maio' },
  { value: Month.june, label: 'Junho' },
  { value: Month.july, label: 'Julho' },
  { value: Month.august, label: 'Agosto' },
  { value: Month.september, label: 'Setembro' },
  { value: Month.october, label: 'Outubro' },
  { value: Month.november, label: 'Novembro' },
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i);

const MUSEUMS = ['MHAB', 'MIS', 'MUMO'];

function getStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case Status.approved: return 'default';
    case Status.submitted: return 'secondary';
    case Status.underReview: return 'outline';
    default: return 'outline';
  }
}

function quantityToNumber(qty: string): number {
  const map: Record<string, number> = {
    one: 1, two: 2, three: 3, four: 4, five: 5,
    six: 6, seven: 7, eight: 8, nine: 9, ten: 10, maisDeDez: 11,
  };
  return map[qty] || 1;
}

export default function ConsolidatedMuseumPage() {
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();
  const { data: allReports, isLoading: reportsLoading } = useGetAllReports();
  const { data: allActivities, isLoading: activitiesLoading } = useGetAllActivities();

  const [selectedMuseum, setSelectedMuseum] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR.toString());

  const isCoordOrAdmin =
    userProfile?.appRole === 'coordination' || userProfile?.appRole === 'administration';

  const filteredReports = useMemo(() => {
    if (!allReports || !selectedMuseum || !selectedMonth) return [];
    return allReports.filter(
      (r) =>
        r.mainMuseum === selectedMuseum &&
        r.referenceMonth === selectedMonth &&
        r.year.toString() === selectedYear
    );
  }, [allReports, selectedMuseum, selectedMonth, selectedYear]);

  const filteredActivities = useMemo(() => {
    if (!allActivities || filteredReports.length === 0) return [];
    const reportIds = new Set(filteredReports.map((r) => r.id));
    return allActivities.filter((a) => reportIds.has(a.reportId));
  }, [allActivities, filteredReports]);

  // Build activitiesByReport map for generators
  const activitiesByReport = useMemo(() => {
    const map = new Map<string, ActivityType[]>();
    filteredReports.forEach(r => map.set(r.id, []));
    filteredActivities.forEach(a => {
      const existing = map.get(a.reportId) ?? [];
      existing.push(a);
      map.set(a.reportId, existing);
    });
    return map;
  }, [filteredReports, filteredActivities]);

  const aggregated = useMemo(() => {
    const totalActivities = filteredActivities.length;
    const totalAudience = filteredActivities.reduce(
      (sum, a) => sum + Number(a.totalAudience),
      0
    );

    // Products with quantities
    const productMap = new Map<string, number>();
    filteredActivities.forEach((a) => {
      if (a.productRealised && a.productRealised !== 'naoSeAplica') {
        const label = productRealisedLabel(a.productRealised);
        const qty = a.quantity ? quantityToNumber(a.quantity as string) : 1;
        productMap.set(label, (productMap.get(label) || 0) + qty);
      }
    });

    // Opportunities
    const opportunities = filteredReports
      .map((r) => r.identifiedOpportunity)
      .filter(Boolean);

    return { totalActivities, totalAudience, productMap, opportunities };
  }, [filteredActivities, filteredReports]);

  const handleExportPDF = () => {
    if (!selectedMuseum || !selectedMonth) {
      toast.error('Selecione museu e mês antes de exportar.');
      return;
    }
    generateConsolidatedPDF(filteredReports, activitiesByReport);
  };

  const handleExportCSV = () => {
    if (!selectedMuseum || !selectedMonth) {
      toast.error('Selecione museu e mês antes de exportar.');
      return;
    }
    generateConsolidatedCsv(filteredReports, activitiesByReport);
  };

  if (profileLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!isCoordOrAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <BarChart3 className="w-12 h-12 text-muted-foreground" />
        <p className="text-muted-foreground text-lg">Acesso restrito à Coordenação e Administração.</p>
      </div>
    );
  }

  const isLoading = reportsLoading || activitiesLoading;
  const hasSelection = selectedMuseum && selectedMonth;

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <BarChart3 className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold">Consolidado por Museu</h1>
      </div>

      {/* Selectors */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Selecionar Período e Museu</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select value={selectedMuseum} onValueChange={setSelectedMuseum}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar museu..." />
              </SelectTrigger>
              <SelectContent>
                {MUSEUMS.map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar mês..." />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger>
                <SelectValue placeholder="Ano" />
              </SelectTrigger>
              <SelectContent>
                {YEARS.map((y) => (
                  <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {hasSelection && (
        <>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          ) : (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Activity className="w-4 h-4 text-primary" />
                      <span className="text-xs text-muted-foreground">Total Atividades</span>
                    </div>
                    <p className="text-2xl font-bold">{aggregated.totalActivities}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="w-4 h-4 text-primary" />
                      <span className="text-xs text-muted-foreground">Público Total</span>
                    </div>
                    <p className="text-2xl font-bold">{aggregated.totalAudience.toLocaleString('pt-BR')}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="w-4 h-4 text-primary" />
                      <span className="text-xs text-muted-foreground">Relatórios</span>
                    </div>
                    <p className="text-2xl font-bold">{filteredReports.length}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Lightbulb className="w-4 h-4 text-primary" />
                      <span className="text-xs text-muted-foreground">Oportunidades</span>
                    </div>
                    <p className="text-2xl font-bold">{aggregated.opportunities.length}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Products */}
              {aggregated.productMap.size > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Produtos Entregues</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Array.from(aggregated.productMap.entries()).map(([product, qty]) => (
                        <div key={product} className="flex items-center justify-between py-1 border-b last:border-0">
                          <span className="text-sm">{product}</span>
                          <Badge variant="secondary">{qty}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Opportunities */}
              {aggregated.opportunities.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Oportunidades Identificadas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {aggregated.opportunities.map((opp, i) => (
                        <li key={i} className="text-sm flex gap-2">
                          <span className="text-primary font-bold">•</span>
                          <span>{opp}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Reports List */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Relatórios Individuais — {selectedMuseum} / {monthLabel(selectedMonth as any)} {selectedYear}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {filteredReports.length === 0 ? (
                    <p className="p-4 text-muted-foreground text-sm">
                      Nenhum relatório encontrado para este período e museu.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="text-left p-3 font-medium">Profissional</th>
                            <th className="text-left p-3 font-medium">Função</th>
                            <th className="text-left p-3 font-medium">Status</th>
                            <th className="text-left p-3 font-medium">Atividades</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredReports.map((report) => {
                            const reportActivities = filteredActivities.filter(
                              (a) => a.reportId === report.id
                            );
                            return (
                              <tr key={report.id} className="border-b hover:bg-muted/20">
                                <td className="p-3 font-medium">{report.professionalName}</td>
                                <td className="p-3 text-muted-foreground">{report.role}</td>
                                <td className="p-3">
                                  <Badge variant={getStatusVariant(report.status)}>
                                    {statusLabel(report.status)}
                                  </Badge>
                                </td>
                                <td className="p-3">{reportActivities.length}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Export Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" className="gap-2 flex-1" onClick={handleExportPDF}>
                  <FileText className="w-4 h-4" />
                  Exportar PDF Consolidado
                </Button>
                <Button variant="outline" className="gap-2 flex-1" onClick={handleExportCSV}>
                  <Download className="w-4 h-4" />
                  Exportar CSV
                </Button>
              </div>
            </>
          )}
        </>
      )}

      {!hasSelection && (
        <div className="flex flex-col items-center justify-center h-48 gap-3 text-muted-foreground">
          <BarChart3 className="w-10 h-10" />
          <p>Selecione um museu e mês para visualizar o consolidado.</p>
        </div>
      )}
    </div>
  );
}
