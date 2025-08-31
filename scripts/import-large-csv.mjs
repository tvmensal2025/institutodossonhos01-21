import { readFile } from 'node:fs/promises';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://hlrkoyywjpckdotimtik.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9zZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI';

if (process.argv.length < 3) {
  console.error('Uso: node scripts/import-large-csv.mjs <arquivo.csv> [delimitador] [linhasPorLote]');
  process.exit(1);
}

const filePath = process.argv[2];
const delimiter = process.argv[3] || ',';
const rowsPerBatch = Number(process.argv[4] || 1000);

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const AUTH_TOKEN = process.env.SUPABASE_FUNCTION_JWT || process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;

function chunkArray(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

(async () => {
  const text = await readFile(filePath, 'utf8');
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter(Boolean);
  if (lines.length < 2) {
    console.error('CSV vazio ou sem dados.');
    process.exit(2);
  }
  const header = lines[0];
  const dataLines = lines.slice(1);
  const batches = chunkArray(dataLines, rowsPerBatch);

  let imported = 0;
  for (let i = 0; i < batches.length; i++) {
    const bodyText = [header, ...batches[i]].join('\n');
    const { data, error } = await supabase.functions.invoke('import-nutrition-csv', {
      body: { csvText: bodyText, delimiter },
      headers: { Authorization: `Bearer ${AUTH_TOKEN}` },
    });
    if (error) {
      console.error(`Lote ${i + 1}/${batches.length} falhou:`, error);
      process.exit(3);
    }
    console.log(`Lote ${i + 1}/${batches.length} importado:`, data?.stats || data);
    imported += data?.imported || 0;
  }

  console.log('Concluído. Linhas importadas (aprox.):', imported);
})();


