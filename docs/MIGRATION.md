### Migration Playbook (Production)

Checklists

Pre-flight
- [ ] Repo clean, CI green
- [ ] Confirm DB migrations list and order
- [ ] Confirm RLS policies and buckets exist in target
- [ ] Approve maintenance window & comms

Database backup
```bash
pg_dump --no-owner --no-privileges --format=custom \
  --host=<SOURCE_HOST> --username=<PGUSER> --dbname=<DBNAME> \
  --file=backup_$(date +%Y%m%d_%H%M).dump
```

Restore to new server
```bash
pg_restore --no-owner --no-privileges \
  --host=<TARGET_HOST> --username=<PGUSER> --dbname=<DBNAME> \
  backup_YYYYMMDD_HHMM.dump
```

Extensions
- Ensure `pgcrypto`, `uuid-ossp` as required by migrations.

Apply migrations
- Run pending SQL files in `supabase/migrations/*` in chronological order.

Storage sync
```bash
# Example using supabase CLI object API or provider CLI
rsync -av --progress <OLD_STORAGE>/course-thumbnails <NEW_STORAGE>/
rsync -av --progress <OLD_STORAGE>/chat-images <NEW_STORAGE>/
```
Reapply policies: run `20250730090000_configure_course_thumbnails_and_admin_logs.sql` if needed.

Edge Functions
- Build and deploy each function from `supabase/functions/*`.
- Set secrets: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY, SITE_URL, GOOGLE_FIT_* etc.
- Smoke test: invoke `goal-notifications` with a dummy body.

App deploy
```bash
node -v # ensure version from package.json engines if defined
npm ci
npm run build:prod
# Deploy to hosting provider
```

DNS/SSL cutover
- Set low TTL 24h before.
- Switch to new origin; verify health.

Post-migration validation
- [ ] Login works
- [ ] Upload avatar/thumbnail works (public URL loads)
- [ ] Create course, module, lesson (admin)
- [ ] Create goal with invite; invitee receives email/WhatsApp and sees in-app card
- [ ] Play hero video and load playlist
- [ ] Daily mission answers save
- [ ] Weight measurement insert & report function

Rollback
- Repoint DNS back to old origin
- Restore DB from last dump
- Restore storage from previous snapshot
- Announce incident and ETA

