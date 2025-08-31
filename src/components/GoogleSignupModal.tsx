import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Ruler, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface GoogleSignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  googleUser: any;
}

export const GoogleSignupModal: React.FC<GoogleSignupModalProps> = ({
  isOpen,
  onClose,
  googleUser
}) => {
  const [formData, setFormData] = useState({
    birthDate: '',
    height: '',
    gender: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Resetar formulário quando modal abrir
  useEffect(() => {
    if (isOpen) {
      setFormData({
        birthDate: '',
        height: '',
        gender: ''
      });
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    // Validar campos obrigatórios com mensagens específicas
    if (!formData.birthDate) {
      toast({
        title: "Data de nascimento obrigatória",
        description: "Selecione sua data de nascimento",
        variant: "destructive"
      });
      return;
    }

    if (!formData.height?.trim()) {
      toast({
        title: "Altura obrigatória",
        description: "Digite sua altura em centímetros",
        variant: "destructive"
      });
      return;
    }

    if (!formData.gender) {
      toast({
        title: "Gênero obrigatório",
        description: "Selecione seu gênero",
        variant: "destructive"
      });
      return;
    }

    // Validar altura
    const height = parseFloat(formData.height);
    if (isNaN(height) || height < 100 || height > 250) {
      toast({
        title: "Altura inválida",
        description: "A altura deve estar entre 100cm e 250cm",
        variant: "destructive"
      });
      return;
    }

    // Validar data de nascimento
    const birthDate = new Date(formData.birthDate);
    const today = new Date();
    
    // Verificar se a data é válida
    if (isNaN(birthDate.getTime())) {
      toast({
        title: "Data de nascimento inválida",
        description: "Selecione uma data válida",
        variant: "destructive"
      });
      return;
    }

    // Verificar se não é data futura
    if (birthDate > today) {
      toast({
        title: "Data de nascimento inválida",
        description: "A data de nascimento não pode ser no futuro",
        variant: "destructive"
      });
      return;
    }

    const age = today.getFullYear() - birthDate.getFullYear();
    if (age < 13) {
      toast({
        title: "Idade mínima não atingida",
        description: "Você deve ter pelo menos 13 anos para usar o sistema",
        variant: "destructive"
      });
      return;
    }

    if (age > 120) {
      toast({
        title: "Idade inválida",
        description: "Verifique se a data de nascimento está correta",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Atualizar perfil
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          birth_date: formData.birthDate,
          height: height,
          gender: formData.gender,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', googleUser.id);

      if (profileError) {
        console.error('Erro ao atualizar perfil:', profileError);
        
        // Mensagens de erro específicas para problemas de perfil
        let errorMessage = "Erro ao salvar dados";
        let errorDescription = "Tente novamente";

        switch (profileError.code) {
          case '23505': // Unique violation
            errorMessage = "Dados já existem";
            errorDescription = "Seus dados já foram salvos anteriormente.";
            break;
          case '23503': // Foreign key violation
            errorMessage = "Usuário não encontrado";
            errorDescription = "Erro na identificação do usuário. Tente fazer login novamente.";
            break;
          case '42P01': // Table doesn't exist
            errorMessage = "Erro do sistema";
            errorDescription = "Problema técnico. Entre em contato com o suporte.";
            break;
          default:
            errorDescription = profileError.message || "Erro ao salvar dados complementares.";
        }

        toast({
          title: errorMessage,
          description: errorDescription,
          variant: "destructive"
        });
        return;
      }

      // Criar dados físicos
      const { error: physicalError } = await supabase
        .from('user_physical_data')
        .insert({
          user_id: googleUser.id,
          altura_cm: height,
          idade: age,
          sexo: formData.gender,
          nivel_atividade: 'moderado'
        });

      if (physicalError) {
        console.error('Erro ao criar dados físicos:', physicalError);
        
        // Não bloquear o fluxo se os dados físicos falharem
        toast({
          title: "Aviso",
          description: "Perfil salvo, mas alguns dados complementares não puderam ser salvos",
          variant: "default"
        });
      } else {
        toast({
          title: "Perfil completo!",
          description: "Seus dados foram salvos com sucesso",
        });
      }

      onClose();
      
      // Emitir evento para mostrar modal de escolha
      const event = new CustomEvent('showAuthChoice', {
        detail: {
          userName: googleUser?.full_name || 'Usuário'
        }
      });
      window.dispatchEvent(event);

    } catch (error) {
      console.error('Erro geral:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um problema ao salvar seus dados. Tente novamente ou entre em contato com o suporte.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Complete seu perfil
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Olá <strong>{googleUser?.full_name}</strong>! Para personalizar sua experiência, 
            precisamos de algumas informações adicionais.
          </div>

          <div className="space-y-4">
            {/* Data de Nascimento */}
            <div className="space-y-2">
              <Label htmlFor="birth-date" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Data de Nascimento *
              </Label>
              <Input
                id="birth-date"
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                className="h-12"
                required
              />
            </div>

            {/* Altura */}
            <div className="space-y-2">
              <Label htmlFor="height" className="flex items-center gap-2">
                <Ruler className="h-4 w-4" />
                Altura (cm) *
              </Label>
              <Input
                id="height"
                type="number"
                placeholder="175"
                min="100"
                max="250"
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                className="h-12"
                required
              />
            </div>

            {/* Gênero - Versão simplificada */}
            <div className="space-y-2">
              <Label htmlFor="gender" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Gênero *
              </Label>
              <select
                id="gender"
                value={formData.gender}
                onChange={(e) => {
                  console.log('🎯 Gênero selecionado:', e.target.value);
                  setFormData({ ...formData, gender: e.target.value });
                }}
                className="w-full h-12 px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                required
              >
                <option value="">Selecione seu gênero</option>
                <option value="masculino">Masculino</option>
                <option value="feminino">Feminino</option>
                <option value="outro">Outro</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              Pular
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin" />
                  Salvando...
                </div>
              ) : (
                "Salvar e Continuar"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
