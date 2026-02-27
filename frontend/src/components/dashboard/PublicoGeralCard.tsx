import React, { useState } from 'react';
import { Users, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { AudienceQueryType } from '../../hooks/useQueries';
import { useGetTotalGeneralAudience } from '../../hooks/useQueries';

const MODE_OPTIONS: { label: string; value: AudienceQueryType }[] = [
  { label: 'Total Acumulado', value: { __kind__: 'cumulativeTotal' } },
  {
    label: 'Mês Atual',
    value: {
      __kind__: 'specificMonth',
      month: new Date().toLocaleString('en', { month: 'long' }).toLowerCase(),
      year: new Date().getFullYear(),
    },
  },
];

export default function PublicoGeralCard() {
  const [modeIndex, setModeIndex] = useState(0);
  const queryType = MODE_OPTIONS[modeIndex].value;

  const { data, isLoading } = useGetTotalGeneralAudience(queryType);

  const total = data != null ? Number(data) : null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Users className="w-4 h-4" />
          Público Geral
        </CardTitle>
        <div className="flex gap-1">
          {MODE_OPTIONS.map((opt, idx) => (
            <Button
              key={idx}
              size="sm"
              variant={modeIndex === idx ? 'default' : 'outline'}
              className="text-xs h-6 px-2"
              onClick={() => setModeIndex(idx)}
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="text-3xl font-bold text-foreground">
            {total != null ? total.toLocaleString('pt-BR') : '—'}
          </div>
        )}
        <p className="text-xs text-muted-foreground mt-1">{MODE_OPTIONS[modeIndex].label}</p>
      </CardContent>
    </Card>
  );
}
