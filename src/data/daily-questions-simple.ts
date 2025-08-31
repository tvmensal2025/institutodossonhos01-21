import { DailyQuestion } from '@/types/daily-missions';

export const dailyQuestionsSimple: DailyQuestion[] = [
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
    order: 1
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
    order: 2
  },

  // SEÇÃO 2: HÁBITOS DO DIA
  {
    id: 'sleep_hours',
    section: 'habits',
    question: 'Quantas horas você dormiu?',
    type: 'multiple_choice',
    options: [
      'Menos de 6h',
      '6-7h',
      '7-8h',
      '8h+'
    ],
    points: 15,
    required: true,
    order: 3
  },
  {
    id: 'water_intake',
    section: 'habits',
    question: 'Quanto de água você bebeu hoje?',
    type: 'multiple_choice',
    options: [
      'Menos de 1L',
      '1-2L',
      '2-3L',
      '3L+'
    ],
    points: 15,
    required: true,
    order: 4
  },
  {
    id: 'physical_activity',
    section: 'habits',
    question: 'Praticou atividade física hoje?',
    type: 'yes_no',
    points: 20,
    required: true,
    order: 5
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
    order: 6
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
    order: 7
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
    order: 8
  }
];

export const getQuestionsBySectionSimple = (section: 'morning' | 'habits' | 'mindset') => {
  return dailyQuestionsSimple
    .filter(q => q.section === section)
    .sort((a, b) => a.order - b.order);
};

export const getSectionTitleSimple = (section: 'morning' | 'habits' | 'mindset') => {
  switch (section) {
    case 'morning': return '🌅 MANHÃ';
    case 'habits': return '💪 HÁBITOS';
    case 'mindset': return '🧠 MENTE';
    default: return '';
  }
}; 