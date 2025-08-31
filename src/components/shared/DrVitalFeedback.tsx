import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Stethoscope, RefreshCw, User, Download, Share2, Mail, MessageCircle, Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getCharacterImageUrl } from '@/lib/character-images';

interface DrVitalFeedbackProps {
  assessmentType: 'abundance' | 'competency' | 'health' | 'life';
  scores: Record<string, number>;
  areas: Array<{
    id: string;
    name: string;
    icon: string;
  }>;
  userProfile?: {
    full_name?: string;
    email?: string;
    phone?: string;
  };
  onResetToDefault: () => void;
  onNewAssessment: () => void;
  onShowResults: () => void;
}

export const DrVitalFeedback: React.FC<DrVitalFeedbackProps> = ({
  assessmentType,
  scores,
  areas,
  userProfile,
  onResetToDefault,
  onNewAssessment,
  onShowResults
}) => {
  const [currentMessage, setCurrentMessage] = useState(0);
  const [showActions, setShowActions] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const { toast } = useToast();

  // Obter URL da imagem do Dr. Vital
  const drVitalImageUrl = getCharacterImageUrl('dr-vital');

  // Calcular estatísticas gerais
  const scoreValues = Object.values(scores);
  const averageScore = scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length;
  
  // Identificar áreas críticas e fortes
  const criticalAreas = areas.filter(area => scores[area.id] <= 2);
  const strongAreas = areas.filter(area => scores[area.id] >= 4);

  // Gerar feedback personalizado baseado no tipo de avaliação
  const generateFeedback = () => {
    const feedbackMessages = {
      abundance: [
        `Olá! Sou o Dr. Vital, e analisei sua Roda da Abundância. 💰`,
        `Seu score geral é de ${Math.round(averageScore * 20)}%. ${averageScore >= 4 ? 'Parabéns pelo progresso!' : 'Vamos trabalhar juntos para melhorar!'}`,
        criticalAreas.length > 0 
          ? `Identifiquei ${criticalAreas.length} área(s) que precisam de atenção especial: ${criticalAreas.map(a => a.name).join(', ')}.`
          : 'Suas finanças estão bem equilibradas! Continue assim.',
        strongAreas.length > 0
          ? `Suas áreas mais fortes são: ${strongAreas.map(a => a.name).join(', ')}. Use-as como base para crescer!`
          : 'Vamos fortalecer suas competências financeiras gradualmente.',
        'Agora vou mostrar seus resultados detalhados para você acompanhar sua evolução.'
      ],
      competency: [
        `Olá! Sou o Dr. Vital, e analisei sua Roda das Competências. 🎯`,
        `Seu nível geral é de ${Math.round(averageScore * 10)}%. ${averageScore >= 7 ? 'Excelente desenvolvimento profissional!' : 'Há muito potencial para crescer!'}`,
        criticalAreas.length > 0
          ? `Recomendo focar no desenvolvimento de: ${criticalAreas.map(a => a.name).join(', ')}.`
          : 'Suas competências estão bem desenvolvidas!',
        strongAreas.length > 0
          ? `Suas competências destaque são: ${strongAreas.map(a => a.name).join(', ')}. São seus diferenciais!`
          : 'Vamos identificar e desenvolver suas competências naturais.',
        'Agora vou mostrar sua análise detalhada para você acompanhar seu desenvolvimento.'
      ],
      health: [
        `Olá! Sou o Dr. Vital, e analisei sua Roda da Saúde. 🏥`,
        `Seu índice geral de saúde é ${Math.round(averageScore * 10)}%. ${averageScore >= 7 ? 'Ótimo cuidado com sua saúde!' : 'Vamos cuidar melhor de você!'}`,
        criticalAreas.length > 0
          ? `Áreas que precisam de atenção imediata: ${criticalAreas.map(a => a.name).join(', ')}.`
          : 'Sua saúde está bem equilibrada!',
        strongAreas.length > 0
          ? `Pontos fortes da sua saúde: ${strongAreas.map(a => a.name).join(', ')}. Mantenha esses hábitos!`
          : 'Vamos construir hábitos saudáveis gradualmente.',
        'Agora vou mostrar seus indicadores detalhados para acompanharmos sua jornada de bem-estar.'
      ],
      life: [
        `Olá! Sou o Dr. Vital, e analisei sua Roda da Vida. 🌟`,
        `Seu índice de satisfação é ${Math.round(averageScore * 10)}%. ${averageScore >= 7 ? 'Vida bem equilibrada!' : 'Vamos buscar mais equilíbrio!'}`,
        criticalAreas.length > 0
          ? `Áreas da vida que merecem mais atenção: ${criticalAreas.map(a => a.name).join(', ')}.`
          : 'Sua vida está bem balanceada entre as diferentes áreas!',
        strongAreas.length > 0
          ? `Seus pilares mais sólidos: ${strongAreas.map(a => a.name).join(', ')}. Use-os como apoio!`
          : 'Vamos fortalecer cada área da sua vida de forma equilibrada.',
        'Agora vou mostrar sua análise detalhada para você acompanhar seu crescimento pessoal.'
      ]
    };

    return feedbackMessages[assessmentType] || feedbackMessages.health;
  };

  const messages = generateFeedback();

  // Controle manual das mensagens - removido useEffect automático
  const handleNextMessage = () => {
    if (currentMessage < messages.length - 1) {
      setCurrentMessage(prev => prev + 1);
    } else {
      setShowActions(true);
    }
  };

  const handlePrevMessage = () => {
    if (currentMessage > 0) {
      setCurrentMessage(prev => prev - 1);
    }
  };

  const handleShowResults = () => {
    onShowResults();
  };

  const handleShare = (method: 'email' | 'whatsapp' | 'print') => {
    const assessmentName = {
      abundance: 'Roda da Abundância',
      competency: 'Roda das Competências', 
      health: 'Roda da Saúde',
      life: 'Roda da Vida'
    }[assessmentType];

    const score = Math.round(averageScore * (assessmentType === 'abundance' ? 20 : 10));
    
    switch (method) {
      case 'email':
        const emailSubject = encodeURIComponent(`Minha Avaliação - ${assessmentName}`);
        const emailBody = encodeURIComponent(
          `Olá! Acabei de fazer minha avaliação de ${assessmentName} e obtive um score de ${score}%.\n\n` +
          `Áreas fortes: ${strongAreas.map(a => a.name).join(', ')}\n` +
          `Áreas para melhorar: ${criticalAreas.map(a => a.name).join(', ')}\n\n` +
          `Quer fazer sua avaliação também? Acesse: ${window.location.origin}`
        );
        window.open(`mailto:?subject=${emailSubject}&body=${emailBody}`);
        break;
        
      case 'whatsapp':
        const whatsappText = encodeURIComponent(
          `🌟 Acabei de fazer minha avaliação de ${assessmentName}!\n\n` +
          `📊 Score: ${score}%\n` +
          `💪 Áreas fortes: ${strongAreas.map(a => a.name).join(', ')}\n` +
          `🎯 Para melhorar: ${criticalAreas.map(a => a.name).join(', ')}\n\n` +
          `Quer fazer sua avaliação também? Acesse: ${window.location.origin}`
        );
        window.open(`https://wa.me/?text=${whatsappText}`);
        break;
        
      case 'print':
        window.print();
        break;
    }

    toast({
      title: "Compartilhado com sucesso!",
      description: `Sua avaliação foi ${method === 'print' ? 'enviada para impressão' : 'compartilhada'}.`,
    });
  };

  const handleDownload = () => {
    const assessmentName = {
      abundance: 'Roda da Abundância',
      competency: 'Roda das Competências',
      health: 'Roda da Saúde', 
      life: 'Roda da Vida'
    }[assessmentType];

    const score = Math.round(averageScore * (assessmentType === 'abundance' ? 20 : 10));
    
    const reportContent = `
AVALIAÇÃO - ${assessmentName.toUpperCase()}
Data: ${new Date().toLocaleDateString('pt-BR')}
Score Geral: ${score}%

ÁREAS FORTES:
${strongAreas.map(area => `- ${area.name}: ${scores[area.id] * 20}%`).join('\n')}

ÁREAS PARA MELHORAR:
${criticalAreas.map(area => `- ${area.name}: ${scores[area.id] * 20}%`).join('\n')}

TODAS AS ÁREAS:
${areas.map(area => `- ${area.name}: ${scores[area.id] * 20}%`).join('\n')}

---
Instituto dos Sonhos - Avaliação Personalizada
    `.trim();

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `avaliacao-${assessmentType}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Relatório baixado!",
      description: "Sua avaliação foi salva no seu dispositivo.",
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <Card className="max-w-2xl w-full bg-gradient-to-br from-blue-900/90 to-slate-900/90 border-blue-700/50 backdrop-blur-lg">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mb-4 overflow-hidden">
            <img 
              src={drVitalImageUrl}
              alt="Dr. Vital"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <CardTitle className="text-2xl text-white flex items-center justify-center gap-2">
            <User className="w-6 h-6" />
            Dr. Vital - Feedback Personalizado
          </CardTitle>
          
          {/* Dados do Usuário */}
          {userProfile && (
            <div className="mt-4 p-3 bg-slate-800/30 rounded-lg text-sm text-slate-300">
              <div className="grid grid-cols-1 gap-1">
                <div><strong>Nome:</strong> {userProfile.full_name || 'Não informado'}</div>
                <div><strong>Email:</strong> {userProfile.email || 'Não informado'}</div>
                <div><strong>Telefone:</strong> {userProfile.phone || 'Não informado'}</div>
                <div><strong>Data/Hora:</strong> {new Date().toLocaleString('pt-BR')}</div>
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Mensagem atual do Dr. Vital */}
          <div className="bg-slate-800/50 rounded-lg p-6 min-h-[120px] flex items-center">
            <div className="w-full">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                  <img 
                    src={drVitalImageUrl}
                    alt="Dr. Vital"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-white text-lg leading-relaxed">
                    {messages[currentMessage]}
                  </p>
                  
                  {/* Controles de navegação e indicador de progresso */}
                  <div className="mt-4 space-y-3">
                    <div className="flex gap-1">
                      {messages.map((_, index) => (
                        <div
                          key={index}
                          className={`h-1 rounded-full transition-all duration-500 ${
                            index <= currentMessage 
                              ? 'bg-blue-400 w-8' 
                              : 'bg-slate-600 w-2'
                          }`}
                        />
                      ))}
                    </div>
                    
                    {/* Botões de navegação */}
                    <div className="flex justify-between items-center">
                      <Button
                        onClick={handlePrevMessage}
                        disabled={currentMessage === 0}
                        variant="outline"
                        size="sm"
                        className="text-white border-slate-600"
                      >
                        ← Anterior
                      </Button>
                      
                      <span className="text-slate-400 text-sm">
                        {currentMessage + 1} de {messages.length}
                      </span>
                      
                      <Button
                        onClick={handleNextMessage}
                        disabled={currentMessage === messages.length - 1}
                        variant="outline"
                        size="sm"
                        className="text-white border-slate-600"
                      >
                        Próximo →
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Resumo visual dos scores */}
          {currentMessage >= 1 && (
            <div className="grid grid-cols-3 gap-4 animate-in slide-in-from-bottom-4 duration-500">
              <div className="text-center p-4 bg-slate-800/30 rounded-lg">
                <div className="text-2xl font-bold text-blue-400">
                  {Math.round(averageScore * (assessmentType === 'abundance' ? 20 : 10))}%
                </div>
                <div className="text-sm text-slate-300">Score Geral</div>
              </div>
              <div className="text-center p-4 bg-slate-800/30 rounded-lg">
                <div className="text-2xl font-bold text-green-400">
                  {strongAreas.length}
                </div>
                <div className="text-sm text-slate-300">Áreas Fortes</div>
              </div>
              <div className="text-center p-4 bg-slate-800/30 rounded-lg">
                <div className="text-2xl font-bold text-orange-400">
                  {criticalAreas.length}
                </div>
                <div className="text-sm text-slate-300">A Melhorar</div>
              </div>
            </div>
          )}

          {/* Ações */}
          {showActions && (
            <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
              {/* Ação principal */}
              <Button
                onClick={handleShowResults}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
                size="lg"
              >
                <User className="w-5 h-5" />
                Ver Resultados Detalhados
              </Button>
              
              {/* Opções de compartilhamento */}
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Baixar
                </Button>
                
                <Button
                  onClick={() => handleShare('email')}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Email
                </Button>
                
                <Button
                  onClick={() => handleShare('whatsapp')}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </Button>
                
                <Button
                  onClick={() => handleShare('print')}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  Imprimir
                </Button>
              </div>
            </div>
          )}

          {/* Botão para mostrar ações quando chegar na última mensagem */}
          {currentMessage === messages.length - 1 && !showActions && (
            <div className="flex justify-center">
              <Button
                onClick={() => setShowActions(true)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Ver Opções
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};