### Testing Strategy

Unit
- Use Vitest + Testing Library. Targets pure utils and small components.
- Example areas: `src/utils/sabotadoresCalculator.ts`, reducers, hooks without IO.

Integration
- Supabase client interactions mocked; verify queries and state updates.
- Edge function contracts tested via local invocation (Deno deploy or CLI) with dummy secrets.

E2E (recommended)
- Use Playwright/Cypress to cover: login, create course/module/lesson (admin), upload thumbnail, create goal with invite, accept invite, play course video.

Running tests
- `pnpm test` (or `npm run test`) to open Vitest.
- `pnpm test:ci` to run with coverage.

Coverage thresholds (suggested)
- Lines 70%, Functions 70%, Branches 60%.

Critical cases
- RLS: non-admin cannot create session/lesson.
- Invitations: inserting into `user_goal_invitations` and participant acceptance flow.
- Storage: uploads respect mime/size; public URL persisted.

