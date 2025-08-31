import { readFile } from 'node:fs/promises';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://hlrkoyywjpckdotimtik.supabase.co';
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_FUNCTION_JWT;
if (!SERVICE_ROLE) {
  console.error('Erro: defina SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

if (process.argv.length < 3) {
  console.error('Uso: node scripts/import-nutrition-direct.mjs <arquivo.csv> [delimitador]');
  process.exit(1);
}

const filePath = process.argv[2];
const delimiter = process.argv[3] || ',';
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

function normalize(text = '') {
  const lowered = String(text).toLowerCase();
  const noAccents = lowered.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return noAccents.replace(/[^a-z0-9 ]/g, ' ').trim().replace(/\s+/g, ' ');
}

function toNumber(v) {
  if (v == null) return null;
  const s = String(v).trim();
  if (!s) return null;
  const n = Number(s.replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

function detectStateFromName(name = '') {
  const n = name.toLowerCase();
  if (n.includes('grelh')) return 'grelhado';
  if (n.includes('frit')) return 'frito';
  if (n.includes('cozid')) return 'cozido';
  if (n.includes('assad')) return 'assado';
  if (n.includes('cru')) return 'cru';
  if (n.includes('molho') || n.includes('suco') || n.includes('caldo')) return 'pronto';
  return 'raw';
}

(async () => {
  const text = await readFile(filePath, 'utf8');
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter(Boolean);
  if (lines.length < 2) {
    console.error('CSV vazio.');
    process.exit(2);
  }
  const header = lines[0].split(delimiter).map(h => h.trim());
  const rows = lines.slice(1).map(line => {
    const cols = line.split(delimiter).map(c => c.trim());
    const obj = {};
    header.forEach((h, i) => (obj[h] = cols[i] ?? ''));
    return obj;
  });

  let foods = 0, aliases = 0, yields = 0, errors = 0;

  for (const r of rows) {
    try {
      const canonical_name = r.name?.trim();
      if (!canonical_name) continue;
      const canonical_name_normalized = normalize(canonical_name);
      const state = (r.yield_to_state?.trim()) || detectStateFromName(canonical_name);
      const payload = {
        canonical_name,
        canonical_name_normalized,
        locale: 'pt-BR',
        state,
        kcal: toNumber(r.kcal) ?? 0,
        protein_g: toNumber(r.protein_g) ?? 0,
        fat_g: toNumber(r.fat_g) ?? 0,
        carbs_g: toNumber(r.carbs_g) ?? 0,
        fiber_g: toNumber(r.fiber_g) ?? 0,
        sodium_mg: toNumber(r.sodium_mg) ?? 0,
        density_g_ml: toNumber(r.density_g_ml),
        edible_portion_factor: toNumber(r.epf),
        source: 'CSV Import',
        source_ref: 'nutrition-sample',
        is_recipe: false,
      };

      const { data: up, error: upErr } = await supabase
        .from('nutrition_foods')
        .upsert([payload], { onConflict: 'canonical_name_normalized,locale,state' })
        .select()
        .limit(1);
      if (upErr) throw upErr;
      const food = up?.[0];
      if (!food) continue;
      foods += 1;

      if (r.aliases) {
        const list = String(r.aliases).split('|').map(a => a.trim()).filter(Boolean);
        if (list.length) {
          const rows = list.map(a => ({ alias_normalized: normalize(a), food_id: food.id }));
          const { error } = await supabase.from('nutrition_aliases').upsert(rows, { onConflict: 'alias_normalized' });
          if (error) throw error;
          aliases += rows.length;
        }
      }

      const fromState = r.yield_from_state?.trim();
      const toState = r.yield_to_state?.trim();
      const factor = toNumber(r.yield_factor);
      if (fromState && toState && factor && factor > 0) {
        const { error } = await supabase
          .from('nutrition_yields')
          .upsert([{ food_id: food.id, from_state: fromState, to_state: toState, factor }], { onConflict: 'food_id,from_state,to_state' });
        if (error) throw error;
        yields += 1;
      }
    } catch (e) {
      errors += 1;
      console.warn('Erro linha:', r?.name, e?.message || e);
    }
  }

  console.log(JSON.stringify({ success: true, stats: { foods, aliases, yields, errors } }, null, 2));
})();








