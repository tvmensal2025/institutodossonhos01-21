import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Brain, 
  Target, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  BarChart3,
  Lightbulb,
  Heart,
  Zap,
  Shield,
  Eye,
  ArrowRight,
  ArrowLeft,
  Star,
  Award,
  BookOpen,
  Users,
  MessageSquare,
  UserCheck,
  Settings
} from 'lucide-react';
import { saboteurQuestions, Question } from '@/data/saboteurQuestions';

interface SaboteurType {
  name: string;
  description: string;
  characteristics: string[];
  impact: string;
  strategies: string[];
  color: string;
  icon: React.ComponentType<{ className?: string }>;
}

const saboteurTypes: Record<string, SaboteurType> = {
  perfeccionismo: {
    name: "O Perfeccionista",
    description: "O sabotador que exige perfeição absoluta em tudo, criando padrões impossíveis de atingir.",
    characteristics: [
      "Estabelece padrões extremamente altos",
      "Foca em detalhes irrelevantes",
      "Tem dificuldade em aceitar resultados 'bons o suficiente'",
      "Procrastina por medo de imperfeição",
      "Revisa trabalho repetidamente"
    ],
    impact: "Pode levar à paralisia, procrastinação e burnout, impedindo progresso real.",
    strategies: [
      "Estabeleça padrões realistas e flexíveis",
      "Celebre progresso, não apenas perfeição",
      "Pratique o conceito de 'bom o suficiente'",
      "Foque no processo, não apenas no resultado",
      "Defina prazos para finalizar projetos"
    ],
    color: "text-purple-600",
    icon: Star
  },
  procrastinacao: {
    name: "O Procrastinador",
    description: "O sabotador que sempre encontra desculpas para adiar ações importantes.",
    characteristics: [
      "Sempre encontra razões para adiar",
      "Trabalha melhor 'sob pressão'",
      "Distrai-se facilmente",
      "Tem dificuldade em priorizar",
      "Começa muitas coisas mas não termina"
    ],
    impact: "Resulta em estresse desnecessário, prazos apertados e qualidade comprometida.",
    strategies: [
      "Quebre tarefas grandes em partes menores",
      "Use a técnica Pomodoro (25min focados)",
      "Elimine distrações durante períodos de foco",
      "Estabeleça prazos intermediários",
      "Crie rotinas consistentes"
    ],
    color: "text-orange-600",
    icon: Clock
  },
  comparacao: {
    name: "O Comparador",
    description: "O sabotador que constantemente se compara com outros, perdendo foco no próprio progresso.",
    characteristics: [
      "Compara-se constantemente com outros",
      "Foca no que outros têm ou fazem",
      "Perde perspectiva do próprio progresso",
      "Sente-se inadequado facilmente",
      "Fica desmotivado com sucessos alheios"
    ],
    impact: "Reduz autoestima, motivação e foco no próprio desenvolvimento.",
    strategies: [
      "Foque no seu próprio progresso",
      "Celebre conquistas pessoais",
      "Use comparação como inspiração, não desmotivação",
      "Pratique gratidão pelo que você tem",
      "Desenvolva sua própria métrica de sucesso"
    ],
    color: "text-blue-600",
    icon: Users
  },
  autocritica: {
    name: "O Autocrítico",
    description: "O sabotador que tem uma voz interna extremamente negativa e crítica.",
    characteristics: [
      "Voz interna muito negativa",
      "Foca mais em erros que acertos",
      "Tem dificuldade em aceitar elogios",
      "Espera o pior de si mesmo",
      "É mais duro consigo que com outros"
    ],
    impact: "Reduz confiança, motivação e pode levar à depressão e ansiedade.",
    strategies: [
      "Pratique autocompaixão diariamente",
      "Reconheça e celebre pequenas conquistas",
      "Trate-se como trataria um amigo",
      "Desenvolva uma voz interna mais gentil",
      "Foque nos seus pontos fortes"
    ],
    color: "text-red-600",
    icon: Heart
  },
  medo_falha: {
    name: "O Medroso",
    description: "O sabotador que tem tanto medo de falhar que evita tentar coisas novas.",
    characteristics: [
      "Evita situações desconhecidas",
      "Prefere não tentar do que tentar e falhar",
      "Fica ansioso com mudanças",
      "Tem medo de julgamento dos outros",
      "Fica paralisado por possíveis falhas"
    ],
    impact: "Limita crescimento pessoal e profissional, mantendo a pessoa na zona de conforto.",
    strategies: [
      "Reenquadre falhas como oportunidades de aprendizado",
      "Comece com desafios pequenos",
      "Pratique aceitação da imperfeição",
      "Foque no processo, não apenas no resultado",
      "Desenvolva resiliência emocional"
    ],
    color: "text-yellow-600",
    icon: Shield
  },
  pensamento_binario: {
    name: "O Binário",
    description: "O sabotador que vê tudo como preto ou branco, sem nuances.",
    characteristics: [
      "Vê situações como 'tudo ou nada'",
      "Tem dificuldade com nuances",
      "É muito rígido em suas opiniões",
      "Não aceita resultados intermediários",
      "É inflexível em suas decisões"
    ],
    impact: "Cria expectativas irreais e dificulta flexibilidade e adaptação.",
    strategies: [
      "Pratique ver nuances nas situações",
      "Aceite que a vida tem tons de cinza",
      "Desenvolva flexibilidade de pensamento",
      "Foque em progresso gradual",
      "Pratique aceitação de diferentes perspectivas"
    ],
    color: "text-gray-600",
    icon: Eye
  },
  vitima: {
    name: "A Vítima",
    description: "O sabotador que sempre se vê como vítima das circunstâncias.",
    characteristics: [
      "Sempre acha que a vida é injusta",
      "Culpa outros pelos seus problemas",
      "Sente que não tem controle",
      "Acha que outros têm mais sorte",
      "Evita assumir responsabilidade"
    ],
    impact: "Reduz autonomia, motivação e capacidade de mudança.",
    strategies: [
      "Assuma responsabilidade pelas suas escolhas",
      "Foque no que você pode controlar",
      "Desenvolva mentalidade de crescimento",
      "Pratique gratidão pelas oportunidades",
      "Aceite que você tem poder de mudança"
    ],
    color: "text-pink-600",
    icon: UserCheck
  },
  controle: {
    name: "O Controlador",
    description: "O sabotador que precisa controlar tudo ao seu redor.",
    characteristics: [
      "Precisa controlar tudo",
      "Fica ansioso com imprevistos",
      "Tem dificuldade em delegar",
      "Precisa saber de tudo",
      "Fica frustrado quando outros não seguem seu jeito"
    ],
    impact: "Cria estresse desnecessário e dificulta relacionamentos e colaboração.",
    strategies: [
      "Pratique aceitação do que não pode controlar",
      "Aprenda a delegar e confiar",
      "Desenvolva flexibilidade",
      "Foque no que realmente importa",
      "Pratique mindfulness e presença"
    ],
    color: "text-indigo-600",
    icon: Settings
  },
  aprovacao: {
    name: "O Aprovador",
    description: "O sabotador que precisa da aprovação dos outros para se sentir bem.",
    characteristics: [
      "Precisa da aprovação dos outros",
      "Fica ansioso com rejeição",
      "Tem dificuldade em tomar decisões sozinho",
      "Preocupa-se com o que outros pensam",
      "Precisa agradar todos"
    ],
    impact: "Reduz autenticidade, confiança e capacidade de tomar decisões independentes.",
    strategies: [
      "Desenvolva autoconfiança",
      "Pratique tomar decisões independentes",
      "Aceite que não pode agradar todos",
      "Foque em seus próprios valores",
      "Desenvolva autoestima interna"
    ],
    color: "text-green-600",
    icon: MessageSquare
  }
};

const SaboteurTest: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAnswer = async (value: number) => {
    setAnswers(prev => ({
      ...prev,
      [saboteurQuestions[currentQuestion].id]: value
    }));
    
    // Salvar resposta individual no banco
    await saveAnswer(saboteurQuestions[currentQuestion].id, value);
  };

  const saveAnswer = async (questionId: number, answer: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];
      
      // Salvar na tabela daily_responses com seção saboteurs
      const { error } = await supabase
        .from('daily_responses')
        .upsert({
          user_id: user.id,
          date: today,
          section: 'saboteurs',
          question_id: `saboteur_${questionId}`,
          answer: answer.toString(),
          points_earned: 5, // Pontos por resposta
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Erro ao salvar resposta do sabotador:', error);
      } else {
        console.log(`Resposta do sabotador salva: ${questionId} = ${answer}`);
      }
    } catch (error) {
      console.error('Erro ao salvar resposta do sabotador:', error);
    }
  };

  const calculateScores = () => {
    const categoryScores: Record<string, number> = {};
    
    Object.keys(saboteurTypes).forEach(category => {
      const categoryQuestions = saboteurQuestions.filter(q => q.category === category);
      let totalScore = 0;
      let maxScore = 0;
      
      categoryQuestions.forEach(question => {
        const answer = answers[question.id] || 0;
        totalScore += answer * question.weight;
        maxScore += 5 * question.weight; // 5 é o valor máximo da escala
      });
      
      categoryScores[category] = (totalScore / maxScore) * 100;
    });
    
    setScores(categoryScores);
  };

  const handleFinish = async () => {
    setIsLoading(true);
    calculateScores();
    await saveTestResults();
    setShowResults(true);
    setIsLoading(false);
  };

  const saveTestResults = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];
      const categoryScores: Record<string, number> = {};
      
      // Calcular scores por categoria
      Object.keys(saboteurTypes).forEach(category => {
        const categoryQuestions = saboteurQuestions.filter(q => q.category === category);
        let totalScore = 0;
        let maxScore = 0;
        
        categoryQuestions.forEach(question => {
          const answer = answers[question.id] || 0;
          totalScore += answer * question.weight;
          maxScore += 5 * question.weight;
        });
        
        categoryScores[category] = (totalScore / maxScore) * 100;
      });

      // Salvar resultados do teste de sabotadores
      const { error } = await supabase
        .from('daily_responses')
        .upsert({
          user_id: user.id,
          date: today,
          section: 'saboteurs_results',
          question_id: 'saboteur_test_complete',
          answer: JSON.stringify(categoryScores),
          text_response: `Teste de sabotadores concluído com ${Object.keys(answers).length} respostas`,
          points_earned: 50, // Pontos por completar o teste
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Erro ao salvar resultados do teste:', error);
        toast({
          title: "Erro",
          description: "Não foi possível salvar os resultados do teste",
          variant: "destructive"
        });
      } else {
          console.log('Resultados do teste de sabotadores salvos:', categoryScores);
          
          // Determinar nível de risco
          const averageScore = Object.values(categoryScores).reduce((a, b) => a + b, 0) / Object.keys(categoryScores).length;
          const riskLevel = averageScore > 70 ? 'alto' : averageScore > 40 ? 'médio' : 'baixo';
          
          toast({
            title: "Teste Concluído! 🎯",
            description: `Seus resultados foram salvos. Nível de risco: ${riskLevel}`,
            duration: 5000
          });
      }
    } catch (error) {
      console.error('Erro ao salvar resultados:', error);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
    setScores({});
  };

  const getTopSaboteurs = () => {
    return Object.entries(scores)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);
  };

  const getOverallScore = () => {
    const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
    return totalScore / Object.keys(scores).length;
  };

  const getScoreLevel = (score: number) => {
    if (score < 30) return { level: "Baixo", color: "text-green-600", bgColor: "bg-green-100" };
    if (score < 60) return { level: "Médio", color: "text-yellow-600", bgColor: "bg-yellow-100" };
    return { level: "Alto", color: "text-red-600", bgColor: "bg-red-100" };
  };

  const progress = ((currentQuestion + 1) / saboteurQuestions.length) * 100;

  if (showResults) {
    const topSaboteurs = getTopSaboteurs();
    const overallScore = getOverallScore();
    const overallLevel = getScoreLevel(overallScore);

    return (
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Brain className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold">Relatório de Sabotadores</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Análise completa dos seus padrões de sabotagem interna
          </p>
        </div>

        {/* Overall Score */}
        <Card className="health-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-6 w-6" />
              Score Geral de Sabotadores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div className={`text-6xl font-bold ${overallLevel.color}`}>
                {overallScore.toFixed(0)}%
              </div>
              <Badge className={`text-lg px-4 py-2 ${overallLevel.bgColor} ${overallLevel.color}`}>
                Nível {overallLevel.level}
              </Badge>
              <p className="text-muted-foreground">
                {overallScore < 30 
                  ? "Excelente! Você tem boa consciência dos seus padrões."
                  : overallScore < 60
                  ? "Atenção! Alguns sabotadores podem estar afetando seu progresso."
                  : "Alerta! Seus sabotadores estão significativamente impactando sua vida."
                }
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Top Saboteurs */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-orange-500" />
            Seus Principais Sabotadores
          </h2>
          
          {topSaboteurs.map(([category, score], index) => {
            const saboteur = saboteurTypes[category];
            const Icon = saboteur.icon;
            const level = getScoreLevel(score);
            
            return (
              <Card key={category} className="health-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon className={`h-8 w-8 ${saboteur.color}`} />
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          #{index + 1} {saboteur.name}
                          <Badge className={`${level.bgColor} ${level.color}`}>
                            {level.level}
                          </Badge>
                        </CardTitle>
                        <p className="text-muted-foreground">{saboteur.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-3xl font-bold ${saboteur.color}`}>
                        {score.toFixed(0)}%
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Características:</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {saboteur.characteristics.map((char, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-muted-foreground rounded-full" />
                          {char}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Impacto:</h4>
                    <p className="text-sm text-muted-foreground">{saboteur.impact}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-yellow-500" />
                      Estratégias de Superação:
                    </h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {saboteur.strategies.map((strategy, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          {strategy}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* All Scores */}
        <Card className="health-card">
          <CardHeader>
            <CardTitle>Análise Completa por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(scores).map(([category, score]) => {
                const saboteur = saboteurTypes[category];
                const Icon = saboteur.icon;
                const level = getScoreLevel(score);
                
                return (
                  <div key={category} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Icon className={`h-5 w-5 ${saboteur.color}`} />
                      <div>
                        <p className="font-medium">{saboteur.name}</p>
                        <p className="text-sm text-muted-foreground">{score.toFixed(0)}%</p>
                      </div>
                    </div>
                    <Badge className={`${level.bgColor} ${level.color}`}>
                      {level.level}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <Button onClick={handleRestart} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Refazer Teste
          </Button>
          <Button className="btn-gradient">
            <BookOpen className="h-4 w-4 mr-2" />
            Ver Estratégias Detalhadas
          </Button>
        </div>
      </div>
    );
  }

  const currentQ = saboteurQuestions[currentQuestion];

  return (
    <div className="mobile-padding space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Brain className="h-8 w-8 lg:h-10 lg:w-10 text-primary" />
          <h1 className="mobile-text-2xl font-bold">Teste de Sabotadores</h1>
        </div>
        <p className="text-muted-foreground mobile-text-lg">
          Identifique os padrões que podem estar sabotando seu progresso
        </p>
      </div>

      {/* Progress */}
      <Card className="health-card">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Questão {currentQuestion + 1} de {saboteurQuestions.length}</span>
              <span>{Math.round(progress)}% completo</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Question */}
      <Card className="health-card">
        <CardHeader className="pb-3 md:pb-6">
          <CardTitle className="text-lg md:text-xl leading-tight">
            {currentQ.text}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={answers[currentQ.id]?.toString() || ""}
            onValueChange={(value) => handleAnswer(parseInt(value))}
            className="space-y-2 md:space-y-4"
          >
            <div className="flex items-center space-x-2 md:space-x-3 p-2 md:p-3 rounded-lg border hover:bg-muted/20 cursor-pointer">
              <RadioGroupItem value="1" id={`q${currentQ.id}-1`} />
              <Label htmlFor={`q${currentQ.id}-1`} className="text-sm md:text-base cursor-pointer">
                Discordo Totalmente
              </Label>
            </div>
            <div className="flex items-center space-x-2 md:space-x-3 p-2 md:p-3 rounded-lg border hover:bg-muted/20 cursor-pointer">
              <RadioGroupItem value="2" id={`q${currentQ.id}-2`} />
              <Label htmlFor={`q${currentQ.id}-2`} className="text-sm md:text-base cursor-pointer">
                Discordo
              </Label>
            </div>
            <div className="flex items-center space-x-2 md:space-x-3 p-2 md:p-3 rounded-lg border hover:bg-muted/20 cursor-pointer">
              <RadioGroupItem value="3" id={`q${currentQ.id}-3`} />
              <Label htmlFor={`q${currentQ.id}-3`} className="text-sm md:text-base cursor-pointer">
                Neutro
              </Label>
            </div>
            <div className="flex items-center space-x-2 md:space-x-3 p-2 md:p-3 rounded-lg border hover:bg-muted/20 cursor-pointer">
              <RadioGroupItem value="4" id={`q${currentQ.id}-4`} />
              <Label htmlFor={`q${currentQ.id}-4`} className="text-sm md:text-base cursor-pointer">
                Concordo
              </Label>
            </div>
            <div className="flex items-center space-x-2 md:space-x-3 p-2 md:p-3 rounded-lg border hover:bg-muted/20 cursor-pointer">
              <RadioGroupItem value="5" id={`q${currentQ.id}-5`} />
              <Label htmlFor={`q${currentQ.id}-5`} className="text-sm md:text-base cursor-pointer">
                Concordo Totalmente
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex flex-col md:flex-row justify-between gap-2 md:gap-4">
        <Button
          variant="outline"
          onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
          disabled={currentQuestion === 0}
          className="h-12 md:h-10 text-sm md:text-base w-full md:w-auto"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Anterior
        </Button>

        {currentQuestion === saboteurQuestions.length - 1 ? (
          <Button
            onClick={handleFinish}
            disabled={!answers[currentQ.id] || isLoading}
            className="mobile-button-lg w-full lg:w-auto"
          >
            {isLoading ? 'Processando...' : 'Finalizar Teste'}
            <CheckCircle className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={() => setCurrentQuestion(prev => prev + 1)}
            disabled={!answers[currentQ.id] || isLoading}
            className="mobile-button-lg w-full lg:w-auto"
          >
            Próxima
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default SaboteurTest; 