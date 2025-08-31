import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Bot, Send, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const SofiaTest: React.FC = () => {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const testSofia = async () => {
    if (!message.trim()) return;
    
    setLoading(true);
    setResponse('');
    
    try {
      const { data, error } = await supabase.functions.invoke('health-chat-bot', {
        body: {
          message: message,
          userId: 'test-user',
          userName: 'Usuário Teste'
        }
      });

      if (error) {
        setResponse(`Erro: ${error.message}`);
      } else {
        setResponse(data?.response || 'Sem resposta');
      }
    } catch (error: any) {
      setResponse(`Erro de conexão: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-6 h-6 text-emerald-500" />
            Teste da Sofia
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Digite uma mensagem para a Sofia..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && testSofia()}
              disabled={loading}
            />
            <Button onClick={testSofia} disabled={loading || !message.trim()}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
          
          {response && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Resposta da Sofia:</h3>
              <p className="whitespace-pre-wrap">{response}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SofiaTest;
