import React from 'react';
import type { Month } from '../types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getMonthOptions } from '../utils/labels';

interface MonthYearSelectorProps {
  selectedMonth: Month | '';
  selectedYear: number;
  onMonthChange: (month: Month | '') => void;
  onYearChange: (year: number) => void;
}

const currentYear = new Date().getFullYear();
const yearOptions = Array.from(new Set([2024, 2025, 2026, 2027, currentYear])).sort();

export default function MonthYearSelector({
  selectedMonth,
  selectedYear,
  onMonthChange,
  onYearChange,
}: MonthYearSelectorProps) {
  const monthOptions = getMonthOptions();

  return (
    <div className="flex gap-2">
      <Select
        value={selectedMonth}
        onValueChange={(v) => onMonthChange(v as Month | '')}
      >
        <SelectTrigger className="w-40 bg-white">
          <SelectValue placeholder="Mês" />
        </SelectTrigger>
        <SelectContent className="bg-white">
          {monthOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={String(selectedYear)}
        onValueChange={(v) => onYearChange(Number(v))}
      >
        <SelectTrigger className="w-28 bg-white">
          <SelectValue placeholder="Ano" />
        </SelectTrigger>
        <SelectContent className="bg-white">
          {yearOptions.map((y) => (
            <SelectItem key={y} value={String(y)}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
