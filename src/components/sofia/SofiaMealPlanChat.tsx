import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, Bot, User, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface SofiaMealPlanChatProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentMealPlan?: any;
  onMealPlanUpdate?: (mealPlan: any) => void;
  userPreferences?: any;
}

const SofiaMealPlanChat: React.FC<SofiaMealPlanChatProps> = ({
  open,
  onOpenChange,
  currentMealPlan,
  onMealPlanUpdate,
  userPreferences
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && currentMealPlan) {
      const initialMessage: Message = {
        id: 'initial',
        role: 'assistant',
        content: `Olá! Sou a Sofia, sua assistente nutricional. Vou analisar seu cardápio atual e ajudar você a ajustá-lo conforme suas necessidades.

**Cardápio Atual:**
${Object.entries(currentMealPlan).map(([day, meals]: [string, any]) => 
  `• **${day.charAt(0).toUpperCase() + day.slice(1)}**: ${Object.keys(meals).join(', ')}`
).join('\n')}

Como posso melhorar este cardápio para você? Você pode me dizer:
- Alimentos que não gosta
- Objetivos específicos (perder peso, ganhar massa, etc.)
- Restrições alimentares
- Preferências de sabor`,
        timestamp: new Date()
      };
      setMessages([initialMessage]);
    }
  }, [open, currentMealPlan]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('gpt-chat', {
        body: {
          message: inputValue,
          context: {
            currentMealPlan,
            userPreferences,
            conversationHistory: messages.map(m => ({
              role: m.role,
              content: m.content
            }))
          }
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: Date.now().toString() + '_assistant',
        role: 'assistant',
        content: data.message || 'Desculpe, não consegui processar sua solicitação.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Verificar se há um novo cardápio na resposta
      if (data.updated_meal_plan && onMealPlanUpdate) {
        onMealPlanUpdate(data.updated_meal_plan);
        toast.success('Cardápio atualizado pela Sofia!');
      }

    } catch (error: any) {
      console.error('Erro no chat:', error);
      toast.error('Erro ao enviar mensagem para Sofia');
      
      const errorMessage: Message = {
        id: Date.now().toString() + '_error',
        role: 'assistant',
        content: 'Desculpe, houve um erro ao processar sua mensagem. Tente novamente.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Chat com Sofia - Ajustes do Cardápio
          </DialogTitle>
        </DialogHeader>

        <ScrollArea ref={scrollRef} className="flex-1 pr-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`flex gap-3 max-w-[80%] ${
                    message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <div className="flex-shrink-0">
                    {message.role === 'user' ? (
                      <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                    ) : (
                      <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <Bot className="h-4 w-4 text-purple-600" />
                      </div>
                    )}
                  </div>
                  <div
                    className={`p-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-card border border-slate-200'
                    }`}
                  >
                    <div className="text-sm whitespace-pre-wrap">
                      {message.content}
                    </div>
                    <div className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Bot className="h-4 w-4 text-purple-600" />
                </div>
                <div className="bg-card border border-slate-200 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Sofia está pensando...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex gap-2 pt-4 border-t">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua mensagem para Sofia..."
            disabled={loading}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={loading || !inputValue.trim()}
            size="icon"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="text-xs text-muted-foreground mt-2">
          💡 Dica: Seja específico sobre suas preferências e objetivos para um cardápio personalizado
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SofiaMealPlanChat;
