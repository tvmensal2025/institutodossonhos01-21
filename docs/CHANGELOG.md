### Changelog

All notable changes documented here (SemVer style).

## 1.2.0 - 2025-08-11
- Added documentation suite under `/docs/*`.
- Group Goals: created `user_goal_invitations` and `user_goal_participants` with RLS; frontend now invokes `goal-notifications` with `recipientUserId`.
- Storage: standardized `course-thumbnails` usage for course/module thumbnails.
- Security: hardened RLS for `sessions` and `lessons` (admin-only writes).
- Daily responses: allowed `saboteurs` sections in CHECK constraint.

## 1.1.0 - 2025-08-10
- Weight measurement schema unified.

## 1.0.0 - 2025-08-01
- Initial release.

