import React from 'react';
import { Clock, LogOut, RefreshCw, CheckCircle } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useRequestApproval } from '../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function PendingApprovalPage() {
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const requestApproval = useRequestApproval();

  const handleRequestApproval = async () => {
    try {
      await requestApproval.mutateAsync();
      toast.success('Solicitação de aprovação enviada com sucesso!');
    } catch (error) {
      toast.error('Erro ao enviar solicitação. Tente novamente.');
    }
  };

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="flex flex-col items-center gap-8 max-w-md w-full">
        <img
          src="/assets/generated/museus-centro-logo.dim_256x256.png"
          alt="Museus Centro Logo"
          className="w-24 h-24 object-contain"
        />

        <div className="w-full bg-card border border-border rounded-xl p-8 shadow-sm text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center">
              <Clock className="w-8 h-8 text-warning" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-2">Aguardando Aprovação</h1>
          <p className="text-muted-foreground mb-6">
            Sua conta está aguardando aprovação de um coordenador. Você receberá acesso ao sistema assim que sua conta for aprovada.
          </p>

          <div className="bg-muted/50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-success" />
              Próximos passos:
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Aguarde o coordenador aprovar sua conta</li>
              <li>Você pode reenviar a solicitação se necessário</li>
              <li>Entre em contato com o coordenador se precisar de ajuda</li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleRequestApproval}
              disabled={requestApproval.isPending}
              className="w-full py-2.5 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {requestApproval.isPending ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Enviando...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Reenviar Solicitação
                </>
              )}
            </button>

            <button
              onClick={handleLogout}
              className="w-full py-2.5 px-4 bg-muted text-muted-foreground rounded-lg font-medium hover:bg-muted/80 transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </div>
        </div>

        <footer className="text-center text-xs text-muted-foreground">
          <p>
            Feito com ❤️ usando{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              caffeine.ai
            </a>
          </p>
          <p className="mt-1">© {new Date().getFullYear()} Museus Centro</p>
        </footer>
      </div>
    </div>
  );
}
