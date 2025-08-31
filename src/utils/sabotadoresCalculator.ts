import { SABOTADORES_CONFIG, SABOTADORES_NOMES } from '../types/sabotadores';

// Função principal para calcular scores dos sabotadores
export const calcularSabotadores = (respostas: (number | null)[], perguntasAtivas: string[]) => {
  const scores: Record<string, number> = {};
  
  Object.keys(SABOTADORES_CONFIG).forEach(sabotador => {
    const indices = SABOTADORES_CONFIG[sabotador as keyof typeof SABOTADORES_CONFIG];
    const soma = indices.reduce((acc, index) => {
      const resposta = respostas[index];
      return acc + (typeof resposta === 'number' ? resposta : 0);
    }, 0);
    scores[sabotador] = Math.round((soma / indices.length) * 20);
  });

  return scores;
};

// Função para obter nome do sabotador
export const getNomeSabotador = (key: string): string => {
  return SABOTADORES_NOMES[key as keyof typeof SABOTADORES_NOMES] || key;
};

// Função para obter dicas do sabotador
export const getDicaSabotador = (key: string) => {
  const dicas = {
    roupas: {
      resumo: "O sabotador das roupas te faz esconder seu corpo e evitar a realidade do espelho. Você se apega a peças antigas como uma forma de segurança, temendo o fracasso e a frustração de não encontrar roupas que sirvam.",
      comoSuperar: "Comece a renovar seu guarda-roupa gradualmente. Doe peças que não servem mais e que trazem memórias ruins. Experimente comprar uma peça nova que te valorize, mesmo que seja um acessório. Encare o espelho como um aliado, não um inimigo, e celebre cada pequena mudança que notar em seu corpo."
    },
    dinheiro: {
      resumo: "Este sabotador associa recompensa e celebração diretamente com comida. O dinheiro na mão se torna um gatilho para gastar com guloseimas e refeições especiais, transformando a alimentação em uma comemoração constante, o que dificulta o controle.",
      comoSuperar: "Crie novas formas de se recompensar que não envolvam comida. Use o dinheiro para investir em um hobby, um passeio, um livro ou roupas novas. Planeje suas finanças para que a comida não seja a principal válvula de escape para suas emoções ou a única forma de celebrar."
    },
    valvula_escape: {
      resumo: "Você usa a comida como uma muleta emocional para lidar com estresse, tristeza, ansiedade e até felicidade. Qualquer emoção intensa se torna um pretexto para comer, criando um ciclo vicioso de comer para aliviar sentimentos, o que gera culpa e mais sentimentos negativos.",
      comoSuperar: "Identifique os gatilhos emocionais. Antes de comer, pergunte-se: 'Estou com fome ou estou sentindo algo?'. Crie uma 'caixa de primeiros socorros emocionais' com alternativas: ligar para um amigo, ouvir música, fazer uma caminhada, escrever em um diário ou praticar respiração profunda."
    },
    prazer_comida: {
      resumo: "Para você, o maior (ou único) prazer da vida é comer. Nenhum outro programa parece tão atraente quanto uma boa refeição. Essa crença te impede de encontrar satisfação em outras áreas da vida, tornando a comida o centro de tudo.",
      comoSuperar: "Expanda seu leque de prazeres. Faça uma lista de 20 coisas que você gosta de fazer e que não envolvam comida (ex: dançar, ler, aprender algo novo, cuidar de plantas). Pratique o 'comer consciente' (mindful eating), saboreando cada pedaço lentamente para aumentar a satisfação com porções menores."
    },
    critico: {
      resumo: "Uma voz interna te julga constantemente, minando sua autoconfiança e fazendo você acreditar que não é capaz de emagrecer. Esse crítico interno te pune por cada deslize, gerando um ciclo de autossabotagem e desistência.",
      comoSuperar: "Dê um nome a essa voz crítica e diga 'Pare!' quando ela aparecer. Pratique a autocompaixão: trate-se com a mesma gentileza que trataria um amigo querido. Anote suas qualidades e pequenas vitórias diárias para fortalecer sua autoimagem positiva."
    },
    boazinha: {
      resumo: "Você tem uma enorme dificuldade em dizer 'não'. Sua necessidade de agradar os outros faz com que você coloque as necessidades deles sempre à frente das suas, inclusive as relacionadas à sua saúde e emagrecimento. Você come para não fazer desfeita e negligencia seus próprios planos.",
      comoSuperar: "Comece a praticar dizer 'não' em situações de baixo risco. Use frases como 'Obrigada, mas vou passar desta vez' ou 'Agradeço o convite, mas tenho outro compromisso (comigo mesma!)'. Lembre-se que cuidar de você não é egoísmo, é uma necessidade."
    },
    estranheza_mudanca: {
      resumo: "Quando você emagrece, se sente desconfortável com sua nova imagem e com os comentários alheios, especialmente os que dizem que você parece 'doente'. Isso gera uma crise de identidade que te leva a voltar aos velhos hábitos para se sentir 'normal' de novo.",
      comoSuperar: "Prepare-se mentalmente para a mudança. Faça afirmações positivas diárias em frente ao espelho, como 'Eu aceito e amo meu novo corpo'. Tenha respostas prontas para comentários negativos, como 'Estou mais saudável do que nunca, obrigada pela preocupação'. Cerque-se de pessoas que apoiam sua transformação."
    },
    magreza_infancia: {
      resumo: "Você associa a magreza a sentimentos negativos da sua infância, como se sentir feia ou fraca. Inconscientemente, você mantém o sobrepeso para se proteger dessas memórias dolorosas e evitar reviver essas emoções.",
      comoSuperar: "Ressignifique suas memórias. Escreva uma carta para a sua 'criança interior', explicando que hoje você é uma adulta forte e que ser magra significa saúde e vitalidade, não fraqueza. A terapia pode ser muito útil para processar essas memórias."
    },
    falta_crencas: {
      resumo: "Após tantas tentativas frustradas, você simplesmente não acredita mais que é capaz de emagrecer. Essa falta de fé se torna uma profecia autorrealizável, onde qualquer obstáculo é visto como a confirmação de que 'não adianta tentar'.",
      comoSuperar: "Quebre o objetivo grande em metas minúsculas e alcançáveis (ex: beber 1 copo de água a mais por dia). Comemore cada micro-vitória para construir um histórico de sucesso. Acompanhe seu progresso em fotos e medidas, não apenas na balança, para ver as mudanças acontecendo."
    },
    atividade_fisica: {
      resumo: "Você odeia a ideia de exercício físico, associando-o a sofrimento, vergonha e comparação. A academia é um ambiente hostil para você, o que te faz desistir do emagrecimento por acreditar que um não existe sem o outro.",
      comoSuperar: "Encontre uma forma de movimento que você goste. Pode ser dançar na sala, caminhar no parque ouvindo música, natação, ioga online. Desvincule 'movimento' de 'academia'. O objetivo é celebrar o que seu corpo pode fazer, não puni-lo."
    },
    crenca_contraria: {
      resumo: "Você acredita que fazer dieta é viver sob pressão e que a alimentação saudável é uma tortura. Essa crença te impede de ver o lado positivo de uma reeducação alimentar, transformando qualquer tentativa em um sofrimento.",
      comoSuperar: "Mude sua perspectiva sobre a alimentação saudável. Explore novas receitas, descubra alimentos saborosos e nutritivos. Foque nos benefícios para sua saúde e bem-estar, não apenas na restrição. Veja a alimentação como autocuidado e prazer."
    },
    obesidade_riqueza: {
      resumo: "Você associa o sobrepeso a riqueza e fartura, e a magreza à pobreza ou doença. Essas crenças, muitas vezes enraizadas na infância, fazem com que você, inconscientemente, resista a emagrecer para não 'perder' essa simbologia de prosperidade.",
      comoSuperar: "Desconstrua essa associação. Entenda que a verdadeira riqueza está na saúde e na qualidade de vida. Busque exemplos de pessoas saudáveis e bem-sucedidas. Relembre que o valor de uma pessoa não está ligado ao seu peso."
    },
    tamanho_fortaleza: {
      resumo: "Você pode ter a crença de que ser grande ou ter um corpo maior te confere força, proteção ou respeito. A ideia de emagrecer pode gerar a sensação de perda de poder ou fragilidade, levando à autossabotagem para manter essa 'fortaleza'.",
      comoSuperar: "Reconheça sua força interior e suas qualidades que independem do seu tamanho físico. Entenda que a saúde e a vitalidade são as verdadeiras fortalezas. Construa uma autoimagem baseada em seus valores e capacidades, não apenas no corpo."
    },
    apego_autoimagem: {
      resumo: "Você se acostumou tanto com sua imagem atual que tem dificuldade em se ver de outra forma. Há um medo inconsciente de não se reconhecer ou de perder a 'identidade' que construiu com seu corpo atual, mesmo que não seja saudável.",
      comoSuperar: "Permita-se a redescoberta. Encare o emagrecimento como uma oportunidade de se reconectar com uma versão mais saudável e feliz de si. Peça para amigos e familiares próximos reforçarem sua nova imagem de forma positiva. Abrace o processo de autotransformação."
    },
    problemas_conjuge: {
      resumo: "Você pode estar sabotando seu emagrecimento devido a medos relacionados ao seu relacionamento. Ciúmes do parceiro, medo de atrair outros ou de mudanças na dinâmica da relação podem fazer com que você, inconscientemente, prefira manter o peso.",
      comoSuperar: "Abra o diálogo com seu cônjuge sobre seus objetivos e medos. O apoio e a compreensão mútua são essenciais. Se o ciúme é um problema, trabalhem juntos na confiança e na segurança da relação. Lembre-se que cuidar de si fortalece a parceria."
    },
    fuga_beleza: {
      resumo: "Em algum momento da vida, a sua beleza pode ter gerado desconforto, inveja ou problemas. Isso pode ter levado à crença de que é 'perigoso' ser bonito(a), e você inconscientemente se sabota para evitar a atenção ou as consequências da sua própria beleza.",
      comoSuperar: "Reconheça e aceite sua beleza como parte de quem você é. Desconstrua a ideia de que ser bonito(a) é um fardo. Entenda que o valor de uma pessoa vai além da aparência física. O foco deve ser na saúde e bem-estar, não na busca por uma 'aparência perigosa'."
    },
    protecao_filhos: {
      resumo: "Você se sente na obrigação de viver apenas para seus filhos e família, negligenciando suas próprias necessidades e bem-estar. A maternidade/paternidade se torna uma 'desculpa' para não cuidar de si, acreditando que é um ato de abnegação.",
      comoSuperar: "Entenda que cuidar de si é fundamental para cuidar bem dos outros. Ser um exemplo de saúde e autocuidado para seus filhos é um dos maiores presentes que você pode dar a eles. Reserve um tempo diário para você, sem culpa, seja para exercício, leitura ou relaxamento."
    },
    fuga_afetiva: {
      resumo: "Você pode estar usando o excesso de peso como uma barreira para a intimidade ou para evitar situações de vulnerabilidade emocional e sexual. A comida se torna um refúgio para não lidar com questões de afeto ou sexualidade.",
      comoSuperar: "Busque apoio profissional para trabalhar questões de intimidade e sexualidade. Explore outras formas de prazer e conexão emocional. Entenda que a comida é alimento, não um substituto para o afeto ou para a expressão da sua sexualidade."
    },
    biotipo_identidade: {
      resumo: "Você pode ter a crença de que seu biotipo ou sua identidade está ligada ao seu peso atual. Experiências passadas, como ser muito magro(a) na infância e se sentir fraco(a), podem fazer com que você, inconscientemente, evite retornar àquele estado, mesmo que não seja saudável.",
      comoSuperar: "Aceite seu biotipo, mas busque sua melhor versão saudável dentro dele. Foque na saúde e no bem-estar, não em atingir um peso que o fez mal no passado. O importante é o equilíbrio e a sensação de vitalidade no presente."
    },
    comida_afeto: {
      resumo: "Em sua família, o amor e o afeto sempre foram muito associados à comida. Reuniões fartas, elogios ao comer muito, e a comida como conforto em momentos difíceis, fizeram com que você associasse o ato de comer a ser amado(a) e aceito(a).",
      comoSuperar: "Encontre novas formas de dar e receber afeto que não envolvam comida. Cultive conversas significativas, abraços, tempo de qualidade e palavras de afirmação. Redefina a forma como você celebra e expressa amor na família, inserindo atividades não-alimentares."
    },
    perdas_presente: {
      resumo: "Você está lidando com perdas significativas no presente (término de relacionamento, perda de emprego, desilusões). A comida se torna uma forma de lidar com a tristeza, frustração e falta de propósito, preenchendo um vazio emocional.",
      comoSuperar: "Procure ajuda profissional (terapia) para processar suas perdas. Desenvolva mecanismos de enfrentamento saudáveis, como exercícios, hobbies, meditação, ou buscar apoio em grupos de suporte. Permita-se sentir as emoções sem recorrer à comida como escape."
    },
    perdas_infancia: {
      resumo: "Traumas ou perdas na infância (separação dos pais, ausência, falta de atenção) podem ter levado você a usar a comida como conforto ou preenchimento de um vazio emocional. Essa programação inconsciente persiste na vida adulta, dificultando o emagrecimento.",
      comoSuperar: "Reconheça e valide a dor da sua criança interior. Busque apoio terapêutico para trabalhar esses traumas e ressignificar essas experiências. A comida não pode curar feridas emocionais. Entenda que você merece amor e atenção agora, e que pode se dar isso a si mesmo de formas saudáveis."
    }
  };
  
  return dicas[key] || { 
    resumo: "Seu padrão de comportamento interfere nos seus objetivos.", 
    comoSuperar: "Identificar a raiz desse comportamento é o primeiro passo. Busque entender o que te leva a agir dessa forma e procure ajuda profissional para desenvolver novas estratégias e fortalecer sua jornada de emagrecimento." 
  };
};

// Função para obter categoria da pergunta
export const getCategoriaPergunta = (id: number): string => {
  const categorias = {
    'Emocional': [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34, 37, 40, 43, 46, 49, 52, 55, 58, 61, 64, 67, 70, 73, 76, 79, 82, 85, 88, 91, 94, 97, 100, 103, 106, 109, 112, 115],
    'Autocrítica': [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35, 38, 41, 44, 47, 50, 53, 56, 59, 62, 65, 68, 71, 74, 77, 80, 83, 86, 89, 92, 95, 98, 101, 104, 107, 110, 113],
    'Comportamento Alimentar': [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36, 39, 42, 45, 48, 51, 54, 57, 60, 63, 66, 69, 72, 75, 78, 81, 84, 87, 90, 93, 96, 99, 102, 105, 108, 111, 114],
    'Imagem Corporal': [5, 15, 25, 35, 45, 55, 65, 75, 85, 95, 105, 115]
  };
  
  for (const [categoria, ids] of Object.entries(categorias)) {
    if (ids.includes(id)) {
      return categoria;
    }
  }
  return 'outros';
}; 