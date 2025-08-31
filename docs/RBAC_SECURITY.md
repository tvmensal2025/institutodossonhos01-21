### RBAC & Security

Roles
- Anonymous: public pages only.
- Authenticated user: owns their rows; can read published content.
- Admin: JWT `app_metadata.role='admin'` or `user_metadata.role='admin'`. Grants write on admin-managed tables via RLS predicates.

Auth flow
- Supabase Auth (email/password, OAuth if enabled). Frontend reads session via `supabase.auth.getUser()`.
- Admin marking: set `raw_app_meta_data.role = 'admin'` for the user; re-login to refresh JWT.

RLS policy patterns
- Owner access: `auth.uid() = user_id`.
- Admin override: `(auth.jwt()->'app_metadata'->>'role' = 'admin') OR (auth.jwt()->'user_metadata'->>'role' = 'admin')`.

Sensitive tables
- `sessions`, `lessons`, `admin_logs` — writes admin-only.
- `user_goals`, `goal_updates` — owner writes; admin can read all if needed.
- `profiles` — user own, admins read.

Data classification
- PII: profiles, weight_measurements, medical documents (when enabled). Protect via RLS; audit actions in `admin_logs`.
- Public: published courses/lessons metadata, thumbnails.

Privacy (GDPR/LGPD)
- Right to erasure: cascade deletes for user-owned data (FKs ON DELETE CASCADE where applicable).
- Data portability: export endpoints/functions for user data (TODO: add function for full export).
- Consent/audit: `admin_logs` stores admin actions.

