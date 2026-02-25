import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { LogIn, Loader2, Building2 } from 'lucide-react';

export default function LoginPage() {
  const { login, loginStatus, isInitializing } = useInternetIdentity();
  const isLoggingIn = loginStatus === 'logging-in';

  return (
    <div className="min-h-screen bg-gradient-to-br from-[oklch(0.22_0.07_258)] to-[oklch(0.18_0.05_255)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header band */}
          <div className="bg-gradient-to-r from-[oklch(0.28_0.08_255)] to-[oklch(0.55_0.12_195)] px-8 py-8 text-white text-center">
            <div className="flex justify-center mb-4">
              <img
                src="/assets/generated/museus-centro-logo.dim_256x256.png"
                alt="Museus Centro"
                className="w-20 h-20 rounded-xl object-cover shadow-lg"
              />
            </div>
            <h1 className="text-xl font-bold font-display leading-tight">
              Museus Centro
            </h1>
            <p className="text-sm text-white/80 mt-1">
              Relatório Mensal Individual 2026
            </p>
          </div>

          {/* Body */}
          <div className="px-8 py-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Building2 className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wider">
                  Chamamento Público FMC nº 001/2024
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Sistema interno para registro e acompanhamento de atividades do Projeto Museus Centro.
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={login}
                disabled={isLoggingIn || isInitializing}
                className="w-full h-11 text-sm font-semibold gap-2"
                size="lg"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    Entrar no Sistema
                  </>
                )}
              </Button>
            </div>

            <div className="border-t border-border pt-4 text-center">
              <p className="text-xs text-muted-foreground">
                Acesso restrito a profissionais autorizados do Projeto Museus Centro.
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-white/40 mt-6">
          © {new Date().getFullYear()} Museus Centro &nbsp;|&nbsp; Feito com ❤️ usando{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || 'museus-centro-2026')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-white/70"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}
