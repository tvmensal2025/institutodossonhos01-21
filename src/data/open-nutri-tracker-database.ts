// OpenNutriTracker Database - Base de dados expandida
// Complementa a base TACO com alimentos internacionais e dados nutricionais avançados

export interface OpenNutriTrackerFood {
  id: string;
  name: string;
  brazilianName?: string;
  category: string;
  subcategory: string;
  imageUrl?: string; // URL da imagem do alimento
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  glycemicIndex?: number;
  glycemicLoad?: number;
  omega3?: number;
  omega6?: number;
  vitaminA?: number;
  vitaminC?: number;
  vitaminD?: number;
  vitaminE?: number;
  vitaminK?: number;
  vitaminB1?: number;
  vitaminB2?: number;
  vitaminB3?: number;
  vitaminB6?: number;
  vitaminB12?: number;
  folate?: number;
  calcium?: number;
  iron?: number;
  magnesium?: number;
  potassium?: number;
  zinc?: number;
  selenium?: number;
  phosphorus?: number;
  copper?: number;
  manganese?: number;
  chromium?: number;
  molybdenum?: number;
  iodine?: number;
  sulfur?: number;
  boron?: number;
  vanadium?: number;
  nickel?: number;
  silicon?: number;
  healthScore: number;
  allergens: string[];
  servingSize: string;
  commonUnits: string[];
  description?: string;
  origin: string;
  availability: string;
  seasonal?: boolean;
  organic?: boolean;
  glutenFree?: boolean;
  vegan?: boolean;
  vegetarian?: boolean;
  keto?: boolean;
  paleo?: boolean;
  mediterranean?: boolean;
  antiInflammatory?: boolean;
  antioxidant?: boolean;
  probiotic?: boolean;
  prebiotic?: boolean;
  adaptogen?: boolean;
  superfood?: boolean;
}

