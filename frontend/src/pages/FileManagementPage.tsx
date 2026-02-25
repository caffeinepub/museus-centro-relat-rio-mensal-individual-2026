import React, { useRef, useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useListFiles, useUploadFile, useDeleteFile } from '../hooks/useQueries';
import { FileAttachment } from '../backend';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, Trash2, FileText, Image, File, Loader2, FolderOpen } from 'lucide-react';
import { Principal } from '@dfinity/principal';

function formatFileSize(bytes: bigint): string {
  const n = Number(bytes);
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(time: bigint): string {
  const ms = Number(time) / 1_000_000;
  return new Date(ms).toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
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

export default function FileManagementPage() {
  const { identity } = useInternetIdentity();
  const { data: files = [], isLoading, isError } = useListFiles();
  const uploadFileMutation = useUploadFile();
  const deleteFileMutation = useDeleteFile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !identity) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const reader = new FileReader();
      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          setUploadProgress(Math.round((event.loaded / event.total) * 50));
        }
      };
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1] ?? '';
        const fileId = `file-${Date.now()}-${Math.random().toString(36).slice(2)}`;

        const fileAttachment: FileAttachment = {
          id: fileId,
          name: file.name,
          mimeType: file.type || 'application/octet-stream',
          size: BigInt(file.size),
          uploadedAt: BigInt(Date.now()) * BigInt(1_000_000),
          uploader: identity.getPrincipal() as unknown as import('@dfinity/principal').Principal,
          base64Content: base64,
        };

        setUploadProgress(75);
        await uploadFileMutation.mutateAsync(fileAttachment);
        setUploadProgress(100);
        setTimeout(() => {
          setIsUploading(false);
          setUploadProgress(0);
        }, 500);
      };
      reader.onerror = () => {
        setIsUploading(false);
        setUploadProgress(0);
      };
      reader.readAsDataURL(file);
    } catch {
      setIsUploading(false);
      setUploadProgress(0);
    }

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = async (fileId: string) => {
    await deleteFileMutation.mutateAsync(fileId);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestão de Arquivos</h1>
          <p className="text-muted-foreground mt-1">
            Faça upload e gerencie arquivos para vincular a relatórios
          </p>
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="application/pdf,image/*,.doc,.docx,.xls,.xlsx,.txt"
            onChange={handleFileSelect}
            disabled={isUploading}
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || !identity}
            className="gap-2"
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {isUploading ? 'A enviar...' : 'Enviar Arquivo'}
          </Button>
        </div>
      </div>

      {isUploading && (
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>A enviar arquivo...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Arquivos ({files.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">A carregar arquivos...</span>
            </div>
          ) : isError ? (
            <div className="text-center py-12 text-destructive">
              <p>Erro ao carregar arquivos. Tente novamente.</p>
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-12">
              <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground font-medium">Nenhum arquivo encontrado</p>
              <p className="text-sm text-muted-foreground mt-1">
                Clique em "Enviar Arquivo" para adicionar o primeiro arquivo
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Tamanho</TableHead>
                    <TableHead>Data de Upload</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {files.map((file) => (
                    <TableRow key={file.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getFileIcon(file.mimeType)}
                          <span className="font-medium truncate max-w-[200px]" title={file.name}>
                            {file.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {getMimeTypeBadge(file.mimeType)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatFileSize(file.size)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(file.uploadedAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              disabled={deleteFileMutation.isPending}
                            >
                              {deleteFileMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Eliminar arquivo</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem a certeza que deseja eliminar "{file.name}"? Esta ação não pode
                                ser desfeita e removerá todas as vinculações a relatórios.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(file.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
