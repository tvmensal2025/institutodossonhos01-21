
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { GalileuHealthWheel } from '@/components/ui/galileu-health-wheel';
import { DrVitalFeedback } from '@/components/shared/DrVitalFeedback';
import { 
  CheckCircle, 
  AlertTriangle,
  Heart,
  Brain,
  Utensils
} from 'lucide-react';

interface HealthWheelSessionProps {
  sessionId: string;
  userId: string;
  content: {
    systems?: Record<string, {
      name: string;
      icon: string;
      color: string;
      questions: (string | { id: string; text: string; type: string })[];
    }> | Array<{
      system: string;
      icon?: string;
      color?: string;
      questions: (string | { id: string; text: string; type: string })[];
    }>;
    areas?: Array<{
      id: string;
      name: string;
      question: string | { id: string; text: string; type: string };
      icon: string;
      color: string;
      emoji_options: Array<{
        value: number;
        emoji: string;
        label: string;
      }>;
    }>;
  };
  onComplete: () => void;
}

interface QuestionResponse {
  question: string;
  answer: string;
  followUpQuestion?: string;
  followUpAnswer?: string;
}

interface SystemResult {
  systemName: string;
  responses: QuestionResponse[];
  score: number;
  color: string;
  icon: string;
  symptomsCount: number;
  symptoms: string[];
}

