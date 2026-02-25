import React, { useState } from 'react';
import {
  useFilesForReport,
  useListFiles,
  useLinkFileToReport,
  useUnlinkFileFromReport,
} from '../hooks/useQueries';
import { FileAttachment } from '../backend';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Paperclip,
  Plus,
  Trash2,
  FileText,
  Image,
  File,
  Loader2,
  FolderOpen,
} from 'lucide-react';

interface ReportFilesSectionProps {
  reportId: string;
  canEdit?: boolean;
}

function formatFileSize(bytes: bigint): string {
  const n = Number(bytes);
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return <Image className="h-4 w-4 text-blue-500" />;
  if (mimeType === 'application/pdf') return <FileText className="h-4 w-4 text-red-500" />;
  return <File className="h-4 w-4 text-muted-foreground" />;
}

function getMimeTypeBadge(mimeType: string): string {
  if (mimeType.startsWith('image/')) return mimeType.replace('image/', '').toUpperCase();
  if (mimeType === 'application/pdf') return 'PDF';
  if (mimeType.includes('word')) return 'DOCX';
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'XLSX';
  return mimeType.split('/')[1]?.toUpperCase() ?? 'FILE';
}

export default function ReportFilesSection({ reportId, canEdit = true }: ReportFilesSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: linkedFiles = [], isLoading: linkedLoading } = useFilesForReport(reportId);
  const { data: allFiles = [], isLoading: allFilesLoading } = useListFiles();
  const linkMutation = useLinkFileToReport();
  const unlinkMutation = useUnlinkFileFromReport();

  const linkedFileIds = new Set(linkedFiles.map((f) => f.id));

  const handleToggleLink = async (file: FileAttachment) => {
    if (linkedFileIds.has(file.id)) {
      await unlinkMutation.mutateAsync({ fileId: file.id, reportId });
    } else {
      await linkMutation.mutateAsync({ fileId: file.id, reportId });
    }
  };

  const handleUnlink = async (fileId: string) => {
    await unlinkMutation.mutateAsync({ fileId, reportId });
  };

  const isMutating = linkMutation.isPending || unlinkMutation.isPending;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Paperclip className="h-4 w-4" />
            Arquivos Vinculados
            {linkedFiles.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {linkedFiles.length}
              </Badge>
            )}
          </CardTitle>
          {canEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className="gap-1"
            >
              <Plus className="h-3 w-3" />
              Adicionar Arquivos
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {linkedLoading ? (
          <div className="flex items-center gap-2 py-4 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">A carregar arquivos...</span>
          </div>
        ) : linkedFiles.length === 0 ? (
          <div className="text-center py-6">
            <FolderOpen className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Nenhum arquivo vinculado</p>
            {canEdit && (
              <p className="text-xs text-muted-foreground mt-1">
                Clique em "Adicionar Arquivos" para vincular arquivos a este relatório
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {linkedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-2 rounded-md border border-border bg-muted/30"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {getFileIcon(file.mimeType)}
                  <span className="text-sm font-medium truncate" title={file.name}>
                    {file.name}
                  </span>
                  <Badge variant="outline" className="text-xs shrink-0">
                    {getMimeTypeBadge(file.mimeType)}
                  </Badge>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {formatFileSize(file.size)}
                  </span>
                </div>
                {canEdit && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                    onClick={() => handleUnlink(file.id)}
                    disabled={isMutating}
                  >
                    {unlinkMutation.isPending ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Trash2 className="h-3 w-3" />
                    )}
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* File Linking Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Vincular Arquivos ao Relatório</DialogTitle>
            <DialogDescription>
              Selecione os arquivos que deseja vincular a este relatório.
            </DialogDescription>
          </DialogHeader>
          <Separator />
          <div className="max-h-80 overflow-y-auto space-y-2 py-2">
            {allFilesLoading ? (
              <div className="flex items-center gap-2 py-4 text-muted-foreground justify-center">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">A carregar arquivos...</span>
              </div>
            ) : allFiles.length === 0 ? (
              <div className="text-center py-6">
                <FolderOpen className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Nenhum arquivo disponível</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Vá à página de Gestão de Arquivos para fazer upload de arquivos
                </p>
              </div>
            ) : (
              allFiles.map((file) => {
                const isLinked = linkedFileIds.has(file.id);
                return (
                  <div
                    key={file.id}
                    className={`flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-colors ${
                      isLinked
                        ? 'border-primary/50 bg-primary/5'
                        : 'border-border hover:bg-muted/50'
                    }`}
                    onClick={() => !isMutating && handleToggleLink(file)}
                  >
                    <Checkbox
                      checked={isLinked}
                      disabled={isMutating}
                      onCheckedChange={() => !isMutating && handleToggleLink(file)}
                    />
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {getFileIcon(file.mimeType)}
                      <span className="text-sm font-medium truncate" title={file.name}>
                        {file.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="outline" className="text-xs">
                        {getMimeTypeBadge(file.mimeType)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </span>
                    </div>
                    {isMutating && <Loader2 className="h-3 w-3 animate-spin shrink-0" />}
                  </div>
                );
              })
            )}
          </div>
          <Separator />
          <div className="flex justify-end">
            <Button onClick={() => setIsModalOpen(false)}>Fechar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
