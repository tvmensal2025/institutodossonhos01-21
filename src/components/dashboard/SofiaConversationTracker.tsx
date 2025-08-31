import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MessageCircle, 
  Brain, 
  TrendingUp, 
  Calendar,
  Activity,
  Heart,
  Smile,
  AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SofiaConversation {
  id: string;
  user_message: string;
  bot_response: string;
  character_name: string;
  sentiment_score?: number;
  emotion_tags?: string[];
  topic_tags?: string[];
  pain_level?: number;
  stress_level?: number;
  energy_level?: number;
  created_at: string;
}

interface ConversationStats {
  totalConversations: number;
  averageSentiment: number;
  dominantEmotions: string[];
  averageStress: number;
  averageEnergy: number;
  mostDiscussedTopics: string[];
}

const SofiaConversationTracker: React.FC = () => {
  const [conversations, setConversations] = useState<SofiaConversation[]>([]);
  const [stats, setStats] = useState<ConversationStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Carregar conversas dos últimos 30 dias
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Dados mock temporários até migração das tabelas
      const data: SofiaConversation[] = [];
      const error = null;

      if (error) {
        console.error('Erro ao carregar conversas:', error);
        return;
      }

      setConversations(data || []);
      calculateStats(data || []);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (conversations: SofiaConversation[]) => {
    if (conversations.length === 0) {
      setStats(null);
      return;
    }

    const totalConversations = conversations.length;
    
    // Calcular sentiment score médio
    const validSentiments = conversations
      .filter(c => c.sentiment_score !== null && c.sentiment_score !== undefined)
      .map(c => c.sentiment_score);
    const averageSentiment = validSentiments.length > 0 
      ? validSentiments.reduce((sum, score) => sum + (score || 0), 0) / validSentiments.length 
      : 0;

    // Calcular emoções dominantes
    const allEmotions = conversations
      .filter(c => c.emotion_tags && c.emotion_tags.length > 0)
      .flatMap(c => c.emotion_tags || []);
    
    const emotionCounts = allEmotions.reduce((acc, emotion) => {
      acc[emotion] = (acc[emotion] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const dominantEmotions = Object.entries(emotionCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([emotion]) => emotion);

    // Calcular níveis médios
    const validStress = conversations
      .filter(c => c.stress_level !== null && c.stress_level !== undefined)
      .map(c => c.stress_level);
    const averageStress = validStress.length > 0 
      ? validStress.reduce((sum, level) => sum + (level || 0), 0) / validStress.length 
      : 0;

    const validEnergy = conversations
      .filter(c => c.energy_level !== null && c.energy_level !== undefined)
      .map(c => c.energy_level);
    const averageEnergy = validEnergy.length > 0 
      ? validEnergy.reduce((sum, level) => sum + (level || 0), 0) / validEnergy.length 
      : 0;

    // Calcular tópicos mais discutidos
    const allTopics = conversations
      .filter(c => c.topic_tags && c.topic_tags.length > 0)
      .flatMap(c => c.topic_tags || []);
    
    const topicCounts = allTopics.reduce((acc, topic) => {
      acc[topic] = (acc[topic] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const mostDiscussedTopics = Object.entries(topicCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([topic]) => topic);

    setStats({
      totalConversations,
      averageSentiment,
      dominantEmotions,
      averageStress,
      averageEnergy,
      mostDiscussedTopics
    });
  };

  const getSentimentColor = (score: number) => {
    if (score >= 0.7) return 'text-green-600';
    if (score >= 0.4) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSentimentIcon = (score: number) => {
    if (score >= 0.7) return <Smile className="w-4 h-4" />;
    if (score >= 0.4) return <Activity className="w-4 h-4" />;
    return <AlertTriangle className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageCircle className="w-5 h-5" />
            <span>Conversas com Sofia</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-8 bg-gray-200 rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center space-x-2">
                <MessageCircle className="w-4 h-4 text-blue-500" />
                <span>Total de Conversas</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats.totalConversations}
              </div>
              <p className="text-xs text-muted-foreground">
                Últimos 30 dias
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center space-x-2">
                <Brain className="w-4 h-4 text-purple-500" />
                <span>Sentimento Médio</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                {getSentimentIcon(stats.averageSentiment)}
                <span className={`text-2xl font-bold ${getSentimentColor(stats.averageSentiment)}`}>
                  {(stats.averageSentiment * 100).toFixed(0)}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Positivo
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center space-x-2">
                <Heart className="w-4 h-4 text-red-500" />
                <span>Nível de Estresse</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {stats.averageStress.toFixed(1)}/5
              </div>
              <p className="text-xs text-muted-foreground">
                Média das conversas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center space-x-2">
                <Activity className="w-4 h-4 text-green-500" />
                <span>Nível de Energia</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.averageEnergy.toFixed(1)}/5
              </div>
              <p className="text-xs text-muted-foreground">
                Média das conversas
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Emoções Dominantes */}
      {stats && stats.dominantEmotions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Emoções Dominantes</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {stats.dominantEmotions.map((emotion, index) => (
                <Badge key={index} variant="secondary">
                  {emotion}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tópicos Mais Discutidos */}
      {stats && stats.mostDiscussedTopics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageCircle className="w-5 h-5" />
              <span>Tópicos Mais Discutidos</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.mostDiscussedTopics.map((topic, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium">{topic}</span>
                  <Badge variant="outline" className="text-xs">
                    #{index + 1}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}


    </div>
  );
};

export default SofiaConversationTracker; 