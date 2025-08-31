### CI/CD Pipeline

Suggested pipeline stages
1) Lint & Typecheck
2) Unit tests (Vitest)
3) Build (Vite)
4) Preview deploy (optional)
5) Tag + Release notes
6) Deploy Edge Functions
7) Apply DB migrations (manual approval in prod)
8) Frontend production deploy

Required secrets (CI context)
- SUPABASE_URL, SUPABASE_ANON_KEY (for smoke tests)
- SUPABASE_SERVICE_ROLE_KEY (for migrations/functions deploy) — protect carefully
- RESEND_API_KEY (optional)
- GOOGLE_FIT_* (if running integration tests)

Caching hints
- Cache pnpm/npm store, Vite cache, and Vitest cache for faster builds.

Branching
- `main` protected; PRs require checks green.
- Tags follow SemVer, mirrored into docs/CHANGELOG.md.

