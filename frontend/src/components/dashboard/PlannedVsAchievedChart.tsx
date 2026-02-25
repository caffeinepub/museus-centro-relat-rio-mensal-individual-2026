import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Activity } from '../../backend';
import { Classification } from '../../backend';

interface PlannedVsAchievedChartProps {
  activities: Activity[];
}

export default function PlannedVsAchievedChart({ activities }: PlannedVsAchievedChartProps) {
  const goalActivities = activities.filter(a => a.classification === Classification.goalLinked);

  const chartData = goalActivities
    .filter(a => a.quantitativeGoal !== undefined && a.quantitativeGoal !== null)
    .map(a => ({
      name: a.goalNumber !== undefined ? `Meta ${String(a.goalNumber)}` : a.activityName.substring(0, 15),
      fullName: a.activityName,
      Previsto: Number(a.quantitativeGoal ?? 0),
      Alcançado: Number(a.achievedResult ?? 0),
    }));

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
        Nenhuma atividade vinculada a metas
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
        <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
        <Tooltip
          labelFormatter={(label: string, payload: any[]) => payload?.[0]?.payload?.fullName ?? label}
          contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
        />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Bar dataKey="Previsto" fill="#1c2864" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Alcançado" fill="#0d9488" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
