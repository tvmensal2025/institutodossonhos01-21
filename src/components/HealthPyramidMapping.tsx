import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Slider } from '@/components/ui/slider';
import { Heart, Brain, Zap, Sparkles } from 'lucide-react';

interface Question {
  id: string;
  text: string;
  category: string;
  type: 'scale' | 'frequency' | 'yesno' | 'multiple';
  options?: string[];
}

interface CategoryResult {
  name: string;
  score: number;
  maxScore: number;
  percentage: number;
  color: string;
  icon: React.ReactNode;
  level: number;
  description: string;
  recommendations: string[];
  strengths: string[];
  concerns: string[];
}

const questions: Question[] = [
  // Saúde Espiritual (Nível 4 - Topo da Pirâmide)
  { id: 'esp1', text: 'Sente-se conectado a um propósito maior?', category: 'Saúde Espiritual', type: 'scale' },
  { id: 'esp2', text: 'Pratica alguma forma de espiritualidade?', category: 'Saúde Espiritual', type: 'frequency' },
  { id: 'esp3', text: 'Sente paz interior regularmente?', category: 'Saúde Espiritual', type: 'scale' },
  { id: 'esp4', text: 'Encontra significado em suas experiências de vida?', category: 'Saúde Espiritual', type: 'scale' },
  { id: 'esp5', text: 'Como classifica sua conexão espiritual?', category: 'Saúde Espiritual', type: 'scale' },
  { id: 'esp6', text: 'Sente-se parte de algo maior que você mesmo?', category: 'Saúde Espiritual', type: 'scale' },
  { id: 'esp7', text: 'Tem práticas de gratidão ou oração?', category: 'Saúde Espiritual', type: 'frequency' },
  { id: 'esp8', text: 'Como avalia seu senso de propósito na vida?', category: 'Saúde Espiritual', type: 'scale' },

  // Saúde Mental (Nível 3)
  { id: 'men1', text: 'Consegue manter foco e concentração?', category: 'Saúde Mental', type: 'scale' },
  { id: 'men2', text: 'Tem clareza mental para tomar decisões?', category: 'Saúde Mental', type: 'scale' },
  { id: 'men3', text: 'Experimenta pensamentos negativos recorrentes?', category: 'Saúde Mental', type: 'frequency' },
  { id: 'men4', text: 'Sente-se mentalmente sobrecarregado?', category: 'Saúde Mental', type: 'frequency' },
  { id: 'men5', text: 'Consegue controlar pensamentos sobre comida?', category: 'Saúde Mental', type: 'scale' },
  { id: 'men6', text: 'Tem pensamentos obsessivos sobre alimentação?', category: 'Saúde Mental', type: 'frequency' },
  { id: 'men7', text: 'Consegue planejar e organizar sua vida?', category: 'Saúde Mental', type: 'scale' },
  { id: 'men8', text: 'Como avalia sua saúde mental geral?', category: 'Saúde Mental', type: 'scale' },

  // Saúde Emocional (Nível 2)
  { id: 'emo1', text: 'Como classifica sua estabilidade emocional?', category: 'Saúde Emocional', type: 'scale' },
  { id: 'emo2', text: 'Identifica gatilhos emocionais para comer?', category: 'Saúde Emocional', type: 'scale' },
  { id: 'emo3', text: 'Como lida com estresse e ansiedade?', category: 'Saúde Emocional', type: 'scale' },
  { id: 'emo4', text: 'Associa comida com conforto emocional?', category: 'Saúde Emocional', type: 'frequency' },
  { id: 'emo5', text: 'Tem controle sobre suas emoções?', category: 'Saúde Emocional', type: 'scale' },
  { id: 'emo6', text: 'Consegue identificar suas emoções claramente?', category: 'Saúde Emocional', type: 'scale' },
  { id: 'emo7', text: 'Como reage a situações de frustração?', category: 'Saúde Emocional', type: 'scale' },
  { id: 'emo8', text: 'Quais emoções experimenta com mais frequência?', category: 'Saúde Emocional', type: 'multiple', options: ['Alegria', 'Ansiedade', 'Tristeza', 'Raiva', 'Medo', 'Calma'] },

  // Saúde Física (Nível 1 - Base da Pirâmide)
  { id: 'fis1', text: 'Como avalia seus níveis de energia diários?', category: 'Saúde Física', type: 'scale' },
  { id: 'fis2', text: 'Como classifica sua qualidade digestiva?', category: 'Saúde Física', type: 'scale' },
  { id: 'fis3', text: 'Apresenta inflamações crônicas?', category: 'Saúde Física', type: 'frequency' },
  { id: 'fis4', text: 'Como avalia sua vitalidade geral?', category: 'Saúde Física', type: 'scale' },
  { id: 'fis5', text: 'Como classifica sua qualidade do sono?', category: 'Saúde Física', type: 'scale' },
  { id: 'fis6', text: 'Qual seu nível de atividade física?', category: 'Saúde Física', type: 'scale' },
  { id: 'fis7', text: 'Apresenta dores crônicas?', category: 'Saúde Física', type: 'frequency' },
  { id: 'fis8', text: 'Como avalia sua qualidade da respiração?', category: 'Saúde Física', type: 'scale' },
  { id: 'fis9', text: 'Mantém hidratação adequada?', category: 'Saúde Física', type: 'scale' },
  { id: 'fis10', text: 'Como se sente em relação ao seu peso atual?', category: 'Saúde Física', type: 'scale' },
];

