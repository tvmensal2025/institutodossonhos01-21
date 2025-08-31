import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, 
  Trophy, 
  Flame, 
  Target,
  Plus,
  Smile,
  Navigation
} from 'lucide-react';
import { FileUpload } from './FileUpload';

interface CreatePostProps {
  onPost: (postData: any) => void;
  currentUser: {
    name: string;
    avatar: string;
    level: string;
  };
}

export function CreatePost({ onPost, currentUser }: CreatePostProps) {
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState<'conquista' | 'progresso' | 'meta'>('conquista');
  const [location, setLocation] = useState('');
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Dados específicos por tipo de post
  const [achievementData, setAchievementData] = useState({
    title: '',
    description: '',
    points: 0
  });
  
  const [progressData, setProgressData] = useState({
    metric: '',
    before: '',
    after: '',
    change: ''
  });

  const handleSubmit = () => {
    if (!content.trim()) return;

    const postData = {
      content,
      postType,
      location,
      tags: [],
      mediaUrls,
      achievementsData: postType === 'conquista' ? achievementData : null,
      progressData: postType === 'progresso' ? progressData : null,
      visibility: 'public',
      isStory: false
    };

    onPost(postData);
    
    // Reset form
    setContent('');
    setLocation('');
    setMediaUrls([]);
    setIsExpanded(false);
    setAchievementData({ title: '', description: '', points: 0 });
    setProgressData({ metric: '', before: '', after: '', change: '' });
  };

  const handleFilesChange = (files: string[]) => {
    setMediaUrls(files);
  };

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'conquista': return <Trophy className="w-4 h-4 text-yellow-500" />;
      case 'progresso': return <Flame className="w-4 h-4 text-orange-500" />;
      case 'meta': return <Target className="w-4 h-4 text-purple-500" />;
      default: return <Trophy className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPlaceholderText = (type: string) => {
    switch (type) {
      case 'conquista': return 'Compartilhe sua conquista! Ex: "Completei meu primeiro 5K!" 🏃‍♀️';
      case 'progresso': return 'Mostre seu progresso! Ex: "Perdi 2kg este mês!" 📈';
      case 'meta': return 'Defina sua meta! Ex: "Nova meta: correr 10K em 2 meses" 🎯';
      default: return 'O que você quer compartilhar hoje?';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Mestre': return 'text-purple-600 bg-purple-100';
      case 'Especialista': return 'text-orange-600 bg-orange-100';
      case 'Dedicado': return 'text-blue-600 bg-blue-100';
      case 'Intermediário': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <Card className="w-full max-w-full overflow-hidden">
      <CardHeader className="pb-3 px-3 sm:px-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <Avatar className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">
            <AvatarImage src={currentUser.avatar} />
            <AvatarFallback className="text-xs sm:text-base">{currentUser.name.charAt(0)}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 sm:gap-2">
              <h4 className="font-semibold text-sm sm:text-base truncate">{currentUser.name}</h4>
              <Badge className={`text-xs flex-shrink-0 ${getLevelColor(currentUser.level)}`}>
                {currentUser.level}
              </Badge>
            </div>
            
            <Select value={postType} onValueChange={(value: any) => setPostType(value)}>
              <SelectTrigger className="w-32 sm:w-40 h-6 sm:h-8 mt-1 text-xs sm:text-sm">
                <SelectValue />
              </SelectTrigger>
               <SelectContent>
                 <SelectItem value="conquista">
                   <div className="flex items-center gap-2">
                     <Trophy className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" />
                     <span className="text-xs sm:text-sm">Conquista</span>
                   </div>
                 </SelectItem>
                <SelectItem value="progresso">
                  <div className="flex items-center gap-2">
                    <Flame className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500" />
                    <span className="text-xs sm:text-sm">Progresso</span>
                  </div>
                </SelectItem>
                <SelectItem value="meta">
                  <div className="flex items-center gap-2">
                    <Target className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500" />
                    <span className="text-xs sm:text-sm">Meta</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-6">
        {/* Área de Texto Principal */}
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={getPlaceholderText(postType)}
          className="min-h-[100px] resize-none border-none focus:outline-none"
          onFocus={() => setIsExpanded(true)}
        />

        {/* Dados Específicos por Tipo de Post */}
        {isExpanded && postType === 'conquista' && (
          <div className="space-y-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-semibold text-yellow-800 flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Detalhes da Conquista
            </h4>
            <div className="space-y-2">
              <Input
                placeholder="Título da conquista"
                value={achievementData.title}
                onChange={(e) => setAchievementData({...achievementData, title: e.target.value})}
              />
              <Input
                placeholder="Descrição"
                value={achievementData.description}
                onChange={(e) => setAchievementData({...achievementData, description: e.target.value})}
              />
              <Input
                type="number"
                placeholder="Pontos conquistados"
                value={achievementData.points}
                onChange={(e) => setAchievementData({...achievementData, points: parseInt(e.target.value) || 0})}
              />
            </div>
          </div>
        )}

        {isExpanded && postType === 'progresso' && (
          <div className="space-y-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-800 flex items-center gap-2">
              <Flame className="w-4 h-4" />
              Dados do Progresso
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Métrica (ex: peso, bf%)"
                value={progressData.metric}
                onChange={(e) => setProgressData({...progressData, metric: e.target.value})}
              />
              <Input
                placeholder="Variação (ex: -2kg)"
                value={progressData.change}
                onChange={(e) => setProgressData({...progressData, change: e.target.value})}
              />
              <Input
                placeholder="Valor anterior"
                value={progressData.before}
                onChange={(e) => setProgressData({...progressData, before: e.target.value})}
              />
              <Input
                placeholder="Valor atual"
                value={progressData.after}
                onChange={(e) => setProgressData({...progressData, after: e.target.value})}
              />
            </div>
          </div>
        )}

        {/* Upload de arquivos */}
        {isExpanded && (
          <FileUpload
            onFilesChange={handleFilesChange}
            currentFiles={mediaUrls}
            maxFiles={5}
            accept="image/*,video/*"
          />
        )}


        {/* Localização */}
        {isExpanded && (
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Adicionar localização"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="flex-1"
            />
          </div>
        )}

        <Separator />

        {/* Botões de ação */}
        <div className="flex justify-between items-center">
          <div className="flex gap-1 sm:gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                window.open('/health-feed', '_blank');
              }}
              className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-2"
            >
              <Navigation className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm">Comunidade</span>
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-2"
            >
              <Smile className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm">Emoji</span>
            </Button>
          </div>

          <Button 
            onClick={handleSubmit}
            disabled={!content.trim()}
            className="bg-primary hover:bg-primary/90 flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2"
            size="sm"
          >
            {getPostTypeIcon(postType)}
            <span className="text-xs sm:text-sm">Publicar</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}