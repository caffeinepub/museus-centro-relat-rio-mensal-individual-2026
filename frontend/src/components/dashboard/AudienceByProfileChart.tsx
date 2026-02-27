import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface AudienceBreakdown {
  children: number;
  youth: number;
  adults: number;
  elderly: number;
  pcd: number;
}

interface Props {
  data: AudienceBreakdown;
}

export default function AudienceByProfileChart({ data }: Props) {
  const chartData = [
    { name: 'Crianças', value: data.children },
    { name: 'Jovens', value: data.youth },
    { name: 'Adultos', value: data.adults },
    { name: 'Idosos', value: data.elderly },
    { name: 'PCD', value: data.pcd },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-md px-3 py-2 shadow-md">
          <p className="text-foreground text-sm font-medium">{payload[0].payload.name}</p>
          <p className="text-primary text-sm">{payload[0].value} pessoas</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <h3 className="text-foreground font-semibold text-sm mb-4">
        Público por Perfil
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
          <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
