import { useState } from 'react';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import { AppUserRole, TeamLocation } from '../backend';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ProfileSetupModalProps {
  onComplete: () => void;
}

const TEAM_OPTIONS = [
  { value: TeamLocation.comunicacao, label: 'Comunicação' },
  { value: TeamLocation.administracao, label: 'Administração' },
  { value: TeamLocation.mhab, label: 'MHAB' },
  { value: TeamLocation.mumo, label: 'MUMO' },
  { value: TeamLocation.mis, label: 'MIS' },
];

export default function ProfileSetupModal({ onComplete }: ProfileSetupModalProps) {
  const [name, setName] = useState('');
  const [team, setTeam] = useState<TeamLocation | ''>('');
  const saveProfile = useSaveCallerUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !team) return;

    await saveProfile.mutateAsync({
      name: name.trim(),
      appRole: AppUserRole.professional,
      team: team as TeamLocation,
    });
    onComplete();
  };

  return (
    <Dialog open={true}>
      <DialogContent className="bg-card border border-border sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-foreground">Configurar Perfil</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Bem-vindo! Por favor, configure seu perfil para continuar.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground">
              Nome Completo
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome completo"
              required
              className="bg-background border-input text-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="team" className="text-foreground">
              Equipe Principal
            </Label>
            <Select
              value={team}
              onValueChange={(val) => setTeam(val as TeamLocation)}
            >
              <SelectTrigger className="bg-background border-input text-foreground">
                <SelectValue placeholder="Selecione sua equipe" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {TEAM_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} className="text-foreground">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={!name.trim() || !team || saveProfile.isPending}
          >
            {saveProfile.isPending ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                Salvando...
              </span>
            ) : (
              'Salvar Perfil'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
