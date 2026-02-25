import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ActivitiesByMuseumChartProps {
  data: Array<[string, bigint]>;
}

const COLORS = ['#1c2864', '#0d9488', '#4338ca', '#0f766e', '#3730a3', '#115e59'];

export default function ActivitiesByMuseumChart({ data }: ActivitiesByMuseumChartProps) {
  const chartData = data.map(([museum, count]) => ({
    museum: museum.length > 20 ? museum.substring(0, 20) + '…' : museum,
    fullName: museum,
    atividades: Number(count),
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
      <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis
          dataKey="museum"
          tick={{ fontSize: 11, fill: '#64748b' }}
          angle={-30}
          textAnchor="end"
          interval={0}
        />
        <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
        <Tooltip
          formatter={(value: number) => [value, 'Atividades']}
          labelFormatter={(label: string, payload: any[]) => payload?.[0]?.payload?.fullName ?? label}
          contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
        />
        <Bar dataKey="atividades" radius={[4, 4, 0, 0]}>
          {chartData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
