import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  ChevronLeft, 
  ChevronRight,
  Activity,
  Target,
  Trophy,
  Users,
  Star,
  ArrowRight,
  CheckCircle
} from "lucide-react";

interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  gradient: string;
  badge?: string;
  stats?: {
    users: number;
    rating: number;
    courses: number;
  };
  features?: string[];
  ctaText: string;
  ctaIcon: React.ComponentType<any>;
}

const heroSlides: HeroSlide[] = [
  {
    id: '1',
    title: "TRANSFORME SUA SAÚDE",
    subtitle: "Plataforma Completa de Bem-estar",
    description: "Descubra o poder da tecnologia para revolucionar sua jornada de saúde. Conecte-se com sua balança inteligente, acompanhe seu progresso e alcance seus objetivos com nossa plataforma inovadora.",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    gradient: "from-orange-500 via-red-500 to-purple-600",
    badge: "NOVO",
    stats: {
      users: 15420,
      rating: 4.8,
      courses: 15
    },
    features: [
      "Integração com Balança Xiaomi",
      "Sistema de Missões Diárias",
      "Acompanhamento em Tempo Real",
      "Plataforma de Cursos Premium"
    ],
    ctaText: "Começar Agora",
    ctaIcon: Play
  },
  {
    id: '2',
    title: "CONECTE SUA BALANÇA",
    subtitle: "Tecnologia Xiaomi Mi Body Scale 2",
    description: "Sincronize automaticamente suas medições de peso, gordura corporal, massa muscular e muito mais. Acompanhe sua evolução com precisão científica e insights personalizados.",
    image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    gradient: "from-blue-500 via-cyan-500 to-teal-500",
    badge: "CONECTADO",
    stats: {
      users: 8920,
      rating: 4.9,
      courses: 8
    },
    features: [
      "Conexão Bluetooth Automática",
      "Medições Precisas",
      "Histórico Completo",
      "Análise de Tendências"
    ],
    ctaText: "Conectar Balança",
    ctaIcon: Activity
  },
  {
    id: '3',
    title: "MISSÕES DIÁRIAS",
    subtitle: "Gamificação da Saúde",
    description: "Transforme seus objetivos de saúde em missões divertidas e desafiadoras. Complete tarefas diárias, ganhe pontos e desbloqueie conquistas enquanto melhora sua qualidade de vida.",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    gradient: "from-green-500 via-emerald-500 to-lime-500",
    badge: "GAMIFICADO",
    stats: {
      users: 12340,
      rating: 4.7,
      courses: 12
    },
    features: [
      "Missões Personalizadas",
      "Sistema de Pontos",
      "Conquistas Desbloqueáveis",
      "Ranking de Usuários"
    ],
    ctaText: "Ver Missões",
    ctaIcon: Target
  },
  {
    id: '4',
    title: "CURSOS PREMIUM",
    subtitle: "Educação em Saúde",
    description: "Acesse nossa biblioteca completa de cursos sobre nutrição, exercícios, mindfulness e muito mais. Aprenda com especialistas e transforme seu conhecimento em resultados.",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    gradient: "from-purple-500 via-pink-500 to-rose-500",
    badge: "PREMIUM",
    stats: {
      users: 9870,
      rating: 4.6,
      courses: 20
    },
    features: [
      "15 Cursos Especializados",
      "Aulas em Vídeo HD",
      "Certificados de Conclusão",
      "Suporte de Especialistas"
    ],
    ctaText: "Explorar Cursos",
    ctaIcon: Trophy
  }
];

export const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  };

  const currentSlideData = heroSlides[currentSlide];
  const CtaIcon = currentSlideData.ctaIcon;

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 overflow-hidden">
      <div className="absolute inset-0 bg-black/20"></div>

      <div className="relative z-10 min-h-screen flex items-center">
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div className="space-y-8">
              {currentSlideData.badge && (
                <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 px-4 py-2 text-sm font-semibold">
                  {currentSlideData.badge}
                </Badge>
              )}

              <div className="space-y-4">
                <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight">
                  {currentSlideData.title}
                </h1>
                
                <h2 className="text-2xl lg:text-3xl font-semibold text-gray-300">
                  {currentSlideData.subtitle}
                </h2>
              </div>

              <p className="text-lg text-gray-400 leading-relaxed max-w-2xl">
                {currentSlideData.description}
              </p>

              {currentSlideData.features && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {currentSlideData.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3 text-gray-300">
                      <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              )}

              {currentSlideData.stats && (
                <div className="flex items-center gap-8 py-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-400" />
                    <span className="text-white font-semibold">
                      {currentSlideData.stats.users.toLocaleString()}+ usuários
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-400" />
                    <span className="text-white font-semibold">
                      {currentSlideData.stats.rating} avaliação
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-purple-400" />
                    <span className="text-white font-semibold">
                      {currentSlideData.stats.courses} cursos
                    </span>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4">
                <Button 
                  size="lg" 
                  className={`bg-gradient-to-r ${currentSlideData.gradient} hover:opacity-90 text-white font-semibold px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300`}
                >
                  <CtaIcon className="h-6 w-6 mr-2" />
                  {currentSlideData.ctaText}
                </Button>
                
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-white/30 text-white hover:bg-white/10 font-semibold px-8 py-4 text-lg"
                >
                  <ArrowRight className="h-6 w-6 mr-2" />
                  Saiba Mais
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <div className={`absolute inset-0 bg-gradient-to-br ${currentSlideData.gradient} opacity-20`}></div>
                <img 
                  src={currentSlideData.image} 
                  alt={currentSlideData.title}
                  className="w-full h-[500px] object-cover"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-6 hover:bg-white/30 transition-all duration-300 cursor-pointer">
                    <Play className="h-12 w-12 text-white" fill="white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex items-center gap-3">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'bg-white scale-125' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
            />
          ))}
        </div>
      </div>

      <button
        onClick={prevSlide}
        className="absolute left-6 top-1/2 transform -translate-y-1/2 z-20 bg-white/10 backdrop-blur-sm rounded-full p-3 hover:bg-white/20 transition-all duration-300"
      >
        <ChevronLeft className="h-6 w-6 text-white" />
      </button>
      
      <button
        onClick={nextSlide}
        className="absolute right-6 top-1/2 transform -translate-y-1/2 z-20 bg-white/10 backdrop-blur-sm rounded-full p-3 hover:bg-white/20 transition-all duration-300"
      >
        <ChevronRight className="h-6 w-6 text-white" />
      </button>

      <div className="absolute bottom-4 right-6 z-20">
        <div className="flex items-center gap-2 text-white/70 text-sm">
          <div className={`w-2 h-2 rounded-full ${isAutoPlaying ? 'bg-green-400' : 'bg-gray-400'}`}></div>
          <span>{isAutoPlaying ? 'Auto-play' : 'Pausado'}</span>
        </div>
      </div>
    </div>
  );
};

export default HeroCarousel; 