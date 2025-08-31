import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Heart, AlertTriangle, Brain, Shield } from 'lucide-react';

interface Question {
  id: string;
  text: string;
  category: string;
  type: 'text' | 'age' | 'emotions' | 'body_map' | 'intensity' | 'eating_impact' | 'triggers' | 'weight_impact';
  required: boolean;
  sensitive: boolean;
}

interface TraumaResponse {
  traumaEvents: string;
  ageOccurred: string;
  emotions: string[];
  bodyLocations: string[];
  intensity: number;
  eatingImpact: string;
  triggers: string[];
  weightImpact: string;
}

interface AssessmentResult {
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  overallIntensity: number;
  affectedAreas: string[];
  recommendations: string[];
  professionalSupport: boolean;
  urgentCare: boolean;
}

const questions: Question[] = [
  {
    id: 'events',
    text: 'Identificou eventos traumáticos significativos? Compartilhe apenas o que se sente confortável.',
    category: 'Identificação',
    type: 'text',
    required: true,
    sensitive: true
  },
  {
    id: 'age',
    text: 'Em qual idade aproximadamente esses eventos ocorreram?',
    category: 'Contexto Temporal',
    type: 'age',
    required: true,
    sensitive: false
  },
  {
    id: 'emotions',
    text: 'Quais emoções ainda surgem ao recordar esses eventos?',
    category: 'Impacto Emocional',
    type: 'emotions',
    required: true,
    sensitive: true
  },
  {
    id: 'body_locations',
    text: 'Onde no corpo você sente essas emoções?',
    category: 'Manifestação Física',
    type: 'body_map',
    required: true,
    sensitive: false
  },
  {
    id: 'intensity',
    text: 'Qual intensidade (0-10) essas memórias ainda provocam?',
    category: 'Intensidade',
    type: 'intensity',
    required: true,
    sensitive: true
  },
  {
    id: 'eating_impact',
    text: 'Como esses traumas afetam sua alimentação?',
    category: 'Impacto Alimentar',
    type: 'eating_impact',
    required: true,
    sensitive: false
  },
  {
    id: 'triggers',
    text: 'Quais gatilhos emocionais você identificou?',
    category: 'Gatilhos',
    type: 'triggers',
    required: true,
    sensitive: false
  },
  {
    id: 'weight_impact',
    text: 'Como os traumas influenciam seu peso?',
    category: 'Impacto no Peso',
    type: 'weight_impact',
    required: true,
    sensitive: false
  }
];

const emotionOptions = [
  'Tristeza', 'Raiva', 'Medo', 'Ansiedade', 'Culpa', 'Vergonha',
  'Abandono', 'Rejeição', 'Desamparo', 'Insegurança', 'Solidão', 'Traição'
];

const bodyLocationOptions = [
  'Cabeça/Mente', 'Pescoço/Garganta', 'Peito/Coração', 'Estômago',
  'Abdômen', 'Braços', 'Mãos', 'Pernas', 'Pés', 'Costas', 'Todo o corpo'
];

const triggerOptions = [
  'Conflitos interpessoais', 'Rejeição', 'Críticas', 'Solidão',
  'Estresse no trabalho', 'Problemas financeiros', 'Datas específicas',
  'Lugares ou objetos', 'Cheiros ou sons', 'Certas pessoas'
];

const eatingImpactOptions = [
  'Perda de apetite', 'Compulsão alimentar', 'Comer emocional',
  'Restrição alimentar extrema', 'Vômitos ou purgativos',
  'Obsessão com comida', 'Não sinto impacto', 'Varia conforme humor'
];

const weightImpactOptions = [
  'Ganho de peso significativo', 'Perda de peso não intencional',
  'Flutuações extremas', 'Dificuldade para perder peso',
  'Obsessão com o peso', 'Não percebo relação direta'
];

