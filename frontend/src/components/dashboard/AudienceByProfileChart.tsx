import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { AudienceBreakdown } from '../../backend';

interface AudienceByProfileChartProps {
  data: AudienceBreakdown;
}

const COLORS = ['#1c2864', '#0d9488', '#4338ca', '#0f766e', '#6366f1'];

const LABELS: Record<string, string> = {
  children: 'Crianças',
  youth: 'Jovens',
  adults: 'Adultos',
  elderly: 'Idosos',
  pcd: 'PCD',
};

export default function AudienceByProfileChart({ data }: AudienceByProfileChartProps) {
  const chartData = Object.entries(data)
    .map(([key, value]) => ({
      name: LABELS[key] ?? key,
      value: Number(value),
    }))
    .filter(d => d.value > 0);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
        Nenhum dado disponível
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="45%"
          outerRadius={80}
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          labelLine={false}
        >
          {chartData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => [value, 'Pessoas']}
          contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
        />
        <Legend wrapperStyle={{ fontSize: 11 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
