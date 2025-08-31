import { DailyQuestion } from '@/types/daily-missions';

export const dailyQuestionsFinal: DailyQuestion[] = [
  // SEÇÃO 1: RITUAL DA MANHÃ
  {
    id: 'morning_liquid',
    section: 'morning',
    question: 'Qual foi o primeiro líquido que consumiu?',
    type: 'multiple_choice',
    options: [
      'Água morna com limão',
      'Chá natural',
      'Café puro',
      'Água gelada',
      'Outro'
    ],
    points: 10,
    required: true,
    order: 1,
    tracking: 'morning_liquid'
  },
  {
    id: 'internal_connection',
    section: 'morning',
    question: 'Praticou algum momento de conexão interna?',
    type: 'multiple_choice',
    options: [
      'Oração',
      'Meditação',
      'Respiração consciente',
      'Não fiz hoje'
    ],
    points: 15,
    required: true,
    order: 2,
    tracking: 'internal_connection'
  },
  {
    id: 'morning_energy',
    section: 'morning',
    question: 'Como você classificaria sua energia ao acordar?',
    type: 'scale',
    scale: {
      min: 1,
      max: 5,
      labels: ['Muito baixo', 'Baixo', 'Médio', 'Alto', 'Muito alto'],
      emojis: ['😴', '😐', '🙂', '😊', '🤩']
    },
    points: 15,
    required: true,
    order: 3,
    tracking: 'energy_level'
  },

  // SEÇÃO 2: HÁBITOS DO DIA
  {
    id: 'sleep_hours',
    section: 'habits',
    question: 'Quantas horas você dormiu?',
    type: 'multiple_choice',
    options: [
      '4h ou menos',
      '6h',
      '8h',
      '9h+'
    ],
    points: 20,
    required: true,
    order: 4,
    tracking: 'sleep_hours'
  },
  {
    id: 'water_intake',
    section: 'habits',
    question: 'Quanto de água você bebeu hoje?',
    type: 'multiple_choice',
    options: [
      'Menos de 500ml',
      '1L',
      '2L',
      '3L ou mais'
    ],
    points: 15,
    required: true,
    order: 5,
    tracking: 'water_intake'
  },
  {
    id: 'physical_activity',
    section: 'habits',
    question: 'Praticou atividade física hoje?',
    type: 'yes_no',
    points: 15,
    required: true,
    order: 6,
    tracking: 'physical_activity'
  },
  {
    id: 'stress_level',
    section: 'habits',
    question: 'Como está seu nível de estresse hoje?',
    type: 'scale',
    scale: {
      min: 1,
      max: 5,
      labels: ['Muito baixo', 'Baixo', 'Médio', 'Alto', 'Muito alto']
    },
    points: 15,
    required: true,
    order: 7,
    tracking: 'stress_level'
  },
  {
    id: 'emotional_hunger',
    section: 'habits',
    question: 'Sentiu fome emocional hoje?',
    type: 'yes_no',
    points: 10,
    required: true,
    order: 8,
    tracking: 'emotional_hunger'
  },

  // SEÇÃO 3: MENTE & EMOÇÕES
  {
    id: 'gratitude',
    section: 'mindset',
    question: 'Pelo que você é grato hoje?',
    type: 'multiple_choice',
    options: [
      'Minha saúde',
      'Minha família',
      'Meu trabalho',
      'Meu corpo',
      'Outro'
    ],
    points: 15,
    required: true,
    order: 9,
    tracking: 'gratitude'
  },
  {
    id: 'small_victory',
    section: 'mindset',
    question: 'Qual foi sua pequena vitória hoje?',
    type: 'text',
    placeholder: 'Conte sobre sua conquista do dia...',
    points: 20,
    required: true,
    order: 10,
    tracking: 'small_victory'
  },
  {
    id: 'tomorrow_intention',
    section: 'mindset',
    question: 'Qual sua intenção para amanhã?',
    type: 'multiple_choice',
    options: [
      'Cuidar de mim',
      'Estar presente',
      'Fazer melhor',
      'Outro'
    ],
    points: 15,
    required: true,
    order: 11,
    tracking: 'tomorrow_intention'
  },
  {
    id: 'day_rating',
    section: 'mindset',
    question: 'Como foi seu dia hoje?',
    type: 'star_scale',
    scale: {
      min: 1,
      max: 5,
      labels: ['Muito ruim', 'Ruim', 'Normal', 'Bom', 'Excelente'],
      stars: true
    },
    points: 20,
    required: true,
    order: 12,
    tracking: 'day_rating'
  }
];

export const getQuestionsBySectionFinal = (section: 'morning' | 'habits' | 'mindset') => {
  return dailyQuestionsFinal
    .filter(q => q.section === section)
    .sort((a, b) => a.order - b.order);
};

export const getSectionTitleFinal = (section: 'morning' | 'habits' | 'mindset') => {
  switch (section) {
    case 'morning': return '🌅 RITUAL DA MANHÃ';
    case 'habits': return '💪 HÁBITOS DO DIA';
    case 'mindset': return '🧠 MENTE & EMOÇÕES';
    default: return '';
  }
};

// Funções para calcular dados de tracking
export const calculateWaterIntake = (answer: string): number => {
  switch (answer) {
    case 'Menos de 500ml': return 250;
    case '1L': return 1000;
    case '2L': return 2000;
    case '3L ou mais': return 3000;
    default: return 0;
  }
};

export const calculateSleepHours = (answer: string): number => {
  switch (answer) {
    case '4h ou menos': return 4;
    case '6h': return 6;
    case '8h': return 8;
    case '9h+': return 9;
    default: return 0;
  }
}; 