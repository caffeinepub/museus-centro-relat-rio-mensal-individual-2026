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
import { Building2 } from 'lucide-react';

interface ActivitiesByMuseumChartProps {
  data: Array<[string, bigint]> | undefined | null;
}

export default function ActivitiesByMuseumChart({ data }: ActivitiesByMuseumChartProps) {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Atividades por Museu
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

  const chartData = data.map(([museum, count]) => ({
    museum: museum ? (museum.length > 14 ? museum.slice(0, 14) + '…' : museum) : 'N/A',
    fullName: museum ?? 'N/A',
    atividades: Number(count ?? 0),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          Atividades por Museu
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="museum"
              tick={{ fontSize: 10 }}
              className="text-muted-foreground"
            />
            <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const item = payload[0]?.payload;
                return (
                  <div
                    style={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      fontSize: '12px',
                    }}
                  >
                    <p className="font-medium">{item?.fullName ?? ''}</p>
                    <p className="text-muted-foreground">
                      Atividades: {item?.atividades ?? 0}
                    </p>
                  </div>
                );
              }}
            />
            <Bar dataKey="atividades" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
