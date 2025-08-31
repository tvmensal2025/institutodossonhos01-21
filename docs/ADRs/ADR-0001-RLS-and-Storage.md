### ADR-0001 — RLS Model and Storage Buckets

Context
- We manage user-generated content (goals, sessions, lessons) and media (thumbnails, chat images).
- Need strong defaults for privacy and admin workflows.

Decision
- Use Supabase RLS with owner-based policies and explicit admin override via JWT `app_metadata.role = 'admin'`.
- Separate storage buckets by purpose: `avatars`, `community-uploads`, `chat-images`, `course-thumbnails`.
- Public read for media; writes restricted to authenticated or admins depending on bucket.

Consequences
- Requires setting admin flag in user metadata for moderators.
- Edge functions that send notifications may use SERVICE ROLE to resolve contacts safely.

Status: Accepted

