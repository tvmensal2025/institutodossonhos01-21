import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Heart, RefreshCw, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface SofiaBiographyProps {
  user: User | null;
}

interface UserBiography {
  id: string;
  biography: string;
  last_updated: string;
  conversation_count: number;
}

export const SofiaBiography = ({ user }: SofiaBiographyProps) => {
  const [biography, setBiography] = useState<UserBiography | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchBiography = async () => {
    if (!user?.id) return;

    try {
      // User AI biography table doesn't exist yet - return null
      const data = null;
      const error = null;

      setBiography(null);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateBiography = async () => {
    if (!user?.id) return;
    
    setUpdating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-user-biography', {
        body: { userId: user.id }
      });

      if (error) {
        toast.error('Erro ao gerar biografia');
        console.error('Erro:', error);
        return;
      }

      await fetchBiography();
      toast.success('Biografia atualizada pela Sof.ia!');
    } catch (error) {
      toast.error('Erro ao conectar com Sof.ia');
      console.error('Erro:', error);
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    fetchBiography();
  }, [user?.id]);

  if (loading) {
    return (
      <Card className="overflow-hidden bg-gradient-to-r from-purple-900 to-fuchsia-900 border-fuchsia-800">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-white/20 rounded w-3/4"></div>
            <div className="h-4 bg-white/20 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden bg-gradient-to-r from-purple-900 to-fuchsia-900 border-fuchsia-800">
      <CardHeader>
        <CardTitle className="text-white drop-shadow-sm flex items-center gap-2">
          <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center overflow-hidden">
            <img 
              src="https://imagensids.s3.us-east-1.amazonaws.com/Sofia%20sem%20fundo.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAZAQZCSRHU3YW55DQ%2F20250729%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250729T200136Z&X-Amz-Expires=300&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEIT%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIQChA3%2BbD1dZqLBDQqsI5BQFiUEGWdCUcevcJ9eXvyTkqAIgRI18C0sZ9AuXHxEfrihiBQnbyAcXCr9NQJ033v55sG0q3wIIrf%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgw2MTk2MDE2MzAyODciDHNhM9pb2hgFxRbGmiqzAmX16D%2FTsmIZ44pytO6ppRtdkF2MNSclV%2B494zA1B%2FNYNYShq1yLQvYIE8mu%2Bw%2Fp623wtNUqHRK%2FVB55wp5C4S7VbqtWryvbWWgwqt78y32eIaXrv5AMKippOH9ueHFEAjsA%2FQbBN2mQZlD%2FiadabySlYFQSvWHJ6pKV077%2BwjTfedjHLgU0AusofsIolBqq%2FBoUHcMz2%2BRmhD3QIDshc7%2BBSOce76%2BuSEjWUql8fnYLrHn54Q%2BnQ5MIjGa8y1IZ7wBSXe4J0cZI%2FdgovKavwfAzfHm%2BmVcmS0mEIg0D1qK5UEOPcXwxfJU4a5f3nNXkRuoVlAfhVr0aDIeQ8oRjbJ923lFaz1m945SbBvcCeZnPFKODH6r9Xstrz5tp9fTj0FLZL7nRXb7KVq8fXGqLBQtD%2Bk8w%2FMykxAY6rQJsvxbhGbRYFYsd%2FgOTolaFps%2BmKV1R0j6pl0sTUgdJi94%2Fs6yv7igUxpCXKUdufJIk8NgOnIfkQYt88B0%2F0dYtStMeumcbgc%2Bpsi%2BlaUNd3I%2BBKgamg%2FY%2BnL4lo22YFVVJRgVEQ2ALLwQlqUW7wx%2BsATDs6LFkQ0zCZrjENrjvCcAGLdHw5R%2Fuo2nsg3yNuIHHMH%2BWz8ZBawseAP%2FwwgftK%2Bk%2BL5ira8wJtwX9FpgetHBlL2VXp3ZnamgV%2FuRJwHRXcVrqHr36zsizaedMk6KD6ITy%2BmPcx3Ai8vs37Ga24PnpfAbnGKqGLHOLhy8sAPjUQJX2jAOfGiYHHDRDaujJPQEshMpG0MZPXQur5oosX4M4qmQs8GSJvZAUcL7ZkahcF6ZHfltnM82YDtRx&X-Amz-Signature=898906fe6d7fd05f241153a3c5cbdb1980b83434d711179c47d010b057dc3eb4&X-Amz-SignedHeaders=host&response-content-disposition=inline"
              alt="Sofia"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          Sua Biografia por Sof.ia
          <Sparkles className="h-4 w-4 text-yellow-400 animate-pulse" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {biography ? (
          <>
            <div className="text-white/90 leading-relaxed">
              "{biography.biography}"
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-white/70">
                Atualizada em {new Date(biography.last_updated).toLocaleDateString('pt-BR')} • 
                Baseada em {biography.conversation_count} conversas
              </p>
              <Button
                onClick={generateBiography}
                disabled={updating}
                size="sm"
                className="bg-pink-600 hover:bg-pink-700 text-white"
              >
                {updating ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Heart className="h-4 w-4 mr-1" />
                    Atualizar
                  </>
                )}
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center space-y-4">
            <p className="text-white/80">
              A Sof.ia ainda não criou sua biografia personalizada.
            </p>
            <p className="text-sm text-white/70">
              Converse mais com ela para que possa conhecer você melhor!
            </p>
            <Button
              onClick={generateBiography}
              disabled={updating}
              className="bg-pink-600 hover:bg-pink-700 text-white"
            >
              {updating ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Heart className="h-4 w-4 mr-2" />
              )}
              Criar Biografia
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};