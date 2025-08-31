import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with, Authorization, X-Client-Info, Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

type CsvRow = {
  name: string;
  categoria?: string;
  subcategoria?: string;
  carbs_g?: string; // numbers as string
  protein_g?: string;
  fat_g?: string;
  fiber_g?: string;
  sodium_mg?: string;
  kcal?: string;
  aliases?: string; // pipe-separated
  density_g_ml?: string;
  epf?: string;
  yield_from_state?: string;
  yield_to_state?: string;
  yield_factor?: string;
};

function normalize(text: string): string {
  if (!text) return '';
  const lowered = text.toLowerCase();
  // Remove combining marks explicitly (stable in Deno/V8)
  const withoutAccents = lowered.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const cleaned = withoutAccents.replace(/[^a-z0-9 ]/g, ' ').trim().replace(/\s+/g, ' ');
  return cleaned;
}

function toNumber(value?: string): number | null {
  if (value == null) return null;
  const v = String(value).trim();
  if (v === '' || v === ',') return null;
  const num = Number(v.replace(',', '.'));
  return Number.isFinite(num) ? num : null;
}

function detectStateFromName(name: string): string {
  const n = (name || '').toLowerCase();
  if (n.includes('grelh')) return 'grelhado';
  if (n.includes('frit')) return 'frito';
  if (n.includes('cozid')) return 'cozido';
  if (n.includes('assad')) return 'assado';
  if (n.includes('cru')) return 'cru';
  if (n.includes('suco') || n.includes('molho') || n.includes('caldo')) return 'pronto';
  return 'raw';
}