export const HealthWheelSession: React.FC<HealthWheelSessionProps> = ({
  sessionId,
  userId,
  content,
  onComplete
}) => {
  const { toast } = useToast();
  const [currentSystemIndex, setCurrentSystemIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, QuestionResponse[]>>({});
  const [showResults, setShowResults] = useState(false);
  const [sessionStatus, setSessionStatus] = useState<string>('');
  const [pendingFollowUp, setPendingFollowUp] = useState<{
    question: string;
    answer: string;
    systemKey: string;
  } | null>(null);
  const [showDrVitalFeedback, setShowDrVitalFeedback] = useState(false);

  // Verificar se a sessão já está completa ao carregar
  useEffect(() => {
    const checkSessionStatus = async () => {
      try {
        const { data: session } = await supabase
          .from('user_sessions')
          .select('status, progress')
          .eq('session_id', sessionId)
          .eq('user_id', userId)
          .single();

        if (session && session.status === 'completed') {
          setSessionStatus('completed');
          // Carregar respostas salvas se a sessão estiver completa
          await loadSavedResponses();
          setShowResults(true);
        }
      } catch (error) {
        console.error('Error checking session status:', error);
      }
    };

    checkSessionStatus();
  }, [sessionId, userId]);

  // Carregar respostas salvas para sessão completa
  const loadSavedResponses = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const section = content.areas ? 'life_wheel' : 'health_wheel';
      
      const { data: savedResponses } = await supabase
        .from('daily_responses')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)
        .eq('section', section);

      if (savedResponses && savedResponses.length > 0) {
        const responsesBySystem: Record<string, QuestionResponse[]> = {};
        
        savedResponses.forEach(response => {
          try {
            const textResponse = JSON.parse(response.text_response || '[]');
            const systemKey = response.question_id.replace(`${section}_`, '');
            responsesBySystem[systemKey] = textResponse;
          } catch (error) {
            console.error('Error parsing saved response:', error);
          }
        });
        
        setResponses(responsesBySystem);
      }
    } catch (error) {
      console.error('Error loading saved responses:', error);
    }
  };
  
  // Converter o objeto/array systems/areas em array para navegação
  const systemsArray: [string, { name: string; icon: string; color: string; questions: string[] }][] = (() => {
    // Verificar se systems existe e se é array ou objeto
    if (content.systems) {
      // Se systems é um array (formato novo do JSON)
      if (Array.isArray(content.systems)) {
        return content.systems.map((system: any, index: number) => {
          console.log('Processing system array item:', system);
          
          const convertedQuestions = system.questions.map((q: any) => {
            console.log('System question type:', typeof q);
            console.log('System question value:', q);
            const questionText = typeof q === 'string' ? q : q?.text || '';
            console.log('Converted system question text:', questionText);
            return questionText;
          });
          
          return [system.system || `system_${index}`, {
            name: system.system || `Sistema ${index + 1}`,
            icon: system.icon || '🔍',
            color: system.color || '#666666',
            questions: convertedQuestions
          }];
        });
      } 
      // Se systems é um objeto (formato antigo)
      else {
        return Object.entries(content.systems).map(([key, system]: [string, any]) => {
          console.log('Processing system object:', key, system);
          
          const convertedQuestions = system.questions.map((q: any) => {
            console.log('System question type:', typeof q);
            console.log('System question value:', q);
            const questionText = typeof q === 'string' ? q : q?.text || '';
            console.log('Converted system question text:', questionText);
            return questionText;
          });
          
          return [key, {
            name: system.name,
            icon: system.icon,
            color: system.color,
            questions: convertedQuestions
          }];
        });
      }
    }
    // Se não tem systems, verificar areas (formato Roda da Vida)
    else if (content.areas) {
      return content.areas.map((area: any) => {
        console.log('Processing area:', area);
        console.log('Area question type:', typeof area.question);
        console.log('Area question value:', area.question);
        
        // Fallback robusto: se não houver pergunta, gera uma pergunta padrão
        const fallbackText = `Como você avalia sua área de ${area.name} hoje?`;
        const questionText = typeof area.question === 'string'
          ? (area.question?.trim?.() ? area.question : fallbackText)
          : (area.question?.text?.trim?.() ? area.question.text : fallbackText);
        console.log('Converted question text:', questionText);
        
        return [area.id, { 
          name: area.name, 
          icon: area.icon, 
          color: area.color, 
          questions: [questionText] 
        }];
      });
    }
    
    return [];
  })();
  const [currentSystemKey, currentSystemData] = systemsArray[currentSystemIndex] || [undefined, undefined];
  
  const currentQuestion = currentSystemData?.questions[currentQuestionIndex];
  console.log('Final current question value:', currentQuestion);
  console.log('Final current question type:', typeof currentQuestion);
  const totalQuestions = systemsArray.reduce((total, [_, system]) => total + system.questions.length, 0);
  const answeredQuestions = Object.values(responses).reduce((total, systemResponses) => total + systemResponses.length, 0);
  const progress = (answeredQuestions / totalQuestions) * 100;

  const handleResponse = (answer: string) => {
    if (!currentSystemKey || !currentQuestion) return;

    // Se a resposta for "Ocasionalmente" ou "Frequentemente", preparar pergunta de follow-up
    if (answer === 'Ocasionalmente' || answer === 'Frequentemente') {
      setPendingFollowUp({
        question: currentQuestion,
        answer: answer,
        systemKey: currentSystemKey as string
      });
      return; // Não avança ainda
    }

    // Resposta simples (Não)
    const response: QuestionResponse = {
      question: currentQuestion,
      answer
    };

    setResponses(prev => ({
      ...prev,
      [currentSystemKey as string]: [...(prev[currentSystemKey as string] || []), response]
    }));

    nextQuestion();
  };

  const handleEmojiResponse = (value: number, emoji: string, label: string) => {
    if (!currentSystemKey || !currentQuestion) return;

    const response: QuestionResponse = {
      question: currentQuestion,
      answer: `${value} - ${emoji} ${label}`
    };

    setResponses(prev => ({
      ...prev,
      [currentSystemKey as string]: [...(prev[currentSystemKey as string] || []), response]
    }));

    nextQuestion();
  };

  // Função para lidar com a resposta de intensidade (follow-up)
  const handleIntensityResponse = (intensity: string) => {
    if (!pendingFollowUp) return;

    const response: QuestionResponse = {
      question: pendingFollowUp.question,
      answer: pendingFollowUp.answer,
      followUpQuestion: `Qual a intensidade dessa ${pendingFollowUp.question.toLowerCase()}?`,
      followUpAnswer: intensity
    };

    setResponses(prev => ({
      ...prev,
      [pendingFollowUp.systemKey]: [...(prev[pendingFollowUp.systemKey] || []), response]
    }));

    setPendingFollowUp(null);
    nextQuestion();
  };

  const nextQuestion = () => {
    if (currentSystemData && currentQuestionIndex < currentSystemData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else if (currentSystemIndex < systemsArray.length - 1) {
      setCurrentSystemIndex(currentSystemIndex + 1);
      setCurrentQuestionIndex(0);
    } else {
      // Terminou todas as perguntas
      completeAssessment();
    }
  };

  const completeAssessment = async () => {
    try {
      const results = calculateResults();
      
      // Salvar respostas simples na tabela de daily_responses para tracking
      const today = new Date().toISOString().split('T')[0];
      
      for (const result of results) {
        await supabase
          .from('daily_responses')
          .insert({
            user_id: userId,
            date: today,
            section: content.areas ? 'life_wheel' : 'health_wheel',
            question_id: `${content.areas ? 'life_wheel' : 'health_wheel'}_${result.systemName.toLowerCase().replace(/\s+/g, '_')}`,
            answer: `Score: ${result.score}%`,
            text_response: JSON.stringify(result.responses),
            points_earned: Math.max(10, result.score)
          });
      }
      
      // Atualizar status da sessão
      await supabase
        .from('user_sessions')
        .update({
          status: 'completed',
          progress: 100,
          completed_at: new Date().toISOString()
        })
        .eq('session_id', sessionId)
        .eq('user_id', userId);
      
      setShowDrVitalFeedback(true);
    } catch (error) {
      console.error('Error completing assessment:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar os resultados",
        variant: "destructive"
      });
    }
  };

  const calculateResults = (): SystemResult[] => {
    return systemsArray.map(([systemKey, systemData]) => {
      const systemResponses = responses[systemKey as string] || [];
      
      let score = 0;
      
      if (content.areas) {
        // Roda da Vida - calcular score baseado nos valores numéricos (1-5 convertido para 0-100)
        const totalScore = systemResponses.reduce((sum, response) => {
          const match = response.answer.match(/^(\d+)\s*-/);
          const value = match ? parseInt(match[1]) : 0;
          return sum + value;
        }, 0);
        score = systemResponses.length > 0 ? Math.round((totalScore / (systemResponses.length * 5)) * 100) : 0;
      } else {
        // Roda da Saúde - calcular score baseado nas respostas "Não"
        const noCount = systemResponses.filter(r => r.answer === 'Não').length;
        const totalQuestions = systemData.questions.length;
        score = totalQuestions > 0 ? Math.round((noCount / totalQuestions) * 100) : 0;
      }
      
      // Coletar sintomas que tiveram resposta "Ocasionalmente" ou "Frequentemente"
      const symptoms = systemResponses
        .filter(r => r.answer === 'Ocasionalmente' || r.answer === 'Frequentemente')
        .map(r => r.question);
      
      return {
        systemName: systemData.name,
        responses: systemResponses,
        score,
        color: systemData.color,
        icon: systemData.icon,
        symptomsCount: systemData.questions.length,
        symptoms
      };
    });
  };

  const renderQuestionCard = () => {
    if (!currentSystemData || !currentQuestion) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-xl mb-4">Carregando avaliação...</div>
            <Progress value={0} className="w-64" />
            {/* Mensagem de fallback quando não há perguntas configuradas */}
            {systemsArray.length > 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                Nenhuma pergunta definida para {systemsArray[0][1].name}. Usando pergunta padrão.
              </p>
            )}
          </div>
        </div>
      );
    }

    // Se estamos esperando uma pergunta de follow-up de intensidade
    if (pendingFollowUp) {
      return (
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="text-4xl mr-3">{currentSystemData?.icon}</div>
              <div>
                <CardTitle className="text-lg">{currentSystemData?.name}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Pergunta de follow-up sobre intensidade
                </p>
              </div>
            </div>
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-muted-foreground">
              {answeredQuestions} de {totalQuestions} perguntas respondidas
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                  Sua resposta anterior: <strong>"{pendingFollowUp.answer}"</strong>
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  Para: {pendingFollowUp.question}
                </p>
              </div>
              
              <p className="text-lg mb-6">
                Qual a intensidade/gravidade desse sintoma?
              </p>
              
              <div className="space-y-3">
                {['Leve', 'Moderada', 'Intensa'].map((intensity) => (
                  <Button
                    key={intensity}
                    variant="outline"
                    size="lg"
                    className="w-full text-left justify-start h-auto py-4 px-6"
                    onClick={() => handleIntensityResponse(intensity)}
                    style={{
                      borderColor: 
                        intensity === "Leve" ? "#10b981" :
                        intensity === "Moderada" ? "#f59e0b" : "#ef4444",
                      color: 
                        intensity === "Leve" ? "#10b981" :
                        intensity === "Moderada" ? "#f59e0b" : "#ef4444"
                    }}
                  >
                    <div className="flex items-center">
                      {intensity === "Leve" && "🟢"}
                      {intensity === "Moderada" && "🟡"}
                      {intensity === "Intensa" && "🔴"}
                      <span className="ml-3 text-lg">{intensity}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="text-4xl mr-3">{currentSystemData?.icon}</div>
            <div>
              <CardTitle className="text-lg">{currentSystemData?.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Área {currentSystemIndex + 1} de {systemsArray.length} • Pergunta {currentQuestionIndex + 1} de {currentSystemData?.questions.length || 0}
              </p>
            </div>
          </div>
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-muted-foreground">
            {answeredQuestions} de {totalQuestions} perguntas respondidas
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-lg mb-6">
              {currentQuestion}
            </p>
            <div className="space-y-3">
              {/* Verificar se é Roda da Vida (com emoji_options) ou Roda da Saúde */}
              {content.areas ? (
                // Roda da Vida - mostrar opções de emoji (com fallback caso não haja emoji_options)
                (content.areas.find(area => area.id === currentSystemKey)?.emoji_options || [
                  { value: 1, emoji: '😟', label: 'Muito baixa' },
                  { value: 2, emoji: '😕', label: 'Baixa' },
                  { value: 3, emoji: '😐', label: 'Média' },
                  { value: 4, emoji: '🙂', label: 'Boa' },
                  { value: 5, emoji: '😄', label: 'Excelente' },
                ]).map((option) => (
                  <Button
                    key={option.value}
                    variant="outline"
                    size="lg"
                    className="w-full text-left justify-start h-auto py-4 px-6"
                    onClick={() => handleEmojiResponse(option.value, option.emoji, option.label)}
                  >
                    <div className="flex items-center">
                      <span className="text-3xl mr-4">{option.emoji}</span>
                      <div>
                        <div className="text-lg font-medium">{option.label}</div>
                        <div className="text-sm text-muted-foreground">Valor: {option.value}</div>
                      </div>
                    </div>
                  </Button>
                ))
              ) : (
                // Roda da Saúde - mostrar opções tradicionais
                ['Não', 'Ocasionalmente', 'Frequentemente'].map((option) => (
                  <Button
                    key={option}
                    variant="outline"
                    size="lg"
                    className="w-full text-left justify-start h-auto py-4 px-6"
                    onClick={() => handleResponse(option)}
                    style={{
                      borderColor: 
                        option === "Não" ? "#10b981" :
                        option === "Ocasionalmente" ? "#f59e0b" : "#ef4444",
                      color: 
                        option === "Não" ? "#10b981" :
                        option === "Ocasionalmente" ? "#f59e0b" : "#ef4444"
                    }}
                  >
                    <div className="flex items-center">
                      {option === "Não" && "✅"}
                      {option === "Ocasionalmente" && "🟡"}
                      {option === "Frequentemente" && "🔴"}
                      <span className="ml-3 text-lg">{option}</span>
                    </div>
                  </Button>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderResults = () => {
    const results = calculateResults();
    const totalScore = results.reduce((sum, result) => sum + result.score, 0);
    const averageScore = results.length > 0 ? totalScore / results.length : 0;
    
    // Converter para formato do GalileuHealthWheel
    const healthWheelData = results.map(result => ({
      systemName: result.systemName,
      score: result.score / 10, // Converter de 0-100 para 0-10
      color: result.color,
      icon: result.icon,
      symptomsCount: result.symptomsCount,
      symptoms: result.symptoms // Usar os sintomas calculados
    }));

    return (
      <div className="min-h-screen bg-background">
        <div className="bg-card border-b border-border">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
                  {content.areas ? '🎯 Resultados da Roda da Vida' : '🩺 Resultados da Roda da Saúde'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {content.areas ? 'Avaliação de Equilíbrio de Vida' : 'Avaliação Completa de Saúde'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="space-y-8">
            {/* Cards informativos movidos para o final da página */}

            {/* Gráficos lado a lado */}
            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="shadow-xl border-0 bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
                <CardHeader className="text-center pb-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-t-lg">
                  <CardTitle className="text-white flex items-center justify-center gap-2 text-lg">
                    {content.areas ? '🎯 Roda da Vida' : '🩺 Roda da Saúde'}
                  </CardTitle>
                  <p className="text-sm text-gray-300">Avaliação Atual dos Sistemas</p>
                </CardHeader>
                <CardContent className="flex justify-center p-6">
                  <GalileuHealthWheel 
                    data={healthWheelData}
                    totalScore={averageScore / 10}
                    evolutionData={[]}
                    title=""
                    size={450}
                    className="w-full"
                    showEvolutionChart={false}
                  />
                </CardContent>
              </Card>

              <Card className="shadow-xl border-0 bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
                <CardHeader className="text-center pb-4 bg-gradient-to-r from-green-600/20 to-blue-600/20 rounded-t-lg">
                  <CardTitle className="text-white flex items-center justify-center gap-2 text-lg">
                    📊 Score Geral
                  </CardTitle>
                  <p className="text-sm text-gray-300">Pontuação Total da Avaliação</p>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Termômetro de Score - MAIOR */}
                  <div className="bg-black/30 rounded-lg p-8">
                    <div className="text-center">
                      <div className="relative mb-6">
                        <svg width="300" height="180" className="mx-auto">
                          <defs>
                            <linearGradient id="thermometerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#ef4444" />
                              <stop offset="30%" stopColor="#f59e0b" />
                              <stop offset="70%" stopColor="#84cc16" />
                              <stop offset="100%" stopColor="#10b981" />
                            </linearGradient>
                          </defs>
                          
                          {/* Background arc */}
                          <path
                            d="M 50 140 A 100 100 0 0 1 250 140"
                            fill="none"
                            stroke="#374151"
                            strokeWidth="16"
                            strokeLinecap="round"
                          />
                          
                          {/* Progress arc */}
                          <path
                            d="M 50 140 A 100 100 0 0 1 250 140"
                            fill="none"
                            stroke="url(#thermometerGradient)"
                            strokeWidth="16"
                            strokeLinecap="round"
                            strokeDasharray={`${(averageScore / 100) * 314} 314`}
                          />
                          
                          {/* Center score */}
                          <text
                            x="150"
                            y="110"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="text-5xl font-bold fill-white"
                          >
                            {averageScore.toFixed(0)}%
                          </text>
                          
                          <text
                            x="150"
                            y="135"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="text-sm fill-gray-400 uppercase tracking-wider"
                          >
                            Score Geral
                          </text>
                          
                          {/* Scale markers */}
                          <text x="50" y="165" textAnchor="middle" className="text-sm fill-gray-500">0%</text>
                          <text x="100" y="80" textAnchor="middle" className="text-sm fill-gray-500">25%</text>
                          <text x="150" y="60" textAnchor="middle" className="text-sm fill-gray-500">50%</text>
                          <text x="200" y="80" textAnchor="middle" className="text-sm fill-gray-500">75%</text>
                          <text x="250" y="165" textAnchor="middle" className="text-sm fill-gray-500">100%</text>
                        </svg>
                      </div>
                      
                      <div className="flex justify-center space-x-6 text-sm">
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 rounded-full bg-red-500"></div>
                          <span className="text-gray-400">0-40% Crítico</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                          <span className="text-gray-400">41-70% Atenção</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 rounded-full bg-green-500"></div>
                          <span className="text-gray-400">71-100% Excelente</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Seção Resumo por Área removida do painel */}
                </CardContent>
              </Card>
            </div>

            {/* Interpretação dos Resultados */}
            <Card>
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  📋 Interpretação dos Resultados
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center p-4 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">0-40%</div>
                    <div className="text-sm text-red-700 dark:text-red-300">Crítico</div>
                    <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                      {content.areas ? 'Área requer atenção urgente' : 'Necessita atenção médica urgente'}
                    </div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800">
                    <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">41-70%</div>
                    <div className="text-sm text-yellow-700 dark:text-yellow-300">Atenção</div>
                    <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                      {content.areas ? 'Área com potencial de melhoria' : 'Requer acompanhamento médico'}
                    </div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">71-100%</div>
                    <div className="text-sm text-green-700 dark:text-green-300">Excelente</div>
                    <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                      {content.areas ? 'Área bem equilibrada' : 'Sistema funcionando adequadamente'}
                    </div>
                  </div>
                 </div>
               </CardContent>
             </Card>

               {/* Seção de Respostas Detalhadas removida do painel - dados continuam sendo salvos no Supabase */}

             {/* Cards informativos no final da página */}
             <div className="grid gap-4 md:grid-cols-2 mt-8">
               <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 dark:border-blue-800 dark:from-blue-950 dark:to-cyan-950 shadow-lg">
                 <CardHeader className="pb-3">
                   <CardTitle className="text-blue-800 dark:text-blue-200 text-base flex items-center gap-2">
                     {content.areas ? '🎯 Avaliação de Vida' : '📊 Avaliação de Saúde'}
                   </CardTitle>
                 </CardHeader>
                 <CardContent>
                   <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                     {content.areas 
                       ? 'Avaliação completa do seu equilíbrio de vida em múltiplas áreas importantes.'
                       : 'Avaliação completa dos principais sistemas do corpo humano.'
                     }
                   </p>
                 </CardContent>
               </Card>

               <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 dark:border-green-800 dark:from-green-950 dark:to-emerald-950 shadow-lg">
                 <CardHeader className="pb-3">
                   <CardTitle className="text-green-800 dark:text-green-200 text-base flex items-center gap-2">
                     📈 Score Geral: {averageScore.toFixed(1)}%
                   </CardTitle>
                 </CardHeader>
                 <CardContent>
                   <p className="text-sm text-green-700 dark:text-green-300 leading-relaxed">
                     {content.areas 
                       ? 'Seu nível geral de satisfação e equilíbrio de vida.'
                       : 'Seu nível geral de saúde baseado nos sistemas avaliados.'
                     }
                   </p>
                 </CardContent>
               </Card>
             </div>

              <div className="flex gap-4 justify-center mt-8">
               <Button onClick={onComplete} size="lg">
                 <CheckCircle className="w-5 h-5 mr-2" />
                 Finalizar Avaliação
               </Button>
               <Button variant="outline" size="lg" onClick={() => window.print()}>
                 📄 Imprimir Resultados
               </Button>
             </div>
           </div>
         </div>
       </div>
     );
  };

  const handleResetToDefault = () => {
    // Aqui você pode implementar a lógica para resetar os gráficos para o estado padrão
    console.log('Resetando gráficos para estado padrão...');
  };

  const handleNewAssessment = () => {
    setShowDrVitalFeedback(false);
    setCurrentSystemIndex(0);
    setCurrentQuestionIndex(0);
    setResponses({});
    setShowResults(false);
    setPendingFollowUp(null);
  };

  if (showDrVitalFeedback) {
    const results = calculateResults();
    const scores: Record<string, number> = {};
    const areas = results.map(result => {
      const normalizedScore = content.areas 
        ? Math.round(result.score / 20) // Converter 0-100 para 1-5 para áreas
        : Math.round(result.score / 10); // Converter 0-100 para 1-10 para saúde
      scores[result.systemName] = normalizedScore;
      return {
        id: result.systemName,
        name: result.systemName,
        icon: result.icon
      };
    });

    return (
      <DrVitalFeedback
        assessmentType={content.areas ? "life" : "health"}
        scores={scores}
        areas={areas}
        onResetToDefault={handleResetToDefault}
        onNewAssessment={handleNewAssessment}
        onShowResults={() => {}}
      />
    );
  }

  if (showResults) {
    return renderResults();
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {content.areas ? '🎯 Roda da Vida' : '🩺 Roda da Saúde IDS'}
        </h1>
        <p className="text-muted-foreground">
          {content.areas 
            ? `Avaliação de equilíbrio em ${systemsArray.length} áreas da vida`
            : `Avaliação completa de sintomas em ${systemsArray.length} sistemas corporais`
          }
        </p>
      </div>

      {renderQuestionCard()}

      <div className="flex justify-center gap-4 mt-6">
        <Badge variant="outline">
          Sistema {currentSystemIndex + 1} de {systemsArray.length}
        </Badge>
        <Badge variant="outline">
          {answeredQuestions}/{totalQuestions} perguntas
        </Badge>
      </div>
    </div>
  );
};
