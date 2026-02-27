import React, { useState } from 'react';
import { useReportFiles, useLinkFileToReport, useUnlinkFileFromReport, useListFiles } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Paperclip, Link, Unlink, Loader2, FileText } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface FileAttachment {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  uploadedAt: number | bigint;
  uploader: any;
  base64Content: string;
}

interface ReportFilesSectionProps {
  reportId: string;
}

export default function ReportFilesSection({ reportId }: ReportFilesSectionProps) {
  const { data: reportFiles = [], isLoading: reportFilesLoading } = useReportFiles(reportId);
  const { data: allFiles = [], isLoading: allFilesLoading } = useListFiles();
  const linkFile = useLinkFileToReport();
  const unlinkFile = useUnlinkFileFromReport();

  const [showLinkDialog, setShowLinkDialog] = useState(false);

  const reportFileIds = new Set((reportFiles as FileAttachment[]).map(f => f.id));
  const availableFiles = (allFiles as FileAttachment[]).filter(f => !reportFileIds.has(f.id));

  const handleLink = async (fileId: string) => {
    try {
      await linkFile.mutateAsync({ reportId, fileId });
    } catch {
      // silently fail
    }
  };

  const handleUnlink = async (fileId: string) => {
    try {
      await unlinkFile.mutateAsync({ reportId, fileId });
    } catch {
      // silently fail
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Paperclip className="w-4 h-4" />
          Arquivos Vinculados
        </CardTitle>
        <Button size="sm" variant="outline" onClick={() => setShowLinkDialog(true)}>
          <Link className="w-3 h-3 mr-1" />
          Vincular
        </Button>
      </CardHeader>
      <CardContent>
        {reportFilesLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : (reportFiles as FileAttachment[]).length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhum arquivo vinculado.
          </p>
        ) : (
          <div className="space-y-2">
            {(reportFiles as FileAttachment[]).map(file => (
              <div key={file.id} className="flex items-center gap-2 p-2 bg-muted/30 rounded text-sm">
                <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="flex-1 truncate">{file.name}</span>
                <span className="text-muted-foreground text-xs">
                  {(file.size / 1024).toFixed(1)} KB
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleUnlink(file.id)}
                  disabled={unlinkFile.isPending}
                >
                  <Unlink className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Link Dialog */}
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Vincular Arquivo ao Relatório</DialogTitle>
            <DialogDescription>
              Selecione um arquivo para vincular a este relatório.
            </DialogDescription>
          </DialogHeader>
          {allFilesLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          ) : availableFiles.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum arquivo disponível para vincular.
            </p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {availableFiles.map(file => (
                <div key={file.id} className="flex items-center gap-2 p-2 border border-border rounded text-sm">
                  <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="flex-1 truncate">{file.name}</span>
                  <Button
                    size="sm"
                    onClick={() => handleLink(file.id)}
                    disabled={linkFile.isPending}
                  >
                    {linkFile.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Link className="w-3 h-3" />}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
