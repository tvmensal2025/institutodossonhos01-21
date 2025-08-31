-- Create private storage bucket for medical reports
insert into storage.buckets (id, name, public)
values ('medical-reports', 'medical-reports', false)
on conflict (id) do nothing;

-- Main reports table
create table public.premium_medical_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text,
  status text not null default 'pending',
  report_date date default current_date,
  patient_name text,
  patient_dob date,
  sex text,
  lab_name text,
  exam_types text[],
  source_files jsonb not null default '[]'::jsonb, -- [{bucket, path, size, type}]
  extracted_json_path text,
  derived_json_path text,
  html_path text,
  pdf_path text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.premium_medical_reports enable row level security;

-- Policies for premium_medical_reports
create policy "Users select own premium reports"
  on public.premium_medical_reports for select
  using (auth.uid() = user_id OR public.is_admin_user(auth.uid()));

create policy "Users insert own premium reports"
  on public.premium_medical_reports for insert
  with check (auth.uid() = user_id);

create policy "Users update own premium reports"
  on public.premium_medical_reports for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Admins can manage premium reports"
  on public.premium_medical_reports for all
  using (public.is_admin_user(auth.uid()))
  with check (public.is_admin_user(auth.uid()));

-- Updated_at trigger
create trigger trg_premium_reports_updated_at
  before update on public.premium_medical_reports
  for each row execute function public.update_updated_at();

-- Events/logs table for pipeline steps
create table public.premium_report_events (
  id bigserial primary key,
  report_id uuid not null references public.premium_medical_reports(id) on delete cascade,
  user_id uuid not null,
  stage text not null,    -- upload | extraction | validation | interpretation | render | share
  status text not null,   -- pending | running | success | error
  message text,
  meta jsonb,
  created_at timestamptz not null default now()
);

alter table public.premium_report_events enable row level security;

create policy "Users select own premium report events"
  on public.premium_report_events for select
  using (auth.uid() = user_id OR public.is_admin_user(auth.uid()));

create policy "Users insert own premium report events"
  on public.premium_report_events for insert
  with check (auth.uid() = user_id);

create policy "Admins manage premium report events"
  on public.premium_report_events for all
  using (public.is_admin_user(auth.uid()))
  with check (public.is_admin_user(auth.uid()));

-- Storage policies for bucket medical-reports
-- Users may only access paths prefixed by their user_id, e.g., {uid}/file.pdf
create policy "Users can upload medical reports to their folder"
  on storage.objects for insert
  with check (
    bucket_id = 'medical-reports' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can read their medical reports"
  on storage.objects for select
  using (
    bucket_id = 'medical-reports' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can update their medical reports"
  on storage.objects for update
  using (
    bucket_id = 'medical-reports' and
    auth.uid()::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'medical-reports' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete their medical reports"
  on storage.objects for delete
  using (
    bucket_id = 'medical-reports' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Admins can read all medical reports files"
  on storage.objects for select
  using (bucket_id = 'medical-reports' and public.is_admin_user(auth.uid()));