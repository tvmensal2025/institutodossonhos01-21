import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  MessageCircle, 
  Share, 
  MoreHorizontal,
  ThumbsUp,
  Flame,
  Trophy,
  Handshake,
  MapPin,
  Camera,
  Video,
  BookOpen
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getUserAvatar } from '@/lib/avatar-utils';

interface PostReaction {
  count: number;
  userReacted: boolean;
}

interface PostComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  createdAt: string;
  replies?: PostComment[];
}

interface FeedPost {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userLevel: string;
  content: string;
  postType: 'conquista' | 'progresso' | 'meta' | 'story';
  mediaUrls: string[];
  achievementsData?: any;
  progressData?: any;
  location?: string;
  tags: string[];
  createdAt: string;
  reactions: {
    like: PostReaction;
    love: PostReaction;
    fire: PostReaction;
    hands: PostReaction;
    trophy: PostReaction;
  };
  comments: PostComment[];
  isStory: boolean;
}

interface FeedPostCardProps {
  post: FeedPost;
  onReaction: (postId: string, reactionType: string) => void;
  onComment: (postId: string, content: string) => void;
  onShare: (postId: string) => void;
}

export function FeedPostCard({ post, onReaction, onComment, onShare }: FeedPostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'conquista': return <Trophy className="w-4 h-4 text-yellow-500" />;
      case 'progresso': return <Flame className="w-4 h-4 text-orange-500" />;
      case 'meta': return <Trophy className="w-4 h-4 text-purple-500" />;
      default: return <BookOpen className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPostTypeLabel = (type: string) => {
    switch (type) {
      case 'conquista': return 'Conquista';
      case 'progresso': return 'Progresso';
      case 'meta': return 'Meta';
      default: return 'Post';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Mestre': return 'text-purple-600 bg-purple-100';
      case 'Expert': return 'text-orange-600 bg-orange-100';
      case 'Dedicado': return 'text-blue-600 bg-blue-100';
      case 'Ativo': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getReactionIcon = (type: string, isActive: boolean) => {
    const className = `w-5 h-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`;
    switch (type) {
      case 'like': return <ThumbsUp className={className} />;
      case 'love': return <Heart className={className} />;
      case 'fire': return <Flame className={className} />;
      case 'hands': return <Handshake className={className} />;
      case 'trophy': return <Trophy className={className} />;
      default: return <ThumbsUp className={className} />;
    }
  };

  const getReactionEmoji = (type: string) => {
    switch (type) {
      case 'like': return '👍';
      case 'love': return '❤️';
      case 'fire': return '🔥';
      case 'hands': return '🤝';
      case 'trophy': return '🏆';
      default: return '👍';
    }
  };

  const totalReactions = Object.values(post.reactions).reduce((sum, reaction) => sum + reaction.count, 0);
  const hasUserReacted = Object.values(post.reactions).some(reaction => reaction.userReacted);

  const handleCommentSubmit = () => {
    if (newComment.trim()) {
      onComment(post.id, newComment);
      setNewComment('');
    }
  };

  return (
    <Card className="w-full max-w-full overflow-hidden">
      <CardHeader className="pb-3 px-3 sm:px-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden bg-muted flex items-center justify-center flex-shrink-0">
              {(() => {
                const avatar = getUserAvatar(post.userAvatar, post.userName);
                
                if (avatar.type === 'photo' || avatar.type === 'generated') {
                  return (
                    <img 
                      src={avatar.value} 
                      alt={post.userName}
                      className="w-full h-full object-cover"
                    />
                  );
                } else {
                  return (
                    <div className="text-sm sm:text-lg">
                      {avatar.value}
                    </div>
                  );
                }
              })()}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 sm:gap-2">
                <h4 className="font-semibold text-sm sm:text-base truncate">{post.userName}</h4>
                <Badge className={`text-xs flex-shrink-0 ${getLevelColor(post.userLevel)}`}>
                  {post.userLevel}
                </Badge>
              </div>
              
              <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground flex-wrap">
                <div className="flex items-center gap-1">
                  {getPostTypeIcon(post.postType)}
                  <span className="hidden sm:inline">{getPostTypeLabel(post.postType)}</span>
                </div>
                •
                <time className="truncate">
                  {formatDistanceToNow(new Date(post.createdAt), { 
                    addSuffix: true, 
                    locale: ptBR 
                  })}
                </time>
                {post.location && (
                  <>
                    •
                    <div className="flex items-center gap-1 min-w-0">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate text-xs">{post.location}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <Button variant="ghost" size="sm" className="flex-shrink-0">
            <MoreHorizontal className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-6">
        {/* Conteúdo do Post */}
        <div className="space-y-2 sm:space-y-3">
          <p className="text-sm leading-relaxed break-words">{post.content}</p>
          
          {/* Dados de Conquista/Progresso */}
          {post.achievementsData && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-2 sm:p-3">
              <div className="flex items-center gap-2 mb-1 sm:mb-2">
                <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 flex-shrink-0" />
                <span className="font-semibold text-yellow-800 text-sm">Conquista Desbloqueada!</span>
              </div>
              <p className="text-xs sm:text-sm text-yellow-700">{post.achievementsData.description}</p>
              {post.achievementsData.points && (
                <p className="text-xs text-yellow-600 mt-1">+{post.achievementsData.points} pontos</p>
              )}
            </div>
          )}

          {post.progressData && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-2 sm:p-3">
              <div className="flex items-center gap-2 mb-1 sm:mb-2">
                <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
                <span className="font-semibold text-blue-800 text-sm">Progresso Registrado</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
                <div className="space-y-1">
                  <p className="text-blue-600">Antes: {post.progressData.before}</p>
                  <p className="text-blue-600">Depois: {post.progressData.after}</p>
                </div>
                <div>
                  <p className="text-green-600 font-semibold">
                    Progresso: {post.progressData.change}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Mídia */}
          {post.mediaUrls.length > 0 && (
            <div className="grid grid-cols-2 gap-1 sm:gap-2">
              {post.mediaUrls.map((url, index) => (
                <div key={index} className="relative aspect-square bg-muted rounded-lg overflow-hidden">
                  <img 
                    src={url} 
                    alt={`Mídia ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                  />
                  {url.includes('video') && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <Video className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <Separator />

        {/* Estatísticas de Reações e Comentários */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            {totalReactions > 0 && (
              <div className="flex items-center gap-1">
                <div className="flex -space-x-1">
                  {Object.entries(post.reactions)
                    .filter(([_, reaction]) => reaction.count > 0)
                    .slice(0, 3)
                    .map(([type, _]) => (
                      <span key={type} className="text-base">
                        {getReactionEmoji(type)}
                      </span>
                    ))}
                </div>
                <span>{totalReactions}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            {post.comments.length > 0 && (
              <button 
                onClick={() => setShowComments(!showComments)}
                className="hover:underline"
              >
                {post.comments.length} comentário{post.comments.length !== 1 ? 's' : ''}
              </button>
            )}
          </div>
        </div>

        <Separator />

        {/* Botões de Ação */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          {/* Reações */}
          <div className="flex items-center gap-1 flex-wrap">
            {Object.entries(post.reactions).slice(0, 3).map(([type, reaction]) => (
              <Button
                key={type}
                variant="ghost"
                size="sm"
                onClick={() => onReaction(post.id, type)}
                className={`flex items-center gap-1 px-2 py-1 text-xs h-8 ${reaction.userReacted ? 'text-primary bg-primary/10' : 'hover:bg-muted'}`}
              >
                <span className="text-sm">{getReactionEmoji(type)}</span>
                {reaction.count > 0 && <span className="text-xs font-medium">{reaction.count}</span>}
              </Button>
            ))}
          </div>
          
          {/* Ações principais */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-1 px-3 py-1 h-8 hover:bg-muted"
            >
              <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs">Com</span>
              {post.comments.length > 0 && (
                <span className="text-xs bg-muted-foreground/20 px-1 py-0.5 rounded-full">
                  {post.comments.length}
                </span>
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onShare(post.id)}
              className="flex items-center gap-1 px-3 py-1 h-8 hover:bg-muted"
            >
              <Share className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs">Comp</span>
            </Button>
          </div>
        </div>

        {/* Seção de Comentários */}
        {showComments && (
          <div className="space-y-2 sm:space-y-3 pt-2 sm:pt-3 border-t">
            {/* Comentários Existentes */}
            {post.comments.map((comment) => (
              <div key={comment.id} className="flex gap-2 sm:gap-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full overflow-hidden bg-muted flex items-center justify-center flex-shrink-0">
                  {(() => {
                    const avatar = getUserAvatar(comment.userAvatar, comment.userName);
                    
                    if (avatar.type === 'photo' || avatar.type === 'generated') {
                      return (
                        <img 
                          src={avatar.value} 
                          alt={comment.userName}
                          className="w-full h-full object-cover"
                        />
                      );
                    } else {
                      return (
                        <div className="text-xs sm:text-sm">
                          {avatar.value}
                        </div>
                      );
                    }
                  })()}
                </div>
                
                <div className="flex-1 space-y-1 min-w-0">
                  <div className="bg-muted rounded-lg p-2 sm:p-3">
                    <p className="font-semibold text-xs sm:text-sm truncate">{comment.userName}</p>
                    <p className="text-xs sm:text-sm break-words">{comment.content}</p>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 text-xs text-muted-foreground">
                    <button className="hover:underline">Curtir</button>
                    <button className="hover:underline">Responder</button>
                    <time className="truncate">
                      {formatDistanceToNow(new Date(comment.createdAt), { 
                        addSuffix: true, 
                        locale: ptBR 
                      })}
                    </time>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Novo Comentário */}
            <div className="flex gap-2 sm:gap-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-xs sm:text-sm text-primary font-semibold">U</span>
              </div>
              
              <div className="flex-1 space-y-2 min-w-0">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Escreva um comentário..."
                  className="w-full min-h-[60px] sm:min-h-[80px] p-2 sm:p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
                <div className="flex justify-end">
                  <Button 
                    size="sm" 
                    onClick={handleCommentSubmit}
                    disabled={!newComment.trim()}
                    className="text-xs sm:text-sm"
                  >
                    Comentar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}