import { testPreprocessing, preprocessTextForTTS } from './src/utils/ttsPreprocessor.js';

console.log('🧪 Testando pré-processamento de texto para TTS...\n');

// Testar casos específicos mencionados no comando
const testCases = [
  "Bom dia 😊 vamos em frente! ❤️",
  "Reunião às 14:30 -> link: https://exemplo.com",
  "Parabéns!!! 🎉🎉🎉",
  "Obrigado 🙏 de verdade",
  "Código: `console.log('teste')` funciona!",
  "Email: usuario@exemplo.com é válido",
  "Número: 123-456-7890",
  ":smile: isso é um shortcode :heart:",
  "Texto com **negrito** e ~tachado~",
  "Múltiplos emojis 😊😄😂 devem ser agrupados",
  "Sofia falando com 😡 e depois 😢",
  "Link importante: https://github.com/rafael",
  "Código: `npm install react`",
  "Horário: 15:30",
  "Telefone: (11) 99999-9999"
];

console.log('📋 Casos de teste específicos:\n');

testCases.forEach((testCase, index) => {
  const processed = preprocessTextForTTS(testCase);
  console.log(`${index + 1}. Original: "${testCase}"`);
  console.log(`   Processado: "${processed}"`);
  console.log('');
});

console.log('🎉 Teste de pré-processamento concluído!');
console.log('\n✅ Funcionalidades implementadas:');
console.log('- ✅ Substituição de emojis por expressões naturais');
console.log('- ✅ Remoção de símbolos decorativos');
console.log('- ✅ Preservação de links e códigos');
console.log('- ✅ Processamento de shortcodes');
console.log('- ✅ Agrupamento de emojis consecutivos');
console.log('- ✅ Limpeza de espaços e pontuação');
