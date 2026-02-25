import React from 'react';
import { Month } from '../backend';
import { getMonthOptions, getCurrentYear } from '../utils/labels';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface MonthYearSelectorProps {
  selectedMonth: Month;
  selectedYear: number;
  onMonthChange: (month: Month) => void;
  onYearChange: (year: number) => void;
}

const YEAR_OPTIONS: number[] = [2024, 2025, 2026, 2027];

export default function MonthYearSelector({
  selectedMonth,
  selectedYear,
  onMonthChange,
  onYearChange,
}: MonthYearSelectorProps) {
  const monthOptions = getMonthOptions();
  const currentYear = getCurrentYear();

  // Ensure current year is always in the list
  const yearOptions = YEAR_OPTIONS.includes(currentYear)
    ? YEAR_OPTIONS
    : [...YEAR_OPTIONS, currentYear].sort((a, b) => a - b);

  return (
    <div className="flex items-center gap-2">
      <Select
        value={selectedMonth}
        onValueChange={(val) => onMonthChange(val as Month)}
      >
        <SelectTrigger className="w-36 bg-background border-border">
          <SelectValue placeholder="Mês" />
        </SelectTrigger>
        <SelectContent>
          {monthOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={String(selectedYear)}
        onValueChange={(val) => onYearChange(Number(val))}
      >
        <SelectTrigger className="w-24 bg-background border-border">
          <SelectValue placeholder="Ano" />
        </SelectTrigger>
        <SelectContent>
          {yearOptions.map((year) => (
            <SelectItem key={year} value={String(year)}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
