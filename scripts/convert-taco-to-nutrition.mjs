import { readFile, writeFile } from 'node:fs/promises';

function splitCsvLine(line) {
  const out = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
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
  if (!s || s.toLowerCase() === 'tr') return 0;
  const n = Number(s.replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}

function normalize(text = '') {
  const lowered = String(text).toLowerCase();
  const noAccents = lowered.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return noAccents.replace(/[^a-z0-9 ]/g, ' ').trim().replace(/\s+/g, ' ');
}

(async () => {
  const inPath = process.argv[2] || 'data/TACO_Completo.csv';
  const outPath = process.argv[3] || 'data/taco-normalized.csv';
  const text = await readFile(inPath, 'utf8');
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');

  // Encontrar linhas de cabeçalho
  let headerTopIdx = -1;
  let headerMidIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    const row = splitCsvLine(lines[i]);
    const joined = row.join(',').toLowerCase();
    if (joined.includes('número do') && headerTopIdx === -1) headerTopIdx = i;
    if ((row[0] || '').toLowerCase().includes('alimento') && (row[1] || '').toLowerCase().includes('descrição')) {
      headerMidIdx = i;
      break;
    }
  }
  if (headerTopIdx === -1 || headerMidIdx === -1) {
    console.error('Cabeçalho TACO não encontrado.');
    process.exit(2);
  }

  const headerTop = splitCsvLine(lines[headerTopIdx]);
  const headerMid = splitCsvLine(lines[headerMidIdx]);
  // Combinar nomes de colunas
  const maxCols = Math.max(headerTop.length, headerMid.length);
  const cols = [];
  for (let i = 0; i < maxCols; i++) {
    const a = (headerTop[i] || '').trim();
    const b = (headerMid[i] || '').trim();
    const name = `${a} ${b}`.trim().replace(/\s+/g, ' ');
    cols.push(name);
  }

  // Mapear índices por palavras-chave
  function findIdx(keyword) {
    const key = keyword.toLowerCase();
    for (let i = 0; i < cols.length; i++) {
      if (cols[i].toLowerCase().includes(key)) return i;
    }
    return -1;
  }

  const idxName = findIdx('Descrição dos alimentos');
  const idxKcal = findIdx('(kcal)');
  const idxProt = findIdx('Proteína');
  const idxFat = findIdx('Lipídeos');
  // carbo aparece quebrado "Carbo- idrato"
  let idxCarb = findIdx('Carbo-');
  if (idxCarb === -1) idxCarb = findIdx('idrato');
  const idxFiber = findIdx('Alimentar');
  const idxSodium = findIdx('Sódio');

  if ([idxName, idxKcal, idxProt, idxFat, idxCarb, idxFiber, idxSodium].some(i => i === -1)) {
    console.error('Não foi possível mapear todas as colunas necessárias.');
    console.error({ idxName, idxKcal, idxProt, idxFat, idxCarb, idxFiber, idxSodium });
    process.exit(3);
  }

  const outRows = [];
  outRows.push(['name','categoria','subcategoria','carbs_g','protein_g','fat_g','fiber_g','sodium_mg','kcal','aliases','density_g_ml','epf','yield_from_state','yield_to_state','yield_factor'].join(','));

  for (let i = headerMidIdx + 1; i < lines.length; i++) {
    const row = splitCsvLine(lines[i]);
    if (row.length < idxSodium + 1) continue;
    // Ignorar linhas de seção como 'Cereais e derivados' e vazias
    const firstTwo = ((row[0]||'') + (row[1]||'')).trim();
    if (!firstTwo) continue;
    if (!/\d+/.test((row[0]||'').trim())) {
      // pode ser linha de seção; continue
      if ((row[1]||'').trim().length === 0) continue;
    }

    const name = (row[idxName] || '').replace(/"/g, '').trim();
    if (!name) continue;

    const carbs = toNumber(row[idxCarb]);
    const protein = toNumber(row[idxProt]);
    const fat = toNumber(row[idxFat]);
    const fiber = toNumber(row[idxFiber]);
    const sodium = toNumber(row[idxSodium]);
    const kcal = toNumber(row[idxKcal]);

    const out = [
      name,
      '',
      '',
      carbs,
      protein,
      fat,
      fiber,
      sodium,
      kcal,
      normalize(name),
      '',
      '',
      '',
      '',
      ''
    ];
    outRows.push(out.join(','));
  }

  await writeFile(outPath, outRows.join('\n'));
  console.log(JSON.stringify({ success: true, output: outPath, rows: outRows.length - 1 }));
})();