const categoryConfig = {
  'Saúde Espiritual': {
    color: '#8b5cf6',
    icon: <Sparkles className="w-6 h-6" />,
    level: 4,
    description: 'Conexão com propósito, significado e transcendência',
    baseRecommendations: [
      'Desenvolva práticas espirituais regulares',
      'Cultive momentos de reflexão e gratidão',
      'Busque atividades que tragam significado à sua vida'
    ]
  },
  'Saúde Mental': {
    color: '#06b6d4',
    icon: <Brain className="w-6 h-6" />,
    level: 3,
    description: 'Clareza mental, foco e capacidade cognitiva',
    baseRecommendations: [
      'Pratique técnicas de mindfulness e meditação',
      'Desenvolva estratégias de organização mental',
      'Busque atividades que estimulem a cognição'
    ]
  },
  'Saúde Emocional': {
    color: '#f59e0b',
    icon: <Heart className="w-6 h-6" />,
    level: 2,
    description: 'Estabilidade e inteligência emocional',
    baseRecommendations: [
      'Desenvolva habilidades de regulação emocional',
      'Pratique identificação e expressão de emoções',
      'Busque suporte profissional se necessário'
    ]
  },
  'Saúde Física': {
    color: '#ef4444',
    icon: <Zap className="w-6 h-6" />,
    level: 1,
    description: 'Base física: energia, vitalidade e bem-estar corporal',
    baseRecommendations: [
      'Mantenha rotina regular de exercícios',
      'Cuide da qualidade do sono e alimentação',
      'Faça acompanhamento médico preventivo'
    ]
  }
};

