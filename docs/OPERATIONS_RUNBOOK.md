### Operations Runbook

Health checks
- Frontend: `/health` route (add if missing) or app load smoke test.
- Edge Functions: use Studio → Functions → Invoke test; check logs.
- DB: simple `select now()`; storage: upload small file to `chat-images`.

Logs & metrics
- Edge Functions logs in Studio.
- Structured logs: include `requestId`, `userId`, `feature` fields when logging (convention).

Common incidents
- 403 on admin screens: user JWT lacks `app_metadata.role=admin`. Fix in Auth → Users or via SQL update and re-login.
- Upload fails: bucket missing/policy; reapply migrations `20250730090000_configure_course_thumbnails_and_admin_logs.sql`.
- 404 on table: migration not applied; run pending migrations.
- Email not sent on invites: set `RESEND_API_KEY` and redeploy `goal-notifications`.

SLOs
- Availability: 99.5% monthly.
- P50 page load < 2.5s; P95 < 5s.
- Error rate < 1% of requests.

Rollbacks
- DB: restore latest backup; re-run idempotent migrations.
- Functions: deploy previous version from history (keep tags).
- Frontend: rollback to previous build on CDN/hosting.

