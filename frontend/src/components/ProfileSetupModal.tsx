import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import { AppUserRole, MuseumLocation } from '../backend';
import { toast } from 'sonner';
import { User } from 'lucide-react';

export default function ProfileSetupModal() {
  const [name, setName] = useState('');
  const [appRole, setAppRole] = useState<AppUserRole>(AppUserRole.professional);
  const { mutateAsync: saveProfile, isPending } = useSaveCallerUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Por favor, informe seu nome.');
      return;
    }
    try {
      await saveProfile({ name: name.trim(), appRole, museum: MuseumLocation.equipePrincipal });
      toast.success('Perfil configurado com sucesso!');
    } catch (err) {
      toast.error('Erro ao salvar perfil. Tente novamente.');
    }
  };

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-lg">Configurar Perfil</DialogTitle>
              <DialogDescription className="text-sm">
                Bem-vindo ao Museus Centro! Configure seu perfil para continuar.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Nome Completo *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome completo"
              required
            />
          </div>

          <div className="space-y-3">
            <Label>Perfil de Acesso *</Label>
            <RadioGroup
              value={appRole}
              onValueChange={(v) => setAppRole(v as AppUserRole)}
              className="space-y-2"
            >
              <div className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value={AppUserRole.professional} id="role-professional" className="mt-0.5" />
                <label htmlFor="role-professional" className="cursor-pointer">
                  <p className="text-sm font-medium">Profissional</p>
                  <p className="text-xs text-muted-foreground">Cria e edita apenas seus próprios relatórios</p>
                </label>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value={AppUserRole.coordination} id="role-coordination" className="mt-0.5" />
                <label htmlFor="role-coordination" className="cursor-pointer">
                  <p className="text-sm font-medium">Coordenação</p>
                  <p className="text-xs text-muted-foreground">Visualiza todos os relatórios</p>
                </label>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value={AppUserRole.administration} id="role-administration" className="mt-0.5" />
                <label htmlFor="role-administration" className="cursor-pointer">
                  <p className="text-sm font-medium">Administração</p>
                  <p className="text-xs text-muted-foreground">Acesso completo e exportação consolidada</p>
                </label>
              </div>
            </RadioGroup>
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Salvando...' : 'Confirmar Perfil'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
