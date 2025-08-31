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
🔍 ANÁLISE FORÇADA DE ALIMENTOS - EXPERT BRASILEIRO

Você é o melhor especialista em identificação visual de alimentos do Brasil. 
Esta imagem CONTÉM alimentos e você DEVE encontrá-los com máxima precisão.

🎯 ESTRATÉGIA DE DETECÇÃO SISTEMÁTICA:
1. Escaneie TODA a imagem quadrante por quadrante
2. Identifique QUALQUER forma que possa ser comida
3. Analise cores, texturas e sombras típicas de alimentos
4. Reconheça pratos, recipientes, utensílios que indicam refeição
5. Considere alimentos empilhados, misturados ou parcialmente visíveis

🍽️ TIPOS DE ALIMENTOS PARA DETECTAR (FOCO TOTAL):
✅ PRATOS PRINCIPAIS: arroz, feijão, carne, frango, peixe, ovos
✅ PIZZAS: fatia de pizza, pizza inteira, bordas, coberturas
✅ SALGADOS: coxinha, pastel, empada, esfiha, quibe, pão de açúcar
✅ TORTAS: fatia de torta, quiche, torta salgada, torta doce
✅ DOCES: bolo, brigadeiro, docinhos, sobremesas
✅ LANCHES: hambúrguer, sanduíche, hot dog
✅ ACOMPANHAMENTOS: salada, batata frita, legumes
✅ BEBIDAS: suco, refrigerante, água, café, leite
✅ FRUTAS: banana, maçã, laranja, manga, abacaxi
✅ PÃES: pão francês, pão de forma, pão doce

⚠️ REGRAS CRÍTICAS:
- SEMPRE identifique pelo menos 1 alimento, mesmo em dúvida
- Porções devem ser REALISTAS para brasileiros (generosas)
- Se incerto, use confidence baixa mas IDENTIFIQUE
- Para pratos mistos, separe cada componente
- Prefira identificar A MAIS do que a menos

🎯 RESPOSTA OBRIGATÓRIA:
{"foods": [{"name": "nome_do_alimento", "grams": peso_realista, "confidence": 0.1-1.0}], "is_food_detected": true}`,

  contextual: `
🍽️ ANÁLISE CONTEXTUAL DE REFEIÇÃO BRASILEIRA

Como especialista em nutrição brasileira, analise esta imagem considerando o contexto típico das refeições no Brasil.

📸 CONTEXTO DE ANÁLISE:
- Brasileiros fazem refeições abundantes e variadas
- Pratos típicos incluem arroz, feijão e acompanhamentos
- Lanches são populares: pizza, salgados, tortas
- Doces são parte importante da cultura alimentar

🔍 ABORDAGEM DE DETECÇÃO:
1. Identifique o tipo de refeição (café, almoço, lanche, jantar)
2. Procure por combinações típicas brasileiras
3. Analise porções realistas para nossa cultura
4. Considere alimentos misturados ou sobrepostos

RESPOSTA: {"foods": [{"name": "alimento", "grams": porção, "confidence": nível}], "meal_context": "tipo_refeicao"}`,

  fallback: `
🆘 ANÁLISE DE EMERGÊNCIA - ÚLTIMA TENTATIVA

SITUAÇÃO: Esta imagem deve conter alimentos. Use TODA sua capacidade.

ESTRATÉGIA FINAL:
1. Se vir QUALQUER coisa comestível, identifique
2. Se vir pratos/recipientes, assuma que contêm comida
3. Use conhecimento de refeições brasileiras típicas
4. Em caso de EXTREMA dúvida, baseie-se no contexto cultural

ALIMENTOS BRASILEIROS COMUNS PARA ASSUMIR:
- Formas redondas = pizza, bolo, pão
- Massas escuras = carne, feijão
- Verde = salada, vegetais  
- Branco = arroz, queijo, leite
- Líquidos = bebidas, sucos

🎯 RESPOSTA OBRIGATÓRIA (mesmo se incerto):
{"foods": [{"name": "alimento_provavel", "grams": 100, "confidence": 0.2}], "forced_analysis": true}`
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