import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useRequestApproval } from '../hooks/useQueries';
import { Clock, LogOut, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function PendingApprovalPage() {
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const requestApproval = useRequestApproval();
  const [requested, setRequested] = useState(false);

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const handleRequestApproval = async () => {
    await requestApproval.mutateAsync();
    setRequested(true);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-2xl shadow-lg p-8 flex flex-col items-center gap-6">
          {/* Logo */}
          <img
            src="/assets/generated/museus-centro-logo.dim_256x256.png"
            alt="Museus Centro Logo"
            className="w-16 h-16 object-contain"
          />

          {/* Icon */}
          <div className="w-16 h-16 rounded-full bg-warning/20 flex items-center justify-center">
            <Clock className="w-8 h-8 text-warning-foreground" />
          </div>

          {/* Content */}
          <div className="text-center space-y-2">
            <h1 className="text-xl font-bold text-foreground">
              Aguardando Aprovação
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Sua conta está aguardando aprovação de um coordenador. Você receberá
              acesso ao sistema assim que sua solicitação for aprovada.
            </p>
          </div>

          {/* Actions */}
          <div className="w-full space-y-3">
            {!requested ? (
              <Button
                onClick={handleRequestApproval}
                disabled={requestApproval.isPending}
                className="w-full gap-2"
                variant="default"
              >
                {requestApproval.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Solicitar Aprovação
                  </>
                )}
              </Button>
            ) : (
              <div className="bg-success/10 border border-success/30 rounded-lg p-3 text-center">
                <p className="text-success text-sm font-medium">
                  ✓ Solicitação enviada com sucesso!
                </p>
              </div>
            )}

            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full gap-2 bg-card border-border text-foreground hover:bg-muted"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
