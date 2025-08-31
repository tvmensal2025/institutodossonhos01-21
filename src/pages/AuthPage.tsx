import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, ArrowLeft, User, Phone, Calendar, MapPin, Ruler, Star } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { GoogleSignupModal } from "@/components/GoogleSignupModal";
import { AuthChoiceModal } from "@/components/AuthChoiceModal";
const AuthPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [rememberMe, setRememberMe] = useState(true); // Padrão true para lembrar senha
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Estados para os modais
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [showAuthChoiceModal, setShowAuthChoiceModal] = useState(false);
  const [googleUser, setGoogleUser] = useState(null);
  const [authenticatedUser, setAuthenticatedUser] = useState(null);
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const {
    signInWithGoogle,
    isLoading: googleLoading
  } = useGoogleAuth();

  // Listener para detectar quando o usuário retorna do OAuth Google
  useEffect(() => {
    const checkGoogleAuth = async () => {
      const {
        data: {
          session
        }
      } = await supabase.auth.getSession();
      if (session?.user && session.user.app_metadata?.provider === 'google') {
        const userData = session.user;

        // Verificar se o perfil já existe e tem dados completos
        const {
          data: existingProfile
        } = await supabase.from('profiles').select('birth_date, height, gender').eq('user_id', userData.id).single();

        // Se não tem perfil ou dados incompletos, mostrar modal
        const needsProfileCompletion = !existingProfile || !existingProfile.birth_date || !existingProfile.height || !existingProfile.gender;
        if (needsProfileCompletion) {
          setGoogleUser({
            id: userData.id,
            full_name: userData.user_metadata?.full_name || '',
            email: userData.email || '',
            avatar_url: userData.user_metadata?.avatar_url || ''
          });
          setShowGoogleModal(true);
        } else {
          // Perfil completo: verificar Google Fit
          try {
            const {
              data: fitToken
            }: any = await (supabase as any).from('google_fit_tokens').select('expires_at').eq('user_id', userData.id).maybeSingle();
            const hasValidToken = !!fitToken && (!fitToken.expires_at || new Date(fitToken.expires_at) > new Date());
            if (!hasValidToken) {
              navigate('/google-fit-oauth?auto=1', {
                replace: true
              });
              return;
            }
          } catch (e) {
            // segue fluxo normal
          }

          // Mostrar modal de escolha
          setAuthenticatedUser({
            id: userData.id,
            name: userData.user_metadata?.full_name || userData.email?.split('@')[0] || 'Usuário'
          });
          setShowAuthChoiceModal(true);
        }
      }
    };
    checkGoogleAuth();
  }, [navigate]);

  // Listener para evento de mostrar modal de escolha
  useEffect(() => {
    const handleShowAuthChoice = (event: CustomEvent) => {
      setAuthenticatedUser({
        id: 'google-user',
        name: event.detail.userName
      });
      setShowAuthChoiceModal(true);
    };
    window.addEventListener('showAuthChoice', handleShowAuthChoice as EventListener);
    return () => {
      window.removeEventListener('showAuthChoice', handleShowAuthChoice as EventListener);
    };
  }, []);

  // Login form state
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });

  // Signup form state - EXPANDIDO com novos campos
  const [signupData, setSignupData] = useState({
    fullName: "",
    email: "",
    phone: "",
    birthDate: "",
    gender: "",
    city: "",
    state: "",
    height: "",
    password: "",
    confirmPassword: ""
  });
  const handleLogin = async () => {
    if (!loginData.email || !loginData.password) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha email e senha",
        variant: "destructive"
      });
      return;
    }

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(loginData.email)) {
      toast({
        title: "Email inválido",
        description: "Digite um email válido (exemplo: usuario@email.com)",
        variant: "destructive"
      });
      return;
    }
    setIsLoading(true);
    try {
      const {
        data,
        error
      } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password
      });
      if (error) {
        // Mensagens de erro específicas baseadas no código de erro
        let errorMessage = "Erro no login";
        let errorDescription = "Tente novamente";
        switch (error.message) {
          case "Invalid login credentials":
            errorDescription = "Email ou senha incorretos. Verifique suas credenciais.";
            break;
          case "Email not confirmed":
            errorDescription = "Email não confirmado. Verifique sua caixa de entrada e confirme o cadastro.";
            break;
          case "Too many requests":
            errorDescription = "Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.";
            break;
          case "User not found":
            errorDescription = "Usuário não encontrado. Verifique se o email está correto ou crie uma conta.";
            break;
          default:
            errorDescription = error.message || "Erro inesperado. Tente novamente.";
        }
        toast({
          title: errorMessage,
          description: errorDescription,
          variant: "destructive"
        });
        return;
      }

      // Verificar se o usuário tem role de admin após login bem-sucedido
      if (data.user) {
        try {
          // Usar RPC para verificar se é admin (evita problemas de tipos)
          // Check if user is admin by checking profiles table
          const {
            data: profileData
          } = await supabase.from('profiles').select('*').eq('user_id', data.user.id).maybeSingle();
          const isAdmin = (profileData as any)?.role === 'admin';
          if (isAdmin) {
            toast({
              title: "Acesso administrativo concedido",
              description: "Bem-vindo, administrador"
            });
            navigate("/admin");
          } else {
            // Buscar dados do usuário para mostrar no modal
            const {
              data: profile
            } = await supabase.from('profiles').select('full_name').eq('user_id', data.user.id).single();
            setAuthenticatedUser({
              id: data.user.id,
              name: profile?.full_name || data.user.email?.split('@')[0] || 'Usuário'
            });
            toast({
              title: "Login realizado!",
              description: "Bem-vindo de volta ao Instituto dos Sonhos"
            });

            // Mostrar modal de escolha
            setShowAuthChoiceModal(true);
          }
        } catch (roleError) {
          console.log('Erro ao verificar role, assumindo usuário comum:', roleError);
          // Se não conseguir verificar role, assume usuário comum
          toast({
            title: "Login realizado!",
            description: "Bem-vindo de volta ao Instituto dos Sonhos"
          });
          navigate("/dashboard");
        }
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handleSignup = async () => {
    console.log('🔍 Iniciando handleSignup...');
    console.log('📝 Dados do formulário:', signupData);

    // Validar campos obrigatórios com mensagens específicas
    if (!signupData.fullName?.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Digite seu nome completo",
        variant: "destructive"
      });
      return;
    }
    if (!signupData.email?.trim()) {
      toast({
        title: "Email obrigatório",
        description: "Digite seu endereço de email",
        variant: "destructive"
      });
      return;
    }
    if (!signupData.phone?.trim()) {
      toast({
        title: "Telefone obrigatório",
        description: "Digite seu número de celular",
        variant: "destructive"
      });
      return;
    }
    if (!signupData.birthDate) {
      toast({
        title: "Data de nascimento obrigatória",
        description: "Selecione sua data de nascimento",
        variant: "destructive"
      });
      return;
    }
    if (!signupData.gender) {
      toast({
        title: "Gênero obrigatório",
        description: "Selecione seu gênero",
        variant: "destructive"
      });
      return;
    }
    if (!signupData.city?.trim()) {
      toast({
        title: "Cidade obrigatória",
        description: "Digite sua cidade",
        variant: "destructive"
      });
      return;
    }
    if (!signupData.state?.trim()) {
      toast({
        title: "Estado obrigatório",
        description: "Digite seu estado",
        variant: "destructive"
      });
      return;
    }
    if (!signupData.height?.trim()) {
      toast({
        title: "Altura obrigatória",
        description: "Digite sua altura em centímetros",
        variant: "destructive"
      });
      return;
    }
    if (!signupData.password?.trim()) {
      toast({
        title: "Senha obrigatória",
        description: "Crie uma senha para sua conta",
        variant: "destructive"
      });
      return;
    }

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(signupData.email)) {
      toast({
        title: "Email inválido",
        description: "Digite um email válido (exemplo: usuario@email.com)",
        variant: "destructive"
      });
      return;
    }

    // Validar formato do telefone (aceita vários formatos)
    const phoneRegex = /^[\d\s\(\)\-\+]+$/;
    if (!phoneRegex.test(signupData.phone) || signupData.phone.replace(/\D/g, '').length < 10) {
      toast({
        title: "Telefone inválido",
        description: "Digite um número de telefone válido (exemplo: (11) 99999-9999)",
        variant: "destructive"
      });
      return;
    }

    // Validar senha
    if (signupData.password.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 6 caracteres",
        variant: "destructive"
      });
      return;
    }

    // Validar confirmação de senha
    if (signupData.password !== signupData.confirmPassword) {
      toast({
        title: "Senhas não coincidem",
        description: "A senha e a confirmação devem ser iguais",
        variant: "destructive"
      });
      return;
    }

    // Validar altura
    const height = parseFloat(signupData.height);
    if (isNaN(height) || height < 100 || height > 250) {
      toast({
        title: "Altura inválida",
        description: "A altura deve estar entre 100cm e 250cm",
        variant: "destructive"
      });
      return;
    }

    // Validar data de nascimento
    const birthDate = new Date(signupData.birthDate);
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
        description: "Você deve ter pelo menos 13 anos para se cadastrar",
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

    // Validar aceitação dos termos
    if (!acceptTerms) {
      toast({
        title: "Termos não aceitos",
        description: "Você deve aceitar os termos de uso e política de privacidade",
        variant: "destructive"
      });
      return;
    }
    console.log('✅ Validações passaram, criando usuário...');
    setIsLoading(true);
    try {
      const {
        data,
        error
      } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: signupData.fullName,
            phone: signupData.phone,
            birth_date: signupData.birthDate,
            gender: signupData.gender,
            city: signupData.city,
            state: signupData.state,
            height: height
          }
        }
      });
      console.log('📊 Resposta do signUp:', {
        data,
        error
      });
      if (error) {
        console.error('❌ Erro no signUp:', error);

        // Mensagens de erro específicas para cadastro
        let errorMessage = "Erro no cadastro";
        let errorDescription = "Tente novamente";
        switch (error.message) {
          case "User already registered":
            errorMessage = "Usuário já cadastrado";
            errorDescription = "Este email já está em uso. Tente fazer login ou use outro email.";
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
            errorDescription = error.message || "Erro inesperado. Tente novamente.";
        }
        toast({
          title: errorMessage,
          description: errorDescription,
          variant: "destructive"
        });
      } else {
        // O perfil é criado automaticamente pelo trigger
        if (data.user) {
          console.log('✅ Usuário criado, criando dados físicos...');

          // Criar dados físicos automaticamente
          const {
            error: physicalError
          } = await supabase.from('user_physical_data').insert({
            user_id: data.user.id,
            altura_cm: height,
            idade: age,
            sexo: signupData.gender,
            nivel_atividade: 'moderado'
          });
          console.log('📊 Resposta dados físicos:', {
            physicalError
          });
          if (physicalError) {
            console.error('❌ Erro ao criar dados físicos:', physicalError);
          } else {
            console.log('✅ Dados físicos criados com sucesso!');
          }

          // Buscar dados do usuário para mostrar no modal
          const {
            data: profile
          } = await supabase.from('profiles').select('full_name').eq('user_id', data.user.id).single();
          setAuthenticatedUser({
            id: data.user.id,
            name: profile?.full_name || data.user.email?.split('@')[0] || 'Usuário'
          });
          toast({
            title: "Conta criada com sucesso!",
            description: "Bem-vindo ao Instituto dos Sonhos. Seus dados foram salvos."
          });

          // Mostrar modal de escolha
          setShowAuthChoiceModal(true);
        }
      }
    } catch (error) {
      console.error('❌ Erro geral:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail?.trim()) {
      toast({
        title: "Email obrigatório",
        description: "Digite seu email para recuperar a senha",
        variant: "destructive"
      });
      return;
    }

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(forgotPasswordEmail)) {
      toast({
        title: "Email inválido",
        description: "Digite um email válido (exemplo: usuario@email.com)",
        variant: "destructive"
      });
      return;
    }
    setIsLoading(true);
    try {
      const {
        error
      } = await supabase.auth.resetPasswordForEmail(forgotPasswordEmail, {
        redirectTo: `${window.location.origin}/auth`
      });
      if (error) {
        // Mensagens de erro específicas para recuperação de senha
        let errorMessage = "Erro ao enviar email";
        let errorDescription = "Tente novamente";
        switch (error.message) {
          case "User not found":
            errorMessage = "Usuário não encontrado";
            errorDescription = "Este email não está cadastrado em nossa base. Verifique se está correto.";
            break;
          case "Invalid email":
            errorMessage = "Email inválido";
            errorDescription = "Digite um email válido (exemplo: usuario@email.com).";
            break;
          case "Too many requests":
            errorMessage = "Muitas tentativas";
            errorDescription = "Aguarde alguns minutos antes de tentar novamente.";
            break;
          case "Email not confirmed":
            errorMessage = "Email não confirmado";
            errorDescription = "Confirme seu email antes de solicitar a recuperação de senha.";
            break;
          default:
            errorDescription = error.message || "Erro inesperado. Tente novamente.";
        }
        toast({
          title: errorMessage,
          description: errorDescription,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Email enviado com sucesso!",
          description: "Verifique sua caixa de entrada e spam para redefinir a senha"
        });
        setShowForgotPassword(false);
        setForgotPasswordEmail("");
      }
    } catch (error) {
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao processar sua solicitação. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      // O OAuth redireciona automaticamente, o useEffect vai detectar o retorno
    } catch (error) {
      console.error('Erro no login Google:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleGoogleSignup = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      // O OAuth redireciona automaticamente, o useEffect vai detectar o retorno
    } catch (error) {
      console.error('Erro no signup Google:', error);
    } finally {
      setIsLoading(false);
    }
  };
  return <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10 border-b border-border/10 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex items-center gap-2">
              <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
              <div className="relative">
                <img src="/images/instituto-logo.png" alt="Instituto dos Sonhos" className="h-8 w-8 object-contain" />
              </div>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Instituto dos Sonhos
            </h1>
          </Link>
        </div>
      </header>

      <div className="min-h-screen flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-md space-y-8">
          {/* Header Text */}
          <div className="text-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tight">
                Comece sua
                <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  {" "}transformação
                </span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Faça login ou crie sua conta gratuita
              </p>
            </div>
          </div>

          {/* Main Auth Card */}
          <Card className="border-0 shadow-2xl shadow-primary/5 bg-card/50 backdrop-blur-xl">
            <CardContent className="p-8">
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8 bg-muted/50">
                  <TabsTrigger value="login" className="data-[state=active]:bg-background data-[state=active]:shadow-md">
                    Entrar
                  </TabsTrigger>
                  <TabsTrigger value="signup" className="data-[state=active]:bg-background data-[state=active]:shadow-md">
                    Criar Conta
                  </TabsTrigger>
                </TabsList>

                {/* Login Tab */}
                <TabsContent value="login" className="space-y-6">
                  {/* Google Login Button */}
                  <div className="space-y-4">
                    
                    
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border/50" />
                      </div>
                      
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email" className="text-sm font-medium">Email</Label>
                      <Input id="login-email" type="email" placeholder="seu@email.com" value={loginData.email} onChange={e => setLoginData({
                      ...loginData,
                      email: e.target.value
                    })} className="h-12 bg-background/50 border-border/50 focus:border-primary focus:ring-primary/20" required />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="login-password" className="text-sm font-medium">Senha</Label>
                      <Input id="login-password" type="password" placeholder="Sua senha" value={loginData.password} onChange={e => setLoginData({
                      ...loginData,
                      password: e.target.value
                    })} onKeyDown={e => e.key === 'Enter' && handleLogin()} className="h-12 bg-background/50 border-border/50 focus:border-primary focus:ring-primary/20" required />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="remember" checked={rememberMe} onCheckedChange={checked => setRememberMe(checked === true)} />
                        <Label htmlFor="remember" className="text-sm text-muted-foreground">Lembrar de mim</Label>
                      </div>
                      <button onClick={() => setShowForgotPassword(true)} className="text-sm text-primary hover:underline">
                        Esqueceu a senha?
                      </button>
                    </div>
                  </div>

                  <Button onClick={handleLogin} disabled={isLoading} className="w-full h-12 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground font-medium shadow-lg shadow-primary/25 transition-all duration-200">
                    {isLoading ? <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin" />
                        Entrando...
                      </div> : "Entrar"}
                  </Button>

                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      Ainda não tem conta?{" "}
                      <span className="text-primary font-medium cursor-pointer hover:underline">
                        Crie uma agora
                      </span>
                    </p>
                    

                  </div>
                </TabsContent>

                {/* Modal Esqueci Senha */}
                {showForgotPassword && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-background rounded-lg p-6 w-full max-w-md mx-4 shadow-2xl border">
                      <h3 className="text-lg font-semibold mb-4">Recuperar Senha</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Digite seu email para receber as instruções de recuperação
                      </p>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="forgot-email">Email</Label>
                          <Input id="forgot-email" type="email" placeholder="seu@email.com" value={forgotPasswordEmail} onChange={e => setForgotPasswordEmail(e.target.value)} className="h-12 bg-background/50 border-border/50 focus:border-primary focus:ring-primary/20" />
                        </div>
                        
                        <div className="flex gap-2">
                          <Button variant="outline" onClick={() => {
                        setShowForgotPassword(false);
                        setForgotPasswordEmail("");
                      }} className="flex-1">
                            Cancelar
                          </Button>
                          <Button onClick={handleForgotPassword} disabled={isLoading} className="flex-1">
                            {isLoading ? "Enviando..." : "Enviar"}
                          </Button>
                        </div>
                      </div>
                      

                    </div>
                  </div>}

                {/* Signup Tab */}
                <TabsContent value="signup" className="space-y-6">
                  {/* Google Signup Button */}
                  <div className="space-y-4">
                    
                    
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border/50" />
                      </div>
                      
                    </div>
                    
                    
                  </div>
                  
                  {/* Dados Pessoais */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-semibold text-foreground">Dados Pessoais</span>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-name" className="text-sm font-medium">Nome completo *</Label>
                        <Input id="signup-name" type="text" placeholder="Digite seu nome completo" value={signupData.fullName} onChange={e => setSignupData({
                        ...signupData,
                        fullName: e.target.value
                      })} className="h-12 bg-background/50 border-border/50 focus:border-primary focus:ring-primary/20" required />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="signup-phone" className="text-sm font-medium flex items-center gap-2">
                            <Phone className="h-3 w-3" />
                            Celular *
                          </Label>
                          <Input id="signup-phone" type="tel" placeholder="(11) 99999-9999" value={signupData.phone} onChange={e => setSignupData({
                          ...signupData,
                          phone: e.target.value
                        })} className="h-12 bg-background/50 border-border/50 focus:border-primary focus:ring-primary/20" required />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="signup-email" className="text-sm font-medium">Email *</Label>
                          <Input id="signup-email" type="email" placeholder="seu@email.com" value={signupData.email} onChange={e => setSignupData({
                          ...signupData,
                          email: e.target.value
                        })} className="h-12 bg-background/50 border-border/50 focus:border-primary focus:ring-primary/20" required />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className="space-y-2">
                           <Label htmlFor="signup-birth" className="text-sm font-medium flex items-center gap-2">
                             <Calendar className="h-3 w-3" />
                             Data de Nascimento *
                           </Label>
                           <Input id="signup-birth" type="date" value={signupData.birthDate} onChange={e => setSignupData({
                          ...signupData,
                          birthDate: e.target.value
                        })} className="h-12 bg-background/50 border-border/50 focus:border-primary focus:ring-primary/20" required />
                         </div>

                        <div className="space-y-2">
                          <Label htmlFor="signup-gender" className="text-sm font-medium">Gênero *</Label>
                          <Select value={signupData.gender} onValueChange={value => {
                          console.log('Gender selected:', value);
                          setSignupData({
                            ...signupData,
                            gender: value
                          });
                        }}>
                            <SelectTrigger className="h-12 bg-background/50 border-border/50 focus:border-primary focus:ring-primary/20">
                              <SelectValue placeholder="Selecione seu gênero" />
                            </SelectTrigger>
                            <SelectContent className="z-50">
                              <SelectItem value="masculino">Masculino</SelectItem>
                              <SelectItem value="feminino">Feminino</SelectItem>
                              <SelectItem value="outro">Outro</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                         <div className="space-y-2">
                           <Label htmlFor="signup-city" className="text-sm font-medium flex items-center gap-2">
                             <MapPin className="h-3 w-3" />
                             Cidade *
                           </Label>
                           <Input id="signup-city" type="text" placeholder="Sua cidade" value={signupData.city} onChange={e => setSignupData({
                          ...signupData,
                          city: e.target.value
                        })} className="h-12 bg-background/50 border-border/50 focus:border-primary focus:ring-primary/20" required />
                         </div>

                         <div className="space-y-2">
                           <Label htmlFor="signup-state" className="text-sm font-medium">Estado *</Label>
                           <Input id="signup-state" type="text" placeholder="SP" value={signupData.state} onChange={e => setSignupData({
                          ...signupData,
                          state: e.target.value
                        })} className="h-12 bg-background/50 border-border/50 focus:border-primary focus:ring-primary/20" required />
                         </div>

                         <div className="space-y-2">
                           <Label htmlFor="signup-height" className="text-sm font-medium flex items-center gap-2">
                             <Ruler className="h-3 w-3" />
                             Altura (cm) *
                           </Label>
                           <Input id="signup-height" type="number" placeholder="175" min="100" max="250" value={signupData.height} onChange={e => setSignupData({
                          ...signupData,
                          height: e.target.value
                        })} className="h-12 bg-background/50 border-border/50 focus:border-primary focus:ring-primary/20" required />
                         </div>
                       </div>
                    </div>
                  </div>

                  {/* Segurança */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Heart className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-semibold text-foreground">Segurança</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-password" className="text-sm font-medium">Senha *</Label>
                        <Input id="signup-password" type="password" placeholder="Crie uma senha forte" value={signupData.password} onChange={e => setSignupData({
                        ...signupData,
                        password: e.target.value
                      })} className="h-12 bg-background/50 border-border/50 focus:border-primary focus:ring-primary/20" required />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirm-password" className="text-sm font-medium">Confirmar senha *</Label>
                        <Input id="confirm-password" type="password" placeholder="Confirme sua senha" value={signupData.confirmPassword} onChange={e => setSignupData({
                        ...signupData,
                        confirmPassword: e.target.value
                      })} className="h-12 bg-background/50 border-border/50 focus:border-primary focus:ring-primary/20" required />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-4 bg-muted/20 rounded-lg border border-border/50">
                    <Checkbox id="terms" checked={acceptTerms} onCheckedChange={checked => setAcceptTerms(checked === true)} className="mt-0.5" />
                    <Label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed">
                      Aceito os{" "}
                      <Link to="/termos" className="text-primary hover:underline font-medium">termos de uso</Link>{" "}
                      e{" "}
                      <Link to="/privacidade" className="text-primary hover:underline font-medium">política de privacidade</Link>
                    </Label>
                  </div>

                  <Button onClick={handleSignup} disabled={isLoading} className="w-full h-12 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-medium shadow-lg shadow-green-500/25 transition-all duration-200">
                    {isLoading ? <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        Criando conta...
                      </div> : "Criar minha conta"}
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Social Proof */}
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Estamos <span className="font-semibold text-primary">iniciando nossa jornada</span> de transformação
              </p>
            </div>
            
            <Card className="border-0 bg-gradient-to-r from-primary/5 to-green-500/5 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center gap-1 mb-3">
                  <Star className="h-5 w-5 text-primary" />
                </div>
                <p className="text-lg font-medium mb-2">
                  "Faça de seu alimento seu remédio"
                </p>
                <p className="text-sm text-muted-foreground">
                  Transforme sua saúde através da alimentação consciente
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modal para completar perfil Google */}
      <GoogleSignupModal isOpen={showGoogleModal} onClose={() => setShowGoogleModal(false)} googleUser={googleUser} />

      {/* Modal de escolha após autenticação */}
      <AuthChoiceModal isOpen={showAuthChoiceModal} onClose={() => setShowAuthChoiceModal(false)} userName={authenticatedUser?.name} />
    </div>;
};
export default AuthPage;