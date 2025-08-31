// Dados padrão para ranking quando não há dados reais
export const defaultRankingUsers = [
  {
    user_id: 'demo-1',
    user_name: 'Usuário Demo',
    total_points: 0,
    streak_days: 0,
    missions_completed: 0,
    last_activity: null,
    position: 1
  }
];

// Dados padrão para posts quando não há dados reais
export const defaultPosts = [
  {
    id: 'demo-post-1',
    userId: 'demo-1',
    userName: 'Usuário Demo',
    userAvatar: '',
    userLevel: 'Iniciante',
    content: 'Bem-vindo à comunidade! Compartilhe sua jornada de saúde aqui.',
    postType: 'story' as const,
    mediaUrls: [],
    achievementsData: null,
    progressData: null,
    location: null,
    tags: ['bem-vindo'],
    createdAt: new Date().toISOString(),
    reactions: {
      like: { count: 0, userReacted: false },
      love: { count: 0, userReacted: false },
      fire: { count: 0, userReacted: false },
      hands: { count: 0, userReacted: false },
      trophy: { count: 0, userReacted: false }
    },
    comments: [],
    isStory: false
  }
];