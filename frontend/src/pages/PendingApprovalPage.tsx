import React from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useRequestApproval } from '../hooks/useQueries';
import { Clock, LogOut, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function PendingApprovalPage() {
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const requestApproval = useRequestApproval();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const handleRequestApproval = async () => {
    try {
      await requestApproval.mutateAsync();
      toast.success('Solicitação de aprovação enviada! Aguarde o contato da coordenação.');
    } catch {
      toast.error('Erro ao enviar solicitação. Tente novamente.');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl p-10 w-full max-w-md shadow-xl text-center space-y-6">
        {/* Logo */}
        <img
          src="/assets/generated/museus-centro-logo.dim_256x256.png"
          alt="Museus Centro"
          className="w-20 h-20 rounded-2xl mx-auto"
        />

        {/* Icon */}
        <div className="flex justify-center">
          <div className="p-4 rounded-full bg-amber-100 dark:bg-amber-900/30">
            <Clock className="w-10 h-10 text-amber-600 dark:text-amber-400" />
          </div>
        </div>

        {/* Title & message */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Aguardando Aprovação</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Seu cadastro foi recebido com sucesso! Sua conta está aguardando a aprovação de um coordenador antes de você poder acessar o sistema.
          </p>
        </div>

        {/* Info box */}
        <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 p-4 text-left space-y-2">
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">O que acontece agora?</p>
          <ul className="text-sm text-amber-700 dark:text-amber-400 space-y-1 list-disc list-inside">
            <li>A coordenação será notificada do seu cadastro</li>
            <li>Após a aprovação, você terá acesso completo ao sistema</li>
            <li>Você pode tentar fazer login novamente após ser aprovado</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button
            variant="outline"
            onClick={handleRequestApproval}
            disabled={requestApproval.isPending}
            className="w-full"
          >
            {requestApproval.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Reenviar solicitação de aprovação
          </Button>

          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair da conta
          </Button>
        </div>

        {/* Footer */}
        <p className="text-xs text-muted-foreground">
          Em caso de dúvidas, entre em contato com a coordenação do Museus Centro.
        </p>
      </div>
    </div>
  );
}
