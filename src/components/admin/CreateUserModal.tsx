import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  UserPlus, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Ruler,
  Save,
  X
} from 'lucide-react';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: () => void;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({
  isOpen,
  onClose,
  onUserCreated
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Dados básicos
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    
    // Dados pessoais
    birth_date: '',
    city: '',
    state: '',
    bio: '',
    
    // Dados físicos
    altura_cm: '',
    sexo: '',
    nivel_atividade: 'moderado'
  });

  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    // Validar campos obrigatórios com mensagens específicas
    if (!formData.full_name?.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Digite o nome completo do usuário",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.email?.trim()) {
      toast({
        title: "Email obrigatório",
        description: "Digite o endereço de email do usuário",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.password?.trim()) {
      toast({
        title: "Senha obrigatória",
        description: "Crie uma senha para o usuário",
        variant: "destructive",
      });
      return false;
    }

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Email inválido",
        description: "Digite um email válido (exemplo: usuario@email.com)",
        variant: "destructive",
      });
      return false;
    }

    // Validar senha
    if (formData.password.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 6 caracteres",
        variant: "destructive",
      });
      return false;
    }

    // Validar confirmação de senha
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Senhas não coincidem",
        description: "A senha e a confirmação devem ser iguais",
        variant: "destructive",
      });
      return false;
    }

    // Validar altura se fornecida
    if (formData.altura_cm?.trim()) {
      const height = parseInt(formData.altura_cm);
      if (isNaN(height) || height < 100 || height > 250) {
        toast({
          title: "Altura inválida",
          description: "A altura deve estar entre 100cm e 250cm",
          variant: "destructive",
        });
        return false;
      }
    }

    // Validar data de nascimento se fornecida
    if (formData.birth_date) {
      const birthDate = new Date(formData.birth_date);
      
      // Verificar se a data é válida
      if (isNaN(birthDate.getTime())) {
        toast({
          title: "Data de nascimento inválida",
          description: "Selecione uma data válida",
          variant: "destructive",
        });
        return false;
      }

      // Verificar se não é data futura
      const today = new Date();
      if (birthDate > today) {
        toast({
          title: "Data de nascimento inválida",
          description: "A data de nascimento não pode ser no futuro",
          variant: "destructive",
        });
        return false;
      }

      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 13) {
        toast({
          title: "Idade mínima não atingida",
          description: "O usuário deve ter pelo menos 13 anos",
          variant: "destructive",
        });
        return false;
      }

      if (age > 120) {
        toast({
          title: "Idade inválida",
          description: "Verifique se a data de nascimento está correta",
          variant: "destructive",
        });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      // Calcular idade se data de nascimento fornecida
      const age = formData.birth_date 
        ? new Date().getFullYear() - new Date(formData.birth_date).getFullYear()
        : null;

      // Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.full_name,
            phone: formData.phone,
            birth_date: formData.birth_date,
            city: formData.city,
            state: formData.state,
          }
        }
      });

      if (authError) {
        console.error('Auth error:', authError);
        
        // Mensagens de erro específicas para criação de usuário
        let errorMessage = "Erro na criação do usuário";
        let errorDescription = "Tente novamente";

        switch (authError.message) {
          case "User already registered":
            errorMessage = "Usuário já cadastrado";
            errorDescription = "Este email já está em uso. Use outro email ou verifique se o usuário já existe.";
            break;
          case "Password should be at least 6 characters":
            errorMessage = "Senha muito curta";
            errorDescription = "A senha deve ter pelo menos 6 caracteres.";
            break;
          case "Invalid email":
            errorMessage = "Email inválido";
            errorDescription = "Digite um email válido (exemplo: usuario@email.com).";
            break;
          case "Unable to validate email address: invalid format":
            errorMessage = "Formato de email inválido";
            errorDescription = "Verifique se o email está escrito corretamente.";
            break;
          case "Signup is disabled":
            errorMessage = "Cadastro temporariamente indisponível";
            errorDescription = "Tente novamente em alguns minutos.";
            break;
          case "Too many requests":
            errorMessage = "Muitas tentativas";
            errorDescription = "Aguarde alguns minutos antes de tentar novamente.";
            break;
          default:
            errorDescription = authError.message || "Erro inesperado. Tente novamente.";
        }

        toast({
          title: errorMessage,
          description: errorDescription,
          variant: "destructive",
        });
        return;
      }

      if (!authData.user) {
        toast({
          title: "Erro na criação",
          description: "Usuário não foi criado corretamente. Tente novamente.",
          variant: "destructive",
        });
        return;
      }

      const userId = authData.user.id;

      // O perfil será criado automaticamente pelo trigger

      // Criar dados físicos se fornecidos
      if (formData.altura_cm || formData.sexo || formData.nivel_atividade) {
        const { error: physicalError } = await supabase
          .from('user_physical_data')
          .insert({
            user_id: userId,
            altura_cm: formData.altura_cm ? parseInt(formData.altura_cm) : null,
            idade: age,
            sexo: formData.sexo || null,
            nivel_atividade: formData.nivel_atividade
          });

        if (physicalError) {
          console.error('Physical data error:', physicalError);
          
          // Não bloquear o fluxo se os dados físicos falharem
          toast({
            title: "Aviso",
            description: "Usuário criado, mas alguns dados físicos não puderam ser salvos",
            variant: "default"
          });
        }
      }

      toast({
        title: "Usuário criado com sucesso!",
        description: `${formData.full_name} foi adicionado ao sistema`,
      });

      // Resetar formulário
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        birth_date: '',
        city: '',
        state: '',
        bio: '',
        altura_cm: '',
        sexo: '',
        nivel_atividade: 'moderado'
      });

      onUserCreated();
      onClose();

    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um problema ao criar o usuário. Tente novamente ou entre em contato com o suporte.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Criar Novo Usuário
          </DialogTitle>
          <DialogDescription>
            Adicione um novo usuário ao sistema preenchendo as informações abaixo
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Dados de Acesso */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Dados de Acesso
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Nome Completo *</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    placeholder="Digite o nome completo"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="email@exemplo.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder="Repita a senha"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Dados Pessoais */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Dados Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="birth_date">Data de Nascimento</Label>
                  <Input
                    id="birth_date"
                    type="date"
                    value={formData.birth_date}
                    onChange={(e) => handleInputChange('birth_date', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="city">Cidade</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="Cidade"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">Estado</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      placeholder="UF"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio/Observações</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="Informações adicionais sobre o usuário"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Dados Físicos */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ruler className="h-4 w-4" />
                  Dados Físicos (Opcionais)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="altura_cm">Altura (cm)</Label>
                    <Input
                      id="altura_cm"
                      type="number"
                      value={formData.altura_cm}
                      onChange={(e) => handleInputChange('altura_cm', e.target.value)}
                      placeholder="ex: 170"
                      min="100"
                      max="250"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sexo">Sexo</Label>
                    <Select value={formData.sexo} onValueChange={(value) => handleInputChange('sexo', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="masculino">Masculino</SelectItem>
                        <SelectItem value="feminino">Feminino</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nivel_atividade">Nível de Atividade</Label>
                    <Select value={formData.nivel_atividade} onValueChange={(value) => handleInputChange('nivel_atividade', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sedentario">Sedentário</SelectItem>
                        <SelectItem value="leve">Leve</SelectItem>
                        <SelectItem value="moderado">Moderado</SelectItem>
                        <SelectItem value="intenso">Intenso</SelectItem>
                        <SelectItem value="muito_intenso">Muito Intenso</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Ações */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Criando...' : 'Criar Usuário'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateUserModal;