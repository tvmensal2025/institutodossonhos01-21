export type QuestionType = 'multiple_choice' | 'scale' | 'text' | 'yes_no' | 'emoji_scale' | 'star_scale';

export type SectionType = 'morning' | 'habits' | 'mindset';

export interface ScaleConfig {
  min: number;
  max: number;
  labels: string[];
  emojis?: string[];
  stars?: boolean;
}

export interface DailyQuestion {
  id: string;
  section: SectionType;
  question: string;
  type: QuestionType;
  options?: string[];
  scale?: ScaleConfig;
  placeholder?: string;
  points: number;
  required: boolean;
  order: number;
  tracking?: string; // Para rastrear dados específicos (água, sono, etc.)
}

export interface DailyResponse {
  id?: string;
  user_id: string;
  date: string;
  section: SectionType;
  question_id: string;
  answer: string | number;
  text_response?: string;
  points_earned: number;
  created_at?: string;
}

export interface DailyMissionSession {
  id?: string;
  user_id: string;
  date: string;
  completed_sections: SectionType[];
  total_points: number;
  streak_days: number;
  is_completed: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_type: string;
  title: string;
  description: string;
  icon: string;
  unlocked_at: string;
  progress: number;
  target: number;
}

export interface WeeklyInsights {
  average_mood: number;
  average_energy: number;
  average_stress: number;
  most_common_gratitude: string;
  water_consistency: number;
  sleep_consistency: number;
  exercise_frequency: number;
  streak_days: number;
} 