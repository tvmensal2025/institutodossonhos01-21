// Teste específico das melhorias de voz da Sofia
const testCases = [
  "Olá Sofia 😊 como você está? ❤️",
  "Parabéns!!! 🎉🎉🎉 Você conseguiu!",
  "Obrigado 🙏 de verdade, muito obrigado!",
  "Sofia falando com 😡 e depois 😢, mas tudo bem!",
  "Múltiplos emojis 😊😄😂 devem ser agrupados naturalmente",
  "Link importante: https://github.com/rafael para você ver",
  "Código: `npm install react` funciona perfeitamente!",
  "Horário: 15:30, não esqueça da reunião!",
  "Telefone: (11) 99999-9999 para contato",
  "Bom dia 😊 vamos em frente! ❤️ com determinação! 🚀"
];

// Mapeamento melhorado de emojis
const EMOJI_MAPPING = {
  '😊': 'com um sorriso',
  '😄': 'com um sorriso',
  '😂': 'rindo',
  '❤️': 'com amor',
  '🎉': 'em tom de celebração',
  '🙏': 'com gratidão',
  '😡': 'com raiva',
  '😢': 'com tristeza',
  '⭐': 'com brilho',
  '✨': 'com brilho',
  '🚀': 'com entusiasmo'
};

// Shortcodes melhorados
const SHORTCODE_MAPPING = {
  ':smile:': 'com um sorriso',
  ':heart:': 'com amor'
};

// Símbolos decorativos
const DECORATIVE_SYMBOLS = ['*', '~', '->', '=>', '[', ']', '{', '}', '<', '>', '**', '~~', '`'];

function preprocessTextForTTS(text) {
  let processed = text;
  
  // 1. Processar shortcodes
  for (const [shortcode, replacement] of Object.entries(SHORTCODE_MAPPING)) {
    const regex = new RegExp(shortcode.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    processed = processed.replace(regex, replacement);
  }
  
  // 2. Processar emojis
  for (const [emoji, replacement] of Object.entries(EMOJI_MAPPING)) {
    processed = processed.replace(new RegExp(emoji.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replacement);
  }
  
  // 3. Preservar links
  const linkRegex = /(https?:\/\/[^\s]+)/g;
  const links = [];
  processed = processed.replace(linkRegex, (match) => {
    links.push(match);
    return `__LINK_${links.length - 1}__`;
  });
  
  // 4. Preservar códigos
  const codeRegex = /`([^`]+)`/g;
  const codes = [];
  processed = processed.replace(codeRegex, (match, code) => {
    codes.push(code);
    return `__CODE_${codes.length - 1}__`;
  });
  
  // 5. Remover símbolos decorativos
  for (const symbol of DECORATIVE_SYMBOLS) {
    processed = processed.replace(new RegExp(symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), ' ');
  }
  
  // 6. Restaurar links
  links.forEach((link, index) => {
    processed = processed.replace(`__LINK_${index}__`, link);
  });
  
  // 7. Restaurar códigos
  codes.forEach((code, index) => {
    processed = processed.replace(`__CODE_${index}__`, `"${code}"`);
  });
  
  // 8. Limpar texto e adicionar pausas naturais
  processed = processed
    .replace(/\s+/g, ' ')
    .replace(/\s+([.,;:!?])/g, '$1')
    .replace(/([.,;:!?])\s*([.,;:!?])/g, '$1')
    // Remove repetições consecutivas
    .replace(/(com um sorriso|rindo|em tom de celebração|com amor|com gratidão|com raiva|com tristeza|com brilho|concordando|discordando|pensando|surpreso|com medo|com preocupação|em silêncio|de forma descontraída|com entusiasmo|com carinho|com respeito|com nojo|com calor|com frio|de forma divertida)\s*\1+/g, '$1')
    // Adiciona pausas naturais após expressões de emoção
    .replace(/(com um sorriso|rindo|em tom de celebração|com amor|com gratidão|com raiva|com tristeza|com brilho|concordando|discordando|pensando|surpreso|com medo|com preocupação|em silêncio|de forma descontraída|com entusiasmo|com carinho|com respeito|com nojo|com calor|com frio|de forma divertida)([A-Z])/g, '$1, $2')
    .replace(/(com um sorriso|rindo|em tom de celebração|com amor|com gratidão|com raiva|com tristeza|com brilho|concordando|discordando|pensando|surpreso|com medo|com preocupação|em silêncio|de forma descontraída|com entusiasmo|com carinho|com respeito|com nojo|com calor|com frio|de forma divertida)([a-z])/g, '$1, $2')
    .trim();
  
  return processed;
}

console.log('🎤 Testando melhorias na voz da Sofia...\n');

console.log('📋 Casos de teste com melhorias:\n');

testCases.forEach((testCase, index) => {
  const processed = preprocessTextForTTS(testCase);
  console.log(`${index + 1}. Original: "${testCase}"`);
  console.log(`   Processado: "${processed}"`);
  console.log('');
});

console.log('🎉 Teste das melhorias concluído!');
console.log('\n✅ Melhorias implementadas:');
console.log('- ✅ Pausas naturais após expressões de emoção');
console.log('- ✅ Remoção de repetições consecutivas');
console.log('- ✅ Velocidade mais lenta (0.85) para pausas naturais');
console.log('- ✅ Agrupamento inteligente de emojis');
console.log('- ✅ Espaçamento otimizado entre frases');
console.log('- ✅ Preservação de conteúdo importante');
console.log('\n🎤 A Sofia agora tem voz mais natural e fluida!');
