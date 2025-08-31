import { readFile } from 'node:fs/promises';
import { createClient } from '@supabase/supabase-js';

function splitCsvLine(line) {
  const out = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (ch === ',' && !inQuotes) {
      out.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out.map(s => s.trim());
}

function toNumber(val) {
  if (val == null) return 0;
  const s = String(val).trim();
  if (!s || s === ',') return 0;
  const n = Number(s.replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}

function toInt(val) {
  const n = toNumber(val);
  return Math.round(n);
}

async function main() {
  try {
    const supabaseUrl = process.env.SUPABASE_URL || 'https://hlrkoyywjpckdotimtik.supabase.co';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      || process.env.SUPABASE_ANON_KEY
      || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI';
    const supabase = createClient(supabaseUrl, supabaseKey);

    const csvPath = process.argv[2] || 'data/taco-normalized.csv';
    const text = await readFile(csvPath, 'utf8');
    const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter(l => l.length > 0);
    if (lines.length < 2) {
      console.error('CSV vazio.');
      process.exit(2);
    }
    const header = splitCsvLine(lines[0]);
    const idx = Object.fromEntries(header.map((h, i) => [h.toLowerCase(), i]));
    const reqCols = ['name','carbs_g','protein_g','fat_g','fiber_g','sodium_mg','kcal'];
    for (const c of reqCols) {
      if (!(c in idx)) {
        console.error('Coluna ausente no CSV:', c);
        process.exit(3);
      }
    }

    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = splitCsvLine(lines[i]);
      const name = (cols[idx['name']] || '').replace(/"/g, '').trim();
      if (!name) continue;
      // Ignorar possíveis linhas seções, mas taco-normalized já deve estar limpo
      const carbs = toInt(cols[idx['carbs_g']]);
      const prot = toInt(cols[idx['protein_g']]);
      const fat = toInt(cols[idx['fat_g']]);
      const fiber = toInt(cols[idx['fiber_g']]);
      const sodium = toInt(cols[idx['sodium_mg']]);
      let kcal = toInt(cols[idx['kcal']]);
      if (!kcal && (carbs || prot || fat)) {
        kcal = Math.round(4 * carbs + 4 * prot + 9 * fat);
      }
      rows.push({
        alimento_nome: name,
        carboidratos: carbs,
        proteina: prot,
        gorduras: fat,
        fibras: fiber,
        sodio: sodium,
        kcal
      });
    }

    // Deduplicar por alimento_nome para evitar erro "ON CONFLICT DO UPDATE command cannot affect row a second time"
    const bestByName = new Map();
    function score(row) {
      return (row.kcal > 0) + (row.proteina > 0) + (row.gorduras > 0) + (row.carboidratos > 0) + (row.fibras > 0) + (row.sodio > 0);
    }
    for (const r of rows) {
      const key = r.alimento_nome.replace(/\s+/g, ' ').trim();
      const prev = bestByName.get(key);
      if (!prev) {
        bestByName.set(key, r);
      } else {
        const sPrev = score(prev);
        const sNew = score(r);
        if (sNew > sPrev || (sNew === sPrev && r.kcal > prev.kcal)) {
          bestByName.set(key, r);
        }
      }
    }
    const uniqueRows = Array.from(bestByName.values());

    console.log(`Encontradas ${rows.length} linhas no CSV, ${uniqueRows.length} únicas por nome. Iniciando upsert em lote...`);

    const batchSize = 300;
    let upserted = 0;
    for (let start = 0; start < uniqueRows.length; start += batchSize) {
      const slice = uniqueRows.slice(start, start + batchSize);
      const { error } = await supabase
        .from('valores_nutricionais_completos')
        .upsert(slice, { onConflict: 'alimento_nome' });
      if (error) {
        console.error('Erro no upsert:', error.message || error);
        process.exit(4);
      }
      upserted += slice.length;
      console.log(`✔️ Upsert: ${upserted}/${uniqueRows.length}`);
    }

    const { count } = await supabase
      .from('valores_nutricionais_completos')
      .select('*', { count: 'exact', head: true });

    console.log('✅ Concluído. Total atual na tabela valores_nutricionais_completos:', count);

    // Amostras
    const { data: samples } = await supabase
      .from('valores_nutricionais_completos')
      .select('alimento_nome, kcal, proteina, carboidratos, gorduras, fibras, sodio')
      .ilike('alimento_nome', '%arroz%')
      .limit(5);
    console.log('Amostras (arroz):', samples);
  } catch (e) {
    console.error('Falha:', e);
    process.exit(1);
  }
}

main();


