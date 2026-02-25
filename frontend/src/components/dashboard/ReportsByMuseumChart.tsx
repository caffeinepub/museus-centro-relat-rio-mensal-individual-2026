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

interface ReportsByMuseumChartProps {
  data: Array<[string, bigint]>;
}

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

export default function ReportsByMuseumChart({ data }: ReportsByMuseumChartProps) {
  const chartData = data.map(([museum, count]) => ({
    museum: museum.length > 20 ? museum.slice(0, 20) + '…' : museum,
    fullName: museum,
    relatórios: Number(count),
  }));

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
        Nenhum dado disponível
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis
          dataKey="museum"
          tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
          angle={-35}
          textAnchor="end"
          interval={0}
        />
        <YAxis
          tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="relatórios" fill="var(--primary)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