// Base de dados expandida com alimentos internacionais e brasileiros
export const openNutriTrackerDatabase: OpenNutriTrackerFood[] = [
  // Superfoods Internacionais
  {
    id: "quinoa_cooked",
    name: "Quinoa Cooked",
    brazilianName: "Quinoa Cozida",
    category: "Grains",
    subcategory: "Ancient Grains",
    imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200&h=200&fit=crop&crop=center",
    calories: 120,
    protein: 4.4,
    carbs: 21.3,
    fat: 1.9,
    fiber: 2.8,
    sugar: 0.9,
    sodium: 7,
    glycemicIndex: 53,
    glycemicLoad: 13,
    omega3: 0.1,
    omega6: 0.9,
    vitaminA: 0,
    vitaminC: 0,
    vitaminE: 0.6,
    vitaminB1: 0.1,
    vitaminB2: 0.1,
    vitaminB6: 0.1,
    folate: 42,
    iron: 1.5,
    magnesium: 64,
    potassium: 172,
    zinc: 1.1,
    healthScore: 95,
    allergens: [],
    servingSize: "100g",
    commonUnits: ["cup", "tablespoon", "gram"],
    description: "Grão ancestral rico em proteínas completas e minerais",
    origin: "South America",
    availability: "Global",
    seasonal: false,
    organic: true,
    glutenFree: true,
    vegan: true,
    vegetarian: true,
    keto: false,
    paleo: true,
    mediterranean: true,
    antiInflammatory: true,
    antioxidant: true,
    superfood: true
  },
  {
    id: "chia_seeds",
    name: "Chia Seeds",
    brazilianName: "Sementes de Chia",
    category: "Seeds",
    subcategory: "Super Seeds",
    imageUrl: "https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=200&h=200&fit=crop&crop=center",
    calories: 486,
    protein: 17,
    carbs: 42,
    fat: 31,
    fiber: 34,
    sugar: 0,
    sodium: 16,
    glycemicIndex: 1,
    glycemicLoad: 1,
    omega3: 17.8,
    omega6: 5.8,
    vitaminA: 0,
    vitaminC: 1.6,
    vitaminE: 0.5,
    vitaminB1: 0.6,
    vitaminB2: 0.2,
    vitaminB3: 8.8,
    vitaminB6: 0.9,
    folate: 49,
    calcium: 631,
    iron: 7.7,
    magnesium: 335,
    potassium: 407,
    zinc: 4.6,
    healthScore: 98,
    allergens: [],
    servingSize: "100g",
    commonUnits: ["tablespoon", "teaspoon", "gram"],
    description: "Sementes ricas em ômega-3, fibras e minerais",
    origin: "Central America",
    availability: "Global",
    seasonal: false,
    organic: true,
    glutenFree: true,
    vegan: true,
    vegetarian: true,
    keto: true,
    paleo: true,
    mediterranean: true,
    antiInflammatory: true,
    antioxidant: true,
    superfood: true
  },
  {
    id: "spirulina",
    name: "Spirulina",
    brazilianName: "Espirulina",
    category: "Algae",
    subcategory: "Blue-Green Algae",
    imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop&crop=center",
    calories: 290,
    protein: 57,
    carbs: 24,
    fat: 8,
    fiber: 3.6,
    sugar: 3.1,
    sodium: 1048,
    glycemicIndex: 15,
    glycemicLoad: 4,
    omega3: 0.8,
    omega6: 1.3,
    vitaminA: 570,
    vitaminC: 10.1,
    vitaminE: 5,
    vitaminB1: 2.4,
    vitaminB2: 3.7,
    vitaminB3: 12.8,
    vitaminB6: 0.4,
    vitaminB12: 0,
    folate: 94,
    calcium: 120,
    iron: 28.5,
    magnesium: 195,
    potassium: 1363,
    zinc: 2,
    healthScore: 99,
    allergens: [],
    servingSize: "100g",
    commonUnits: ["teaspoon", "tablet", "gram"],
    description: "Alga rica em proteínas, vitaminas e minerais",
    origin: "Global",
    availability: "Global",
    seasonal: false,
    organic: true,
    glutenFree: true,
    vegan: true,
    vegetarian: true,
    keto: true,
    paleo: true,
    mediterranean: true,
    antiInflammatory: true,
    antioxidant: true,
    superfood: true
  },
  {
    id: "moringa_oleifera",
    name: "Moringa Oleifera",
    brazilianName: "Moringa",
    category: "Leaves",
    subcategory: "Medicinal Leaves",
    imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop&crop=center",
    calories: 64,
    protein: 9.4,
    carbs: 8.3,
    fat: 1.4,
    fiber: 2,
    sugar: 0,
    sodium: 9,
    glycemicIndex: 15,
    glycemicLoad: 1,
    omega3: 0.4,
    omega6: 0.2,
    vitaminA: 7564,
    vitaminC: 51.7,
    vitaminE: 113,
    vitaminB1: 0.3,
    vitaminB2: 0.7,
    vitaminB3: 2.2,
    vitaminB6: 1.2,
    folate: 40,
    calcium: 185,
    iron: 4,
    magnesium: 147,
    potassium: 337,
    zinc: 0.6,
    healthScore: 97,
    allergens: [],
    servingSize: "100g",
    commonUnits: ["tablespoon", "teaspoon", "gram"],
    description: "Planta medicinal rica em nutrientes e antioxidantes",
    origin: "India",
    availability: "Global",
    seasonal: false,
    organic: true,
    glutenFree: true,
    vegan: true,
    vegetarian: true,
    keto: true,
    paleo: true,
    mediterranean: true,
    antiInflammatory: true,
    antioxidant: true,
    adaptogen: true,
    superfood: true
  },
  {
    id: "acai_berry",
    name: "Açaí Berry",
    brazilianName: "Açaí",
    category: "Fruits",
    subcategory: "Berries",
    imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop&crop=center",
    calories: 70,
    protein: 1.5,
    carbs: 4,
    fat: 5,
    fiber: 2.9,
    sugar: 0,
    sodium: 10,
    glycemicIndex: 10,
    glycemicLoad: 1,
    omega3: 0.1,
    omega6: 0.8,
    vitaminA: 15,
    vitaminC: 9.7,
    vitaminE: 0.5,
    vitaminB1: 0.4,
    vitaminB2: 0.1,
    vitaminB3: 0.4,
    vitaminB6: 0.1,
    folate: 6,
    calcium: 118,
    iron: 0.6,
    magnesium: 58,
    potassium: 124,
    zinc: 0.5,
    healthScore: 96,
    allergens: [],
    servingSize: "100g",
    commonUnits: ["cup", "tablespoon", "gram"],
    description: "Fruto amazônico rico em antioxidantes e gorduras saudáveis",
    origin: "Brazil",
    availability: "Brazil",
    seasonal: true,
    organic: true,
    glutenFree: true,
    vegan: true,
    vegetarian: true,
    keto: true,
    paleo: true,
    mediterranean: true,
    antiInflammatory: true,
    antioxidant: true,
    superfood: true
  },
  {
    id: "camu_camu",
    name: "Camu Camu",
    brazilianName: "Camu Camu",
    category: "Fruits",
    subcategory: "Amazonian Fruits",
    imageUrl: "https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=200&h=200&fit=crop&crop=center",
    calories: 17,
    protein: 0.4,
    carbs: 3.8,
    fat: 0.2,
    fiber: 0.4,
    sugar: 0.2,
    sodium: 1,
    glycemicIndex: 5,
    glycemicLoad: 1,
    vitaminA: 0,
    vitaminC: 2280,
    vitaminE: 0.1,
    vitaminB1: 0.1,
    vitaminB2: 0.1,
    vitaminB3: 0.1,
    vitaminB6: 0.1,
    folate: 1,
    calcium: 15,
    iron: 0.5,
    magnesium: 12,
    potassium: 83,
    zinc: 0.2,
    healthScore: 94,
    allergens: [],
    servingSize: "100g",
    commonUnits: ["tablespoon", "teaspoon", "gram"],
    description: "Fruto amazônico com maior concentração de vitamina C do mundo",
    origin: "Brazil",
    availability: "Brazil",
    seasonal: true,
    organic: true,
    glutenFree: true,
    vegan: true,
    vegetarian: true,
    keto: true,
    paleo: true,
    mediterranean: true,
    antiInflammatory: true,
    antioxidant: true,
    superfood: true
  },
  {
    id: "cupuacu",
    name: "Cupuaçu",
    brazilianName: "Cupuaçu",
    category: "Fruits",
    subcategory: "Amazonian Fruits",
    imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop&crop=center",
    calories: 49,
    protein: 1.2,
    carbs: 9.4,
    fat: 0.1,
    fiber: 2.1,
    sugar: 0,
    sodium: 2,
    glycemicIndex: 15,
    glycemicLoad: 1,
    vitaminA: 0,
    vitaminC: 16.2,
    vitaminE: 0.1,
    vitaminB1: 0.1,
    vitaminB2: 0.1,
    vitaminB3: 0.1,
    vitaminB6: 0.1,
    folate: 1,
    calcium: 8,
    iron: 0.2,
    magnesium: 12,
    potassium: 331,
    zinc: 0.1,
    healthScore: 92,
    allergens: [],
    servingSize: "100g",
    commonUnits: ["cup", "tablespoon", "gram"],
    description: "Fruto amazônico rico em antioxidantes e potássio",
    origin: "Brazil",
    availability: "Brazil",
    seasonal: true,
    organic: true,
    glutenFree: true,
    vegan: true,
    vegetarian: true,
    keto: false,
    paleo: true,
    mediterranean: true,
    antiInflammatory: true,
    antioxidant: true,
    superfood: true
  },
  {
    id: "jabuticaba",
    name: "Jabuticaba",
    brazilianName: "Jabuticaba",
    category: "Fruits",
    subcategory: "Brazilian Fruits",
    imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop&crop=center",
    calories: 58,
    protein: 0.6,
    carbs: 13.1,
    fat: 0.2,
    fiber: 0.8,
    sugar: 0,
    sodium: 1,
    glycemicIndex: 20,
    glycemicLoad: 3,
    vitaminA: 0,
    vitaminC: 22.7,
    vitaminE: 0.1,
    vitaminB1: 0.1,
    vitaminB2: 0.1,
    vitaminB3: 0.1,
    vitaminB6: 0.1,
    folate: 1,
    calcium: 6,
    iron: 0.5,
    magnesium: 12,
    potassium: 127,
    zinc: 0.1,
    healthScore: 90,
    allergens: [],
    servingSize: "100g",
    commonUnits: ["cup", "piece", "gram"],
    description: "Fruto brasileiro rico em antioxidantes e vitamina C",
    origin: "Brazil",
    availability: "Brazil",
    seasonal: true,
    organic: true,
    glutenFree: true,
    vegan: true,
    vegetarian: true,
    keto: false,
    paleo: true,
    mediterranean: true,
    antiInflammatory: true,
    antioxidant: true,
    superfood: true
  },
  {
    id: "pequi",
    name: "Pequi",
    brazilianName: "Pequi",
    category: "Fruits",
    subcategory: "Brazilian Fruits",
    imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop&crop=center",
    calories: 205,
    protein: 2.3,
    carbs: 3.8,
    fat: 18.8,
    fiber: 2.1,
    sugar: 0,
    sodium: 2,
    glycemicIndex: 10,
    glycemicLoad: 1,
    omega3: 0.1,
    omega6: 0.8,
    vitaminA: 0,
    vitaminC: 3.2,
    vitaminE: 0.1,
    vitaminB1: 0.1,
    vitaminB2: 0.1,
    vitaminB3: 0.1,
    vitaminB6: 0.1,
    folate: 1,
    calcium: 8,
    iron: 0.2,
    magnesium: 12,
    potassium: 127,
    zinc: 0.1,
    healthScore: 88,
    allergens: [],
    servingSize: "100g",
    commonUnits: ["piece", "tablespoon", "gram"],
    description: "Fruto do cerrado rico em gorduras saudáveis e antioxidantes",
    origin: "Brazil",
    availability: "Brazil",
    seasonal: true,
    organic: true,
    glutenFree: true,
    vegan: true,
    vegetarian: true,
    keto: true,
    paleo: true,
    mediterranean: true,
    antiInflammatory: true,
    antioxidant: true,
    superfood: true
  },
  {
    id: "buriti",
    name: "Buriti",
    brazilianName: "Buriti",
    category: "Fruits",
    subcategory: "Amazonian Fruits",
    imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop&crop=center",
    calories: 192,
    protein: 2.8,
    carbs: 12.5,
    fat: 15.2,
    fiber: 2.1,
    sugar: 0,
    sodium: 2,
    glycemicIndex: 15,
    glycemicLoad: 2,
    omega3: 0.1,
    omega6: 0.8,
    vitaminA: 0,
    vitaminC: 3.2,
    vitaminE: 0.1,
    vitaminB1: 0.1,
    vitaminB2: 0.1,
    vitaminB3: 0.1,
    vitaminB6: 0.1,
    folate: 1,
    calcium: 8,
    iron: 0.2,
    magnesium: 12,
    potassium: 127,
    zinc: 0.1,
    healthScore: 89,
    allergens: [],
    servingSize: "100g",
    commonUnits: ["piece", "tablespoon", "gram"],
    description: "Fruto amazônico rico em gorduras saudáveis e vitamina A",
    origin: "Brazil",
    availability: "Brazil",
    seasonal: true,
    organic: true,
    glutenFree: true,
    vegan: true,
    vegetarian: true,
    keto: true,
    paleo: true,
    mediterranean: true,
    antiInflammatory: true,
    antioxidant: true,
    superfood: true
  }
];

