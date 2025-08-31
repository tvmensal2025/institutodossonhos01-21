import { DetailedMealPlanForHTML } from './exportMealPlanDetailedHTML';

// Dados de exemplo para testar o HTML sem depender da IA
export function generateExampleMealPlan(): DetailedMealPlanForHTML {
  return {
    userName: 'Usuário Teste',
    dateLabel: `Cardápio Detalhado - ${new Date().toLocaleDateString('pt-BR')}`,
    targetCaloriesKcal: 2000,
    guaranteed: false,
    days: [
      {
        day: 1,
        dayName: 'Segunda',
        dailyTotals: {
          calories: 1950,
          protein: 120,
          carbs: 180,
          fat: 65,
          fiber: 25
        },
        meals: [
          {
            meal_type: 'Café da Manhã',
            recipe_name: 'Aveia com Banana e Mel',
            recipe_description: 'Café da manhã nutritivo e energético',
            prep_time: '5 minutos',
            cook_time: '10 minutos',
            calories: 300,
            protein: 12,
            carbs: 45,
            fat: 8,
            fiber: 6,
            ingredients: 'Farinha de aveia em flocos (45 g), Leite desnatado (150 ml), Banana prata em rodelas (60 g), Mel (5 g), Canela em pó (1 g)',
            instructions: 'Aqueça o leite até quase ferver. Adicione a aveia e mexa em fogo baixo por 4-6 minutos até engrossar. Adicione a banana e o mel. Polvilhe canela e sirva quente.',
            recipe_id: 'taco-1'
          },
          {
            meal_type: 'Almoço',
            recipe_name: 'Frango ao Curry com Legumes e Arroz Integral',
            recipe_description: 'Prato principal rico em proteínas e fibras',
            prep_time: '15 minutos',
            cook_time: '25 minutos',
            calories: 620,
            protein: 45,
            carbs: 65,
            fat: 22,
            fiber: 8,
            ingredients: 'Peito de frango em cubos (160 g), Curry em pó (3 g), Sal (2 g), Pimenta-do-reino (1 g), Azeite de oliva (10 ml), Cebola picada (30 g), Alho picado (5 g), Brócolis (80 g), Cenoura em rodelas (60 g), Arroz integral cozido (100 g)',
            instructions: 'Tempere o frango com curry, sal e pimenta. Aqueça o azeite e doure o frango por 5 minutos. Adicione cebola e alho, refogue por 2 minutos. Adicione os legumes e cozinhe por 8 minutos. Sirva com arroz integral.',
            recipe_id: 'taco-2'
          },
          {
            meal_type: 'Lanche',
            recipe_name: 'Iogurte com Granola e Frutas',
            recipe_description: 'Lanche leve e nutritivo',
            prep_time: '3 minutos',
            cook_time: '0 minutos',
            calories: 180,
            protein: 8,
            carbs: 25,
            fat: 5,
            fiber: 3,
            ingredients: 'Iogurte natural desnatado (150 g), Granola sem açúcar (20 g), Morangos picados (30 g), Mel (5 g)',
            instructions: 'Em uma tigela, coloque o iogurte. Adicione a granola por cima. Decore com os morangos picados e regue com mel. Sirva imediatamente.',
            recipe_id: 'taco-3'
          },
          {
            meal_type: 'Jantar',
            recipe_name: 'Sopa de Legumes com Quinoa',
            recipe_description: 'Jantar leve e reconfortante',
            prep_time: '10 minutos',
            cook_time: '20 minutos',
            calories: 320,
            protein: 15,
            carbs: 45,
            fat: 8,
            fiber: 6,
            ingredients: 'Quinoa (40 g), Abobrinha picada (60 g), Cenoura picada (50 g), Cebola picada (30 g), Alho picado (3 g), Caldo de legumes (300 ml), Azeite de oliva (5 ml), Sal (2 g), Pimenta-do-reino (1 g), Salsinha picada (5 g)',
            instructions: 'Aqueça o azeite e refogue a cebola e alho por 2 minutos. Adicione os legumes e refogue por 3 minutos. Adicione o caldo e a quinoa. Cozinhe por 15 minutos até a quinoa ficar macia. Tempere com sal e pimenta. Polvilhe salsinha e sirva.',
            recipe_id: 'taco-4'
          }
        ]
      },
      {
        day: 2,
        dayName: 'Terça',
        dailyTotals: {
          calories: 1980,
          protein: 125,
          carbs: 175,
          fat: 70,
          fiber: 28
        },
        meals: [
          {
            meal_type: 'Café da Manhã',
            recipe_name: 'Omelete de Claras com Espinafre',
            recipe_description: 'Café da manhã rico em proteínas',
            prep_time: '8 minutos',
            cook_time: '5 minutos',
            calories: 280,
            protein: 25,
            carbs: 8,
            fat: 15,
            fiber: 4,
            ingredients: 'Claras de ovo (120 g), Espinafre picado (40 g), Queijo cottage (30 g), Sal (1 g), Pimenta-do-reino (1 g), Azeite de oliva (5 ml)',
            instructions: 'Bata levemente as claras com sal e pimenta. Aqueça o azeite em uma frigideira antiaderente. Adicione o espinafre e refogue por 1 minuto. Despeje as claras e cozinhe por 2 minutos. Adicione o queijo cottage e dobre a omelete. Cozinhe por mais 1 minuto e sirva.',
            recipe_id: 'taco-5'
          },
          {
            meal_type: 'Almoço',
            recipe_name: 'Salmão Grelhado com Batata Doce',
            recipe_description: 'Prato rico em ômega-3 e carboidratos complexos',
            prep_time: '12 minutos',
            cook_time: '20 minutos',
            calories: 580,
            protein: 42,
            carbs: 55,
            fat: 25,
            fiber: 7,
            ingredients: 'Filé de salmão (150 g), Batata doce cozida (120 g), Brócolis (80 g), Limão (1/2 unidade), Azeite de oliva (10 ml), Sal (2 g), Pimenta-do-reino (1 g), Alecrim fresco (2 g)',
            instructions: 'Tempere o salmão com sal, pimenta e alecrim. Aqueça uma grelha ou frigideira. Grelhe o salmão por 4 minutos de cada lado. Sirva com batata doce cozida e brócolis no vapor. Regue com azeite e limão.',
            recipe_id: 'taco-6'
          },
          {
            meal_type: 'Lanche',
            recipe_name: 'Mix de Castanhas e Frutas Secas',
            recipe_description: 'Lanche energético e nutritivo',
            prep_time: '2 minutos',
            cook_time: '0 minutos',
            calories: 200,
            protein: 6,
            carbs: 20,
            fat: 12,
            fiber: 4,
            ingredients: 'Amêndoas (15 g), Nozes (10 g), Uvas passas (20 g), Damascos secos (15 g)',
            instructions: 'Misture todos os ingredientes em uma tigela. Sirva como lanche energético entre as refeições.',
            recipe_id: 'taco-7'
          },
          {
            meal_type: 'Jantar',
            recipe_name: 'Lentilha com Arroz Integral',
            recipe_description: 'Jantar vegetariano rico em proteínas',
            prep_time: '10 minutos',
            cook_time: '30 minutos',
            calories: 420,
            protein: 18,
            carbs: 72,
            fat: 8,
            fiber: 12,
            ingredients: 'Lentilha cozida (100 g), Arroz integral cozido (80 g), Cebola picada (30 g), Alho picado (5 g), Tomate picado (50 g), Azeite de oliva (8 ml), Sal (2 g), Pimenta-do-reino (1 g), Cominho em pó (2 g)',
            instructions: 'Aqueça o azeite e refogue a cebola e alho por 2 minutos. Adicione o tomate e cozinhe por 3 minutos. Adicione a lentilha e o arroz. Tempere com sal, pimenta e cominho. Cozinhe por 5 minutos mexendo ocasionalmente. Sirva quente.',
            recipe_id: 'taco-8'
          }
        ]
      }
    ]
  };
}

// Função para testar o HTML com dados de exemplo
export function testDetailedHTML() {
  const examplePlan = generateExampleMealPlan();
  const { openDetailedMealPlanHTML } = require('./exportMealPlanDetailedHTML');
  openDetailedMealPlanHTML(examplePlan);
}
