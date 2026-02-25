import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AudienceBreakdown } from '../../backend';
import { Users } from 'lucide-react';

interface AudienceByProfileChartProps {
  data: AudienceBreakdown | undefined | null;
}

const COLORS = ['#4f86c6', '#6abf69', '#f5a623', '#e05c5c', '#9b59b6'];

const LABELS: Record<string, string> = {
  children: 'Crianças',
  youth: 'Jovens',
  adults: 'Adultos',
  elderly: 'Idosos',
  pcd: 'PCD',
};

export default function AudienceByProfileChart({ data }: AudienceByProfileChartProps) {
  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" />
            Público por Perfil
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
            Nenhum dado de público disponível
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = [
    { name: LABELS.children, value: Number(data.children ?? 0) },
    { name: LABELS.youth, value: Number(data.youth ?? 0) },
    { name: LABELS.adults, value: Number(data.adults ?? 0) },
    { name: LABELS.elderly, value: Number(data.elderly ?? 0) },
    { name: LABELS.pcd, value: Number(data.pcd ?? 0) },
  ].filter((item) => item.value > 0);

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" />
            Público por Perfil
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
            Nenhum dado de público disponível
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Users className="h-4 w-4" />
          Público por Perfil
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
                fontSize: '12px',
              }}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: '11px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
