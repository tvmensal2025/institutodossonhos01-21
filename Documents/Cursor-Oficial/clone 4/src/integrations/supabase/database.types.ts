export interface Database {
  public: {
    Tables: {
      sessions: {
        Row: {
          id: string
          title: string
          description: string | null
          video_url: string | null
          instructions: string | null
          category: string | null
          created_at: string
          created_by: string | null
          status: string
          is_public: boolean
          estimated_time: number
          notification_type: string
          wheel_tools: string[]
          sent_to: string[]
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          video_url?: string | null
          instructions?: string | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          status?: string
          is_public?: boolean
          estimated_time?: number
          notification_type?: string
          wheel_tools?: string[]
          sent_to?: string[]
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          video_url?: string | null
          instructions?: string | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          status?: string
          is_public?: boolean
          estimated_time?: number
          notification_type?: string
          wheel_tools?: string[]
          sent_to?: string[]
        }
      }
      session_materials: {
        Row: {
          id: string
          session_id: string
          type: string
          title: string | null
          content: string | null
          url: string | null
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          type: string
          title?: string | null
          content?: string | null
          url?: string | null
          order_index?: number
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          type?: string
          title?: string | null
          content?: string | null
          url?: string | null
          order_index?: number
          created_at?: string
        }
      }
      session_responses: {
        Row: {
          id: string
          session_id: string
          user_id: string
          response: string | null
          private_comments: string | null
          completed: boolean
          favorite: boolean
          rating: number | null
          feedback: string | null
          started_at: string | null
          completed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          user_id: string
          response?: string | null
          private_comments?: string | null
          completed?: boolean
          favorite?: boolean
          rating?: number | null
          feedback?: string | null
          started_at?: string | null
          completed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          user_id?: string
          response?: string | null
          private_comments?: string | null
          completed?: boolean
          favorite?: boolean
          rating?: number | null
          feedback?: string | null
          started_at?: string | null
          completed_at?: string | null
          created_at?: string
        }
      }
      session_notifications: {
        Row: {
          id: string
          session_id: string
          user_id: string
          type: string
          title: string
          message: string | null
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          user_id: string
          type: string
          title: string
          message?: string | null
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          user_id?: string
          type?: string
          title?: string
          message?: string | null
          read?: boolean
          created_at?: string
        }
      }
      wheel_responses: {
        Row: {
          id: string
          user_id: string
          session_id: string
          wheel_type: string
          responses: Record<string, number>
          reflection_answers: Record<string, string>
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          session_id: string
          wheel_type: string
          responses: Record<string, number>
          reflection_answers: Record<string, string>
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          session_id?: string
          wheel_type?: string
          responses?: Record<string, number>
          reflection_answers?: Record<string, string>
          created_at?: string
          completed_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: {
          user_uuid?: string
        }
        Returns: boolean
      }
      has_session_access: {
        Args: {
          p_session_id: string
          p_user_id?: string
        }
        Returns: boolean
      }
      send_session_to_users: {
        Args: {
          p_session_id: string
          p_user_ids: string[]
        }
        Returns: void
      }
      mark_notification_read: {
        Args: {
          p_notification_id: string
        }
        Returns: void
      }
      get_user_session_stats: {
        Args: {
          p_user_id?: string
        }
        Returns: {
          total_sessions: number
          completed_sessions: number
          in_progress_sessions: number
          pending_sessions: number
          average_rating: number
        }
      }
      save_wheel_response: {
        Args: {
          p_user_id: string
          p_session_id: string
          p_wheel_type: string
          p_responses: Record<string, number>
          p_reflection_answers: Record<string, string>
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
} 