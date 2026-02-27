import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface Props {
  data: [string, number][];
}

const MONTH_ORDER = [
  'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november',
];

const MONTH_LABELS: Record<string, string> = {
  february: 'Fev', march: 'Mar', april: 'Abr', may: 'Mai',
  june: 'Jun', july: 'Jul', august: 'Ago', september: 'Set',
  october: 'Out', november: 'Nov',
};

export default function MonthlyEvolutionChart({ data }: Props) {
  const sorted = [...data].sort(
    (a, b) => MONTH_ORDER.indexOf(a[0]) - MONTH_ORDER.indexOf(b[0])
  );

  const chartData = sorted.map(([month, count]) => ({
    name: MONTH_LABELS[month] ?? month,
    count,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-md px-3 py-2 shadow-md">
          <p className="text-foreground text-sm font-medium">{label}</p>
          <p className="text-primary text-sm">{payload[0].value} atividades</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <h3 className="text-foreground font-semibold text-sm mb-4">
        Evolução Mensal de Atividades
      </h3>
      {chartData.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
          Sem dados disponíveis
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="count"
              stroke="var(--primary)"
              strokeWidth={2}
              dot={{ fill: 'var(--primary)', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
