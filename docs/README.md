### Mission Health Nexus — Documentation Index

This folder contains production-ready documentation for engineers and AI agents to understand, operate, and migrate the project safely.

- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [DOMAIN_MAP.md](./DOMAIN_MAP.md)
- [ENVIRONMENT.md](./ENVIRONMENT.md)
- [SUPABASE_SCHEMA.md](./SUPABASE_SCHEMA.md)
- [RBAC_SECURITY.md](./RBAC_SECURITY.md)
- [STORAGE_POLICIES.md](./STORAGE_POLICIES.md)
- [FEATURE_MAPS.md](./FEATURE_MAPS.md)
- [OPERATIONS_RUNBOOK.md](./OPERATIONS_RUNBOOK.md)
- [TESTING.md](./TESTING.md)
- [CI_CD.md](./CI_CD.md)
- [MIGRATION.md](./MIGRATION.md)
- [CHANGELOG.md](./CHANGELOG.md)
- ADRs: see [ADRs](./ADRs)

Highlights
- TypeScript + React (Vite) frontend; Supabase backend (Postgres + Edge Functions + Storage).
- Path alias: `@/* → ./src/*`.
- Edge functions: see `supabase/functions/*`.
- Critical security: RLS admin overrides use JWT `app_metadata.role = 'admin'`.

All secrets are redacted. Use placeholders like `<SUPABASE_URL>`.

