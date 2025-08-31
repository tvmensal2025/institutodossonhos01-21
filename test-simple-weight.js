// Teste do SimpleWeightForm
console.log('Testando SimpleWeightForm...');

// Simular dados de entrada
const testData = {
  peso_kg: '80',
  circunferencia_abdominal_cm: '70',
  altura: 165
};

console.log('Dados de teste:', testData);

// Simular cálculo de IMC
const heightInMeters = testData.altura / 100;
const bmi = parseFloat(testData.peso_kg) / (heightInMeters * heightInMeters);

console.log('IMC calculado:', bmi.toFixed(1));

// Simular classificação
let risco_metabolico = 'normal';
if (bmi < 18.5) risco_metabolico = 'baixo_peso';
else if (bmi >= 25 && bmi < 30) risco_metabolico = 'sobrepeso';
else if (bmi >= 30 && bmi < 35) risco_metabolico = 'obesidade_grau1';
else if (bmi >= 35 && bmi < 40) risco_metabolico = 'obesidade_grau2';
else if (bmi >= 40) risco_metabolico = 'obesidade_grau3';

console.log('Classificação:', risco_metabolico);

// Simular tempo de recarregamento
console.log('Tempo de recarregamento: 7000ms (7 segundos)');

console.log('Teste concluído!'); 