// ========================================
// 🔧 SISTEMA APRIMORADO DE DETECÇÃO DE ALIMENTOS
// ========================================

const GOOGLE_AI_API_KEY = Deno.env.get('GOOGLE_AI_API_KEY');
const RATE_LIMIT_DELAY = 2000; // 2 segundos entre requests
const MAX_RETRIES = 3;

// ========================================
// 🤖 PROMPTS MELHORADOS PARA DETECÇÃO
// ========================================

export const ENHANCED_FOOD_PROMPTS = {
  aggressive: `
🔍 ANÁLISE ESPECIALIZADA DE ALIMENTOS BRASILEIROS - EXPERT AVANÇADO

Você é o especialista líder em identificação visual de alimentos brasileiros. 
Esta imagem CONTÉM alimentos e você DEVE encontrá-los com máxima precisão e especificidade.

🎯 ESTRATÉGIA DE DETECÇÃO ULTRA-SISTEMÁTICA:
1. Escaneie TODA a imagem quadrante por quadrante com zoom mental
2. Identifique QUALQUER forma, cor ou textura que possa ser comida
3. Analise sombras, reflexos e contornos típicos de alimentos
4. Reconheça pratos, recipientes, utensílios, embalagens que indicam refeição
5. Considere alimentos empilhados, misturados, parcialmente visíveis ou meio comidos
6. Use conhecimento cultural brasileiro para inferir alimentos típicos

🍽️ ALIMENTOS BRASILEIROS PARA DETECTAR (FOCO TOTAL EXPANDIDO):

🍕 PIZZAS E MASSAS (PRIORIDADE MÁXIMA):
- Pizza margherita, calabresa, portuguesa, quatro queijos, frango catupiry
- Pizza bacon, vegetariana, napolitana, pepperoni, doce (banana, chocolate)
- Fatia de pizza, pizza inteira, borda recheada, bordas douradas
- Lasanha, nhoque, espaguete, parafuso, penne, ravióli, canelone

🥪 SALGADOS BRASILEIROS (ESPECIALIDADE):
- Coxinha (frango, catupiry, queijo), coxinha grande, mini coxinha
- Pastel (queijo, carne, frango, palmito, doce de leite), pastel frito
- Empada, empadinha, empada de frango, empada de palmito
- Esfiha aberta, esfiha fechada, esfiha de carne, esfiha de queijo
- Quibe frito, quibe assado, kibbeh nayyeh
- Risole de frango, risole de queijo, risole de camarão
- Enroladinho de salsicha, bolinha de queijo
- Pão de açúcar, pão de queijo mineiro
- Joelho, croissant salgado, folhado

🥧 TORTAS E QUICHES (EXPANSÃO TOTAL):
- Torta de frango, torta de palmito, torta de atum, torta de camarão
- Torta de legumes, torta de brócolis, torta de queijo e presunto
- Quiche lorraine, quiche de alho-poró, quiche de espinafre
- Torta doce: torta de maçã, torta de chocolate, torta de limão
- Torta de morango, torta holandesa, torta de banana, cheesecake

🍔 LANCHES E FAST FOOD (DETALHAMENTO MÁXIMO):
- Hambúrguer simples, duplo, triplo, artesanal, gourmet
- X-burger, x-salada, x-bacon, x-tudo, x-frango, x-coração
- Big Mac, Whopper, McLanche Feliz, Quarteirão
- Cheeseburger, bacon burger, chicken burger
- Bauru tradicional, bauru paulista
- Beirute árabe, beirute com queijo
- Sanduíche natural, sanduíche vegano, sanduíche de peito de peru
- Misto quente, tostex, croque monsieur
- Hot dog, cachorro-quente simples, completo, especial
- Wrap, tortilla, burrito, taco
- Subway, sanduíche artesanal, bagel

🧁 DOCES E SOBREMESAS (CULTURA BRASILEIRA):
- Brigadeiro tradicional, beijinho, casadinho, cajuzinho
- Bem-casado, olho de sogra, branquinho, negrinho
- Cupcake, muffin, brownie, cookie, biscoito
- Petit four, trufa, bombom, chocolate
- Pudim de leite, pudim de pão, manjar, mousse
- Bolo de chocolate, bolo de cenoura, bolo de fubá
- Bolo de aniversário, bolo decorado, naked cake
- Sorvete, açaí, milk-shake, frappé
- Pavê, tiramisù, cheesecake individual

🍜 PRATOS TRADICIONAIS BRASILEIROS (REGIONALIDADE):
- Feijoada completa, tutu de feijão, feijão tropeiro
- Moqueca baiana, vatapá, acarajé, abará
- Parmegiana (frango, bife), à milanesa
- Estrogonofe (carne, frango), fricassê
- Picadinho, carne de panela, carne seca
- Galinhada, risotto, paella brasileira
- Escondidinho de carne seca, shepherds pie
- Sushi, yakisoba, temaki, hot roll
- Churrasco, costela, picanha, maminha

🥤 BEBIDAS VARIADAS (BRASILEIRISSIMO):
- Suco natural (laranja, limão, uva, maçã, manga, acerola)
- Vitamina de banana, vitamina de abacate, smoothie
- Açaí na tigela, açaí puro, açaí com granola
- Café expresso, cappuccino, café com leite, café pingado
- Refrigerante (coca-cola, guaraná, fanta, sprite)
- Água de coco, água mineral, água com gás
- Milkshake, frappuccino, bubble tea
- Cerveja, caipirinha, drink, soda italiana
- Leite achocolatado, leite fermentado, iogurte

🍞 PÃES E PADARIA (BRASILEIRO):
- Pão francês, pão de açúcar, pão doce, sonho
- Pão de forma, pão integral, pão sírio, pão árabe
- Brioche, croissant, pão de queijo, biscoito de polvilho
- Torrada, rabanada, broa de milho
- Rosca doce, pão de mel, cocada

⚠️ REGRAS CRÍTICAS ATUALIZADAS:
- SEMPRE identifique pelo menos 2-3 alimentos, mesmo em dúvida
- Seja ESPECÍFICO: não diga "carne", diga "bife grelhado" ou "frango à parmegiana"
- Porções devem ser REALISTAS para brasileiros (generosas)
- Se incerto, use confidence baixa (0.3-0.6) mas SEMPRE IDENTIFIQUE
- Para pratos compostos, separe cada componente visível
- Prefira identificar A MAIS do que a menos
- Use terminologia brasileira: "refrigerante" não "soda"
- Considere combinações típicas: arroz+feijão, pizza+refrigerante

🎯 RESPOSTA OBRIGATÓRIA (DETALHADA):
{"foods": [{"name": "nome_específico_brasileiro", "grams": peso_realista, "confidence": 0.1-1.0}], "is_food_detected": true, "meal_type": "tipo_refeicao"}`,

  contextual: `
🍽️ ANÁLISE CONTEXTUAL AVANÇADA DE REFEIÇÃO BRASILEIRA

Como especialista máximo em nutrição brasileira, analise esta imagem considerando profundamente o contexto cultural e gastronômico do Brasil.

📸 CONTEXTO CULTURAL BRASILEIRO:
- Brasileiros fazem refeições abundantes, variadas e sociais
- Pratos típicos: arroz+feijão é base, sempre tem acompanhamentos
- Lanches são cultura nacional: pizza é refeição, não lanche
- Salgados de festa são tradição (coxinha, pastel, empada)
- Doces são celebração social (brigadeiro, beijinho)
- Bebidas: suco natural, refrigerante, café são essenciais

🔍 ABORDAGEM DE DETECÇÃO CULTURAL:
1. Identifique o tipo de refeição (café manhã, almoço, lanche, jantar, festa)
2. Procure por combinações típicas brasileiras
3. Analise porções realistas para nossa cultura (generosas)
4. Considere alimentos misturados, empilhados ou sobrepostos
5. Use conhecimento regional: salgados, massas, doces locais

🌎 ESPECIALIZAÇÃO REGIONAL:
- Sudeste: pizza, parmegiana, salgados fritos, pão de açúcar
- Nordeste: acarajé, tapioca, cuscuz, vatapá, moqueca
- Sul: churrasco, chimarrão, cucas, pinhão
- Norte: açaí, peixes amazônicos, mandioca, cupuaçu
- Centro-Oeste: pacu, pintado, pequi, farofa de banana

RESPOSTA DETALHADA: {"foods": [{"name": "alimento_específico_brasileiro", "grams": porção_realista, "confidence": nível_confiança}], "meal_context": "tipo_refeicao_brasileira", "regional_context": "região_provável"}`,

  fallback: `
🆘 ANÁLISE DE EMERGÊNCIA MÁXIMA - FORÇA TOTAL BRASILEIRA

SITUAÇÃO CRÍTICA: Esta imagem DEVE conter alimentos. Use TODO seu conhecimento cultural brasileiro.

ESTRATÉGIA FINAL BRASILEIRA:
1. Se vir QUALQUER coisa remotamente comestível, identifique como alimento brasileiro típico
2. Se vir pratos/recipientes/utensílios, assuma que contêm nossa comida
3. Use conhecimento profundo de refeições brasileiras para inferir
4. Em caso de EXTREMA dúvida, baseie-se no contexto cultural forte
5. Brasileiro come: arroz+feijão+proteína+salada é padrão

ALIMENTOS BRASILEIROS PARA ASSUMIR POR FORMA/COR:
- Formas redondas claras = pizza, pão de açúcar, empada, queijo
- Formas redondas escuras = coxinha, hambúrguer, bolo chocolate
- Massas escuras = carne, feijão preto, chocolate, café
- Verde = salada, vegetais, suco natural, guaraná
- Branco = arroz, queijo, leite, pão, açúcar
- Amarelo/dourado = frango, ovo, milho, queijo, cerveja
- Vermelho = tomate, carne, molho, catchup, refrigerante
- Líquidos = bebidas, sucos, café, leite, refrigerante
- Retangular = sanduíche, bolo, torta, lasanha
- Triangular = pizza, pastel, torta, sanduíche cortado

🎯 RESPOSTA OBRIGATÓRIA BRASILEIRA (mesmo se incerto):
{"foods": [{"name": "alimento_brasileiro_típico", "grams": 100, "confidence": 0.2}], "forced_analysis": true, "cultural_inference": "baseado_contexto_brasileiro"}`
};

