// Tipos para o Sistema de Sabotadores

export interface PerguntaComLixeira {
  id: number;
  texto: string;
  ativa: boolean;
  naLixeira: boolean;
  dataExclusao?: Date;
  categoria?: string;
}

export interface Answer {
  questionId: number;
  value: any;
  category: string;
}

export interface Question {
  id: number;
  text: string;
  type: 'scale' | 'multiple_choice' | 'matrix' | 'image_selection' | 'drawing';
  category: string;
  required: boolean;
  options: any;
}

export interface SabotadorScore {
  [key: string]: number;
}

export interface SabotadorDica {
  resumo: string;
  comoSuperar: string;
}

export interface SabotadoresResult {
  userId: string;
  userEmail: string;
  categories: {
    Emocional: number;
    Autocrítica: number;
    "Comportamento Alimentar": number;
    "Imagem Corporal": number;
  };
  totalScore: number;
  insights: string[];
  recommendations: string[];
  completedAt: string;
}

// Configuração dos 24 Sabotadores
export const SABOTADORES_CONFIG = {
  roupas: [0, 1, 2, 3, 4],
  dinheiro: [5, 6, 7, 8, 9],
  estranheza_mudanca: [10, 11, 12, 13, 14],
  magreza_infancia: [15, 16, 17, 18, 19],
  rivalidade: [20, 21, 22, 23, 24],
  valvula_escape: [25, 26, 27, 28, 29],
  falta_crencas: [30, 31, 32, 33, 34],
  atividade_fisica: [35, 36, 37, 38, 39],
  crenca_contraria: [40, 41, 42, 43, 44],
  prazer_comida: [45, 46, 47, 48, 49],
  obesidade_riqueza: [50, 51, 52, 53, 54],
  tamanho_fortaleza: [55, 56, 57, 58, 59],
  apego_autoimagem: [60, 61, 62, 63, 64],
  problemas_conjuge: [65, 66, 67, 68, 69],
  fuga_beleza: [70, 71, 72, 73, 74],
  protecao_filhos: [75, 76, 77, 78, 79],
  fuga_afetiva: [80, 81, 82, 83, 84],
  biotipo_identidade: [85, 86, 87, 88, 89],
  comida_afeto: [90, 91, 92, 93, 94],
  perdas_presente: [95, 96, 97, 98, 99],
  perdas_infancia: [100, 101, 102, 103, 104],
  critico: [105, 106, 107, 108, 109],
  boazinha: [110, 111, 112, 113, 114]
};

// Nomes dos Sabotadores
export const SABOTADORES_NOMES = {
  roupas: "Sabotador das Roupas",
  dinheiro: "Sabotador do Dinheiro",
  estranheza_mudanca: "Estranheza da Mudança",
  magreza_infancia: "Magreza da Infância",
  rivalidade: "Rivalidade",
  valvula_escape: "Válvula de Escape",
  falta_crencas: "Falta de Crenças",
  atividade_fisica: "Atividade Física",
  crenca_contraria: "Crença Contrária",
  prazer_comida: "Prazer da Comida",
  obesidade_riqueza: "Obesidade como Riqueza",
  tamanho_fortaleza: "Tamanho como Fortaleza",
  apego_autoimagem: "Apego à Autoimagem",
  problemas_conjuge: "Problemas com Cônjuge",
  fuga_beleza: "Fuga da Beleza",
  protecao_filhos: "Proteção dos Filhos",
  fuga_afetiva: "Fuga Afetiva",
  biotipo_identidade: "Biotipo e Identidade",
  comida_afeto: "Comida como Afeto",
  perdas_presente: "Perdas no Presente",
  perdas_infancia: "Perdas na Infância",
  critico: "Crítico Interno",
  boazinha: "Boazinha Demais"
}; 