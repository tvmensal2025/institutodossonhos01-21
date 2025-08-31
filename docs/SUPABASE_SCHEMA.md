### Supabase Schema & Policies

This document summarizes key tables, relationships, policies, and storage buckets as defined in `supabase/migrations/*`.

#### ERD (selected)

```mermaid
erDiagram
  auth_users {
    uuid id PK
    text email
  }

  user_goals {
    uuid id PK
    uuid user_id FK
    text title
    text description
    text category
    uuid challenge_id
    numeric target_value
    text unit
    text difficulty
    date target_date
    boolean is_group_goal
    boolean evidence_required
    int estimated_points
    text status
    numeric current_value
    timestamptz created_at
  }

  goal_updates {
    uuid id PK
    uuid goal_id FK
    uuid user_id FK
    numeric previous_value
    numeric new_value
    text notes
    timestamptz created_at
  }

  user_goal_invitations {
    uuid id PK
    uuid goal_id FK
    uuid inviter_id FK
    uuid invitee_user_id
    text invitee_email
    text invitee_name
    text status
    timestamptz created_at
  }

  user_goal_participants {
    uuid id PK
    uuid goal_id FK
    uuid user_id FK
    boolean can_view_progress
  }

  courses {
    uuid id PK
    text title
    boolean is_published
  }

  course_modules {
    uuid id PK
    uuid course_id FK
    text title
    int order_index
  }

  lessons {
    uuid id PK
    uuid module_id FK
    uuid course_id FK
    text title
    text description
    text video_url
    text thumbnail_url
    boolean is_free
    int order_index
  }

  daily_responses {
    uuid id PK
    uuid user_id FK
    date date
    text section
    text question_id
    text answer
    text text_response
    int points_earned
  }

  weight_measurements {
    uuid id PK
    uuid user_id FK
    numeric peso_kg
    numeric circunferencia_abdominal_cm
    numeric agua_corporal_percent
    numeric massa_ossea_kg
    text risco_cardiometabolico
    timestamptz created_at
  }

  admin_logs {
    uuid id PK
    uuid user_id FK
    text action
    text entity_type
    uuid entity_id
    jsonb details
    timestamptz created_at
  }

  auth_users ||--o{ user_goals : "user_id"
  user_goals ||--o{ goal_updates : "goal_id"
  user_goals ||--o{ user_goal_invitations : "goal_id"
  user_goals ||--o{ user_goal_participants : "goal_id"
  courses ||--o{ course_modules : "course_id"
  course_modules ||--o{ lessons : "module_id"
```

#### RLS Highlights
- sessions: SELECT aberto; INSERT/UPDATE/DELETE somente admin via `auth.jwt()->'app_metadata'->>'role' = 'admin'` ou `user_metadata` (see 20250730103000_fix_policies_and_sections.sql).
- lessons: leitura de publicadas; escrita somente admin.
- user_goal_invitations/participants: convidador e convidado; admin pode gerenciar.
- profiles: users veem/alteram o próprio; admins têm leitura global.

#### Storage Buckets
- `avatars` — user avatars; público leitura.
- `community-uploads` — uploads de feed; público leitura.
- `chat-images` — imagens do chat; público leitura; limite 5MB; mime `image/*`.
- `course-thumbnails` — capas/thumbnails de cursos e módulos; policies: select público, insert autenticado, update/delete admin.

See migrations: 20250730090000_configure_course_thumbnails_and_admin_logs.sql, 20250806000000_create_chat_images_bucket.sql and related duplicates (kept idempotent).

