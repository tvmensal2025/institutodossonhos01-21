-- Improve search by name/email on profiles
create index if not exists profiles_full_name_trgm on public.profiles using gin (full_name gin_trgm_ops);
create index if not exists profiles_email_trgm on public.profiles using gin (email gin_trgm_ops);
create index if not exists profiles_user_id_not_null on public.profiles (user_id) where user_id is not null;

