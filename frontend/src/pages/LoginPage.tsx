import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Building2, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const { login, loginStatus } = useInternetIdentity();
  const isLoggingIn = loginStatus === 'logging-in';

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-2xl shadow-lg p-8 flex flex-col items-center gap-6">
          {/* Logo */}
          <div className="flex flex-col items-center gap-3">
            <img
              src="/assets/generated/museus-centro-logo.dim_256x256.png"
              alt="Museus Centro Logo"
              className="w-20 h-20 object-contain"
            />
            <div className="text-center">
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                Museus Centro
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Sistema de Relatórios
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-border" />

          {/* Login section */}
          <div className="w-full flex flex-col items-center gap-4">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-foreground">
                Bem-vindo
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                Faça login para acessar o sistema
              </p>
            </div>

            <Button
              onClick={() => login()}
              disabled={isLoggingIn}
              className="w-full gap-2"
              size="lg"
            >
              {isLoggingIn ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Entrar
                </>
              )}
            </Button>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-muted-foreground">
            <p>Acesso seguro via Internet Identity</p>
          </div>
        </div>

        {/* Attribution */}
        <div className="mt-6 text-center text-xs text-muted-foreground">
          <p>
            Built with ❤️ using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
