### Feature Maps

Each section links files → edge functions/endpoints → tables/buckets/policies → UI entry.

Premium Courses
- Files: `src/components/dashboard/CoursePlatformNetflix.tsx`, `src/components/CoursePlatform.tsx`, `src/pages/CoursePlatformPage.tsx`.
- Admin: `src/components/admin/{CourseManagementNew,CourseModal,ModuleModal,LessonModal}.tsx`.
- Tables: `public.courses`, `public.course_modules`, `public.lessons`.
- Buckets: `course-thumbnails`.
- Policies: lessons writes admin-only; public read for published courses.
- UI entry: route `/app/courses` (see `src/App.tsx`).

Goals & Invites
- Files: `src/components/goals/CreateGoalDialog.tsx`, `src/hooks/useGoals.ts`.
- Functions: `goal-notifications`, `search-users`.
- Tables: `public.user_goals`, `public.goal_updates`, `public.user_goal_invitations`, `public.user_goal_participants`.
- Policies: owner access; admin override; invitations allow inviter/invitee.
- UI entry: `/app/goals`.

Daily Missions
- Files: `src/components/daily-missions/*`, hooks `useDailyMissions*.ts`.
- Tables: `public.daily_responses` with sections including `saboteurs`, `saboteurs_results`.
- Policies: owner only.
- UI entry: dashboards and `/app/missions`.

Saboteur Test
- Files: `src/components/SaboteurTest.tsx`, `src/utils/sabotadoresCalculator.ts`, `src/data/saboteurQuestions.ts`.
- Tables: `public.daily_responses` sections.

Coaching Sessions
- Files: `src/components/dashboard/SessionManager.tsx`, `src/components/UserSessions.tsx`.
- Tables: `public.sessions`, `public.user_sessions`.
- Policies: writes admin-only for `sessions`.

SmartScale / Weight
- Files: `src/components/weighing/*`, `src/hooks/useWeightMeasurement.ts`.
- Tables: `public.weight_measurements` unified schema.
- Functions: `generate-weight-report`.

Payments/Subscriptions
- Functions: `create-checkout`, `customer-portal`, `check-subscription`.
- UI: `src/pages/SubscriptionPage.tsx`, `src/components/PremiumContentGuard.tsx`.

Reports & Insights
- Functions: `weekly-health-report`, `generate-weekly-chat-insights`, `dr-vital-weekly-report`.

Admin Logging
- UI: `src/components/admin/AdminEditControls.tsx` inserts into `public.admin_logs`.

