import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface Question {
  id: string;
  text: string;
  category: string;
}

interface CategoryResult {
  name: string;
  score: number;
  maxScore: number;
  percentage: number;
  color: string;
  icon: string;
  description: string;
  recommendations: string[];
}

const questions: Question[] = [
  // Crenças sobre Genética e Metabolismo
  { id: 'gen1', text: 'Sou geneticamente programado para ser gordo', category: 'Genética e Metabolismo' },
  { id: 'gen2', text: 'Meu metabolismo é muito lento', category: 'Genética e Metabolismo' },
  { id: 'gen3', text: 'Tenho tendência a engordar facilmente', category: 'Genética e Metabolismo' },
  { id: 'gen4', text: 'Meu corpo resiste a perder peso', category: 'Genética e Metabolismo' },
  { id: 'gen5', text: 'É muito difícil emagrecer depois dos 40', category: 'Genética e Metabolismo' },

  // Crenças sobre Controle e Força de Vontade
  { id: 'cont1', text: 'Não consigo controlar minha fome', category: 'Controle e Força de Vontade' },
  { id: 'cont2', text: 'Preciso de força de vontade para emagrecer', category: 'Controle e Força de Vontade' },
  { id: 'cont3', text: 'Tenho compulsão alimentar que não consigo controlar', category: 'Controle e Força de Vontade' },
  { id: 'cont4', text: 'Não consigo resistir a determinados alimentos', category: 'Controle e Força de Vontade' },
  { id: 'cont5', text: 'Não tenho tempo para cuidar da alimentação', category: 'Controle e Força de Vontade' },

  // Crenças sobre Prazer e Recompensa
  { id: 'praz1', text: 'Comida é meu único prazer/conforto', category: 'Prazer e Recompensa' },
  { id: 'praz2', text: 'Preciso de prazer na comida', category: 'Prazer e Recompensa' },
  { id: 'praz3', text: 'Mereço me recompensar com comida', category: 'Prazer e Recompensa' },
  { id: 'praz4', text: 'Comida é minha válvula de escape', category: 'Prazer e Recompensa' },
  { id: 'praz5', text: 'Sem comida não tenho prazer na vida', category: 'Prazer e Recompensa' },

  // Crenças sobre Dietas e Tratamentos
  { id: 'diet1', text: 'Dietas sempre falham no longo prazo', category: 'Dietas e Tratamentos' },
  { id: 'diet2', text: 'Já tentei de tudo e nada funciona para mim', category: 'Dietas e Tratamentos' },
  { id: 'diet3', text: 'Tratamentos para emagrecer são sempre temporários', category: 'Dietas e Tratamentos' },
  { id: 'diet4', text: 'Não existe solução definitiva para meu problema', category: 'Dietas e Tratamentos' },
  { id: 'diet5', text: 'Sou um caso perdido', category: 'Dietas e Tratamentos' },
];

const categoryConfig = {
  'Genética e Metabolismo': { 
    color: '#ef4444', 
    icon: '🧬',
    description: 'Crenças relacionadas à herança genética e funcionamento metabólico',
    recommendations: [
      'Entenda que a genética influencia, mas não determina completamente seu peso',
      'Foque em hábitos saudáveis que podem otimizar seu metabolismo',
      'Considere testes genéticos para personalizar sua abordagem'
    ]
  },
  'Controle e Força de Vontade': { 
    color: '#f59e0b', 
    icon: '💪',
    description: 'Crenças sobre autocontrole e capacidade de resistir a impulsos',
    recommendations: [
      'Desenvolva estratégias de controle emocional e mindful eating',
      'Crie ambiente favorável removendo tentações desnecessárias',
      'Pratique técnicas de autorregulação e gestão de impulsos'
    ]
  },
  'Prazer e Recompensa': { 
    color: '#8b5cf6', 
    icon: '😋',
    description: 'Crenças sobre o papel da comida como fonte de prazer e conforto',
    recommendations: [
      'Explore outras fontes de prazer e recompensa além da comida',
      'Desenvolva uma relação mais equilibrada com o prazer alimentar',
      'Identifique gatilhos emocionais que levam ao comer por conforto'
    ]
  },
  'Dietas e Tratamentos': { 
    color: '#06b6d4', 
    icon: '📋',
    description: 'Crenças sobre eficácia de dietas e tratamentos para perda de peso',
    recommendations: [
      'Foque em mudanças de estilo de vida sustentáveis, não dietas temporárias',
      'Busque abordagens personalizadas baseadas em evidências',
      'Mantenha expectativas realistas e celebre pequenos progressos'
    ]
  }
};

