import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { useToast } from '@/hooks/use-toast';
import { User, MapPin, Ruler, UserCheck, Loader2 } from 'lucide-react';

interface GoogleSignupFormProps {
  onComplete: (userData: any) => void;
}

export const GoogleSignupForm: React.FC<GoogleSignupFormProps> = ({ onComplete }) => {
  const [step, setStep] = useState<'google' | 'complementary'>('google');
  const [googleData, setGoogleData] = useState<any>(null);
  const [formData, setFormData] = useState({
    city: '',
    state: '',
    height: '',
    weight: '',
    gender: '',
    birthDate: '',
    phone: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  
  const { signInWithGoogle } = useGoogleAuth();
  const { toast } = useToast();

  const handleGoogleSignup = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithGoogle();
      if (result.success) {
        // OAuth redirection based login - handle success
        setStep('complementary');
        toast({
          title: "✅ Google conectado!",
          description: "Agora complete seus dados complementares"
        });
      }
    } catch (error) {
      toast({
        title: "❌ Erro",
        description: "Erro ao conectar com Google",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComplementary = async () => {
    if (!googleData) return;

    setIsLoading(true);
    try {
      // Combinar dados do Google com dados complementares
      const completeUserData = {
        ...googleData,
        ...formData,
        profile_complete: true
      };

      // Salvar no Supabase
      const { supabase } = await import('@/integrations/supabase/client');
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: googleData.id,
          full_name: googleData.full_name,
          email: googleData.email,
          avatar_url: googleData.avatar_url,
          city: formData.city,
          state: formData.state,
          height: parseFloat(formData.height) || null,
          weight: parseFloat(formData.weight) || null,
          gender: formData.gender,
          birth_date: formData.birthDate,
          phone: formData.phone,
          profile_complete: true,
          provider: 'google'
        });

      if (error) throw error;

      toast({
        title: "✅ Perfil completo!",
        description: "Todos os dados foram salvos com sucesso"
      });

      onComplete(completeUserData);
    } catch (error) {
      toast({
        title: "❌ Erro",
        description: "Erro ao salvar dados complementares",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'google') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <User className="h-5 w-5" />
            Cadastro com Google
          </CardTitle>
          <CardDescription>
            Conecte sua conta Google para começar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleGoogleSignup}
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Conectando...
              </>
            ) : (
              <>
                <UserCheck className="mr-2 h-4 w-4" />
                Continuar com Google
              </>
            )}
          </Button>
          
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800 text-center">
              💡 <strong>Vantagem:</strong> Dados básicos preenchidos automaticamente!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <UserCheck className="h-5 w-5 text-green-600" />
          Dados Complementares
        </CardTitle>
        <CardDescription>
          Complete suas informações para personalizar sua experiência
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Dados do Google (somente leitura) */}
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm font-medium text-green-800 mb-2">✅ Dados do Google:</p>
          <div className="text-xs text-green-700 space-y-1">
            <p><strong>Nome:</strong> {googleData?.full_name}</p>
            <p><strong>Email:</strong> {googleData?.email}</p>
          </div>
        </div>

        {/* Dados complementares */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="city">Cidade</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => setFormData({...formData, city: e.target.value})}
              placeholder="Sua cidade"
            />
          </div>
          <div>
            <Label htmlFor="state">Estado</Label>
            <Select value={formData.state} onValueChange={(value) => setFormData({...formData, state: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'].map(state => (
                  <SelectItem key={state} value={state}>{state}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="height">Altura (cm)</Label>
            <Input
              id="height"
              type="number"
              value={formData.height}
              onChange={(e) => setFormData({...formData, height: e.target.value})}
              placeholder="170"
            />
          </div>
          <div>
            <Label htmlFor="weight">Peso (kg)</Label>
            <Input
              id="weight"
              type="number"
              value={formData.weight}
              onChange={(e) => setFormData({...formData, weight: e.target.value})}
              placeholder="70"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="gender">Gênero</Label>
            <Select value={formData.gender} onValueChange={(value) => setFormData({...formData, gender: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="masculino">Masculino</SelectItem>
                <SelectItem value="feminino">Feminino</SelectItem>
                <SelectItem value="outro">Outro</SelectItem>
                <SelectItem value="prefiro_nao_dizer">Prefiro não dizer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="birthDate">Data de Nascimento</Label>
            <Input
              id="birthDate"
              type="date"
              value={formData.birthDate}
              onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="phone">Telefone (opcional)</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            placeholder="(11) 99999-9999"
          />
        </div>

        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={() => setStep('google')}
            className="flex-1"
          >
            Voltar
          </Button>
          <Button 
            onClick={handleSubmitComplementary}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              'Completar Cadastro'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
