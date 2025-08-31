interface MensagemMotivacional {
  texto: string;
  emoji?: string;
  categoria: string[];  // Permite múltiplas categorias
  intensidade?: 'suave' | 'moderada' | 'intensa';
  contexto?: ('manha' | 'tarde' | 'noite' | 'sempre')[];
}

export const mensagensMotivacionais: MensagemMotivacional[] = [
  // SAUDAÇÕES MATINAIS
  {
    texto: "Bom dia! O sol nasceu trazendo novas oportunidades",
    emoji: "🌅",
    categoria: ["saudacao", "otimismo"],
    contexto: ["manha"]
  },
  {
    texto: "Que sua manhã seja tão brilhante quanto seu potencial",
    emoji: "✨",
    categoria: ["saudacao", "inspiracao"],
    contexto: ["manha"]
  },
  {
    texto: "Acordar cedo é o primeiro passo para conquistar o dia",
    emoji: "🌄",
    categoria: ["saudacao", "disciplina"],
    contexto: ["manha"]
  },
  {
    texto: "Um novo dia, um novo capítulo da sua história de sucesso",
    emoji: "📖",
    categoria: ["saudacao", "motivacao"],
    contexto: ["manha"]
  },

  // SAUDAÇÕES VESPERTINAS
  {
    texto: "Boa tarde! Continue brilhando e inspirando",
    emoji: "☀️",
    categoria: ["saudacao", "motivacao"],
    contexto: ["tarde"]
  },
  {
    texto: "A tarde é perfeita para renovar suas energias",
    emoji: "🌤️",
    categoria: ["saudacao", "energia"],
    contexto: ["tarde"]
  },
  {
    texto: "Que sua tarde seja produtiva e cheia de conquistas",
    emoji: "💪",
    categoria: ["saudacao", "produtividade"],
    contexto: ["tarde"]
  },
  {
    texto: "Aproveite cada momento desta tarde para evoluir",
    emoji: "🚀",
    categoria: ["saudacao", "crescimento"],
    contexto: ["tarde"]
  },

  // SAUDAÇÕES NOTURNAS
  {
    texto: "Boa noite! Hora de celebrar as vitórias do dia",
    emoji: "🌙",
    categoria: ["saudacao", "gratidao"],
    contexto: ["noite"]
  },
  {
    texto: "Que sua noite seja tranquila e renovadora",
    emoji: "✨",
    categoria: ["saudacao", "descanso"],
    contexto: ["noite"]
  },
  {
    texto: "Descanse com a certeza de que deu o seu melhor",
    emoji: "💫",
    categoria: ["saudacao", "realizacao"],
    contexto: ["noite"]
  },
  {
    texto: "A noite é o momento de recarregar para novos desafios",
    emoji: "🌠",
    categoria: ["saudacao", "preparacao"],
    contexto: ["noite"]
  },

  // SAÚDE E BEM-ESTAR
  {
    texto: "Cada escolha saudável é um investimento em você",
    emoji: "🥗",
    categoria: ["saude", "alimentacao"],
    contexto: ["sempre"]
  },
  {
    texto: "Seu corpo é seu templo, cuide dele com amor",
    emoji: "💝",
    categoria: ["saude", "autocuidado"],
    contexto: ["sempre"]
  },
  {
    texto: "Movimento é vida, celebre a capacidade de se exercitar",
    emoji: "🏃‍♂️",
    categoria: ["saude", "exercicio"],
    contexto: ["sempre"]
  },
  {
    texto: "Hidratação é a chave para uma vida mais saudável",
    emoji: "💧",
    categoria: ["saude", "hidratacao"],
    contexto: ["sempre"]
  },

  // CONQUISTAS E REALIZAÇÕES
  {
    texto: "Pequenos progressos levam a grandes vitórias",
    emoji: "🎯",
    categoria: ["conquista", "progresso"],
    contexto: ["sempre"]
  },
  {
    texto: "Cada passo é uma conquista a ser celebrada",
    emoji: "👣",
    categoria: ["conquista", "celebracao"],
    contexto: ["sempre"]
  },
  {
    texto: "Suas conquistas são reflexo da sua dedicação",
    emoji: "🏆",
    categoria: ["conquista", "dedicacao"],
    contexto: ["sempre"]
  },
  {
    texto: "O sucesso é a soma de pequenos esforços repetidos",
    emoji: "📈",
    categoria: ["conquista", "persistencia"],
    contexto: ["sempre"]
  },

  // SUPERAÇÃO E RESILIÊNCIA
  {
    texto: "Os obstáculos são degraus para o sucesso",
    emoji: "🏔️",
    categoria: ["superacao", "desafios"],
    contexto: ["sempre"]
  },
  {
    texto: "A persistência é o caminho do êxito",
    emoji: "🎯",
    categoria: ["superacao", "persistencia"],
    contexto: ["sempre"]
  },
  {
    texto: "Cada desafio é uma oportunidade de crescimento",
    emoji: "🌱",
    categoria: ["superacao", "crescimento"],
    contexto: ["sempre"]
  },
  {
    texto: "A força está em nunca desistir dos seus sonhos",
    emoji: "💫",
    categoria: ["superacao", "motivacao"],
    contexto: ["sempre"]
  },

  // DESENVOLVIMENTO PESSOAL
  {
    texto: "Invista em você, seu maior patrimônio",
    emoji: "📚",
    categoria: ["desenvolvimento", "autoconhecimento"],
    contexto: ["sempre"]
  },
  {
    texto: "Conhecimento é poder, nunca pare de aprender",
    emoji: "🧠",
    categoria: ["desenvolvimento", "aprendizado"],
    contexto: ["sempre"]
  },
  {
    texto: "Seja melhor que ontem, mas não melhor que ninguém",
    emoji: "🎯",
    categoria: ["desenvolvimento", "crescimento"],
    contexto: ["sempre"]
  },
  {
    texto: "O autoconhecimento é a base da evolução",
    emoji: "🔍",
    categoria: ["desenvolvimento", "autoconhecimento"],
    contexto: ["sempre"]
  },

  // GRATIDÃO E MINDFULNESS
  {
    texto: "A gratidão transforma o que temos em suficiente",
    emoji: "🙏",
    categoria: ["gratidao", "mindfulness"],
    contexto: ["sempre"]
  },
  {
    texto: "Viva o presente, é nele que a vida acontece",
    emoji: "🎁",
    categoria: ["gratidao", "presenca"],
    contexto: ["sempre"]
  },
  {
    texto: "Agradecer é reconhecer a beleza da vida",
    emoji: "💝",
    categoria: ["gratidao", "reconhecimento"],
    contexto: ["sempre"]
  },
  {
    texto: "Cada momento é uma dádiva a ser celebrada",
    emoji: "✨",
    categoria: ["gratidao", "celebracao"],
    contexto: ["sempre"]
  },

  // PRODUTIVIDADE E FOCO
  {
    texto: "Foco é dizer não para mil boas ideias",
    emoji: "🎯",
    categoria: ["produtividade", "foco"],
    contexto: ["sempre"]
  },
  {
    texto: "Organize suas prioridades e conquiste seus objetivos",
    emoji: "📋",
    categoria: ["produtividade", "organizacao"],
    contexto: ["sempre"]
  },
  {
    texto: "Pequenas ações consistentes geram grandes resultados",
    emoji: "⚡",
    categoria: ["produtividade", "consistencia"],
    contexto: ["sempre"]
  },
  {
    texto: "Disciplina é a ponte entre metas e conquistas",
    emoji: "🌉",
    categoria: ["produtividade", "disciplina"],
    contexto: ["sempre"]
  },

  // RELACIONAMENTOS E CONEXÕES
  {
    texto: "Cultive relações que te fazem crescer",
    emoji: "🤝",
    categoria: ["relacionamentos", "crescimento"],
    contexto: ["sempre"]
  },
  {
    texto: "Seja a energia positiva que você quer receber",
    emoji: "✨",
    categoria: ["relacionamentos", "positividade"],
    contexto: ["sempre"]
  },
  {
    texto: "Empatia é a linguagem do coração",
    emoji: "💝",
    categoria: ["relacionamentos", "empatia"],
    contexto: ["sempre"]
  },
  {
    texto: "Juntos somos mais fortes",
    emoji: "🤗",
    categoria: ["relacionamentos", "uniao"],
    contexto: ["sempre"]
  },

  // PROPÓSITO E SIGNIFICADO
  {
    texto: "Encontre significado em cada ação",
    emoji: "🎯",
    categoria: ["proposito", "significado"],
    contexto: ["sempre"]
  },
  {
    texto: "Seu propósito é maior que seus medos",
    emoji: "🦋",
    categoria: ["proposito", "coragem"],
    contexto: ["sempre"]
  },
  {
    texto: "Viva com propósito, inspire pessoas",
    emoji: "✨",
    categoria: ["proposito", "inspiracao"],
    contexto: ["sempre"]
  },
  {
    texto: "Deixe sua marca positiva no mundo",
    emoji: "🌍",
    categoria: ["proposito", "impacto"],
    contexto: ["sempre"]
  },

  // CRIATIVIDADE E INOVAÇÃO
  {
    texto: "A criatividade é a inteligência se divertindo",
    emoji: "🎨",
    categoria: ["criatividade", "diversao"],
    contexto: ["sempre"]
  },
  {
    texto: "Pense diferente, crie o extraordinário",
    emoji: "💡",
    categoria: ["criatividade", "inovacao"],
    contexto: ["sempre"]
  },
  {
    texto: "Sua imaginação é o limite do possível",
    emoji: "🚀",
    categoria: ["criatividade", "possibilidades"],
    contexto: ["sempre"]
  },
  {
    texto: "Inove, inspire, transforme",
    emoji: "✨",
    categoria: ["criatividade", "transformacao"],
    contexto: ["sempre"]
  },

  // EQUILÍBRIO E HARMONIA
  {
    texto: "Equilibre corpo, mente e espírito",
    emoji: "☯️",
    categoria: ["equilibrio", "harmonia"],
    contexto: ["sempre"]
  },
  {
    texto: "A paz interior é o maior tesouro",
    emoji: "🕊️",
    categoria: ["equilibrio", "paz"],
    contexto: ["sempre"]
  },
  {
    texto: "Harmonia é o resultado do autoconhecimento",
    emoji: "🎭",
    categoria: ["equilibrio", "autoconhecimento"],
    contexto: ["sempre"]
  },
  {
    texto: "Encontre seu centro em meio ao caos",
    emoji: "🧘‍♂️",
    categoria: ["equilibrio", "centralizacao"],
    contexto: ["sempre"]
  }
];

