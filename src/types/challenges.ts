export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  challenge_type: string;
  target_value: number;
  xp_reward: number;
  badge_reward?: string;
  start_date?: string;
  end_date?: string;
  is_active: boolean;
  is_featured?: boolean;
  created_by?: string;
  created_at: string;
  updated_at?: string;
  
  // Campos específicos para compatibilidade
  duration_days?: number;
  points_reward?: number;
  badge_icon?: string;
  badge_name?: string;
  instructions?: string;
  tips?: string[];
  prerequisites?: string[];
  min_level?: number;
  max_participants?: number;
}

export interface ChallengeParticipation {
  id: string;
  user_id: string;
  challenge_id: string;
  progress: number;
  target_value: number;
  current_streak: number;
  best_streak: number;
  is_completed: boolean;
  started_at: string;
  completed_at?: string;
  created_at: string;
  updated_at?: string;
  challenges?: Challenge;
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  challenge_type: string;
  target_value: number;
  xp_reward: number;
  is_active: boolean;
  expires_in_hours: number;
  created_at: string;
}