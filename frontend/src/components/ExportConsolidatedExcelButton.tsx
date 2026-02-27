import React from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppUserRole } from '../backend';
import { useAllReports, useAllActivities } from '../hooks/useQueries';
import { generateConsolidatedExcel } from '../utils/excelGenerator';

interface ExportConsolidatedExcelButtonProps {
  userRole?: AppUserRole;
}

export default function ExportConsolidatedExcelButton({ userRole }: ExportConsolidatedExcelButtonProps) {
  const { data: reports = [] } = useAllReports();
  const { data: activities = [] } = useAllActivities();

  if (userRole !== 'administration' && userRole !== 'coordination' && userRole !== 'coordinator') {
    return null;
  }

  const handleExport = () => {
    generateConsolidatedExcel(reports, activities);
  };

  return (
    <Button variant="outline" size="sm" onClick={handleExport} className="flex items-center gap-2">
      <Download className="w-4 h-4" />
      Exportar Excel Consolidado
    </Button>
  );
}
