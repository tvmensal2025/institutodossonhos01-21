import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://hlrkoyywjpckdotimtik.supabase.co';
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SERVICE_ROLE_KEY;

if (!SERVICE_ROLE) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const TEST_SETS = [
  {
    name: 'PF_carne_arroz_feijao_salada',
    items: [
      { name: 'carne bovina cozida', grams: 150 },
      { name: 'arroz, branco, cozido', grams: 120 },
      { name: 'feijao carioca cozido', grams: 80 },
      { name: 'salada verde', grams: 50 },
    ],
  },
  {
    name: 'prato_lasanha_arroz_legumes',
    items: [
      { name: 'lasanha', grams: 150 },
      { name: 'arroz, branco, cozido', grams: 100 },
      { name: 'brócolis cozido', grams: 80 },
      { name: 'couve-flor cozida', grams: 80 },
      { name: 'cenoura crua', grams: 50 },
      { name: 'tomate cru', grams: 60 },
    ],
  },
  {
    name: 'frango_arroz_integral_legumes',
    items: [
      { name: 'frango, peito, grelhado', grams: 150 },
      { name: 'arroz integral cozido', grams: 100 },
      { name: 'abóbora cozida', grams: 80 },
      { name: 'salada verde', grams: 50 },
    ],
  },
  {
    name: 'sinonimos_basicos_arroz_frango_batata',
    items: [
      // Deve mapear para versões preparadas via SYNONYMS
      { name: 'arroz', grams: 120 },
      { name: 'frango', grams: 150 },
      { name: 'batata', grams: 150 },
    ],
  },
  {
    name: 'frito_batata_e_azeite',
    items: [
      { name: 'batata frita', grams: 100 },
      { name: 'azeite de oliva', grams: 5 },
    ],
  },
  {
    name: 'liquido_densidade_azeite_10ml',
    items: [
      // Testa conversão ml->g via density_g_ml
      { name: 'azeite de oliva', ml: 10 },
    ],
  },
  {
    name: 'sanduiche_pao_queijo',
    items: [
      { name: 'pão francês', grams: 50 },
      { name: 'queijo minas', grams: 30 },
    ],
  },
];

(async () => {
  const sb = createClient(SUPABASE_URL, SERVICE_ROLE);
  let failures = 0;
  for (const set of TEST_SETS) {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/nutrition-calc`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${SERVICE_ROLE}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: set.items, locale: 'pt-BR' }),
    });
    const json = await res.json();
    const resolved = Array.isArray(json?.resolved) ? json.resolved : [];
    const unmatched = resolved.filter(r => !r.matched_food_id).map(r => r?.input?.name || '');
    const totals = json?.totals || null;
    console.log(`SET ${set.name}: status=${res.status}, matched=${resolved.length - unmatched.length}/${set.items.length}, kcal=${Math.round(totals?.kcal || 0)}; unmatched=${unmatched.join('|')}`);
    if (!totals || unmatched.length > 0) failures++;
  }
  if (failures > 0) {
    console.error(`FAILURES: ${failures}`);
    process.exit(2);
  }
  console.log('All selftests passed.');
})();


