import React, { useState, useMemo } from 'react';
import { Users, Loader2, AlertCircle } from 'lucide-react';
import { Month, type AudienceQueryType } from '../../backend';
import { useGetTotalGeneralAudience } from '../../hooks/useQueries';
import {
  getMonthOptions,
  formatAudienceNumber,
  getCurrentMonth,
  getCurrentYear,
} from '../../utils/labels';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

type PeriodMode = 'month' | 'cumulative' | 'custom';

const AVAILABLE_YEARS = (() => {
  const currentYear = getCurrentYear();
  const years: number[] = [];
  for (let y = 2024; y <= currentYear + 1; y++) {
    years.push(y);
  }
  return years;
})();

export default function PublicoGeralCard() {
  const [periodMode, setPeriodMode] = useState<PeriodMode>('month');

  const defaultMonth: Month = getCurrentMonth() ?? Month.february;
  const defaultYear = getCurrentYear();

  const [selectedMonth, setSelectedMonth] = useState<Month>(defaultMonth);
  const [selectedYear, setSelectedYear] = useState<number>(defaultYear);

  const [customStartMonth, setCustomStartMonth] = useState<Month>(Month.february);
  const [customStartYear, setCustomStartYear] = useState<number>(defaultYear);
  const [customEndMonth, setCustomEndMonth] = useState<Month>(defaultMonth);
  const [customEndYear, setCustomEndYear] = useState<number>(defaultYear);

  const monthOptions = getMonthOptions();

  // Always produce a non-null AudienceQueryType; default to cumulativeTotal if needed
  const queryType = useMemo<AudienceQueryType>(() => {
    if (periodMode === 'month') {
      return {
        __kind__: 'specificMonth',
        specificMonth: {
          month: selectedMonth,
          year: BigInt(selectedYear),
        },
      };
    }
    if (periodMode === 'custom') {
      return {
        __kind__: 'customRange',
        customRange: {
          startMonth: customStartMonth,
          startYear: BigInt(customStartYear),
          endMonth: customEndMonth,
          endYear: BigInt(customEndYear),
        },
      };
    }
    // 'cumulative' or fallback
    return {
      __kind__: 'cumulativeTotal',
      cumulativeTotal: null,
    };
  }, [periodMode, selectedMonth, selectedYear, customStartMonth, customStartYear, customEndMonth, customEndYear]);

  const { data: totalAudience, isLoading, isError } = useGetTotalGeneralAudience(queryType);

  const displayValue = isLoading
    ? '...'
    : isError
    ? '—'
    : totalAudience !== undefined
    ? formatAudienceNumber(totalAudience)
    : '—';

  const periodLabel =
    periodMode === 'month'
      ? 'Mês Atual'
      : periodMode === 'cumulative'
      ? 'Acumulado'
      : 'Período Customizado';

  return (
    <div className="card-section space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Users className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Público Geral</h3>
            <p className="text-xs text-muted-foreground">{periodLabel}</p>
          </div>
        </div>

        {/* Period Mode Selector */}
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          {(['month', 'cumulative', 'custom'] as PeriodMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setPeriodMode(mode)}
              className={cn(
                'px-3 py-1 rounded-md text-xs font-medium transition-all',
                periodMode === mode
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {mode === 'month' ? 'Mês' : mode === 'cumulative' ? 'Acumulado' : 'Período'}
            </button>
          ))}
        </div>
      </div>

      {/* Month/Year selectors for 'month' mode */}
      {periodMode === 'month' && (
        <div className="flex gap-2 flex-wrap">
          <Select value={selectedMonth} onValueChange={(v) => setSelectedMonth(v as Month)}>
            <SelectTrigger className="w-36 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-xs">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(Number(v))}>
            <SelectTrigger className="w-24 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AVAILABLE_YEARS.map((y) => (
                <SelectItem key={y} value={String(y)} className="text-xs">
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Custom range selectors */}
      {periodMode === 'custom' && (
        <div className="space-y-2">
          <div className="flex gap-2 flex-wrap items-center">
            <span className="text-xs text-muted-foreground w-8">De:</span>
            <Select value={customStartMonth} onValueChange={(v) => setCustomStartMonth(v as Month)}>
              <SelectTrigger className="w-32 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} className="text-xs">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={String(customStartYear)} onValueChange={(v) => setCustomStartYear(Number(v))}>
              <SelectTrigger className="w-24 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_YEARS.map((y) => (
                  <SelectItem key={y} value={String(y)} className="text-xs">
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            <span className="text-xs text-muted-foreground w-8">Até:</span>
            <Select value={customEndMonth} onValueChange={(v) => setCustomEndMonth(v as Month)}>
              <SelectTrigger className="w-32 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} className="text-xs">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={String(customEndYear)} onValueChange={(v) => setCustomEndYear(Number(v))}>
              <SelectTrigger className="w-24 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_YEARS.map((y) => (
                  <SelectItem key={y} value={String(y)} className="text-xs">
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Value Display */}
      <div className="flex items-center gap-3">
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        ) : isError ? (
          <AlertCircle className="w-5 h-5 text-destructive" />
        ) : null}
        <span className="text-3xl font-bold text-foreground tabular-nums">{displayValue}</span>
        <span className="text-sm text-muted-foreground">pessoas</span>
      </div>
    </div>
  );
}
