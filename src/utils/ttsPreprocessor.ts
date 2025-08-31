// Minimal TTS preprocessor to avoid excessive mappings and duplicate keys
// Keep it fast, deterministic and TypeScript-safe

export interface TTSPreprocessorConfig {
  enabled: boolean;
  useSSML: boolean;
  preserveLinks: boolean;
  preserveCodes: boolean;
  preserveNumbers: boolean;
}

export const DEFAULT_CONFIG: TTSPreprocessorConfig = {
  enabled: true,
  useSSML: false, // Desativar SSML para evitar problemas com "break time"
  preserveLinks: true,
  preserveCodes: true,
  preserveNumbers: true,
};

// Small, conflict-free mapping for common emojis
const EMOJI_MAP: Record<string, string> = {
  '😊': 'com um sorriso',
  '😂': 'rindo',
  '😉': 'de forma divertida',
  '😢': 'com tristeza',
  '😡': 'com raiva',
  '😴': 'com sono',
  '❤️': 'com amor',
  '🙏': 'com gratidão',
  '👏': 'aplaudindo',
  '👍': 'concordando',
  '🤔': 'pensando',
  '✨': 'com brilho',
  '🔥': 'com energia',
  '💪': 'com força',
  '🎉': 'em celebração',
};

const URL_REGEX = /(https?:\/\/[^\s)]+)|(www\.[^\s)]+)/gi;
const CODE_REGEX = /`{1,3}([\s\S]*?)`{1,3}/g; // inline `code` or ```code```
const MULTISPACE = /[ \t\f\v\u00A0\u2000-\u200B]+/g;

function replaceEmojis(text: string): string {
  // Remover TODOS os emojis de forma mais abrangente
  let result = text;
  
  // Regex mais abrangente para capturar todos os tipos de emojis
  const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1F018}-\u{1F270}]|[\u{238C}-\u{2454}]|[\u{20D0}-\u{20FF}]|[\u{FE00}-\u{FE0F}]|[\u{1F004}]|[\u{1F0CF}]|[\u{1F170}-\u{1F251}]/gu;
  
  // Remover emojis
  result = result.replace(emojiRegex, '');
  
  // Remover também caracteres especiais que podem causar problemas
  result = result.replace(/[^\w\s.,!?;:\-()áéíóúâêîôûàèìòùãõçÁÉÍÓÚÂÊÎÔÛÀÈÌÒÙÃÕÇ]/g, ' ');
  
  // Limpar espaços extras
  result = result.replace(/\s+/g, ' ').trim();
  
  return result;
}

function stripDecorative(text: string): string {
  // Remove caracteres decorativos comuns (borders, art, etc.)
  return text
    .replace(/[•·●◦▪▫◆◇▸►▹▻◼■□▪︎✦✧✪✩✰☆★❖✽✿❀❁❇❈❉♢♣♦♠♡♥❤❥☼☀☾☽☁☂☔⚡⚠︎✓✔︎✗✘]/g, '')
    .replace(/[＿–—‒―▪︎•]/g, '-')
    .replace(/[“”«»„‟‹›]/g, '"')
    .replace(/[‘’‚‛]/g, "'");
}

function normalizeSpaces(text: string): string {
  // Normalizar quebras de linha e espaços múltiplos
  let result = text.replace(/\s*\n\s*/g, '\n').replace(MULTISPACE, ' ').trim();
  
  // Adicionar pausas naturais para melhor fala
  result = result
    // Pausa após pontos de exclamação (ponto extra)
    .replace(/!+/g, '!. ')
    // Pausa após pontos de interrogação (ponto extra)
    .replace(/\?+/g, '?. ')
    // Pausa após pontos finais (ponto extra)
    .replace(/\.+/g, '.. ')
    // Pausa após vírgulas (ponto)
    .replace(/,/g, ',. ')
    // Pausa após dois pontos (ponto extra)
    .replace(/:/g, ':. ')
    // Pausa após ponto e vírgula (ponto extra)
    .replace(/;/g, ';. ')
    // Pausa para quebras de linha (múltiplos pontos)
    .replace(/\n+/g, '... ')
    // Limpar espaços extras mas manter pausas
    .replace(/\s+/g, ' ')
    .trim();
  
  return result;
}

function protect(text: string, regex: RegExp): { cleaned: string; placeholders: string[] } {
  const placeholders: string[] = [];
  const cleaned = text.replace(regex, (match) => {
    const token = `@@P${placeholders.length}@@`;
    placeholders.push(match);
    return token;
  });
  return { cleaned, placeholders };
}

function restore(text: string, placeholders: string[]): string {
  return text.replace(/@@P(\d+)@@/g, (_, i) => placeholders[Number(i)] ?? '');
}

export function preprocessTextForTTS(text: string, config: TTSPreprocessorConfig = DEFAULT_CONFIG): string {
  if (!config.enabled || !text) return text || '';

  let working = String(text);

  // 1) Proteger trechos sensíveis (links e códigos)
  const links = config.preserveLinks ? protect(working, URL_REGEX) : { cleaned: working, placeholders: [] };
  working = links.cleaned;
  const codes = config.preserveCodes ? protect(working, CODE_REGEX) : { cleaned: working, placeholders: [] };
  working = codes.cleaned;

  // 2) Substituir emojis por descrições curtas (removendo os não mapeados)
  working = replaceEmojis(working);

  // 3) Remover símbolos decorativos e normalizar espaços
  working = stripDecorative(working);
  working = normalizeSpaces(working);

  // 4) Restaurar trechos protegidos
  working = restore(working, codes.placeholders);
  working = restore(working, links.placeholders);

  // 5) Pausas naturais simples (sem SSML complexo)
  if (config.useSSML) {
    working = working
      // Pausa após pontos de exclamação
      .replace(/!+/g, '! . . .')
      // Pausa após pontos de interrogação
      .replace(/\?+/g, '? . . .')
      // Pausa após pontos finais
      .replace(/\.+/g, '. . .')
      // Pausa após vírgulas
      .replace(/,/g, ', .')
      // Pausa após dois pontos
      .replace(/:/g, ': . .')
      // Pausa após ponto e vírgula
      .replace(/;/g, '; . .')
      // Pausa para quebras de linha
      .replace(/\n+/g, '. . . . .')
      // Limpar espaços extras
      .replace(/\s+/g, ' ')
      .trim();
  }

  return working;
}

// Simple local tester (no exports)
function __test() {
  const samples = [
    'Bom dia 😊 Vamos com tudo! 🎉',
    'Veja: https://exemplo.com/docs (importante)',
    'Código: `console.log("oi")` ok!',
  ];
  for (const s of samples) {
    // eslint-disable-next-line no-console
    console.log('[TTS]', s, '=>', preprocessTextForTTS(s));
  }
}

// Uncomment to locally test in dev
// __test();