const EmotionalTraumaMapping: React.FC = () => {
  const [responses, setResponses] = useState<Partial<TraumaResponse>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showWarning, setShowWarning] = useState(true);

  const handleResponse = (field: keyof TraumaResponse, value: any) => {
    setResponses(prev => ({ ...prev, [field]: value }));
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const calculateAssessment = (): AssessmentResult => {
    const intensity = responses.intensity || 0;
    const hasMultipleTraumas = (responses.traumaEvents?.length || 0) > 100;
    const hasHighIntensity = intensity >= 7;
    const hasEatingImpact = responses.eatingImpact && responses.eatingImpact !== 'Não sinto impacto';
    const hasMultipleTriggers = (responses.triggers?.length || 0) > 3;

    let riskLevel: 'low' | 'moderate' | 'high' | 'critical' = 'low';
    let professionalSupport = false;
    let urgentCare = false;

    if (intensity >= 9 || (hasHighIntensity && hasMultipleTraumas)) {
      riskLevel = 'critical';
      professionalSupport = true;
      urgentCare = true;
    } else if (intensity >= 7 || (hasHighIntensity && hasEatingImpact)) {
      riskLevel = 'high';
      professionalSupport = true;
    } else if (intensity >= 5 || hasEatingImpact) {
      riskLevel = 'moderate';
      professionalSupport = true;
    }

    const affectedAreas: string[] = [];
    if (responses.emotions?.length) affectedAreas.push('Emocional');
    if (responses.bodyLocations?.length) affectedAreas.push('Física');
    if (hasEatingImpact) affectedAreas.push('Alimentar');
    if (responses.weightImpact && responses.weightImpact !== 'Não percebo relação direta') {
      affectedAreas.push('Peso Corporal');
    }

    const recommendations: string[] = [];
    if (riskLevel === 'critical') {
      recommendations.push('Busque atendimento psicológico especializado urgentemente');
      recommendations.push('Considere terapia EMDR ou terapia cognitivo-comportamental focada em trauma');
      recommendations.push('Evite ficar sozinho e mantenha rede de apoio ativa');
    } else if (riskLevel === 'high') {
      recommendations.push('Procure um psicólogo especializado em trauma');
      recommendations.push('Considere técnicas de regulação emocional (respiração, mindfulness)');
      recommendations.push('Mantenha rotinas que promovam segurança e estabilidade');
    } else if (riskLevel === 'moderate') {
      recommendations.push('Considere psicoterapia para processar experiências passadas');
      recommendations.push('Pratique técnicas de autocuidado e autorregulação');
      recommendations.push('Desenvolva estratégias saudáveis de enfrentamento');
    }

    if (hasEatingImpact) {
      recommendations.push('Considere acompanhamento nutricional especializado em comportamento alimentar');
    }

    return {
      riskLevel,
      overallIntensity: intensity,
      affectedAreas,
      recommendations,
      professionalSupport,
      urgentCare
    };
  };

  if (showWarning) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-rose-900 to-indigo-900 p-6">
        <div className="container mx-auto max-w-4xl">
          <Card className="bg-gray-800/90 backdrop-blur border-gray-700">
            <CardHeader>
              <CardTitle className="text-center text-white flex items-center justify-center gap-2">
                <Shield className="w-6 h-6" />
                Mapeamento de Traumas Emocionais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="bg-yellow-900/50 border-yellow-600">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-yellow-200">
                  <div className="font-bold mb-2">Aviso Importante - Conteúdo Sensível</div>
                  <div className="space-y-2 text-sm">
                    <p>
                      Esta ferramenta aborda temas relacionados a traumas emocionais. 
                      Se você está passando por uma crise ou sentindo pensamentos de autolesão, 
                      busque ajuda profissional imediatamente.
                    </p>
                    <p className="font-medium">
                      🆘 Em caso de emergência: CVV 188 (24h) ou procure o hospital mais próximo
                    </p>
                    <p>
                      Esta avaliação NÃO substitui acompanhamento psicológico profissional 
                      e destina-se apenas a fins de autoconhecimento e orientação inicial.
                    </p>
                  </div>
                </AlertDescription>
              </Alert>

              <div className="text-center space-y-4">
                <h3 className="text-lg font-medium text-white">
                  Sobre esta Avaliação
                </h3>
                <div className="text-gray-300 space-y-2 text-left">
                  <p>• Suas respostas são confidenciais e não são armazenadas</p>
                  <p>• Responda apenas o que se sente confortável compartilhando</p>
                  <p>• Você pode interromper a qualquer momento</p>
                  <p>• Recomendamos fazer em um ambiente seguro e privado</p>
                  <p>• Tenha alguém de confiança disponível se precisar de apoio</p>
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <Button
                  onClick={() => setShowWarning(false)}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Entendo e Desejo Continuar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.history.back()}
                >
                  Voltar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!isCompleted) {
    const progress = ((currentQuestion + 1) / questions.length) * 100;
    const question = questions[currentQuestion];

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-rose-900 to-indigo-900 p-6">
        <div className="container mx-auto max-w-4xl">
          <Card className="bg-gray-800/90 backdrop-blur border-gray-700">
            <CardHeader>
              <CardTitle className="text-center text-white">
                💜 Mapeamento de Traumas Emocionais
              </CardTitle>
              <div className="space-y-2">
                <Progress value={progress} className="w-full" />
                <p className="text-center text-gray-300">
                  Etapa {currentQuestion + 1} de {questions.length}
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <Badge variant="outline" className="mb-4">
                  {question.category}
                </Badge>
                {question.sensitive && (
                  <Badge variant="outline" className="mb-4 ml-2 bg-yellow-900/50 text-yellow-200">
                    Conteúdo Sensível
                  </Badge>
                )}
                <h3 className="text-xl font-medium text-white mb-6">
                  {question.text}
                </h3>
              </div>

              {/* Text Response */}
              {question.type === 'text' && (
                <div className="space-y-4">
                  <Textarea
                    placeholder="Compartilhe apenas o que se sente confortável..."
                    value={responses.traumaEvents || ''}
                    onChange={(e) => handleResponse('traumaEvents', e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                    rows={6}
                  />
                  <Button onClick={nextQuestion} className="w-full">
                    Continuar
                  </Button>
                </div>
              )}

              {/* Age Selection */}
              {question.type === 'age' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {['0-5 anos', '6-12 anos', '13-18 anos', '19-25 anos', '26-35 anos', '36-50 anos', '50+ anos', 'Múltiplas idades'].map((age) => (
                      <Button
                        key={age}
                        onClick={() => {
                          handleResponse('ageOccurred', age);
                          nextQuestion();
                        }}
                        variant="outline"
                        className="p-4 hover:bg-primary/20 border-gray-600"
                      >
                        {age}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Emotions Selection */}
              {question.type === 'emotions' && (
                <div className="space-y-4">
                  <p className="text-gray-400 text-center">Selecione todas que se aplicam:</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {emotionOptions.map((emotion) => (
                      <Button
                        key={emotion}
                        onClick={() => {
                          const current = responses.emotions || [];
                          const updated = current.includes(emotion)
                            ? current.filter(e => e !== emotion)
                            : [...current, emotion];
                          handleResponse('emotions', updated);
                        }}
                        variant={responses.emotions?.includes(emotion) ? "default" : "outline"}
                        className="p-3"
                      >
                        {emotion}
                      </Button>
                    ))}
                  </div>
                  <Button 
                    onClick={nextQuestion} 
                    className="w-full"
                    disabled={!responses.emotions?.length}
                  >
                    Continuar
                  </Button>
                </div>
              )}

              {/* Body Locations */}
              {question.type === 'body_map' && (
                <div className="space-y-4">
                  <p className="text-gray-400 text-center">Selecione onde sente as emoções no corpo:</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {bodyLocationOptions.map((location) => (
                      <Button
                        key={location}
                        onClick={() => {
                          const current = responses.bodyLocations || [];
                          const updated = current.includes(location)
                            ? current.filter(l => l !== location)
                            : [...current, location];
                          handleResponse('bodyLocations', updated);
                        }}
                        variant={responses.bodyLocations?.includes(location) ? "default" : "outline"}
                        className="p-3"
                      >
                        {location}
                      </Button>
                    ))}
                  </div>
                  <Button 
                    onClick={nextQuestion} 
                    className="w-full"
                    disabled={!responses.bodyLocations?.length}
                  >
                    Continuar
                  </Button>
                </div>
              )}

              {/* Intensity Slider */}
              {question.type === 'intensity' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-2">
                      {responses.intensity || 0}
                    </div>
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>Nenhuma intensidade</span>
                      <span>Extremamente intenso</span>
                    </div>
                  </div>
                  <Slider
                    value={[responses.intensity || 0]}
                    onValueChange={(value) => handleResponse('intensity', value[0])}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                  <Button onClick={nextQuestion} className="w-full">
                    Continuar
                  </Button>
                </div>
              )}

              {/* Eating Impact */}
              {question.type === 'eating_impact' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {eatingImpactOptions.map((impact) => (
                      <Button
                        key={impact}
                        onClick={() => {
                          handleResponse('eatingImpact', impact);
                          nextQuestion();
                        }}
                        variant="outline"
                        className="p-4 hover:bg-primary/20 border-gray-600 text-left"
                      >
                        {impact}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Triggers */}
              {question.type === 'triggers' && (
                <div className="space-y-4">
                  <p className="text-gray-400 text-center">Selecione todos os gatilhos que identificou:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {triggerOptions.map((trigger) => (
                      <Button
                        key={trigger}
                        onClick={() => {
                          const current = responses.triggers || [];
                          const updated = current.includes(trigger)
                            ? current.filter(t => t !== trigger)
                            : [...current, trigger];
                          handleResponse('triggers', updated);
                        }}
                        variant={responses.triggers?.includes(trigger) ? "default" : "outline"}
                        className="p-3 text-left"
                      >
                        {trigger}
                      </Button>
                    ))}
                  </div>
                  <Button onClick={nextQuestion} className="w-full">
                    Continuar
                  </Button>
                </div>
              )}

              {/* Weight Impact */}
              {question.type === 'weight_impact' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {weightImpactOptions.map((impact) => (
                      <Button
                        key={impact}
                        onClick={() => {
                          handleResponse('weightImpact', impact);
                          nextQuestion();
                        }}
                        variant="outline"
                        className="p-4 hover:bg-primary/20 border-gray-600 text-left"
                      >
                        {impact}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const assessment = calculateAssessment();

  const getRiskColor = () => {
    switch (assessment.riskLevel) {
      case 'critical': return 'bg-red-600';
      case 'high': return 'bg-orange-500';
      case 'moderate': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  const getRiskMessage = () => {
    switch (assessment.riskLevel) {
      case 'critical': return 'Os traumas têm impacto muito significativo. Busque apoio profissional urgentemente.';
      case 'high': return 'Os traumas têm impacto considerável. Recomendamos acompanhamento psicológico.';
      case 'moderate': return 'Há impactos moderados que se beneficiariam de apoio profissional.';
      default: return 'O impacto atual parece mais limitado, mas o autoconhecimento é sempre valioso.';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-rose-900 to-indigo-900 p-6">
      <div className="container mx-auto max-w-6xl space-y-6">
        {/* Header with Assessment */}
        <Card className="bg-gray-800/90 backdrop-blur border-gray-700">
          <CardHeader>
            <CardTitle className="text-center text-white">
              💜 Resultado do Mapeamento de Traumas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className={`${getRiskColor()} text-white border-0`}>
              <AlertDescription className="text-center">
                <div className="font-bold text-lg mb-2">
                  Nível de Impacto: {assessment.riskLevel.toUpperCase()} (Intensidade: {assessment.overallIntensity}/10)
                </div>
                <div className="mb-2">{getRiskMessage()}</div>
                {assessment.urgentCare && (
                  <div className="text-sm font-bold">
                    ⚠️ BUSQUE AJUDA PROFISSIONAL URGENTEMENTE - CVV: 188
                  </div>
                )}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Áreas Afetadas */}
        <Card className="bg-gray-800/90 backdrop-blur border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">🎯 Áreas de Impacto Identificadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {assessment.affectedAreas.map((area, index) => (
                <div key={index} className="text-center p-4 bg-purple-600/20 rounded-lg">
                  <div className="text-white font-medium">{area}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Detalhamento das Respostas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Emoções e Corpo */}
          <Card className="bg-gray-800/90 backdrop-blur border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Manifestações Emocionais e Físicas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-purple-300 font-medium mb-2">Emoções Identificadas:</h4>
                <div className="flex flex-wrap gap-2">
                  {responses.emotions?.map((emotion, idx) => (
                    <Badge key={idx} variant="outline" className="bg-purple-600/20">
                      {emotion}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-purple-300 font-medium mb-2">Manifestações Corporais:</h4>
                <div className="flex flex-wrap gap-2">
                  {responses.bodyLocations?.map((location, idx) => (
                    <Badge key={idx} variant="outline" className="bg-rose-600/20">
                      {location}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Gatilhos e Impactos */}
          <Card className="bg-gray-800/90 backdrop-blur border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Gatilhos e Impactos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-orange-300 font-medium mb-2">Gatilhos Emocionais:</h4>
                <div className="flex flex-wrap gap-2">
                  {responses.triggers?.map((trigger, idx) => (
                    <Badge key={idx} variant="outline" className="bg-orange-600/20">
                      {trigger}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-yellow-300 font-medium mb-2">Impacto na Alimentação:</h4>
                <Badge variant="outline" className="bg-yellow-600/20">
                  {responses.eatingImpact}
                </Badge>
              </div>
              <div>
                <h4 className="text-blue-300 font-medium mb-2">Impacto no Peso:</h4>
                <Badge variant="outline" className="bg-blue-600/20">
                  {responses.weightImpact}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recomendações */}
        <Card className="bg-gray-800/90 backdrop-blur border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Recomendações e Próximos Passos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {assessment.professionalSupport && (
              <Alert className="bg-blue-900/50 border-blue-600">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-blue-200">
                  <div className="font-bold mb-1">Recomendamos Acompanhamento Profissional</div>
                  <p className="text-sm">
                    Com base nas respostas, seria muito benéfico buscar apoio de um psicólogo 
                    especializado em trauma para processar essas experiências de forma segura.
                  </p>
                </AlertDescription>
              </Alert>
            )}

            <div>
              <h4 className="text-green-300 font-medium mb-3">💡 Recomendações Personalizadas:</h4>
              <ul className="space-y-2">
                {assessment.recommendations.map((rec, idx) => (
                  <li key={idx} className="text-gray-300 flex items-start gap-2">
                    <span className="text-green-400 mt-1">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <Card className="bg-purple-600/20 border-purple-500">
                <CardContent className="p-4 text-center">
                  <h5 className="text-purple-300 font-medium mb-2">Recursos Imediatos</h5>
                  <p className="text-sm text-gray-300">CVV: 188 (24h)</p>
                  <p className="text-sm text-gray-300">Terapia online disponível</p>
                </CardContent>
              </Card>
              <Card className="bg-blue-600/20 border-blue-500">
                <CardContent className="p-4 text-center">
                  <h5 className="text-blue-300 font-medium mb-2">Autocuidado</h5>
                  <p className="text-sm text-gray-300">Técnicas de respiração</p>
                  <p className="text-sm text-gray-300">Mindfulness diário</p>
                </CardContent>
              </Card>
              <Card className="bg-green-600/20 border-green-500">
                <CardContent className="p-4 text-center">
                  <h5 className="text-green-300 font-medium mb-2">Rede de Apoio</h5>
                  <p className="text-sm text-gray-300">Mantenha contato com pessoas de confiança</p>
                  <p className="text-sm text-gray-300">Grupos de apoio</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Ações */}
        <Card className="bg-gray-800/90 backdrop-blur border-gray-700">
          <CardContent className="flex justify-center gap-4 pt-6">
            <Button 
              onClick={() => {
                setResponses({});
                setCurrentQuestion(0);
                setIsCompleted(false);
                setShowWarning(true);
              }}
              variant="outline"
            >
              🔄 Nova Avaliação
            </Button>
            <Button>
              💾 Salvar Confidencialmente
            </Button>
            <Button variant="secondary">
              👨‍⚕️ Buscar Profissional
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmotionalTraumaMapping;