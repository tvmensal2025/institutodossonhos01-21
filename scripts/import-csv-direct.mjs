import { readFile } from 'node:fs/promises';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://hlrkoyywjpckdotimtik.supabase.co';
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SERVICE_ROLE_KEY;

if (!SERVICE_ROLE) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

if (process.argv.length < 3) {
  console.error('Uso: node scripts/import-csv-direct.mjs <arquivo.csv> [delimitador] [lote=500]');
  process.exit(1);
}

const filePath = process.argv[2];
const delimiter = process.argv[3] || ',';
const batch = Number(process.argv[4] || 500);

function normalize(text = '') {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function detectStateFromName(name) {
  const n = (name || '').toLowerCase();
  if (n.includes('grelh')) return 'grelhado';
  if (n.includes('frit')) return 'frito';
  if (n.includes('cozid')) return 'cozido';
  if (n.includes('assad')) return 'assado';
  if (n.includes('cru')) return 'cru';
  if (n.includes('suco') || n.includes('molho') || n.includes('caldo')) return 'pronto';
  return 'raw';
}

function toNumber(v) {
  if (v == null) return null;
  const s = String(v).trim();
  if (!s || s === ',') return null;
  const num = Number(s.replace(',', '.'));
  return Number.isFinite(num) ? num : null;
}

function parseCsv(text, delim = ',') {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter(l => l.trim() !== '');
  if (lines.length < 2) return { header: [], rows: [] };
  const header = lines[0].split(delim).map(h => h.trim());
  const rows = lines.slice(1).map(line => {
    const cols = line.split(delim).map(c => c.trim());
    const obj = {};
    header.forEach((h, i) => { obj[h] = cols[i] ?? ''; });
    return obj;
  });
  return { header, rows };
}

function chunkArray(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

(async () => {
  const sb = createClient(SUPABASE_URL, SERVICE_ROLE);
  const text = await readFile(filePath, 'utf8');
  const { header, rows } = parseCsv(text, delimiter);
  if (rows.length === 0) {
    console.error('CSV vazio.');
    process.exit(2);
  }

  const chunks = chunkArray(rows, batch);
  let stats = { foods: 0, aliases: 0, yields: 0 };
  const errors = [];

  for (let ci = 0; ci < chunks.length; ci++) {
    const c = chunks[ci];
    console.log(`Processando lote ${ci + 1}/${chunks.length} (${c.length} linhas)...`);
    for (let i = 0; i < c.length; i++) {
      const r = c[i];
      try {
        const name = r['name'] || r['nome'] || r['canonical_name'] || r['nome_canonico'] || '';
        if (!name) continue;
        const state = r['state'] || r['estado'] || detectStateFromName(name);
        const locale = 'pt-BR';

        const payload = {
          canonical_name: name,
          canonical_name_normalized: normalize(name),
          locale,
          state,
          kcal: toNumber(r['kcal']) ?? 0,
          protein_g: toNumber(r['protein_g']) ?? 0,
          fat_g: toNumber(r['fat_g']) ?? 0,
          carbs_g: toNumber(r['carbs_g']) ?? 0,
          fiber_g: toNumber(r['fiber_g']) ?? 0,
          sodium_mg: toNumber(r['sodium_mg']) ?? 0,
          density_g_ml: toNumber(r['density_g_ml']) ?? null,
          edible_portion_factor: toNumber(r['epf']) ?? null,
          source: 'CSV Import',
          source_ref: filePath.split('/').pop(),
          is_recipe: false,
        };

        const { data: foodRows, error: foodErr } = await sb
          .from('nutrition_foods')
          .upsert([payload], { onConflict: 'canonical_name_normalized,locale,state' })
          .select()
          .limit(1);
        if (foodErr) throw new Error(foodErr.message);
        const food = foodRows?.[0];
        if (!food) continue;
        stats.foods++;

        const aliases = (r['aliases'] || r['alias'] || '').split('|').map(a => a.trim()).filter(Boolean);
        if (aliases.length > 0) {
          const unique = new Map();
          for (const a of aliases) {
            const n = normalize(a);
            if (!unique.has(n)) unique.set(n, { alias_normalized: n, food_id: food.id });
          }
          const aliasRows = Array.from(unique.values());
          const { error: aliasErr } = await sb.from('nutrition_aliases').upsert(aliasRows, { onConflict: 'alias_normalized' });
          if (aliasErr) throw new Error(aliasErr.message);
          stats.aliases += aliasRows.length;
        }

        const fromState = (r['yield_from_state'] || '').trim();
        const toState = (r['yield_to_state'] || '').trim();
        const factor = toNumber(r['yield_factor']);
        if (fromState && toState && factor && factor > 0) {
          const { error: yErr } = await sb
            .from('nutrition_yields')
            .upsert([{ food_id: food.id, from_state: normalize(fromState), to_state: normalize(toState), factor }], { onConflict: 'food_id,from_state,to_state' });
          if (yErr) throw new Error(yErr.message);
          stats.yields++;
        }
      } catch (e) {
        errors.push({ row: r, error: String(e?.message || e) });
      }
    }
  }

  console.log('Concluído:', stats);
  if (errors.length > 0) {
    console.log('Erros (primeiros 5):', errors.slice(0, 5));
  }
})();


