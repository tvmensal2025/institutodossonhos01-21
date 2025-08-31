import { DailyQuestion } from '@/types/daily-missions';

export const dailyQuestionsEnhanced: DailyQuestion[] = [
  // SEÇÃO 1: RITUAL DA MANHÃ
  {
    id: 'morning_energy',
    section: 'morning',
    question: 'Como você se sente ao acordar hoje?',
    type: 'scale',
    scale: {
      min: 1,
      max: 5,
      labels: ['Muito mal', 'Mal', 'Normal', 'Bem', 'Muito bem']
    },
    points: 10,
    required: true,
    order: 1,
    tracking: 'energy_level'
  },
  {
    id: 'morning_liquid',
    section: 'morning',
    question: 'Qual foi o primeiro líquido que consumiu?',
    type: 'multiple_choice',
    options: [
      'Água',
      'Café',
      'Chá',
      'Suco',
      'Outro'
    ],
    points: 10,
    required: true,
    order: 2,
    tracking: 'morning_liquid'
  },

  // SEÇÃO 2: HÁBITOS DO DIA - FOCO EM ÁGUA E SONO
  {
    id: 'sleep_hours',
    section: 'habits',
    question: 'Quantas horas você dormiu ontem?',
    type: 'multiple_choice',
    options: [
      'Menos de 6h',
      '6-7h',
      '7-8h',
      '8h+'
    ],
    points: 20,
    required: true,
    order: 3,
    tracking: 'sleep_hours'
  },
  {
    id: 'sleep_quality',
    section: 'habits',
    question: 'Como você avalia a qualidade do seu sono?',
    type: 'scale',
    scale: {
      min: 1,
      max: 5,
      labels: ['Muito ruim', 'Ruim', 'Regular', 'Boa', 'Excelente']
    },
    points: 15,
    required: true,
    order: 4,
    tracking: 'sleep_quality'
  },
  {
    id: 'water_intake_morning',
    section: 'habits',
    question: 'Quantos copos de água você bebeu até agora?',
    type: 'multiple_choice',
    options: [
      '0-2 copos',
      '3-4 copos',
      '5-6 copos',
      '7+ copos'
    ],
    points: 15,
    required: true,
    order: 5,
    tracking: 'water_intake_morning'
  },
  {
    id: 'water_goal_reminder',
    section: 'habits',
    question: 'Você quer definir um lembrete para beber água?',
    type: 'yes_no',
    points: 10,
    required: true,
    order: 6,
    tracking: 'water_reminder'
  },
  {
    id: 'physical_activity',
    section: 'habits',
    question: 'Praticou atividade física hoje?',
    type: 'yes_no',
    points: 15,
    required: true,
    order: 7,
    tracking: 'physical_activity'
  },

  // SEÇÃO 3: MENTE & EMOÇÕES
  {
    id: 'stress_level',
    section: 'mindset',
    question: 'Como está seu nível de estresse hoje?',
    type: 'scale',
    scale: {
      min: 1,
      max: 5,
      labels: ['Muito baixo', 'Baixo', 'Médio', 'Alto', 'Muito alto']
    },
    points: 15,
    required: true,
    order: 8,
    tracking: 'stress_level'
  },
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
    id: 'day_rating',
    section: 'mindset',
    question: 'Como foi seu dia hoje?',
    type: 'scale',
    scale: {
      min: 1,
      max: 5,
      labels: ['Muito ruim', 'Ruim', 'Normal', 'Bom', 'Excelente']
    },
    points: 20,
    required: true,
    order: 10,
    tracking: 'day_rating'
  }
];

export const getQuestionsBySectionEnhanced = (section: 'morning' | 'habits' | 'mindset') => {
  return dailyQuestionsEnhanced
    .filter(q => q.section === section)
    .sort((a, b) => a.order - b.order);
};

export const getSectionTitleEnhanced = (section: 'morning' | 'habits' | 'mindset') => {
  switch (section) {
    case 'morning': return '🌅 MANHÃ';
    case 'habits': return '💧 ÁGUA & SONO';
    case 'mindset': return '🧠 MENTE';
    default: return '';
  }
};

// Funções para calcular dados de tracking
export const calculateWaterIntake = (answer: string): number => {
  switch (answer) {
    case '0-2 copos': return 1;
    case '3-4 copos': return 3.5;
    case '5-6 copos': return 5.5;
    case '7+ copos': return 8;
    default: return 0;
  }
};

export const calculateSleepHours = (answer: string): number => {
  switch (answer) {
    case 'Menos de 6h': return 5;
    case '6-7h': return 6.5;
    case '7-8h': return 7.5;
    case '8h+': return 8.5;
    default: return 0;
  }
}; 