// ========================================
// 🤖 FUNÇÃO DE ANÁLISE COM MÚLTIPLAS TENTATIVAS
// ========================================

export async function analyzeWithEnhancedAI(imageUrl: string, attempt = 1) {
  if (!GOOGLE_AI_API_KEY) {
    throw new Error('Google AI API key não configurada');
  }

  console.log(`🤖 Análise aprimorada - Tentativa ${attempt}/${MAX_RETRIES}`);
  
  // Escolher estratégia baseada na tentativa
  let prompt = ENHANCED_FOOD_PROMPTS.aggressive;
  if (attempt === 2) {
    prompt = ENHANCED_FOOD_PROMPTS.contextual;
  } else if (attempt >= 3) {
    prompt = ENHANCED_FOOD_PROMPTS.fallback;
  }

  try {
    // Delay anti-rate-limit
    if (attempt > 1) {
      const delay = RATE_LIMIT_DELAY * attempt;
      console.log(`⏳ Aguardando ${delay}ms para evitar rate limit...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    const requestBody = {
      contents: [{
        parts: [
          { text: prompt },
          { 
            inline_data: {
              mime_type: "image/jpeg",
              data: await fetchImageAsBase64(imageUrl)
            }
          }
        ]
      }],
      generationConfig: {
        temperature: attempt >= 3 ? 0.8 : 0.2, // Mais criativo no fallback
        maxOutputTokens: 1000,
      }
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GOOGLE_AI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Google AI Error (tentativa ${attempt}):`, response.status, errorText);
      
      // Rate limit handling
      if (response.status === 429 && attempt < MAX_RETRIES) {
        const backoffDelay = RATE_LIMIT_DELAY * Math.pow(2, attempt); // Exponential backoff
        console.log(`⏳ Rate limit! Aguardando ${backoffDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
        return analyzeWithEnhancedAI(imageUrl, attempt + 1);
      }
      
      throw new Error(`Google AI error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      if (attempt < MAX_RETRIES) {
        console.log(`⚠️ Resposta inválida na tentativa ${attempt}, tentando novamente...`);
        return analyzeWithEnhancedAI(imageUrl, attempt + 1);
      }
      throw new Error('Resposta inválida da Google AI após múltiplas tentativas');
    }

    const responseText = data.candidates[0].content.parts[0].text;
    console.log(`🤖 Resposta Gemini (tentativa ${attempt}):`, responseText.substring(0, 200) + '...');

    try {
      // Limpar e parsear JSON
      let cleanJson = responseText.replace(/```json|```/g, '').trim();
      
      // Tentar extrair JSON se estiver misturado com texto
      const jsonMatch = cleanJson.match(/\{[^{}]*"foods"[^{}]*\}/);
      if (jsonMatch) {
        cleanJson = jsonMatch[0];
      }
      
      const parsed = JSON.parse(cleanJson);
      
      // Validar resultado
      if (!parsed.foods || !Array.isArray(parsed.foods) || parsed.foods.length === 0) {
        if (attempt < MAX_RETRIES) {
          console.log(`⚠️ Nenhum alimento detectado na tentativa ${attempt}, forçando nova análise...`);
          return analyzeWithEnhancedAI(imageUrl, attempt + 1);
        }
        
        // Último recurso: criar análise genérica
        return createFallbackAnalysis();
      }
      
      // Melhorar dados detectados
      const enhancedFoods = parsed.foods.map(food => ({
        name: food.name || 'alimento não identificado',
        grams: Math.max(food.grams || 50, 30), // Mínimo 30g
        confidence: Math.max(food.confidence || 0.3, 0.1) // Mínimo 0.1
      }));
      
      console.log(`✅ Análise bem-sucedida na tentativa ${attempt}:`, enhancedFoods.length, 'alimentos detectados');
      
      return {
        foods: enhancedFoods,
        total_calories: enhancedFoods.reduce((sum, food) => sum + (food.grams * 2.5), 0),
        attempt_used: attempt,
        detection_method: attempt === 1 ? 'aggressive' : attempt === 2 ? 'contextual' : 'fallback',
        success: true
      };
      
    } catch (parseError) {
      console.error(`❌ Erro ao parsear JSON (tentativa ${attempt}):`, parseError);
      
      if (attempt < MAX_RETRIES) {
        return analyzeWithEnhancedAI(imageUrl, attempt + 1);
      }
      
      // Extrair alimentos do texto como último recurso
      const extractedFoods = extractFoodsFromText(responseText);
      return {
        foods: extractedFoods,
        total_calories: extractedFoods.reduce((sum, food) => sum + (food.grams * 2), 0),
        parsing_error: true,
        fallback_used: true,
        attempt_used: attempt
      };
    }
    
  } catch (error) {
    console.error(`❌ Erro na tentativa ${attempt}:`, error.message);
    
    if (attempt < MAX_RETRIES) {
      // Delay maior para erros de rede
      const errorDelay = RATE_LIMIT_DELAY * (attempt + 1);
      console.log(`⏳ Erro detectado, aguardando ${errorDelay}ms antes da próxima tentativa...`);
      await new Promise(resolve => setTimeout(resolve, errorDelay));
      return analyzeWithEnhancedAI(imageUrl, attempt + 1);
    }
    
    // Último recurso: análise genérica
    console.log('🆘 Todas as tentativas falharam, criando análise genérica...');
    return createFallbackAnalysis();
  }
}

// ========================================
// 🛠️ FUNÇÕES AUXILIARES
// ========================================

function createFallbackAnalysis() {
  console.log('🔄 Criando análise de fallback genérica...');
  
  const genericFoods = [
    { name: 'refeição mista', grams: 200, confidence: 0.3 },
    { name: 'acompanhamento', grams: 100, confidence: 0.2 }
  ];
  
  return {
    foods: genericFoods,
    total_calories: 600, // Estimativa conservadora
    fallback_used: true,
    detection_method: 'generic_fallback'
  };
}

function extractFoodsFromText(text: string) {
  console.log('🔍 Extraindo alimentos do texto...');
  
  const brazilianFoods = [
    'arroz', 'feijão', 'carne', 'frango', 'peixe', 'ovo', 'salada',
    'batata', 'macarrão', 'pão', 'pizza', 'hambúrguer', 'bolo', 'torta',
    'coxinha', 'pastel', 'empada', 'suco', 'café', 'leite', 'queijo',
    'tomate', 'alface', 'cenoura', 'banana', 'maçã', 'laranja'
  ];
  
  const detectedFoods = [];
  const lowerText = text.toLowerCase();
  
  for (const food of brazilianFoods) {
    if (lowerText.includes(food)) {
      detectedFoods.push({
        name: food,
        grams: getTypicalPortionSize(food),
        confidence: 0.4
      });
    }
  }
  
  // Se não encontrou nada, retorna algo genérico
  if (detectedFoods.length === 0) {
    detectedFoods.push({
      name: 'refeição brasileira',
      grams: 250,
      confidence: 0.3
    });
  }
  
  return detectedFoods;
}

function getTypicalPortionSize(food: string): number {
  const portions = {
    'arroz': 120, 'feijão': 80, 'carne': 120, 'frango': 120,
    'pizza': 130, 'hambúrguer': 180, 'bolo': 80, 'torta': 120,
    'coxinha': 70, 'pastel': 60, 'empada': 50, 'pão': 50,
    'suco': 200, 'café': 150, 'leite': 200, 'salada': 60
  };
  
  return portions[food] || 100;
}

async function fetchImageAsBase64(imageUrl: string): Promise<string> {
  const response = await fetch(imageUrl);
  const arrayBuffer = await response.arrayBuffer();
  const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
  return base64;
}