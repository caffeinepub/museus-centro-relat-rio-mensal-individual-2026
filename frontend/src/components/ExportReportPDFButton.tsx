import React from 'react';
import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Report, Activity } from '../types';
import { generateReportPDF } from '../utils/pdfGenerator';

interface ExportReportPDFButtonProps {
  report: Report;
  activities: Activity[];
}

export default function ExportReportPDFButton({ report, activities }: ExportReportPDFButtonProps) {
  const handleExport = () => {
    generateReportPDF(report, activities);
  };

  return (
    <Button variant="outline" size="sm" onClick={handleExport} className="flex items-center gap-2">
      <FileText className="w-4 h-4" />
      Exportar PDF
    </Button>
  );
}