function parseCsv(text: string, delimiter = ','): { header: string[]; rows: CsvRow[] } {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter(l => l.trim() !== '');
  if (lines.length < 2) throw new Error('CSV vazio ou sem dados');
  const header = lines[0].split(delimiter).map(h => h.trim());
  const rows: CsvRow[] = lines.slice(1).map((line) => {
    const cols = line.split(delimiter).map(c => c.trim());
    const obj: any = {};
    header.forEach((h, idx) => obj[h] = cols[idx] ?? '');
    return obj as CsvRow;
  });
  return { header, rows };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let body: any = {};
    try { body = await req.json(); } catch { body = {}; }
    const { csvText, delimiter, dryRun, offset, limit, batchSize } = body;
    if (!csvText) throw new Error('csvText é obrigatório');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    // Preferir o token enviado no Authorization header (Bearer ...). Fallback para env var.
    const authHeader = req.headers.get('authorization') || '';
    const bearer = authHeader.startsWith('Bearer ')
      ? authHeader.substring('Bearer '.length).trim()
      : undefined;
    const serviceKey = bearer || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SERVICE_ROLE_KEY');
    if (!serviceKey) {
      return new Response(JSON.stringify({ success: false, error: 'Missing service key' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const supabase = createClient(supabaseUrl, serviceKey);

    const { header, rows } = parseCsv(csvText, delimiter || ',');

    if (dryRun) {
      return new Response(JSON.stringify({
        success: true,
        mode: 'dry-run',
        header,
        rows_preview: rows.slice(0, 3),
        total_rows: rows.length,
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    let insertedFoods = 0;
    let upsertedAliases = 0;
    let upsertedYields = 0;
    const errors: Array<{row:number; step:string; message:string}> = [];

    const start = Math.max(0, Number.isFinite(+offset) ? Number(offset) : 0);
    const size = Math.max(1, Number.isFinite(+limit) ? Number(limit) : (Number.isFinite(+batchSize) ? Number(batchSize) : 200));
    const end = Math.min(rows.length, start + size);
    const slice = rows.slice(start, end);
    const t0 = Date.now();

    for (let i = 0; i < slice.length; i++) {
      const row = slice[i];
      const name = (row.name || '').trim();
      if (!name) continue;
      const canonical_name = name;
      const canonical_name_normalized = normalize(canonical_name);
      const state = (row.yield_to_state?.trim() ? row.yield_to_state.trim() : detectStateFromName(name));
      const locale = 'pt-BR';

      const payload: any = {
        canonical_name,
        canonical_name_normalized,
        locale,
        state,
        kcal: toNumber(row.kcal) ?? 0,
        protein_g: toNumber(row.protein_g) ?? 0,
        fat_g: toNumber(row.fat_g) ?? 0,
        carbs_g: toNumber(row.carbs_g) ?? 0,
        fiber_g: toNumber(row.fiber_g) ?? 0,
        sodium_mg: toNumber(row.sodium_mg) ?? 0,
        density_g_ml: toNumber(row.density_g_ml) ?? null,
        edible_portion_factor: toNumber(row.epf) ?? null,
        source: 'CSV Import',
        source_ref: 'nutrition-sample',
        is_recipe: false,
      };

      // Upsert food
      const { data: foodRows, error: foodErr } = await supabase
        .from('nutrition_foods')
        .upsert([payload], { onConflict: 'canonical_name_normalized,locale,state' })
        .select()
        .limit(1);
      if (foodErr) {
        errors.push({ row: start + i, step: 'upsert_food', message: foodErr.message || String(foodErr) });
        continue;
      }
      const food = foodRows?.[0];
      if (!food) continue;
      insertedFoods += 1;

      // Aliases
      if (row.aliases) {
        const aliases = row.aliases.split('|').map(a => a.trim()).filter(Boolean);
        if (aliases.length > 0) {
          const aliasRows = aliases.map(alias => ({
            alias_normalized: normalize(alias),
            food_id: food.id,
          }));
          const { error: aliasErr } = await supabase
            .from('nutrition_aliases')
            .upsert(aliasRows, { onConflict: 'alias_normalized' });
          if (aliasErr) {
            errors.push({ row: start + i, step: 'upsert_aliases', message: aliasErr.message || String(aliasErr) });
          } else {
            upsertedAliases += aliasRows.length;
          }
        }
      }

      // Yield
      const fromState = (row.yield_from_state || '').trim();
      const toState = (row.yield_to_state || '').trim();
      const factor = toNumber(row.yield_factor);
      if (fromState && toState && factor && Number(factor) > 0) {
        const { error: yErr } = await supabase
          .from('nutrition_yields')
          .upsert([{
            food_id: food.id,
            from_state: fromState,
            to_state: toState,
            factor: factor,
          }], { onConflict: 'food_id,from_state,to_state' });
        if (yErr) {
          errors.push({ row: start + i, step: 'upsert_yield', message: yErr.message || String(yErr) });
        } else {
          upsertedYields += 1;
        }
      }
    }

    return new Response(JSON.stringify({
      success: true,
      stats: { foods: insertedFoods, aliases: upsertedAliases, yields: upsertedYields },
      window: { offset: start, processed: slice.length, nextOffset: end < rows.length ? end : null, total_rows: rows.length, took_ms: Date.now()-t0 },
      errors,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Erro import-nutrition-csv:', error);
    return new Response(JSON.stringify({ success: false, error: String(error?.message || error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with, Authorization, X-Client-Info, Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

type Row = Record<string, string>;

function normalize(text: string): string {
  return (text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseCSV(text: string, delimiter = ','): Row[] {
  // Minimal CSV parser with quotes support
  const rows: Row[] = [];
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter(l => l.length > 0);
  if (lines.length === 0) return rows;

  // Detect delimiter if not provided
  if (!delimiter) {
    const first = lines[0];
    delimiter = first.includes(';') && !first.includes(',') ? ';' : ',';
  }

  function splitLine(line: string): string[] {
    const out: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; }
        else inQuotes = !inQuotes;
      } else if (c === delimiter && !inQuotes) {
        out.push(cur);
        cur = '';
      } else {
        cur += c;
      }
    }
    out.push(cur);
    return out.map(s => s.trim());
  }

  const headers = splitLine(lines[0]).map(h => normalize(h));
  for (let i = 1; i < lines.length; i++) {
    const cols = splitLine(lines[i]);
    const row: Row = {};
    headers.forEach((h, idx) => row[h] = cols[idx] ?? '');
    rows.push(row);
  }
  return rows;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { csvText, csvUrl, delimiter, defaults } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Load CSV text
    let text: string = csvText;
    if (!text && csvUrl) {
      const res = await fetch(csvUrl);
      if (!res.ok) throw new Error(`Falha ao baixar CSV: ${res.status}`);
      text = await res.text();
    }
    if (!text) throw new Error('csvText ou csvUrl é obrigatório');

    const rows = parseCSV(text, delimiter || ',');
    if (rows.length === 0) return new Response(JSON.stringify({ success: false, error: 'CSV vazio' }), { headers: corsHeaders, status: 400 });

    // Check required schema on DB
    let schemaOk = true;
    try {
      await supabase.from('valores_nutricionais_completos').select('kcal, carboidratos, proteina, gorduras, fibra, sodio_mg').limit(1);
    } catch (_) {
      schemaOk = false;
    }
    if (!schemaOk) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Estrutura nutricional incompleta. Aplique a migração idempotente no SQL Editor.',
        migration: 'supabase/migrations/20250808120000_nutrition_deterministic_patch.sql'
      }), { headers: corsHeaders, status: 400 });
    }

    const results: any[] = [];
    const errors: any[] = [];
    const stats = { upsertedFoods: 0, insertedValues: 0, insertedAliases: 0, insertedDensities: 0, insertedEPF: 0, insertedYields: 0 };

    for (const r of rows) {
      try {
        const name = r['name'] || r['nome'] || r['canonical_name'] || r['nome_canonico'] || '';
        const alias = r['alias'] || r['aliases'] || '';
        const categoria = r['categoria'] || defaults?.categoria || 'desconhecida';
        const subcategoria = r['subcategoria'] || defaults?.subcategoria || 'desconhecida';
        const state = r['state'] || r['estado'] || '';

        if (!name) throw new Error('Linha sem nome');

        // Upsert alimento
        let alimentoId: number | null = null;
        {
          // try find existing by nome ILIKE
          const { data: found } = await supabase
            .from('alimentos_completos')
            .select('id')
            .ilike('nome', name)
            .maybeSingle();

          if (found?.id) alimentoId = found.id;
          else {
            const { data: ins, error: insErr } = await supabase
              .from('alimentos_completos')
              .insert({ nome: name, categoria, subcategoria })
              .select('id')
              .single();
            if (insErr) throw insErr;
            alimentoId = ins!.id;
            stats.upsertedFoods++;
          }
        }

        // Valores por 100g
        const carbs = Number(r['carbs_g'] || r['carboidratos'] || r['carb'] || 0);
        const prot = Number(r['protein_g'] || r['proteina'] || r['protein'] || 0);
        const fat = Number(r['fat_g'] || r['gorduras'] || r['fat'] || 0);
        const fiber = Number(r['fiber_g'] || r['fibra'] || 0);
        const sodium = Number(r['sodium_mg'] || r['sodio_mg'] || 0);
        let kcal = Number(r['kcal'] || r['calorias'] || 0);
        if (!kcal && (carbs || prot || fat)) {
          kcal = Math.round(4 * carbs + 4 * prot + 9 * fat);
        }

        if (carbs || prot || fat || fiber || sodium || kcal) {
          // upsert by alimento_id (if exists, update)
          const { data: existsVal } = await supabase
            .from('valores_nutricionais_completos')
            .select('alimento_id')
            .eq('alimento_id', alimentoId)
            .maybeSingle();
          if (existsVal) {
            const { error: updErr } = await supabase
              .from('valores_nutricionais_completos')
              .update({ carboidratos: carbs, proteina: prot, gorduras: fat, fibra: fiber, sodio_mg: sodium, kcal })
              .eq('alimento_id', alimentoId);
            if (updErr) throw updErr;
          } else {
            const { error: insValErr } = await supabase
              .from('valores_nutricionais_completos')
              .insert({ alimento_id: alimentoId, carboidratos: carbs, proteina: prot, gorduras: fat, fibra: fiber, sodio_mg: sodium, kcal });
            if (insValErr) throw insValErr;
          }
          stats.insertedValues++;
        }

        // Aliases
        if (alias) {
          const aliasParts = alias.split('|').map(a => normalize(a)).filter(Boolean);
          for (const a of aliasParts) {
            // insert ignore duplicates
            const { error: aliasErr } = await supabase
              .from('alimentos_alias')
              .insert({ alimento_id: alimentoId!, alias_norm: a });
            if (aliasErr && !`${aliasErr.message}`.includes('duplicate key')) throw aliasErr;
            else stats.insertedAliases++;
          }
        }

        // Densidade g/ml
        if (r['density_g_ml']) {
          const density = Number(r['density_g_ml']);
          if (!Number.isNaN(density) && density > 0) {
            const { data: dExists } = await supabase.from('alimentos_densidades').select('alimento_id').eq('alimento_id', alimentoId).maybeSingle();
            if (dExists) {
              await supabase.from('alimentos_densidades').update({ densidade_g_ml: density }).eq('alimento_id', alimentoId);
            } else {
              await supabase.from('alimentos_densidades').insert({ alimento_id: alimentoId, densidade_g_ml: density });
            }
            stats.insertedDensities++;
          }
        }

        // EPF
        if (r['epf']) {
          const epf = Number(r['epf']);
          if (!Number.isNaN(epf) && epf > 0) {
            const { data: eExists } = await supabase.from('alimentos_epf').select('alimento_id').eq('alimento_id', alimentoId).maybeSingle();
            if (eExists) {
              await supabase.from('alimentos_epf').update({ epf }).eq('alimento_id', alimentoId);
            } else {
              await supabase.from('alimentos_epf').insert({ alimento_id: alimentoId, epf });
            }
            stats.insertedEPF++;
          }
        }

        // Yield
        if (r['yield_from_state'] && r['yield_to_state'] && r['yield_factor']) {
          const fromState = normalize(r['yield_from_state']);
          const toState = normalize(r['yield_to_state']);
          const factor = Number(r['yield_factor']);
          if (!Number.isNaN(factor) && factor > 0) {
            // upsert via delete/insert unique
            await supabase
              .from('alimentos_yield')
              .upsert({ alimento_id: alimentoId, from_state: fromState, to_state: toState, factor }, { onConflict: 'alimento_id,from_state,to_state' } as any);
            stats.insertedYields++;
          }
        }

        results.push({ name, alimento_id: alimentoId });
      } catch (err) {
        errors.push({ row: r, error: (err as Error).message });
      }
    }

    return new Response(JSON.stringify({ success: errors.length === 0, stats, imported: results.length, errors }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: (error as Error).message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});


