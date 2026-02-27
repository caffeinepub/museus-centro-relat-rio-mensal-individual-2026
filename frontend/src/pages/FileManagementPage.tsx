import React, { useState, useRef } from 'react';
import { toast } from 'sonner';
import { Upload, Trash2, FileText, Loader2, Search, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useListFiles, useUploadFile, useDeleteFile } from '../hooks/useQueries';

interface FileAttachment {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  uploadedAt: number | bigint;
  uploader: any;
  base64Content: string;
}

export default function FileManagementPage() {
  const { data: files = [], isLoading } = useListFiles();
  const uploadFile = useUploadFile();
  const deleteFile = useDeleteFile();

  const [search, setSearch] = useState('');
  const [deletingFile, setDeletingFile] = useState<FileAttachment | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = (files as FileAttachment[]).filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const base64 = (ev.target?.result as string).split(',')[1] ?? '';
        const fileAttachment = {
          id: `file_${Date.now()}`,
          name: file.name,
          mimeType: file.type,
          size: file.size,
          uploadedAt: BigInt(Date.now()) * BigInt(1_000_000),
          uploader: null,
          base64Content: base64,
        };
        await uploadFile.mutateAsync(fileAttachment);
        toast.success(`Arquivo "${file.name}" enviado com sucesso!`);
      };
      reader.readAsDataURL(file);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao enviar arquivo';
      toast.error(message);
    }

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = async () => {
    if (!deletingFile) return;
    try {
      await deleteFile.mutateAsync(deletingFile.id);
      toast.success('Arquivo excluído com sucesso!');
      setDeletingFile(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao excluir arquivo';
      toast.error(message);
    }
  };

  const handleDownload = (file: FileAttachment) => {
    if (!file.base64Content) return;
    const link = document.createElement('a');
    link.href = `data:${file.mimeType};base64,${file.base64Content}`;
    link.download = file.name;
    link.click();
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FileText className="w-7 h-7 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Gerenciamento de Arquivos</h1>
        </div>
        <label className="cursor-pointer">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleUpload}
          />
          <Button asChild disabled={uploadFile.isPending}>
            <span>
              {uploadFile.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Upload className="w-4 h-4 mr-2" />
              )}
              Enviar Arquivo
            </span>
          </Button>
        </label>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Buscar arquivos..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          Nenhum arquivo encontrado.
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(file => (
            <Card key={file.id} className="border border-border">
              <CardContent className="flex items-center gap-3 p-4">
                <FileText className="w-8 h-8 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {file.mimeType} · {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {file.base64Content && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownload(file)}
                    >
                      <Download className="w-3 h-3" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-700 border-red-300 hover:bg-red-50"
                    onClick={() => setDeletingFile(file)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingFile} onOpenChange={open => { if (!open) setDeletingFile(null); }}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o arquivo <strong>{deletingFile?.name}</strong>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteFile.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteFile.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
