// Explicações médicas educativas para relatórios premium
export interface MedicalExplanation {
  category: string;
  icon: string;
  title: string;
  explanation: string;
}

export const medicalExplanations: MedicalExplanation[] = [
  // Perfil Lipídico
  {
    category: "lipidico",
    icon: "🫀",
    title: "Colesterol Total — Como funciona?",
    explanation: "O laboratório mede o colesterol total no sangue, que é a soma do que circula nas \"ruas do corpo\": o que é transportado por LDL/VLDL e o que é recolhido pelo HDL. É um retrato pontual do tráfego de colesterol e pode variar conforme alimentação recente, álcool, medicações e condições clínicas."
  },
  {
    category: "lipidico",
    icon: "🫀",
    title: "LDL — Como funciona?",
    explanation: "Quantifica o colesterol que viaja nos \"caminhões LDL\", os que têm maior tendência a aderir às paredes das artérias. Dependendo do laboratório, o LDL pode ser medido diretamente ou calculado a partir de Total, HDL e triglicerídeos. Por refletir média recente, é sensível a jejum/álcool, dieta e hormônios da tireoide."
  },
  {
    category: "lipidico",
    icon: "🫀",
    title: "HDL — Como funciona?",
    explanation: "Mede o colesterol presente no \"caminhão de limpeza\": partículas que retiram excesso de gordura dos tecidos e levam de volta ao fígado. Parte do nível é constitucional (genética), mas atividade física, peso corporal e hábitos influenciam bastante ao longo do tempo."
  },
  {
    category: "lipidico",
    icon: "🫀",
    title: "Triglicerídeos (TG) — Como funciona?",
    explanation: "Dosam a gordura de transporte que sobe facilmente após açúcares, refeições ricas e álcool. Mesmo com jejum, os TG refletem como o corpo processa e estoca energia. Varia com resistência à insulina, peso abdominal, medicações e doenças da tireoide."
  },
  {
    category: "lipidico",
    icon: "🫀",
    title: "VLDL — Como funciona?",
    explanation: "Avalia (muitas vezes estima) as partículas que o fígado fabrica para levar triglicerídeos até os tecidos. Como acompanha de perto os TG, tende a subir e descer junto com eles. Em jejum inadequado ou TG muito alto, a estimativa perde precisão."
  },
  {
    category: "lipidico",
    icon: "🫀",
    title: "Colesterol não-HDL — Como funciona?",
    explanation: "É um valor derivado: Total – HDL. Na prática, reúne todas as frações que podem \"sujar os canos\" (LDL, VLDL e remanescentes). Por agregar múltiplas partículas, costuma ser estável mesmo quando os TG variam."
  },
  {
    category: "lipidico",
    icon: "🫀",
    title: "ApoB — Como funciona?",
    explanation: "É a contagem direta da proteína ApoB, presente uma por partícula nas lipoproteínas que podem entupir (LDL, VLDL, IDL, Lp(a)). Em vez de medir só quanto colesterol há, a ApoB mostra quantas partículas potencialmente aterogênicas estão circulando."
  },
  {
    category: "lipidico",
    icon: "🫀",
    title: "Lipoproteína(a) [Lp(a)] — Como funciona?",
    explanation: "Mede uma partícula semelhante ao LDL, mas com uma \"peça extra\" (apolipoproteína(a)) que tende a aumentar o risco ao longo da vida. É largamente herdada e pouco muda com dieta ou exercício; por isso, muitas vezes basta dosagem única em algum momento da vida adulta."
  },

  // Glicose & Insulina
  {
    category: "glicose",
    icon: "🍬",
    title: "Glicose em jejum — Como funciona?",
    explanation: "Quantifica a glicose no sangue após um período de 8–12 horas sem comer, oferecendo um retrato do açúcar circulante naquele momento. Pode oscilar com estresse, infecções, corticoides, café muito forte e quebra de jejum, por isso a preparação importa."
  },
  {
    category: "glicose",
    icon: "🍬",
    title: "Hemoglobina glicada (HbA1c) — Como funciona?",
    explanation: "Mostra a porcentagem de hemoglobina que ficou \"açucarada\" ao longo de ~3 meses. Como os glóbulos vermelhos vivem semanas, a HbA1c funciona como uma média de longo prazo da glicose e sofre interferência de anemias, hemoglobinopatias e transfusões."
  },
  {
    category: "glicose",
    icon: "🍬",
    title: "Curva de glicose (OGTT 75 g) — Como funciona?",
    explanation: "É um teste de esforço metabólico: mede a glicose em jejum e após beber uma solução padronizada de 75 g de glicose. Avalia como o corpo lida com uma carga de açúcar, exigindo preparo (jejum, evitar exercício intenso e álcool na véspera)."
  },
  {
    category: "glicose",
    icon: "🍬",
    title: "Insulina & HOMA-IR — Como funciona?",
    explanation: "Dosam a insulina em jejum e calculam o HOMA-IR (uma estimativa de resistência à insulina baseada em glicose+insulina). Refletem sinalização hormonal nas células e mudam com peso, sono, estresse, medicações e atividade física."
  },

  // Função Renal
  {
    category: "renal",
    icon: "💧",
    title: "Creatinina — Como funciona?",
    explanation: "É um subproduto do músculo que os rins devem filtrar. Quando a filtração diminui, a creatinina acumula no sangue. O valor também depende de massa muscular, hidratação e algumas medicações; por isso é interpretado junto de outros parâmetros."
  },
  {
    category: "renal",
    icon: "💧",
    title: "eTFG (taxa de filtração estimada) — Como funciona?",
    explanation: "É um cálculo que usa creatinina, idade e sexo para estimar quanto os rins filtram por minuto (mL/min/1,73 m²). Não é uma medida direta, mas um modelo matemático validado, útil para classificar estágios de função renal."
  },
  {
    category: "renal",
    icon: "💧",
    title: "Ureia — Como funciona?",
    explanation: "Formada no fígado a partir da amônia (do metabolismo das proteínas), a ureia é eliminada pelos rins. Costuma subir com pouca água, dieta proteica ou redução da filtração; por si só é menos específica que a creatinina."
  },
  {
    category: "renal",
    icon: "💧",
    title: "Albumina/Creatinina na urina (ACR) — Como funciona?",
    explanation: "Com uma amostra simples de urina, mede-se quanto de albumina está saindo em relação à creatinina. Essa razão corrige a diluição da urina e flagra vazamentos muito pequenos de proteína — um sinal precoce de dano renal."
  },

  // Hematologia & Nutrientes
  {
    category: "hematologia",
    icon: "🩸",
    title: "Hemograma completo — Como funciona?",
    explanation: "Usa contadores automatizados (e, se preciso, esfregaço no microscópio) para medir glóbulos vermelhos, brancos e plaquetas, além de índices como VCM e HCM. É um painel amplo, sensível a infecções, deficiências nutricionais e sangramentos."
  },
  {
    category: "hematologia",
    icon: "🩸",
    title: "Ferro, Ferritina, Transferrina, Saturação — Como funciona?",
    explanation: "A ferritina indica estoque de ferro; a transferrina é o caminho que o transporta; a saturação mostra quanto do caminho está ocupado; o ferro sérico é o que está circulando. Em conjunto, diferenciam falta de ferro de outras causas de anemia."
  },
  {
    category: "hematologia",
    icon: "🩸",
    title: "Vitamina B12 & Folato — Como funciona?",
    explanation: "São dosagens sanguíneas de vitaminas essenciais para formar sangue e cuidar do sistema nervoso. Podem variar com ingestão, absorção intestinal, álcool e medicações; por isso às vezes são complementadas por outros marcadores."
  },

  // Eletrólitos & Osso
  {
    category: "eletrolitos",
    icon: "⚡️",
    title: "Sódio / Potássio / Cloro / Bicarbonato — Como funciona?",
    explanation: "Medem os íons que regulam água, eletricidade e equilíbrio ácido-básico do corpo. Mudam rapidamente com vômitos/diarreia, diuréticos, doenças renais e hormônios, e por isso são cruciais em avaliação clínica e de medicações."
  },
  {
    category: "eletrolitos",
    icon: "⚡️",
    title: "Cálcio (total/ionizado), Fósforo, Magnésio, PTH — Como funciona?",
    explanation: "O cálcio total inclui a fração ligada à albumina e a livre (ionizada); o ionizado é o biologicamente ativo. PTH e vitamina D controlam esse equilíbrio, enquanto fósforo e magnésio participam de ossos, músculos e nervos."
  },

  // Fígado & Vias Biliares
  {
    category: "figado",
    icon: "🫁",
    title: "AST (TGO) / ALT (TGP) — Como funciona?",
    explanation: "São enzimas dentro das células do fígado. Quando as células sofrem (gordura, vírus, álcool, remédios, esforço intenso), parte dessas enzimas \"vaza\" para o sangue, elevando os valores no exame."
  },
  {
    category: "figado",
    icon: "🫁",
    title: "GGT — Como funciona?",
    explanation: "Enzima sensível das vias biliares e do fígado, frequentemente induzida por álcool e por alguns medicamentos. Sobe junto da FA em distúrbios do fluxo biliar."
  },
  {
    category: "figado",
    icon: "🫁",
    title: "Fosfatase Alcalina (FA) & Bilirrubinas — Como funciona?",
    explanation: "A FA reflete atividade nas vias biliares e em ossos; as bilirrubinas vêm da quebra da hemoglobina e indicam se há acúmulo (icterícia). A fração direta sugere obstrução/fluxo biliar; a indireta aponta para produção excessiva ou processamento alterado."
  },
  {
    category: "figado",
    icon: "🫁",
    title: "Albumina & INR (TP) — Como funciona?",
    explanation: "A albumina é proteína fabricada no fígado e espelha reserva/proteossíntese; o INR mede a via de coagulação que também depende do fígado. Juntos ajudam a avaliar função hepática global."
  },

  // Inflamação
  {
    category: "inflamacao",
    icon: "🔥",
    title: "PCR-us (hs-CRP) — Como funciona?",
    explanation: "É uma proteína de fase aguda produzida pelo fígado. No método de alta sensibilidade, detecta inflamações discretas, úteis para entender risco cardiovascular e resposta a hábitos ao longo do tempo."
  },
  {
    category: "inflamacao",
    icon: "🔥",
    title: "VHS (ESR) — Como funciona?",
    explanation: "Observa a velocidade com que as hemácias sedimentam em um tubo padronizado. Proteínas inflamatórias alteram essa velocidade, tornando o VHS um sinal indireto de inflamação crônica."
  },

  // Outros
  {
    category: "outros",
    icon: "🦴",
    title: "Ácido Úrico — Como funciona?",
    explanation: "É o produto final da quebra de purinas (alimentos e células). Quando o nível sobe e a eliminação cai, podem se formar cristais nas articulações e nos rins, principalmente com desidratação e álcool."
  },
  {
    category: "outros",
    icon: "🦴",
    title: "CK (CPK) — Como funciona?",
    explanation: "Enzima presente no músculo (e em menor grau no coração). Exercício intenso, lesão ou algumas medicações aumentam sua liberação na corrente sanguínea, elevando o valor do exame."
  },

  // Urina
  {
    category: "urina",
    icon: "🚽",
    title: "Urina tipo 1 (EAS) — Como funciona?",
    explanation: "Combina teste químico (fita) e microscopia para avaliar densidade, pH, açúcar, proteína, sangue, células e cristais. É um screening amplo de alterações urinárias e metabólicas."
  },
  {
    category: "urina",
    icon: "🚽",
    title: "Urocultura (± antibiograma) — Como funciona?",
    explanation: "A urina é incubada em meios próprios para ver se bactérias crescem. Se cresce, identifica-se o microrganismo e testa-se a sensibilidade a antibióticos, guiando a escolha do tratamento."
  },

  // Tireoide
  {
    category: "tireoide",
    icon: "🧠",
    title: "TSH / T4 livre / T3 livre — Como funciona?",
    explanation: "O TSH é o comando da hipófise para a tireoide; T4/T3 são os hormônios que ajustam o ritmo do metabolismo. Ensaios imunoquímicos quantificam esses níveis, permitindo ver se o \"motor\" está acelerado, lento ou equilibrado."
  },
  {
    category: "tireoide",
    icon: "🧠",
    title: "Anti-TPO / Anti-Tg / TRAb — Como funciona?",
    explanation: "São anticorpos medidos no sangue contra proteínas da tireoide. A presença deles sugere um componente autoimune, ajudando a explicar alterações de função e a planejar o seguimento."
  },

  // Vitamina D
  {
    category: "vitaminas",
    icon: "🌞",
    title: "Vitamina D (25-OH) — Como funciona?",
    explanation: "Mede a forma de reserva da vitamina D, produzida na pele pelo sol e obtida por alimentos/suplementos. É o melhor indicador do estoque disponível para ossos e músculos."
  },

  // Saúde do Homem
  {
    category: "homem",
    icon: "🧔🏻",
    title: "PSA — Como funciona?",
    explanation: "É uma proteína da próstata que passa ao sangue em pequenas quantidades. Pode aumentar por crescimento benigno, inflamação ou doença da próstata; por isso costuma ser interpretado no contexto e, se preciso, com exames complementares."
  },

  // Marcadores tumorais
  {
    category: "marcadores",
    icon: "🎗️",
    title: "Marcadores tumorais (CEA, CA-125, CA 19-9, AFP…) — Como funciona?",
    explanation: "São substâncias produzidas por alguns tecidos que podem subir em certos tumores e também em condições não malignas. Servem como sinais biológicos acompanhados ao longo do tempo, de preferência dentro de protocolos específicos."
  }
];

export const getCategoryExplanations = (category: string): MedicalExplanation[] => {
  return medicalExplanations.filter(exp => exp.category === category);
};

export const getExplanationByTitle = (title: string): MedicalExplanation | undefined => {
  return medicalExplanations.find(exp => 
    exp.title.toLowerCase().includes(title.toLowerCase()) ||
    title.toLowerCase().includes(exp.title.toLowerCase())
  );
};

export const getAllCategories = (): string[] => {
  return [...new Set(medicalExplanations.map(exp => exp.category))];
};