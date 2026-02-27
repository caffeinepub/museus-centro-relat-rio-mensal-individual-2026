import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface Props {
  planned: number;
  extra: number;
}

export default function PlannedVsAchievedChart({ planned, extra }: Props) {
  const chartData = [
    { name: 'Atividades', Planejadas: planned, Extras: extra },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-md px-3 py-2 shadow-md">
          {payload.map((p: any) => (
            <p key={p.name} className="text-foreground text-sm">
              <span style={{ color: p.fill }}>{p.name}: </span>
              {p.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <h3 className="text-foreground font-semibold text-sm mb-4">
        Atividades Planejadas vs Extras
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
          <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Bar dataKey="Planejadas" fill="var(--primary)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Extras" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
