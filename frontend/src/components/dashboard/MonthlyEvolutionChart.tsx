import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface MonthlyEvolutionChartProps {
  data: Array<[string, bigint]>;
}

const MONTH_LABELS: Record<string, string> = {
  '2026-02': 'Fev',
  '2026-03': 'Mar',
  '2026-04': 'Abr',
  '2026-05': 'Mai',
  '2026-06': 'Jun',
  '2026-07': 'Jul',
  '2026-08': 'Ago',
  '2026-09': 'Set',
  '2026-10': 'Out',
  '2026-11': 'Nov',
};

export default function MonthlyEvolutionChart({ data }: MonthlyEvolutionChartProps) {
  const sorted = [...data].sort((a, b) => a[0].localeCompare(b[0]));
  const chartData = sorted.map(([month, audience]) => ({
    month: MONTH_LABELS[month] ?? month,
    público: Number(audience),
  }));

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
        Nenhum dado disponível
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
        <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
        />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Line
          type="monotone"
          dataKey="público"
          stroke="#0d9488"
          strokeWidth={2}
          dot={{ r: 4, fill: '#0d9488' }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
