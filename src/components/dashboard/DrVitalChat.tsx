import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Stethoscope, 
  Brain, 
  Heart, 
  Activity,
  FileText,
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  MessageCircle,
  User,
  Bot,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { DrVitalEnhancedNotice } from './DrVitalEnhancedNotice';

interface ChatMessage {
  id: string;
  message: string;
  is_user: boolean;
  timestamp: string;
  analysis_type?: string;
}

const DrVitalChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [healthData, setHealthData] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadUserData();
    addWelcomeMessage();
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  const scrollToBottom = () => {
    setTimeout(() => {
      const messagesContainer = document.getElementById('messages-container');
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      } else {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Carregar perfil do usuário
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      setUserProfile(profile);

      // Carregar dados de saúde básicos
      const { data: health } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .limit(10);

      setHealthData(health);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const addWelcomeMessage = () => {
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      message: `Olá! Sou o Dr. Vital, seu assistente médico virtual. Posso ajudar você com:

🏥 **Análise de Saúde**: Exames, sintomas, recomendações
📊 **Dados do Sistema**: Tracking, progresso, metas
📋 **Documentos Médicos**: Histórico, relatórios, prescrições
💡 **Insights**: Tendências, alertas, melhorias

Como posso ajudá-lo hoje?`,
      is_user: false,
      timestamp: new Date().toISOString(),
      analysis_type: 'welcome'
    };

    setMessages([welcomeMessage]);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      message: inputMessage,
      is_user: true,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await generateDrVitalResponse(inputMessage);
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        message: response,
        is_user: false,
        timestamp: new Date().toISOString(),
        analysis_type: 'health_analysis'
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Erro ao gerar resposta:', error);
      toast({
        title: "Erro",
        description: "Não foi possível processar sua mensagem. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateDrVitalResponse = async (message: string): Promise<string> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return "Desculpe, não consegui identificar você. Faça login novamente.";

      console.log('🤖 Dr. Vital Enhanced - Consultando com dados completos...');

      // Usar a nova função dr-vital-enhanced que tem acesso total aos dados
      const { data, error } = await supabase.functions.invoke('dr-vital-enhanced', {
        body: {
          message,
          userId: user.id
        }
      });

      if (error) {
        console.error('Erro na função dr-vital-enhanced:', error);
        throw error;
      }

      if (data?.response) {
        console.log('✅ Dr. Vital Enhanced respondeu com sucesso');
        return data.response;
      }

      return generateFallbackResponse(message, { userProfile, healthData });
    } catch (error) {
      console.error('Erro no Dr. Vital Enhanced:', error);
      return generateFallbackResponse(message, { userProfile, healthData });
    }
  };

  const generateFallbackResponse = (message: string, context: any): string => {
    const msg = message.toLowerCase();
    
    // Respostas baseadas em palavras-chave quando a IA não funciona
    if (msg.includes('saúde') || msg.includes('bem-estar') || msg.includes('geral')) {
      return `🏥 **Dr. Vital - Análise de Saúde:**

Estou processando seus dados completos do Instituto dos Sonhos para uma análise precisa. Seus dados incluem:

✅ **Perfil Médico**: Anamnese, histórico familiar
✅ **Dados Físicos**: Peso, altura, composição corporal  
✅ **Metabolismo**: Taxa basal, idade metabólica
✅ **Hábitos**: Alimentação, exercícios, sono
✅ **Metas**: Objetivos de saúde e progresso

**Aguarde um momento** enquanto analiso todas essas informações para dar recomendações personalizadas baseadas no seu perfil único.

Tente perguntar novamente em alguns segundos.`;
    }

    if (msg.includes('peso') || msg.includes('dieta')) {
      return `⚖️ **Sobre Peso e Nutrição:**

Para acompanhar seu peso e dieta:
• Registre seu peso na aba "Tracking"
• Monitore sua alimentação
• Acompanhe suas metas de peso

Posso analisar suas tendências e dar recomendações personalizadas.`;
    }

    if (msg.includes('exercício') || msg.includes('atividade')) {
      return `🏃‍♂️ **Sobre Exercícios:**

Para acompanhar sua atividade física:
• Registre seus exercícios no tracking
• Defina metas de atividade
• Monitore seu progresso

Posso analisar seus padrões e sugerir melhorias.`;
    }

    if (msg.includes('sono') || msg.includes('descanso')) {
      return `😴 **Sobre Sono:**

Para melhorar seu sono:
• Registre suas horas de sono
• Monitore a qualidade do descanso
• Identifique padrões

Posso ajudar a otimizar sua rotina de sono.`;
    }

    if (msg.includes('estresse') || msg.includes('ansiedade')) {
      return `🧘‍♀️ **Sobre Estresse:**

Para gerenciar seu estresse:
• Monitore seus níveis de estresse
• Pratique técnicas de relaxamento
• Mantenha uma rotina equilibrada

Posso sugerir estratégias baseadas nos seus dados.`;
    }

    return `🤖 **Dr. Vital aqui!**

Posso ajudar você com:
• 📊 Análise de dados de saúde
• 🏥 Interpretação de exames
• 💡 Recomendações personalizadas
• 📈 Acompanhamento de progresso
• 🎯 Definição de metas

O que você gostaria de saber?`;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getMessageIcon = (isUser: boolean) => {
    return isUser ? (
      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
        <User className="w-4 h-4 text-white" />
      </div>
    ) : (
      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
        <Stethoscope className="w-4 h-4 text-white" />
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Aviso sobre o Enhanced */}
      <DrVitalEnhancedNotice />
      
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Stethoscope className="w-5 h-5 text-blue-600" />
            <span>Dr. Vital - Assistente Médico Virtual</span>
          </CardTitle>
          <CardDescription>
            Chat inteligente para análise de saúde, exames e recomendações personalizadas
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Chat Container */}
      <Card className="h-[600px] flex flex-col">
        <CardHeader className="pb-3 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <Stethoscope className="w-4 h-4 text-green-600" />
            <span className="font-medium">Conversa com Dr. Vital</span>
            <Badge variant="secondary" className="ml-auto">
              Online
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col min-h-0">
          {/* Messages */}
          <div id="messages-container" className="flex-1 overflow-y-auto space-y-4 mb-4 min-h-0">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start space-x-3 ${
                  msg.is_user ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                {getMessageIcon(msg.is_user)}
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.is_user
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="whitespace-pre-wrap text-sm">{msg.message}</div>
                  <div className={`text-xs mt-1 ${
                    msg.is_user ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {format(new Date(msg.timestamp), 'HH:mm', { locale: ptBR })}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex items-start space-x-3">
                {getMessageIcon(false)}
                <div className="bg-gray-100 p-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm text-gray-600">Dr. Vital está pensando...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex space-x-2 flex-shrink-0">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua pergunta sobre saúde, exames, etc..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="bg-blue-500 hover:bg-blue-600"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setInputMessage("Como estão meus exames?")}
          className="text-xs"
        >
          <FileText className="w-3 h-3 mr-1" />
          Meus Exames
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setInputMessage("Como está minha saúde geral?")}
          className="text-xs"
        >
          <Heart className="w-3 h-3 mr-1" />
          Saúde Geral
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setInputMessage("Quais são minhas tendências de saúde?")}
          className="text-xs"
        >
          <TrendingUp className="w-3 h-3 mr-1" />
          Tendências
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setInputMessage("Quais recomendações você tem para mim?")}
          className="text-xs"
        >
          <CheckCircle className="w-3 h-3 mr-1" />
          Recomendações
        </Button>
      </div>
    </div>
  );
};

export default DrVitalChat; 