import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { TrendingUp } from 'lucide-react';

interface MonthlyEvolutionChartProps {
  data: Array<[string, bigint]> | undefined | null;
}

const MONTH_ORDER = [
  'february', 'march', 'april', 'may', 'june', 'july',
  'august', 'september', 'october', 'november',
];

export default function MonthlyEvolutionChart({ data }: MonthlyEvolutionChartProps) {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Evolução Mensal do Público
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
            Sem dados disponíveis
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = [...data]
    .sort(([a], [b]) => {
      const ai = MONTH_ORDER.indexOf(a.split('-')[1] ?? a);
      const bi = MONTH_ORDER.indexOf(b.split('-')[1] ?? b);
      if (ai !== -1 && bi !== -1) return ai - bi;
      return a.localeCompare(b);
    })
    .map(([month, count]) => ({
      month: getMonthLabel(month) ?? month,
      público: Number(count ?? 0),
    }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Evolução Mensal do Público
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11 }}
              className="text-muted-foreground"
            />
            <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
                fontSize: '12px',
              }}
            />
            <Bar dataKey="público" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
