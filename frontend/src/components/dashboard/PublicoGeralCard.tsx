import React, { useState } from 'react';
import { useGetTotalGeneralAudience } from '../../hooks/useQueries';
import { AudienceQueryType, Month } from '../../backend';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Users, Loader2 } from 'lucide-react';
import { getMonthOptions, getCurrentMonth, getCurrentYear } from '../../utils/labels';

const MONTH_OPTIONS = getMonthOptions();

const YEAR_OPTIONS = [2024, 2025, 2026, 2027];

type QueryMode = 'specificMonth' | 'cumulativeTotal';

export default function PublicoGeralCard() {
  const [mode, setMode] = useState<QueryMode>('cumulativeTotal');
  const [selectedMonth, setSelectedMonth] = useState<string>(
    getCurrentMonth() ?? 'february'
  );
  const [selectedYear, setSelectedYear] = useState<number>(getCurrentYear());

  const queryType: AudienceQueryType =
    mode === 'specificMonth'
      ? {
          __kind__: 'specificMonth',
          specificMonth: {
            month: selectedMonth as Month,
            year: BigInt(selectedYear),
          },
        }
      : {
          __kind__: 'cumulativeTotal',
          cumulativeTotal: null,
        };

  const { data: totalAudience, isLoading, isError } = useGetTotalGeneralAudience(queryType);

  const displayValue = isLoading
    ? '...'
    : isError
    ? 'N/A'
    : (totalAudience !== undefined && totalAudience !== null
        ? Number(totalAudience).toLocaleString('pt-PT')
        : '0');

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Users className="h-4 w-4" />
          Público Geral (Relatórios Aprovados)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {isLoading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
              <span className="text-3xl font-bold text-foreground">{displayValue}</span>
              <span className="text-sm text-muted-foreground">pessoas</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {mode === 'cumulativeTotal'
                ? 'Total acumulado de todos os relatórios aprovados'
                : `Mês de ${MONTH_OPTIONS.find((m) => m.value === selectedMonth)?.label ?? selectedMonth} de ${selectedYear}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <Select value={mode} onValueChange={(v) => setMode(v as QueryMode)}>
              <SelectTrigger className="w-40 bg-background border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background border-border">
                <SelectItem value="cumulativeTotal">Total Acumulado</SelectItem>
                <SelectItem value="specificMonth">Mês Específico</SelectItem>
              </SelectContent>
            </Select>

            {mode === 'specificMonth' && (
              <>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-36 bg-background border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border">
                    {MONTH_OPTIONS.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={String(selectedYear)}
                  onValueChange={(v) => setSelectedYear(Number(v))}
                >
                  <SelectTrigger className="w-24 bg-background border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border">
                    {YEAR_OPTIONS.map((y) => (
                      <SelectItem key={y} value={String(y)}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
