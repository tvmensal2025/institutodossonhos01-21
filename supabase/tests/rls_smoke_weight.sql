-- RLS smoke tests for weight_measurements and user_physical_profiles
-- Usage (psql):
--   BEGIN;
--   SET LOCAL ROLE TO postgres; -- or a role with rights to set GUCs
--   SET LOCAL request.jwt.claims = '{"sub":"00000000-0000-0000-0000-000000000001","role":"authenticated"}';
--   \i supabase/tests/rls_smoke_weight.sql
--   ROLLBACK;

-- Ensure tables exist
SELECT to_regclass('public.weight_measurements') AS weight_tbl,
       to_regclass('public.user_physical_profiles') AS phys_tbl;

-- Prepare physical profile for current user
WITH uid AS (
  SELECT (current_setting('request.jwt.claims', true)::jsonb ->> 'sub')::uuid AS user_id
)
INSERT INTO public.user_physical_profiles (user_id, height_cm, gender)
SELECT user_id, 175, 'M' FROM uid
ON CONFLICT (user_id) DO NOTHING;

-- Try INSERT as normal user (should succeed for own user_id)
WITH uid AS (
  SELECT (current_setting('request.jwt.claims', true)::jsonb ->> 'sub')::uuid AS user_id
)
INSERT INTO public.weight_measurements (user_id, peso_kg, circunferencia_abdominal_cm, measurement_date)
SELECT user_id, 82.5, 95, CURRENT_DATE FROM uid
RETURNING id, user_id, imc, rce, classificacao_imc, risco_cardiometabolico;

-- Read back own records
WITH uid AS (
  SELECT (current_setting('request.jwt.claims', true)::jsonb ->> 'sub')::uuid AS user_id
)
SELECT id, peso_kg, measurement_date FROM public.weight_measurements
WHERE user_id IN (SELECT user_id FROM uid)
ORDER BY measurement_date DESC
LIMIT 3;

-- Admin context
-- Switch to an admin user id (replace with a real admin UUID if needed)
-- Example admin claims:
-- SET LOCAL request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000AA","role":"authenticated"}';
-- Ensure admin flag via user_roles (optional in non-prod):
-- INSERT INTO public.user_roles (user_id, role) VALUES ('00000000-0000-0000-0000-0000000000AA','admin') ON CONFLICT DO NOTHING;

-- As admin, read arbitrary user records (policy: Admins manage weight_measurements)
-- SELECT count(*) FROM public.weight_measurements; -- should be allowed for admin


