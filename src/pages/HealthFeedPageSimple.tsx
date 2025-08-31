import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Users, Heart, MessageCircle, Share2, TrendingUp } from 'lucide-react';

export function HealthFeedPageSimple() {
  // Dados do usuário atual
  const { data: currentUser } = useQuery({
    queryKey: ['current-user-profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');

      // Buscar dados do perfil
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('user_id', user.id)
        .maybeSingle();

      return {
        id: user.id,
        name: userProfile?.full_name || 'Usuário',
        avatar: userProfile?.avatar_url || '',
        level: 'Iniciante',
        points: 0,
        badges: []
      };
    }
  });

  // Posts mock para demonstração
  const mockPosts = [
    {
      id: '1',
      user: { name: 'Ana Silva', avatar: '👩', level: 'Intermediário' },
      content: 'Consegui correr 5km hoje! 🏃‍♀️ Meta da semana concluída!',
      type: 'conquista',
      reactions: { likes: 12, hearts: 5 },
      comments: 3,
      timeAgo: '2h'
    },
    {
      id: '2',
      user: { name: 'Carlos Santos', avatar: '👨', level: 'Avançado' },
      content: 'Atingi minha meta de beber 2L de água por dia durante toda a semana! 💧',
      type: 'meta',
      reactions: { likes: 8, hearts: 3 },
      comments: 2,
      timeAgo: '4h'
    },
    {
      id: '3',
      user: { name: 'Maria Oliveira', avatar: '👩‍🦳', level: 'Iniciante' },
      content: 'Primeira semana de exercícios completa! Estou muito orgulhosa do meu progresso.',
      type: 'progresso',
      reactions: { likes: 15, hearts: 8 },
      comments: 5,
      timeAgo: '6h'
    }
  ];

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 max-w-md mx-auto">
          <CardContent className="text-center space-y-4">
            <Users className="w-16 h-16 mx-auto text-muted-foreground" />
            <h3 className="text-xl font-semibold">Login necessário</h3>
            <p className="text-muted-foreground">
              Faça login para acessar a comunidade de saúde.
            </p>
            <Button onClick={() => window.location.href = '/auth'}>
              Fazer Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Header da Comunidade */}
        <div className="relative mb-6 rounded-xl overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-6 text-white">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative flex items-center justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Comunidade dos Sonhos</h1>
                  <p className="text-blue-100 text-sm">Compartilhe sua jornada de saúde</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-center">
                <p className="font-semibold text-sm">{currentUser?.name}</p>
                <div className="flex items-center gap-1 text-xs text-blue-100">
                  <span>{currentUser?.level}</span>
                  <span>•</span>
                  <span>{currentUser?.points} pts</span>
                </div>
              </div>
              <div className="relative">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/30 bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <div className="text-lg">👤</div>
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Layout Principal */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Feed Principal */}
          <div className="xl:col-span-3 space-y-6">
            {/* Header do Feed */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-primary" />
                  HealthFeed
                </CardTitle>
                <p className="text-muted-foreground">
                  Acompanhe as conquistas da comunidade
                </p>
              </CardHeader>
            </Card>

            {/* Banner de demonstração */}
            <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
              <CardContent className="py-4">
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                  <TrendingUp className="w-5 h-5" />
                  <p className="text-sm font-medium">
                    Este é o feed da comunidade de demonstração. Em breve você poderá criar e interagir com posts reais!
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Posts */}
            <div className="space-y-6">
              {mockPosts.map((post) => (
                <Card key={post.id}>
                  <CardContent className="p-6">
                    {/* Header do Post */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg">
                        {post.user.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{post.user.name}</h4>
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                            {post.user.level}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{post.timeAgo}</p>
                      </div>
                      <div className="text-xs bg-secondary px-2 py-1 rounded-full">
                        {post.type}
                      </div>
                    </div>

                    {/* Conteúdo do Post */}
                    <div className="mb-4">
                      <p className="text-foreground">{post.content}</p>
                    </div>

                    {/* Ações do Post */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" className="gap-2">
                          <Heart className="w-4 h-4" />
                          <span>{post.reactions.likes}</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-2">
                          <MessageCircle className="w-4 h-4" />
                          <span>{post.comments}</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-2">
                          <Share2 className="w-4 h-4" />
                          Compartilhar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Sidebar - Ranking */}
          <div className="xl:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Top da Semana</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: 'Ana Silva', points: 350, avatar: '👩' },
                  { name: 'Carlos Santos', points: 290, avatar: '👨' },
                  { name: 'Maria Oliveira', points: 240, avatar: '👩‍🦳' }
                ].map((user, index) => (
                  <div key={user.name} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      {user.avatar}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.points} pts</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HealthFeedPageSimple;