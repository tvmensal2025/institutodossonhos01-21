-- View de agregação diária de macros por refeição
-- Depende da tabela public.food_analysis (já existente)

create or replace view public.v_daily_macro_intake as
select
  fa.user_id,
  (fa.created_at at time zone 'utc')::date as day,
  fa.meal_type,
  coalesce((fa.nutrition_analysis->>'totalCalories')::numeric, 0) as kcal,
  coalesce((fa.nutrition_analysis->>'totalProtein')::numeric, 0)   as protein_g,
  coalesce((fa.nutrition_analysis->>'totalCarbs')::numeric, 0)     as carbs_g,
  coalesce((fa.nutrition_analysis->>'totalFat')::numeric, 0)       as fat_g,
  coalesce((fa.nutrition_analysis->>'totalFiber')::numeric, 0)     as fiber_g,
  coalesce((fa.nutrition_analysis->>'totalSodium')::numeric, 0)    as sodium_mg
from public.food_analysis fa;

comment on view public.v_daily_macro_intake is 'Agrega valores de macronutrientes por usuário, dia e refeição a partir de food_analysis';

-- Índices úteis para acelerar filtros por usuário e dia
create index if not exists idx_v_daily_macro_intake_user_day
  on public.food_analysis (user_id, (created_at at time zone 'utc'));