const HealthPyramidMapping: React.FC = () => {
  const [responses, setResponses] = useState<Record<string, number | string>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleResponse = (value: number | string) => {
    const questionId = questions[currentQuestion].id;
    setResponses(prev => ({ ...prev, [questionId]: value }));

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const calculateResults = (): CategoryResult[] => {
    const categories = Object.keys(categoryConfig);
    
    return categories.map(category => {
      const categoryQuestions = questions.filter(q => q.category === category);
      const categoryResponses = categoryQuestions
        .map(q => {
          const response = responses[q.id];
          if (typeof response === 'number') return response;
          if (typeof response === 'string') return 3; // Default for text responses
          return 0;
        })
        .filter(r => r > 0);
      
      const score = categoryResponses.reduce((sum, r) => sum + r, 0);
      const maxScore = categoryQuestions.length * 5;
      const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
      
      const config = categoryConfig[category as keyof typeof categoryConfig];
      
      // Generate dynamic recommendations based on score
      const recommendations = [...config.baseRecommendations];
      const strengths: string[] = [];
      const concerns: string[] = [];
      
      if (percentage >= 80) {
        strengths.push('Área muito bem desenvolvida');
        recommendations.push('Continue mantendo suas práticas atuais');
      } else if (percentage >= 60) {
        strengths.push('Área em bom desenvolvimento');
        recommendations.push('Foque em consistência e aprimoramento gradual');
      } else if (percentage >= 40) {
        concerns.push('Área necessita de atenção moderada');
        recommendations.push('Desenvolva estratégias específicas para esta área');
      } else {
        concerns.push('Área crítica que necessita atenção urgente');
        recommendations.push('Priorize esta área em seu plano de desenvolvimento');
      }
      
      return {
        name: category,
        score,
        maxScore,
        percentage,
        color: config.color,
        icon: config.icon,
        level: config.level,
        description: config.description,
        recommendations,
        strengths,
        concerns
      };
    });
  };

  const renderPyramid = (results: CategoryResult[]) => {
    const sortedResults = results.sort((a, b) => b.level - a.level);
    
    return (
      <div className="flex flex-col items-center space-y-4 py-8">
        {sortedResults.map((result, index) => {
          const width = `${60 + index * 15}%`;
          const opacity = Math.max(result.percentage / 100, 0.3);
          
          return (
            <div
              key={result.name}
              className="relative flex items-center justify-center text-white font-medium py-6 px-4 rounded-lg transition-all duration-300 hover:scale-105"
              style={{
                width,
                backgroundColor: result.color,
                opacity
              }}
            >
              <div className="flex items-center gap-3">
                {result.icon}
                <div className="text-center">
                  <div className="font-bold">{result.name}</div>
                  <div className="text-sm opacity-90">
                    {result.percentage.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const results = calculateResults();
  const averageScore = results.reduce((sum, r) => sum + r.percentage, 0) / results.length;

  const getOverallInterpretation = () => {
    if (averageScore >= 80) {
      return {
        level: 'Excelente',
        color: 'bg-green-500',
        message: 'Sua pirâmide de saúde está muito equilibrada! Continue mantendo essas práticas.',
        priority: 'Manutenção - Foque na consistência'
      };
    } else if (averageScore >= 60) {
      return {
        level: 'Bom',
        color: 'bg-blue-500',
        message: 'Sua saúde está em bom caminho. Identifique áreas específicas para aprimoramento.',
        priority: 'Desenvolvimento - Foque nas áreas mais baixas'
      };
    } else if (averageScore >= 40) {
      return {
        level: 'Moderado',
        color: 'bg-yellow-500',
        message: 'Sua pirâmide precisa de reforços. Priorize as bases físicas e emocionais.',
        priority: 'Atenção - Desenvolva estratégias específicas'
      };
    } else {
      return {
        level: 'Crítico',
        color: 'bg-red-500',
        message: 'Sua pirâmide precisa de reestruturação urgente. Busque suporte profissional.',
        priority: 'Urgente - Inicie pela base da pirâmide'
      };
    }
  };

  if (!isCompleted) {
    const progress = ((currentQuestion + 1) / questions.length) * 100;
    const question = questions[currentQuestion];

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
        <div className="container mx-auto max-w-4xl">
          <Card className="bg-gray-800/90 backdrop-blur border-gray-700">
            <CardHeader>
              <CardTitle className="text-center text-white">
                🏛️ Mapeamento da Pirâmide de Saúde
              </CardTitle>
              <div className="space-y-2">
                <Progress value={progress} className="w-full" />
                <p className="text-center text-gray-300">
                  Questão {currentQuestion + 1} de {questions.length}
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <Badge variant="outline" className="mb-4">
                  {question.category}
                </Badge>
                <h3 className="text-xl font-medium text-white mb-6">
                  {question.text}
                </h3>
              </div>

              {question.type === 'scale' && (
                <div className="space-y-4">
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Muito baixo</span>
                    <span>Muito alto</span>
                  </div>
                  <div className="grid grid-cols-5 gap-3">
                    {[1, 2, 3, 4, 5].map(value => (
                      <Button
                        key={value}
                        onClick={() => handleResponse(value)}
                        variant="outline"
                        className="h-16 flex-col space-y-1 hover:bg-primary/20 border-gray-600"
                      >
                        <span className="text-lg font-bold">{value}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {question.type === 'frequency' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {['Nunca', 'Raramente', 'Às vezes', 'Frequentemente', 'Sempre'].map((option, index) => (
                    <Button
                      key={option}
                      onClick={() => handleResponse(index + 1)}
                      variant="outline"
                      className="p-4 hover:bg-primary/20 border-gray-600"
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              )}

              {question.type === 'multiple' && question.options && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {question.options.map((option, index) => (
                    <Button
                      key={option}
                      onClick={() => handleResponse(index + 1)}
                      variant="outline"
                      className="p-4 hover:bg-primary/20 border-gray-600"
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const interpretation = getOverallInterpretation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="container mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <Card className="bg-gray-800/90 backdrop-blur border-gray-700">
          <CardHeader>
            <CardTitle className="text-center text-white">
              🏛️ Sua Pirâmide de Saúde
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className={`${interpretation.color} text-white border-0`}>
              <AlertDescription className="text-center">
                <div className="font-bold text-lg mb-2">
                  Estado Geral: {interpretation.level} ({averageScore.toFixed(1)}%)
                </div>
                <div className="mb-2">{interpretation.message}</div>
                <div className="text-sm opacity-90">{interpretation.priority}</div>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Pirâmide Visual */}
        <Card className="bg-gray-800/90 backdrop-blur border-gray-700">
          <CardHeader>
            <CardTitle className="text-white text-center">🏛️ Visualização da Pirâmide</CardTitle>
          </CardHeader>
          <CardContent>
            {renderPyramid(results)}
          </CardContent>
        </Card>

        {/* Resultados Detalhados */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {results
            .sort((a, b) => b.level - a.level)
            .map((result, index) => (
            <Card key={index} className="bg-gray-800/90 backdrop-blur border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  {result.icon}
                  {result.name}
                  <Badge variant="outline" className="ml-auto">
                    Nível {result.level}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-300">Pontuação</span>
                    <span className="text-white font-bold">
                      {result.percentage.toFixed(1)}%
                    </span>
                  </div>
                  <Progress 
                    value={result.percentage} 
                    className="w-full h-3"
                  />
                </div>
                
                <p className="text-gray-400 text-sm">
                  {result.description}
                </p>

                {result.strengths.length > 0 && (
                  <div>
                    <h4 className="text-green-400 font-medium mb-2">✅ Pontos Fortes:</h4>
                    <ul className="space-y-1">
                      {result.strengths.map((strength, idx) => (
                        <li key={idx} className="text-green-300 text-sm flex items-start gap-2">
                          <span className="text-green-400 mt-1">•</span>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.concerns.length > 0 && (
                  <div>
                    <h4 className="text-red-400 font-medium mb-2">⚠️ Áreas de Atenção:</h4>
                    <ul className="space-y-1">
                      {result.concerns.map((concern, idx) => (
                        <li key={idx} className="text-red-300 text-sm flex items-start gap-2">
                          <span className="text-red-400 mt-1">•</span>
                          {concern}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <h4 className="text-blue-400 font-medium mb-2">💡 Recomendações:</h4>
                  <ul className="space-y-1">
                    {result.recommendations.map((rec, idx) => (
                      <li key={idx} className="text-gray-300 text-sm flex items-start gap-2">
                        <span className="text-blue-400 mt-1">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Ações */}
        <Card className="bg-gray-800/90 backdrop-blur border-gray-700">
          <CardContent className="flex justify-center gap-4 pt-6">
            <Button 
              onClick={() => {
                setResponses({});
                setCurrentQuestion(0);
                setIsCompleted(false);
              }}
              variant="outline"
            >
              🔄 Nova Avaliação
            </Button>
            <Button>
              💾 Salvar Mapeamento
            </Button>
            <Button variant="secondary">
              📋 Gerar Plano Personalizado
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HealthPyramidMapping;