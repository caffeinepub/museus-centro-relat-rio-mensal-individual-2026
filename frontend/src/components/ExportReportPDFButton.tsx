import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';
import { generateReportPDF } from '../utils/pdfGenerator';
import type { Report, Activity } from '../backend';

interface ExportReportPDFButtonProps {
  report: Report;
  activities: Activity[];
}

export default function ExportReportPDFButton({ report, activities }: ExportReportPDFButtonProps) {
  const handleExport = () => {
    generateReportPDF(report, activities);
  };

  return (
    <Button variant="outline" onClick={handleExport} className="gap-2">
      <FileDown className="w-4 h-4" />
      Exportar PDF
    </Button>
  );
}
