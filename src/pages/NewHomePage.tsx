import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { 
  Heart, 
  Activity, 
  Target, 
  TrendingUp, 
  Users, 
  Award,
  ChevronRight,
  Play,
  Star,
  BarChart3,
  Zap,
  ArrowRight,
  User,
  Scale,
  Brain,
  Shield,
  Sparkles,
  Trophy,
  Calendar,
  CheckCircle,
  Droplets,
  Timer,
  Flame
} from "lucide-react";

const NewHomePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleGetStarted = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/auth");
    }
  };

  const features = [
    {
      icon: Activity,
      title: "Missões Diárias Gamificadas",
      description: "Transforme seus hábitos em um jogo divertido com missões personalizadas e recompensas",
      color: "text-primary",
      bgColor: "bg-primary/10",
      highlights: ["Progresso Visual", "Conquistas", "XP e Níveis"]
    },
    {
      icon: Scale,
      title: "Integração com Balança Inteligente",
      description: "Conecte sua Xiaomi Scale 2 para medições automáticas e análise corporal completa",
      color: "text-secondary",
      bgColor: "bg-secondary/10",
      highlights: ["Sync Automático", "IMC Instantâneo", "Histórico Completo"]
    },
    {
      icon: Brain,
      title: "IA Preditiva Avançada",
      description: "Algoritmos inteligentes analisam seus dados e preveem seu progresso futuro",
      color: "text-accent",
      bgColor: "bg-accent/10",
      highlights: ["Análise Preditiva", "Recomendações IA", "Otimização Contínua"]
    },
    {
      icon: Trophy,
      title: "Sistema de Ranking",
      description: "Compete com amigos, suba níveis e conquiste seu lugar no ranking global",
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
      highlights: ["Ranking Global", "Ligas", "Prêmios Exclusivos"]
    },
    {
      icon: Users,
      title: "Comunidade Ativa",
      description: "Conecte-se com milhares de pessoas na mesma jornada de transformação",
      color: "text-health-steps",
      bgColor: "bg-blue-500/10",
      highlights: ["Feed Social", "Grupos", "Suporte Mútuo"]
    },
    {
      icon: Shield,
      title: "Privacidade Total",
      description: "Seus dados de saúde são protegidos com criptografia de ponta a ponta",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      highlights: ["Criptografia", "LGPD Compliant", "Dados Seguros"]
    }
  ];

  const stats = [
    { label: "Anos de Experiência", value: "10+", icon: Users, color: "text-primary" },
    { label: "Profissionais Qualificados", value: "15+", icon: TrendingUp, color: "text-secondary" },
    { label: "Especialidades", value: "8", icon: Target, color: "text-accent" },
    { label: "Satisfação dos Clientes", value: "100%", icon: Star, color: "text-yellow-500" }
  ];

  const testimonials = [
    {
      name: "Em breve",
      role: "Primeiros resultados",
      content: "Faça de seu alimento seu remédio e transforme sua saúde naturalmente.",
      avatar: "🌟",
      rating: 5
    },
    {
      name: "Em breve",
      role: "Jornada de transformação",
      content: "Nossa metodologia está sendo desenvolvida com base na ciência mais recente.",
      avatar: "🚀",
      rating: 5
    },
    {
      name: "Em breve",
      role: "Resultados comprovados",
      content: "Nossa equipe está trabalhando para criar a melhor experiência possível.",
      avatar: "💪",
      rating: 5
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Heart className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/20 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <Sparkles className="h-4 w-4 text-yellow-500 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Instituto dos Sonhos
              </h1>
              <p className="text-xs text-muted-foreground">Health Platform</p>
            </div>
          </motion.div>
          
          <motion.div 
            className="flex items-center gap-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {user ? (
              <div className="flex items-center gap-3">
                <Button onClick={() => navigate("/dashboard")} variant="default" className="bg-gradient-to-r from-primary to-secondary">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm text-muted-foreground hidden sm:block">
                    {user.email?.split("@")[0]}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Button onClick={() => navigate("/auth")} variant="outline">
                  Entrar
                </Button>
                <Button onClick={() => navigate("/auth")} className="bg-gradient-to-r from-primary to-secondary">
                  Começar Agora
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10"></div>
        <div className="container mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge variant="secondary" className="mb-6 text-sm px-4 py-2 bg-primary/20 text-primary border-primary/30">
              <Sparkles className="h-3 w-3 mr-1" />
              🚀 Transformação real com tecnologia avançada
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Sua jornada de
              </span>
              <br />
              <span className="text-foreground">transformação</span>
              <br />
              <span className="bg-gradient-to-r from-accent via-primary to-secondary bg-clip-text text-transparent">
                começa aqui
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
              A única plataforma que combina <span className="text-primary font-semibold">gamificação</span>, 
              <span className="text-secondary font-semibold"> inteligência artificial</span> e 
              <span className="text-accent font-semibold"> integração com dispositivos</span> para 
              transformar sua saúde de forma definitiva.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                onClick={handleGetStarted} 
                size="lg" 
                className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-secondary hover:scale-105 transition-transform shadow-glow"
              >
                <Play className="h-5 w-5 mr-2" />
                {user ? "Ir para Dashboard" : "Começar Gratuitamente"}
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>

            </div>
          </motion.div>

          {/* Interactive Stats */}
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div 
                  key={index} 
                  className="text-center group cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="p-4 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/20 group-hover:border-primary/30 transition-all">
                    <Icon className={`h-8 w-8 mx-auto mb-2 ${stat.color}`} />
                    <div className="text-3xl font-bold">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-card/20">
        <div className="container mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4">Funcionalidades Revolucionárias</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Tecnologia de ponta para resultados reais e duradouros
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card 
                    className="group hover:scale-105 transition-all duration-300 cursor-pointer border-border/20 hover:border-primary/30 bg-gradient-to-br from-card to-card/50 h-full"
                    onClick={() => user ? navigate("/dashboard") : navigate("/auth")}
                  >
                    <CardHeader>
                      <div className={`w-14 h-14 rounded-xl ${feature.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <Icon className={`h-7 w-7 ${feature.color}`} />
                      </div>
                      <CardTitle className="text-xl group-hover:text-primary transition-colors">
                        {feature.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-muted-foreground group-hover:text-foreground transition-colors mb-4">
                        {feature.description}
                      </CardDescription>
                      <div className="space-y-2">
                        {feature.highlights.map((highlight, i) => (
                          <div key={i} className="flex items-center text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            <span className="text-muted-foreground">{highlight}</span>
                          </div>
                        ))}
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all mt-4" />
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4">Histórias de Sucesso</h2>
            <p className="text-xl text-muted-foreground">
              Veja como nossa plataforma transformou vidas reais
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full bg-gradient-to-br from-card to-card/50 border-border/20 hover:border-primary/30 transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <h4 className="font-semibold">{testimonial.name}</h4>
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-4">"{testimonial.content}"</p>
                    <div className="flex items-center">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="max-w-3xl mx-auto">
              <Zap className="h-16 w-16 text-primary mx-auto mb-6 animate-pulse" />
              <h2 className="text-4xl font-bold mb-6">
                Pronto para sua <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Transformação</span>?
              </h2>
              <p className="text-xl text-muted-foreground mb-10">
                Faça de seu alimento seu remédio e descubra o poder da nutrição 
                como medicina preventiva e curativa!
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={handleGetStarted}
                  size="lg"
                  className="text-lg px-12 py-6 bg-gradient-to-r from-primary to-secondary hover:scale-105 transition-transform shadow-glow"
                >
                  <Heart className="h-5 w-5 mr-2" />
                  {user ? "Voltar ao Dashboard" : "Começar Minha Jornada"}
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/20 py-12 px-4 bg-card/20">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Instituto dos Sonhos</h3>
                  <p className="text-sm text-muted-foreground">Health Platform</p>
                </div>
              </div>
              <p className="text-muted-foreground mb-4 max-w-md">
                Transformando vidas através da tecnologia, gamificação e ciência. 
                Sua jornada de saúde nunca foi tão envolvente.
              </p>
              <div className="flex items-center gap-4 text-muted-foreground">
                <Activity className="h-5 w-5" />
                <Users className="h-5 w-5" />
                <Heart className="h-5 w-5" />
                <Trophy className="h-5 w-5" />
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Recursos</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div>Gamificação</div>
                <div>Balança Inteligente</div>
                <div>IA Preditiva</div>
                <div>Comunidade</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Suporte</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div>Central de Ajuda</div>
                <div>Termos de Uso</div>
                <div>Política de Privacidade</div>
                <div>Contato</div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-border/20 mt-8 pt-8 text-center">
            <p className="text-muted-foreground">
              © 2024 Instituto dos Sonhos. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default NewHomePage;