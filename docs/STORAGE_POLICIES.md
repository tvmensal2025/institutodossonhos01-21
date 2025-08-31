### Storage Buckets & Upload Flows

Buckets
- `avatars` — profile pictures. Public GET; INSERT/UPDATE by owner/admin.
- `community-uploads` — social feed media. Public GET; INSERT by authenticated users.
- `chat-images` — chat images for Sofia assistant. Public GET; INSERT by authenticated; 5MB; `image/jpeg|png|gif|webp`.
- `course-thumbnails` — thumbnails/covers for courses/modules. Public GET; INSERT by authenticated; UPDATE/DELETE by admin only.

Upload flows
- Course/Module thumbnails: `src/components/admin/{CourseModal,ModuleModal}.tsx` upload to `course-thumbnails`, then persist public URL in `courses.thumbnail_url`/`lessons.thumbnail_url`.
- Chat images: `src/components/sofia/SofiaChat.tsx` uploads to `chat-images`.
- Medical documents (planned): `src/components/dashboard/MedicalDocumentsSection.tsx` targets `medical-documents` bucket (ensure bucket and policies before enabling).

Conventions
- Path format: `<user_id>/<timestamp>_<filename>` or `course-thumbnails/<timestamp>_<name>`.
- Cache: UI sets `cacheControl: '3600'` where relevant.
- CDN: use Supabase public URLs; consider proxying via CDN if required.

Lifecycle & cleanup
- Large or outdated files should be pruned by scheduled tasks (TODO: add edge function + cron).

