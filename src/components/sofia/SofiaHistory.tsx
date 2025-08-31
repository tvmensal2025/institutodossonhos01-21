import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar, MessageSquare, Camera, BarChart3, Filter, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface HistoryItem {
  id: string;
  type: 'message' | 'image' | 'analysis' | 'goal';
  title: string;
  content: string;
  timestamp: Date;
  category: string;
  imageUrl?: string;
}

const SofiaHistory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  
  const [historyItems] = useState<HistoryItem[]>([
    {
      id: '1',
      type: 'message',
      title: 'Conversa sobre alimentação',
      content: 'Discussão sobre hábitos alimentares e sugestões da Sofia para melhorar a dieta.',
      timestamp: new Date('2024-01-05T14:30:00'),
      category: 'nutrition'
    },
    {
      id: '2',
      type: 'image',
      title: 'Análise de refeição - Almoço',
      content: 'Arroz integral, frango grelhado, brócolis e tomate cherry. 450 kcal estimadas.',
      timestamp: new Date('2024-01-05T12:15:00'),
      category: 'meal',
      imageUrl: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&q=80'
    },
    {
      id: '3',
      type: 'analysis',
      title: 'Relatório Semanal de Progresso',
      content: 'Análise do progresso da semana: 85% das metas atingidas, melhoria na hidratação.',
      timestamp: new Date('2024-01-01T09:00:00'),
      category: 'progress'
    },
    {
      id: '4',
      type: 'goal',
      title: 'Meta de Peso Atualizada',
      content: 'Progresso na meta de perda de peso: 2.3kg de 5kg (46% concluído).',
      timestamp: new Date('2023-12-28T16:45:00'),
      category: 'weight'
    },
    {
      id: '5',
      type: 'message',
      title: 'Dicas de Exercícios',
      content: 'Sofia sugeriu rotina de exercícios personalizados e alongamentos.',
      timestamp: new Date('2023-12-25T10:20:00'),
      category: 'exercise'
    }
  ]);

  const getTypeIcon = (type: string) => {
    const icons = {
      message: <MessageSquare className="h-4 w-4" />,
      image: <Camera className="h-4 w-4" />,
      analysis: <BarChart3 className="h-4 w-4" />,
      goal: <Calendar className="h-4 w-4" />
    };
    return icons[type as keyof typeof icons] || <MessageSquare className="h-4 w-4" />;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      message: 'bg-blue-100 text-blue-800',
      image: 'bg-green-100 text-green-800',
      analysis: 'bg-purple-100 text-purple-800',
      goal: 'bg-orange-100 text-orange-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryEmoji = (category: string) => {
    const emojis = {
      nutrition: '🥗',
      meal: '🍽️',
      progress: '📊',
      weight: '⚖️',
      exercise: '💪',
      habits: '🎯'
    };
    return emojis[category as keyof typeof emojis] || '📋';
  };

  const filteredItems = historyItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || item.type === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Ontem';
    if (diffDays <= 7) return `${diffDays} dias atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  const filters = [
    { value: 'all', label: 'Todos', count: historyItems.length },
    { value: 'message', label: 'Mensagens', count: historyItems.filter(i => i.type === 'message').length },
    { value: 'image', label: 'Imagens', count: historyItems.filter(i => i.type === 'image').length },
    { value: 'analysis', label: 'Análises', count: historyItems.filter(i => i.type === 'analysis').length },
    { value: 'goal', label: 'Metas', count: historyItems.filter(i => i.type === 'goal').length }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">📚 Histórico</h2>
        <p className="text-gray-600">Acompanhe todas suas interações com a Sofia</p>
      </div>

      {/* Busca e Filtros */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar no histórico..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <Button
              key={filter.value}
              variant={selectedFilter === filter.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedFilter(filter.value)}
              className="gap-2"
            >
              <Filter className="h-3 w-3" />
              {filter.label} ({filter.count})
            </Button>
          ))}
        </div>
      </div>

      {/* Lista do Histórico */}
      <ScrollArea className="h-[600px]">
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(item.type)}
                      <span className="text-lg">{getCategoryEmoji(item.category)}</span>
                    </div>
                    <div>
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                      <p className="text-sm text-gray-500">{formatDate(item.timestamp)}</p>
                    </div>
                  </div>
                  <Badge className={getTypeColor(item.type)}>
                    {item.type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {item.imageUrl && (
                    <img 
                      src={item.imageUrl} 
                      alt="Imagem do histórico" 
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                  )}
                  <p className="text-gray-700">{item.content}</p>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-xs text-gray-500">
                      {item.timestamp.toLocaleString('pt-BR')}
                    </span>
                    <Button variant="ghost" size="sm">
                      Ver detalhes
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredItems.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchTerm ? 'Nenhum resultado encontrado' : 'Histórico vazio'}
                </h3>
                <p className="text-gray-600">
                  {searchTerm 
                    ? 'Tente ajustar sua busca ou filtros.' 
                    : 'Suas conversas e interações com a Sofia aparecerão aqui.'
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default SofiaHistory;