// Funções utilitárias para busca e análise
export const findFoodByName = (name: string): OpenNutriTrackerFood | undefined => {
  const normalizedName = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  return openNutriTrackerDatabase.find(food => {
    const foodName = food.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const brazilianName = food.brazilianName?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') || '';
    
    return foodName.includes(normalizedName) || brazilianName.includes(normalizedName);
  });
};

export const findFoodsByCategory = (category: string): OpenNutriTrackerFood[] => {
  return openNutriTrackerDatabase.filter(food => 
    food.category.toLowerCase() === category.toLowerCase()
  );
};

export const findSuperfoods = (): OpenNutriTrackerFood[] => {
  return openNutriTrackerDatabase.filter(food => food.superfood);
};

export const findFoodsByDiet = (diet: string): OpenNutriTrackerFood[] => {
  return openNutriTrackerDatabase.filter(food => {
    switch (diet.toLowerCase()) {
      case 'keto':
        return food.keto;
      case 'paleo':
        return food.paleo;
      case 'vegan':
        return food.vegan;
      case 'vegetarian':
        return food.vegetarian;
      case 'mediterranean':
        return food.mediterranean;
      case 'gluten-free':
        return food.glutenFree;
      default:
        return false;
    }
  });
};

export const calculateNutritionalScore = (food: OpenNutriTrackerFood): number => {
  let score = 0;
  
  // Macronutrientes balanceados
  if (food.protein > 10) score += 10;
  if (food.fiber > 5) score += 10;
  if (food.fat < 10) score += 5;
  
  // Vitaminas e minerais
  if (food.vitaminC > 10) score += 5;
  if (food.vitaminA > 100) score += 5;
  if (food.iron > 2) score += 5;
  if (food.calcium > 100) score += 5;
  
  // Propriedades especiais
  if (food.antioxidant) score += 10;
  if (food.antiInflammatory) score += 10;
  if (food.superfood) score += 15;
  
  // Baixo índice glicêmico
  if (food.glycemicIndex && food.glycemicIndex < 30) score += 10;
  
  return Math.min(score, 100);
};

export const getNutritionalBenefits = (food: OpenNutriTrackerFood): string[] => {
  const benefits: string[] = [];
  
  if (food.protein > 15) benefits.push('Alto teor proteico');
  if (food.fiber > 10) benefits.push('Rico em fibras');
  if (food.omega3 > 1) benefits.push('Rico em ômega-3');
  if (food.vitaminC > 50) benefits.push('Rico em vitamina C');
  if (food.antioxidant) benefits.push('Antioxidante');
  if (food.antiInflammatory) benefits.push('Anti-inflamatório');
  if (food.superfood) benefits.push('Superalimento');
  
  return benefits;
};
