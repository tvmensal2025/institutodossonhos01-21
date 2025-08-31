import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Heart } from 'lucide-react';

const AutoLoginPage = () => {
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const performAutoLogin = async () => {
      try {
        const token = searchParams.get('token');
        const sessionId = searchParams.get('session');
        const redirectPath = searchParams.get('redirect');

        if (!token) {
          toast({
            title: "Link inválido",
            description: "Token de acesso não encontrado",
            variant: "destructive"
          });
          navigate('/auth');
          return;
        }

        // Decodificar credenciais
        const credentials = atob(token);
        const [email, password] = credentials.split(':');

        if (!email || !password) {
          toast({
            title: "Credenciais inválidas",
            description: "Link malformado ou corrompido",
            variant: "destructive"
          });
          navigate('/auth');
          return;
        }

        // Realizar login automático
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) {
          toast({
            title: "Erro no login automático",
            description: "Credenciais incorretas ou expiradas",
            variant: "destructive"
          });
          navigate('/auth');
          return;
        }

        toast({
          title: "Login realizado com sucesso!",
          description: "Redirecionando para sua área...",
        });

        // Redirecionar conforme parâmetros
        setTimeout(() => {
          if (sessionId) {
            navigate(`/sessions/${sessionId}`);
          } else if (redirectPath) {
            navigate(redirectPath);
          } else {
            navigate('/dashboard');
          }
        }, 1500);

      } catch (error) {
        console.error('Erro no auto-login:', error);
        toast({
          title: "Erro inesperado",
          description: "Ocorreu um erro durante o login automático",
          variant: "destructive"
        });
        navigate('/auth');
      } finally {
        setLoading(false);
      }
    };

    performAutoLogin();
  }, [searchParams, navigate, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center px-6">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center space-y-6">
          <div className="relative">
            <Heart className="h-12 w-12 text-primary mx-auto animate-pulse" />
            <div className="absolute inset-0 h-12 w-12 text-primary/20 animate-ping mx-auto" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Instituto dos Sonhos</h1>
            <p className="text-muted-foreground">
              {loading ? "Realizando login automático..." : "Redirecionando..."}
            </p>
          </div>
          
          <div className="space-y-3">
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-primary h-2 rounded-full animate-pulse w-3/4"></div>
            </div>
            <p className="text-xs text-muted-foreground">
              Aguarde enquanto processamos seu acesso
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AutoLoginPage;