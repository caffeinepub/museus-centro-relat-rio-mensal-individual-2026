import React, { useState, useMemo } from 'react';
import { Users, Loader2, AlertCircle } from 'lucide-react';
import { Month, type AudienceQueryType } from '../../backend';
import { useGetTotalGeneralAudience } from '../../hooks/useQueries';
import {
  getMonthOptions,
  formatAudienceNumber,
  getCurrentMonth,
  getCurrentYear,
  MONTHS,
  getMonthLabel,
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

  const defaultMonth = getCurrentMonth() ?? Month.february;
  const defaultYear = getCurrentYear();

  const [selectedMonth, setSelectedMonth] = useState<Month>(defaultMonth);
  const [selectedYear, setSelectedYear] = useState<number>(defaultYear);

  const [customStartMonth, setCustomStartMonth] = useState<Month>(Month.february);
  const [customStartYear, setCustomStartYear] = useState<number>(defaultYear);
  const [customEndMonth, setCustomEndMonth] = useState<Month>(defaultMonth);
  const [customEndYear, setCustomEndYear] = useState<number>(defaultYear);

  const monthOptions = getMonthOptions();

  const queryType = useMemo<AudienceQueryType | null>(() => {
    if (periodMode === 'month') {
      return {
        __kind__: 'specificMonth',
        specificMonth: {
          month: selectedMonth,
          year: BigInt(selectedYear),
        },
      };
    }
    if (periodMode === 'cumulative') {
      return {
        __kind__: 'cumulativeTotal',
        cumulativeTotal: null,
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
    return null;
  }, [periodMode, selectedMonth, selectedYear, customStartMonth, customStartYear, customEndMonth, customEndYear]);

  const { data: totalAudience, isLoading, isError } = useGetTotalGeneralAudience(queryType);

  const displayValue = isLoading
    ? '...'
    : isError
    ? '—'
    : totalAudience !== undefined
    ? formatAudienceNumber(totalAudience)
    : '0';

  const periodLabel = useMemo(() => {
    if (periodMode === 'month') {
      return `${getMonthLabel(selectedMonth)} ${selectedYear}`;
    }
    if (periodMode === 'cumulative') {
      return 'Total acumulado';
    }
    if (periodMode === 'custom') {
      return `${getMonthLabel(customStartMonth)} ${customStartYear} – ${getMonthLabel(customEndMonth)} ${customEndYear}`;
    }
    return '';
  }, [periodMode, selectedMonth, selectedYear, customStartMonth, customStartYear, customEndMonth, customEndYear]);

  return (
    <div className="rounded-xl border border-border bg-card p-5 col-span-2 lg:col-span-4 transition-shadow hover:shadow-sm">
      {/* Card header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-primary/10 text-primary">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Público Geral</p>
            <p className="text-xs text-muted-foreground">{periodLabel}</p>
          </div>
        </div>

        {/* Period mode selector */}
        <div className="flex flex-wrap gap-1.5">
          {(['month', 'cumulative', 'custom'] as PeriodMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setPeriodMode(mode)}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-medium transition-colors border',
                periodMode === mode
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-transparent text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
              )}
            >
              {mode === 'month' ? 'Mês Atual' : mode === 'cumulative' ? 'Acumulado' : 'Período Customizado'}
            </button>
          ))}
        </div>
      </div>

      {/* Value display */}
      <div className="flex items-center gap-3 mb-4">
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        ) : isError ? (
          <AlertCircle className="w-5 h-5 text-destructive" />
        ) : null}
        <p className={cn('text-3xl font-bold leading-none', isError ? 'text-destructive' : 'text-foreground')}>
          {displayValue}
        </p>
        {isError && (
          <span className="text-xs text-destructive">Erro ao carregar</span>
        )}
      </div>

      {/* Month selector (mode = 'month') */}
      {periodMode === 'month' && (
        <div className="flex flex-wrap gap-2">
          <Select value={selectedMonth} onValueChange={(v) => setSelectedMonth(v as Month)}>
            <SelectTrigger className="w-36 h-8 text-xs">
              <SelectValue placeholder="Mês" />
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
              <SelectValue placeholder="Ano" />
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

      {/* Custom range selectors (mode = 'custom') */}
      {periodMode === 'custom' && (
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground whitespace-nowrap">De:</span>
            <Select value={customStartMonth} onValueChange={(v) => setCustomStartMonth(v as Month)}>
              <SelectTrigger className="w-32 h-8 text-xs">
                <SelectValue placeholder="Mês" />
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
                <SelectValue placeholder="Ano" />
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

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground whitespace-nowrap">Até:</span>
            <Select value={customEndMonth} onValueChange={(v) => setCustomEndMonth(v as Month)}>
              <SelectTrigger className="w-32 h-8 text-xs">
                <SelectValue placeholder="Mês" />
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
                <SelectValue placeholder="Ano" />
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
    </div>
  );
}
