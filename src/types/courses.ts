export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty_level: string;
  duration_minutes: number;
  instructor_name: string;
  is_premium: boolean;
  is_published: boolean;
  price: number;
  thumbnail_url: string;
  created_at: string;
  updated_at: string;
  structure_type?: string; // Campo opcional para compatibilidade
}

export interface Module {
  id: string;
  course_id: string;
  title: string;
  description: string;
  order_index: number;
  created_at: string;
  structure_type?: string; // Campo opcional para compatibilidade
}

export interface Lesson {
  id: string;
  course_id?: string;
  module_id?: string;
  title: string;
  description: string;
  video_url?: string;
  duration_minutes?: number;
  is_free?: boolean;
  order_index: number;
  created_at?: string;
  
  // Campos adicionais para compatibilidade
  content?: string;
  is_completed?: boolean;
  is_premium?: boolean;
}