import { DailyQuestion } from '@/types/daily-missions';

export const dailyQuestions: DailyQuestion[] = [
  // SEÇÃO 1: RITUAL DA MANHÃ
  {
    id: 'morning_liquid',
    section: 'morning',
    question: '🫖 Qual foi o primeiro líquido que consumiu?',
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
    order: 1
  },
  {
    id: 'morning_connection',
    section: 'morning',
    question: '🧘‍♀️ Praticou algum momento de conexão interna?',
    type: 'multiple_choice',
    options: [
      'Oração',
      'Meditação',
      'Respiração consciente',
      'Não fiz hoje'
    ],
    points: 15,
    required: true,
    order: 2
  },
  {
    id: 'morning_energy',
    section: 'morning',
    question: '📿 Como você classificaria sua energia ao acordar?',
    type: 'emoji_scale',
    scale: {
      min: 1,
      max: 5,
      labels: ['Muito baixa', 'Baixa', 'Normal', 'Alta', 'Muito alta'],
      emojis: ['😴', '😐', '🙂', '😊', '🤩']
    },
    points: 10,
    required: true,
    order: 3
  },

  // SEÇÃO 2: HÁBITOS DO DIA
  {
    id: 'sleep_hours',
    section: 'habits',
    question: '💤 Quantas horas você dormiu?',
    type: 'multiple_choice',
    options: [
      '4h ou menos',
      '6h',
      '8h',
      '9h+'
    ],
    points: 20,
    required: true,
    order: 4
  },
  {
    id: 'water_intake',
    section: 'habits',
    question: '💧 Quanto de água você bebeu hoje?',
    type: 'multiple_choice',
    options: [
      'Menos de 500ml',
      '1L',
      '2L',
      '3L ou mais'
    ],
    points: 25,
    required: true,
    order: 5
  },
  {
    id: 'physical_activity',
    section: 'habits',
    question: '🏃‍♀️ Praticou atividade física hoje?',
    type: 'yes_no',
    points: 30,
    required: true,
    order: 6
  },
  {
    id: 'stress_level',
    section: 'habits',
    question: '😰 Como está seu nível de estresse hoje? (1 = Muito baixo, 5 = Muito alto)',
    type: 'scale',
    scale: {
      min: 1,
      max: 5,
      labels: ['Muito baixo', 'Baixo', 'Médio', 'Alto', 'Muito alto']
    },
    points: 15,
    required: true,
    order: 7
  },
  {
    id: 'emotional_hunger',
    section: 'habits',
    question: '🍫 Sentiu fome emocional hoje?',
    type: 'yes_no',
    points: 10,
    required: true,
    order: 8
  },

  // SEÇÃO 3: MENTE & EMOÇÕES
  {
    id: 'gratitude',
    section: 'mindset',
    question: '🙏 Pelo que você é grato hoje?',
    type: 'multiple_choice',
    options: [
      'Minha saúde',
      'Minha família',
      'Meu trabalho',
      'Meu corpo',
      'Outro'
    ],
    points: 20,
    required: true,
    order: 9
  },
  {
    id: 'small_victory',
    section: 'mindset',
    question: '🏆 Qual foi sua pequena vitória hoje?',
    type: 'text',
    placeholder: 'Conte sobre algo que você fez bem hoje, por menor que seja...',
    points: 25,
    required: true,
    order: 10
  },
  {
    id: 'tomorrow_intention',
    section: 'mindset',
    question: '🌱 Qual sua intenção para amanhã?',
    type: 'multiple_choice',
    options: [
      'Cuidar de mim',
      'Estar presente',
      'Fazer melhor',
      'Outro'
    ],
    points: 15,
    required: true,
    order: 11
  },
  {
    id: 'day_rating',
    section: 'mindset',
    question: '⭐ Como foi seu dia hoje? (1 = Muito ruim, 5 = Excelente)',
    type: 'star_scale',
    scale: {
      min: 1,
      max: 5,
      labels: ['Muito ruim', 'Ruim', 'Normal', 'Bom', 'Excelente'],
      stars: true
    },
    points: 30,
    required: true,
    order: 12
  }
];

export const getQuestionsBySection = (section: 'morning' | 'habits' | 'mindset') => {
  return dailyQuestions
    .filter(q => q.section === section)
    .sort((a, b) => a.order - b.order);
};

export const getSectionTitle = (section: 'morning' | 'habits' | 'mindset') => {
  switch (section) {
    case 'morning':
      return '🌅 RITUAL DA MANHÃ';
    case 'habits':
      return '💪 HÁBITOS DO DIA';
    case 'mindset':
      return '🧠 MENTE & EMOÇÕES';
    default:
      return '';
  }
};

export const getSectionDescription = (section: 'morning' | 'habits' | 'mindset') => {
  switch (section) {
    case 'morning':
      return 'Como você iniciou o seu dia hoje?';
    case 'habits':
      return 'Agora me conte como foi seu autocuidado ao longo do dia.';
    case 'mindset':
      return 'Agora vamos cuidar da sua mente e das suas emoções.';
    default:
      return '';
  }
}; 