-- Campos de progresso para relatórios médicos
alter table public.medical_documents
  add column if not exists processing_started_at timestamptz,
  add column if not exists processing_stage text,
  add column if not exists progress_pct numeric,
  add column if not exists images_total int,
  add column if not exists images_processed int,
  add column if not exists estimated_minutes int;


