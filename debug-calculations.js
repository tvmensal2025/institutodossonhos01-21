// Script para debugar cálculos de IMC e composição corporal
// Baseado nos valores mostrados na imagem: peso 200kg, IMC 82.2, gordura 99%

console.log('🔍 DEBUG: Análise dos cálculos incorretos');
console.log('==========================================');

// Dados da imagem
const peso = 200; // kg
const imcExibido = 82.2;
const gorduraExibida = 99.0; // %
const massaMagraExibida = 2.1; // kg

console.log('📊 Dados da imagem:');
console.log(`   - Peso: ${peso} kg`);
console.log(`   - IMC exibido: ${imcExibido}`);
console.log(`   - Gordura exibida: ${gorduraExibida}%`);
console.log(`   - Massa magra exibida: ${massaMagraExibida} kg`);

// Calcular altura baseada no IMC exibido
// IMC = peso / (altura/100)²
// altura = √(peso / IMC) * 100
const alturaCalculada = Math.sqrt(peso / imcExibido) * 100;
console.log(`\n📏 Altura calculada baseada no IMC exibido: ${alturaCalculada.toFixed(1)} cm`);

// Verificar se a altura faz sentido
if (alturaCalculada < 100 || alturaCalculada > 250) {
  console.log('❌ PROBLEMA: Altura calculada está fora do intervalo realista (100-250 cm)');
  console.log('   Isso indica que o IMC está incorreto ou a altura foi registrada errada');
}

// Calcular massa magra baseada na gordura exibida
const massaMagraCalculada = peso * (1 - gorduraExibida / 100);
console.log(`\n💪 Massa magra calculada baseada na gordura exibida: ${massaMagraCalculada.toFixed(1)} kg`);

// Verificar se a massa magra faz sentido
if (massaMagraCalculada < peso * 0.3) {
  console.log('❌ PROBLEMA: Massa magra muito baixa (menos de 30% do peso corporal)');
  console.log('   Isso indica que o percentual de gordura está incorreto');
}

// Calcular IMC realista para diferentes alturas
console.log('\n📈 IMC realista para diferentes alturas:');
const alturasTeste = [150, 160, 170, 180, 190, 200];
alturasTeste.forEach(altura => {
  const imcRealista = peso / Math.pow(altura / 100, 2);
  console.log(`   - Altura ${altura}cm: IMC ${imcRealista.toFixed(1)}`);
});

// Calcular gordura corporal realista usando fórmula de Deurenberg
console.log('\n🎯 Gordura corporal realista (fórmula Deurenberg):');
const idade = 30; // assumindo idade padrão
alturasTeste.forEach(altura => {
  const imc = peso / Math.pow(altura / 100, 2);
  const gorduraHomem = (1.20 * imc) + (0.23 * idade) - 16.2;
  const gorduraMulher = (1.20 * imc) + (0.23 * idade) - 5.4;
  console.log(`   - Altura ${altura}cm:`);
  console.log(`     Homem: ${Math.max(5, Math.min(50, gorduraHomem)).toFixed(1)}%`);
  console.log(`     Mulher: ${Math.max(5, Math.min(50, gorduraMulher)).toFixed(1)}%`);
});

// Calcular massa magra realista
console.log('\n💪 Massa magra realista:');
alturasTeste.forEach(altura => {
  const imc = peso / Math.pow(altura / 100, 2);
  const gorduraHomem = Math.max(5, Math.min(50, (1.20 * imc) + (0.23 * idade) - 16.2));
  const massaMagraHomem = peso * (1 - gorduraHomem / 100);
  const massaMagraMinima = peso * 0.3; // mínimo 30% do peso
  const massaMagraFinal = Math.max(massaMagraMinima, massaMagraHomem);
  
  console.log(`   - Altura ${altura}cm: ${massaMagraFinal.toFixed(1)} kg (${(massaMagraFinal/peso*100).toFixed(1)}%)`);
});

console.log('\n🔧 SOLUÇÕES APLICADAS:');
console.log('1. Limites realistas para gordura corporal: 5-50%');
console.log('2. Limites realistas para água corporal: 40-70%');
console.log('3. Massa magra mínima: 30% do peso corporal');
console.log('4. Verificação de altura: 100-250 cm');
console.log('5. Recalculação automática de IMC e classificações');