// Função para obter mensagens por categoria e contexto
export const getMensagensPorCategoria = (
  categoria: string,
  contexto?: 'manha' | 'tarde' | 'noite' | 'sempre'
): MensagemMotivacional[] => {
  return mensagensMotivacionais.filter(msg => 
    msg.categoria.includes(categoria) && 
    (!contexto || msg.contexto?.includes(contexto) || msg.contexto?.includes('sempre'))
  );
};

// Função para obter uma mensagem aleatória por categoria e contexto
export const getMensagemAleatoria = (
  categoria: string,
  contexto?: 'manha' | 'tarde' | 'noite' | 'sempre'
): MensagemMotivacional => {
  const mensagensFiltradas = getMensagensPorCategoria(categoria, contexto);
  return mensagensFiltradas[Math.floor(Math.random() * mensagensFiltradas.length)];
};

// Função para obter saudação baseada no horário
export const getSaudacao = (hora: number): MensagemMotivacional => {
  const contexto = hora < 12 ? 'manha' : hora < 18 ? 'tarde' : 'noite';
  return getMensagemAleatoria('saudacao', contexto);
};

// Função para obter mensagem motivacional baseada no contexto
export const getMensagemMotivacional = (
  categorias: string[],
  contexto?: 'manha' | 'tarde' | 'noite' | 'sempre'
): MensagemMotivacional => {
  const categoria = categorias[Math.floor(Math.random() * categorias.length)];
  return getMensagemAleatoria(categoria, contexto);
}; 