const LimitingBeliefsWheel: React.FC = () => {
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleResponse = (value: number) => {
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
        .map(q => responses[q.id] || 0)
        .filter(r => r > 0);
      
      const score = categoryResponses.reduce((sum, r) => sum + r, 0);
      const maxScore = categoryQuestions.length * 5;
      const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
      
      const config = categoryConfig[category as keyof typeof categoryConfig];
      
      return {
        name: category,
        score,
        maxScore,
        percentage,
        color: config.color,
        icon: config.icon,
        description: config.description,
        recommendations: config.recommendations
      };
    });
  };

  const getOverallInterpretation = (results: CategoryResult[]) => {
    const averagePercentage = results.reduce((sum, r) => sum + r.percentage, 0) / results.length;
    
    if (averagePercentage >= 70) {
      return {
        level: 'Alto',
        color: 'bg-red-500',
        message: 'Você apresenta muitas crenças limitantes que podem estar sabotando seus resultados. É importante trabalhar essas crenças com um profissional.',
        priority: 'Urgente - Foque em reestruturação cognitiva'
      };
    } else if (averagePercentage >= 40) {
      return {
        level: 'Moderado',
        color: 'bg-yellow-500',
        message: 'Algumas crenças limitantes estão presentes. Com trabalho focado, você pode superar essas barreiras mentais.',
        priority: 'Importante - Desenvolva consciência e estratégias'
      };
    } else {
      return {
        level: 'Baixo',
        color: 'bg-green-500',
        message: 'Parabéns! Você tem poucas crenças limitantes. Continue fortalecendo sua mentalidade positiva.',
        priority: 'Manutenção - Continue desenvolvendo mindset positivo'
      };
    }
  };

  const results = calculateResults();
  const interpretation = getOverallInterpretation(results);

  const radarData = results.map(r => ({
    category: r.name.split(' ')[0],
    value: r.percentage,
    fullName: r.name
  }));

  const pieData = results.map(r => ({
    name: r.name,
    value: r.percentage,
    color: r.color
  }));

  if (!isCompleted) {
    const progress = ((currentQuestion + 1) / questions.length) * 100;
    const question = questions[currentQuestion];

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6">
        <div className="container mx-auto max-w-4xl">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-center text-white">
                🧠 Avaliação de Crenças Limitantes
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
                  "{question.text}"
                </h3>
                <p className="text-gray-400 mb-8">
                  Em que grau você concorda com esta afirmação?
                </p>
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
                    <span className="text-xs">
                      {value === 1 && 'Discordo totalmente'}
                      {value === 2 && 'Discordo'}
                      {value === 3 && 'Neutro'}
                      {value === 4 && 'Concordo'}
                      {value === 5 && 'Concordo totalmente'}
                    </span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6">
      <div className="container mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-center text-white">
              🧠 Resultado - Crenças Limitantes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className={`${interpretation.color} text-white border-0`}>
              <AlertDescription className="text-center">
                <div className="font-bold text-lg mb-2">
                  Nível de Crenças Limitantes: {interpretation.level}
                </div>
                <div className="mb-2">{interpretation.message}</div>
                <div className="text-sm opacity-90">{interpretation.priority}</div>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Radar Chart */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">📊 Análise por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="category" className="text-white" />
                  <PolarRadiusAxis 
                    angle={90} 
                    domain={[0, 100]} 
                    className="text-gray-400"
                  />
                  <Radar
                    name="Crenças Limitantes (%)"
                    dataKey="value"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.3}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Pie Chart */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">🥧 Distribuição por Área</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Resultados Detalhados */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {results.map((result, index) => (
            <Card key={index} className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <span>{result.icon}</span>
                  {result.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-300">Intensidade</span>
                    <span className="text-white font-bold">
                      {result.percentage.toFixed(1)}%
                    </span>
                  </div>
                  <Progress 
                    value={result.percentage} 
                    className="w-full h-3"
                    style={{ 
                      background: `linear-gradient(to right, ${result.color}33, ${result.color})`
                    }}
                  />
                </div>
                
                <p className="text-gray-400 text-sm">
                  {result.description}
                </p>

                <div>
                  <h4 className="text-white font-medium mb-2">💡 Recomendações:</h4>
                  <ul className="space-y-1">
                    {result.recommendations.map((rec, idx) => (
                      <li key={idx} className="text-gray-300 text-sm flex items-start gap-2">
                        <span className="text-green-400 mt-1">•</span>
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
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="flex justify-center gap-4 pt-6">
            <Button 
              onClick={() => {
                setResponses({});
                setCurrentQuestion(0);
                setIsCompleted(false);
              }}
              variant="outline"
            >
              🔄 Refazer Avaliação
            </Button>
            <Button>
              📊 Salvar Resultados
            </Button>
            <Button variant="secondary">
              👨‍⚕️ Agendar Consulta
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LimitingBeliefsWheel;