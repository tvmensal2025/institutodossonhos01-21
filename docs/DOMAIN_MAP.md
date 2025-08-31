### Domain Map

This project spans multiple business domains. Below is a concise map with primary components and data stores.

- Users
  - Auth via Supabase; profiles in `public.profiles`.
  - UI: `src/components/UserProfile.tsx`, `src/hooks/useAuth.ts`.

- Premium Courses
  - Catalog grid and Netflix-like player: `src/components/dashboard/CoursePlatformNetflix.tsx`, `src/components/CoursePlatform.tsx`, `src/pages/CoursePlatformPage.tsx`.
  - Admin CRUD: `src/components/admin/CourseManagementNew.tsx`, `ModuleModal.tsx`, `LessonModal.tsx`, `CourseModal.tsx`.
  - Data: `public.courses`, `public.course_modules`, `public.lessons`.
  - Storage: `course-thumbnails` (covers/thumbs).

- Points/Rewards
  - Estimated points on goals; gamification widgets in `src/components/gamification/*`.
  - Tables include `user_goals`, `goal_updates`.

- Daily Mission
  - Components/Hooks: `src/components/daily-missions/*`, `src/hooks/useDailyMissions*.ts`.
  - Data: `public.daily_responses` with sections including `saboteurs`.

- Coaching Sessions
  - UI: `src/components/dashboard/SessionManager.tsx`, `src/components/UserSessions.tsx`.
  - Data: `public.sessions`, `public.user_sessions`.

- Wheels (Health/Abundance)
  - UI: `src/components/ui/health-wheel.tsx`, `src/components/abundance/*`.

- Saboteur Tests
  - UI/logic: `src/components/SaboteurTest.tsx`, `src/utils/sabotadoresCalculator.ts`, `src/data/saboteurQuestions.ts`.
  - Persisted responses in `public.daily_responses` (section `saboteurs`/`saboteurs_results`).

- SmartScale / Weight
  - UI: `src/components/weighing/*`, `src/components/XiaomiScale*.tsx`.
  - Data: `public.weight_measurements` unified schema.
  - Functions: `supabase/functions/generate-weight-report`.

- Payments/Subscriptions
  - Functions: `create-checkout`, `customer-portal`, `check-subscription`.
  - UI: `src/pages/SubscriptionPage.tsx`, guards in `src/components/PremiumContentGuard.tsx`.

- Reports
  - Edge functions: `weekly-health-report`, `generate-weekly-chat-insights`, `dr-vital-weekly-report`.

- Admin & Logging
  - Admin UI: `src/pages/AdminPage.tsx`, `src/components/admin/*`.
  - Logs: `public.admin_logs` via `AdminEditControls.tsx`.

- Marketing & Health Content
  - Health feed components in `src/components/health-feed/*`.

