import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { generateExcelExport } from '../utils/excelGenerator';
import { useGetAllReports, useGetAllActivities, useGetCallerUserProfile } from '../hooks/useQueries';
import { AppUserRole, Activity } from '../backend';

export default function ExportConsolidatedExcelButton() {
  const [isGenerating, setIsGenerating] = useState(false);
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: reports } = useGetAllReports();
  const { data: activities } = useGetAllActivities();

  const isAdmin = userProfile?.appRole === AppUserRole.administration;
  if (!isAdmin) return null;

  const handleExport = async () => {
    if (!reports || !activities) {
      toast.error('Dados ainda carregando. Tente novamente.');
      return;
    }
    setIsGenerating(true);
    try {
      // Build activitiesByReport map
      const activitiesByReport = new Map<string, Activity[]>();
      reports.forEach(r => activitiesByReport.set(r.id, []));
      activities.forEach(a => {
        const existing = activitiesByReport.get(a.reportId) ?? [];
        existing.push(a);
        activitiesByReport.set(a.reportId, existing);
      });

      generateExcelExport(reports, activitiesByReport);
      toast.success('Arquivo CSV gerado com sucesso! Abra no Excel.');
    } catch (err) {
      toast.error('Erro ao gerar arquivo. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button onClick={handleExport} disabled={isGenerating} className="gap-2">
      {isGenerating ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <FileSpreadsheet className="w-4 h-4" />
      )}
      Exportar Consolidado (CSV/Excel)
    </Button>
  );
}
