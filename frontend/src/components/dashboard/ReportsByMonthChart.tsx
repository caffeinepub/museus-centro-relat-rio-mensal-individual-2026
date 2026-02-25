import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { getMonthLabel } from '../../utils/labels';

interface ReportsByMonthChartProps {
  data: Array<[string, bigint]>;
}

const MONTH_ORDER = [
  'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november',
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '8px 12px',
          color: 'var(--foreground)',
        }}
      >
        <p className="font-medium text-sm">{label}</p>
        <p className="text-sm text-muted-foreground">
          Relatórios: <span className="font-semibold text-foreground">{payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function ReportsByMonthChart({ data }: ReportsByMonthChartProps) {
  const chartData = data
    .map(([month, count]) => ({
      month: getMonthLabel(month),
      monthKey: month,
      relatórios: Number(count),
    }))
    .sort((a, b) => {
      const ai = MONTH_ORDER.indexOf(a.monthKey);
      const bi = MONTH_ORDER.indexOf(b.monthKey);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    });

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
        Nenhum dado disponível
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
        />
        <YAxis
          tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="relatórios" fill="var(--secondary)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
