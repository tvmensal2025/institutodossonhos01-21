import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle, Share2, Camera, MapPin, Trophy, TrendingUp, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

// Mock data para demonstração
const mockUsers = [
  {
    id: '1',
    name: 'Ana Silva',
    avatar: '',
    level: 'Iniciante',
    points: 150,
    badges: ['🏃‍♀️', '💧', '🎯']
  },
  {
    id: '2', 
    name: 'Carlos Santos',
    avatar: '',
    level: 'Intermediário',
    points: 420,
    badges: ['🔥', '💪', '🏆']
  }
];

const mockPosts = [
  {
    id: '1',
    userId: '1',
    profiles: {
      full_name: 'Ana Silva',
      avatar_url: '',
      level: 'Iniciante'
    },
    content: 'Consegui completar minha meta de passos hoje! 10.000 passos ✅',
    post_type: 'achievement',
    media_urls: [],
    achievements_data: { steps: 10000, goal: 10000 },
    progress_data: null,
    location: 'São Paulo, SP',
    tags: ['passos', 'meta'],
    created_at: new Date().toISOString(),
    is_story: false,
    reactions: {
      likes: 12,
      comments: 3
    }
  },
  {
    id: '2',
    userId: '2',
    profiles: {
      full_name: 'Carlos Santos', 
      avatar_url: '',
      level: 'Intermediário'
    },
    content: 'Treino de hoje concluído! Focando na constância 💪',
    post_type: 'workout',
    media_urls: [],
    achievements_data: null,
    progress_data: { workout_duration: '45 min', calories: 320 },
    location: null,
    tags: ['treino', 'constância'],
    created_at: new Date().toISOString(),
    is_story: false,
    reactions: {
      likes: 8,
      comments: 5
    }
  }
];

export default function HealthFeedPage() {
  const [newPost, setNewPost] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const popularTags = ['🏃‍♀️ Corrida', '💪 Musculação', '🧘‍♀️ Meditação', '💧 Hidratação', '🥗 Alimentação', '😴 Sono'];

  const handleCreatePost = () => {
    if (!newPost.trim()) return;
    
    // Aqui seria feita a criação do post
    console.log('Criando post:', { content: newPost, tags: selectedTags });
    setNewPost('');
    setSelectedTags([]);
  };

  const handleTagClick = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-2">
            Health Feed
          </h1>
          <p className="text-muted-foreground">
            Compartilhe sua jornada de saúde e inspire outros
          </p>
        </motion.div>

        {/* Create Post */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Compartilhar Progresso
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="O que você conquistou hoje? Compartilhe sua jornada..."
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                className="min-h-[100px]"
              />
              
              <div className="flex flex-wrap gap-2">
                {popularTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer transition-all"
                    onClick={() => handleTagClick(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="flex gap-2 justify-between">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Camera className="w-4 h-4 mr-2" />
                    Foto
                  </Button>
                  <Button variant="outline" size="sm">
                    <MapPin className="w-4 h-4 mr-2" />
                    Local
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trophy className="w-4 h-4 mr-2" />
                    Conquista
                  </Button>
                </div>
                <Button onClick={handleCreatePost} disabled={!newPost.trim()}>
                  Publicar
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Active Users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Usuários Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
                {mockUsers.map((user) => (
                  <div key={user.id} className="flex flex-col items-center min-w-[80px] sm:min-w-[100px] text-center">
                    <Avatar className="w-16 h-16 mb-2 border-2 border-primary/20">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{user.name.split(' ')[0]}</span>
                    <span className="text-xs text-muted-foreground">{user.level}</span>
                    <div className="flex gap-1 mt-1">
                      {user.badges.map((badge, i) => (
                        <span key={i} className="text-xs">{badge}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Feed Posts */}
        <div className="space-y-6">
          {mockPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <Avatar>
                      <AvatarImage src={post.profiles.avatar_url} />
                      <AvatarFallback>
                        {post.profiles.full_name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{post.profiles.full_name}</span>
                        <Badge variant="outline" className="text-xs">
                          {post.profiles.level}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{new Date(post.created_at).toLocaleDateString('pt-BR')}</span>
                        {post.location && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {post.location}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>{post.content}</p>

                  {post.achievements_data && (
                    <div className="bg-primary/5 p-3 rounded-lg border-l-4 border-primary">
                      <div className="flex items-center gap-2 mb-2">
                        <Trophy className="w-4 h-4 text-primary" />
                        <span className="font-medium text-primary">Conquista Desbloqueada!</span>
                      </div>
                      <p className="text-sm">
                        Meta de passos atingida: {post.achievements_data.steps?.toLocaleString()} passos
                      </p>
                    </div>
                  )}

                  {post.progress_data && (
                    <div className="bg-secondary/20 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-secondary" />
                        <span className="font-medium">Progresso do Treino</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Duração:</span>
                          <span className="ml-2 font-medium">{post.progress_data.workout_duration}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Calorias:</span>
                          <span className="ml-2 font-medium">{post.progress_data.calories} kcal</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-4 pt-2 border-t">
                    <Button variant="ghost" size="sm" className="flex items-center gap-2">
                      <Heart className="w-4 h-4" />
                      <span>{post.reactions.likes}</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4" />
                      <span>{post.reactions.comments}</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="flex items-center gap-2">
                      <Share2 className="w-4 h-4" />
                      Compartilhar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}