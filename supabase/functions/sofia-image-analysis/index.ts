import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';
import { analyzeWithEnhancedAI } from './enhanced-detection.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with, Authorization, X-Client-Info, Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

// Inicializar cliente Supabase globalmente
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const googleAIApiKey = Deno.env.get('GOOGLE_AI_API_KEY');
// Modelo Gemini configurável; padrão mais preciso
const geminiModel = (Deno.env.get('SOFIA_GEMINI_MODEL') || 'gemini-1.5-pro').trim();
// Modo de porção: 'ai_strict' usa os números do Gemini; 'defaults' usa porções padrão
const portionMode = (Deno.env.get('SOFIA_PORTION_MODE') || 'ai_strict').trim();
const minPortionConfidence = Number(Deno.env.get('SOFIA_PORTION_CONFIDENCE_MIN') || '0.55');
// Desativar GPT por padrão: vamos padronizar na família Gemini
const sofiaUseGpt = (Deno.env.get('SOFIA_USE_GPT') || 'false').toLowerCase() === 'true';
// Modo estrito: sem fallback de porções padrão. Só calcula quando houver gramas/ml confiáveis
// Default agora é 'true' para evitar números errados quando a IA não fornecer quantidades
const strictMode = (Deno.env.get('SOFIA_STRICT_MODE') || 'true').toLowerCase() === 'true';
// YOLO microserviço - VPS configurada
const yoloEnabled = (Deno.env.get('YOLO_ENABLED') || 'true').toLowerCase() === 'true';
const yoloServiceUrl = (Deno.env.get('YOLO_SERVICE_URL') || 'http://45.67.221.216:8002').replace(/\/$/, '');
// Configurações avançadas para máxima precisão
const yoloMaxRetries = Number(Deno.env.get('YOLO_MAX_RETRIES') || '3');
// Configurações otimizadas para alimentos brasileiros (pizza, tortas, salgados)
const yoloConfidenceLevels = (Deno.env.get('YOLO_CONFIDENCE_LEVELS') || '0.7,0.55,0.4,0.3').split(',').map(Number);
const yoloUseAdaptiveConfidence = (Deno.env.get('YOLO_USE_ADAPTIVE_CONFIDENCE') || 'true').toLowerCase() === 'true';
// Sistema avançado de qualidade de imagem
const enableImageQualityAnalysis = (Deno.env.get('ENABLE_IMAGE_QUALITY_ANALYSIS') || 'true').toLowerCase() === 'true';
const enableEnsembleDetection = (Deno.env.get('ENABLE_ENSEMBLE_DETECTION') || 'false').toLowerCase() === 'true';
const enableUserFeedback = (Deno.env.get('ENABLE_USER_FEEDBACK') || 'true').toLowerCase() === 'true';
// Label Studio integração opcional
const labelStudioEnabled = (Deno.env.get('LABEL_STUDIO_ENABLED') || 'false').toLowerCase() === 'true';
const labelStudioUrl = (Deno.env.get('LABEL_STUDIO_URL') || 'http://localhost:8080').replace(/\/$/, '');
const labelStudioToken = Deno.env.get('LABEL_STUDIO_TOKEN') || '';
const labelStudioProjectId = Deno.env.get('LABEL_STUDIO_PROJECT_ID') || '';

// Mapeamento expandido de classes COCO/YOLO → alimentos pt-BR
const YOLO_CLASS_MAP: Record<string, string> = {
  // Bebidas e contêineres
  'cup': 'copo',
  'bottle': 'garrafa',
  'wine glass': 'taça de vinho',
  'bowl': 'tigela',
  'plate': 'prato',
  'fork': 'garfo',
  'knife': 'faca',
  'spoon': 'colher',
  
  // Frutas (expandido)
  'banana': 'banana',
  'apple': 'maçã',
  'orange': 'laranja',
  'grapes': 'uvas',
  'strawberry': 'morango',
  'pineapple': 'abacaxi',
  'watermelon': 'melancia',
  'pear': 'pera',
  'peach': 'pêssego',
  'cherry': 'cereja',
  'lemon': 'limão',
  'lime': 'lima',
  'mango': 'manga',
  'kiwi': 'kiwi',
  'avocado': 'abacate',
  
  // Legumes e verduras (expandido)
  'broccoli': 'brócolis',
  'carrot': 'cenoura',
  'tomato': 'tomate',
  'lettuce': 'alface',
  'cucumber': 'pepino',
  'onion': 'cebola',
  'potato': 'batata',
  'corn': 'milho',
  'pepper': 'pimentão',
  'mushroom': 'cogumelo',
  'garlic': 'alho',
  'ginger': 'gengibre',
  'cabbage': 'repolho',
  'spinach': 'espinafre',
  'beet': 'beterraba',
  'radish': 'rabanete',
  'zucchini': 'abobrinha',
  'eggplant': 'berinjela',
  
  // Proteínas (expandido)
  'chicken': 'frango',
  'beef': 'carne bovina',
  'pork': 'carne suína',
  'fish': 'peixe',
  'salmon': 'salmão',
  'tuna': 'atum',
  'shrimp': 'camarão',
  'egg': 'ovo',
  'sausage': 'linguiça',
  'ham': 'presunto',
  'bacon': 'bacon',
  'turkey': 'peru',
  'lamb': 'cordeiro',
  
  // Carboidratos (expandido)
  'bread': 'pão',
  'baguette': 'baguete',
  'croissant': 'croissant',
  'toast': 'torrada',
  'rice': 'arroz',
  'pasta': 'macarrão',
  'noodles': 'macarrão',
  'spaghetti': 'espaguete',
  'potato chips': 'batata frita',
  'french fries': 'batata frita',
  'crackers': 'biscoito salgado',
  'tortilla': 'tortilha',
  
  // Pratos prontos (EXPANDIDO PARA PEDIDO DO USUÁRIO)
  'pizza': 'pizza',
  'pizza slice': 'fatia de pizza',
  'pie': 'torta',
  'meat pie': 'torta de carne',
  'chicken pie': 'torta de frango',
  'quiche': 'quiche',
  'empanada': 'empada',
  'pastel': 'pastel',
  'coxinha': 'coxinha',
  'hamburger': 'hambúrguer',
  'cheeseburger': 'hambúrguer com queijo',
  'hot dog': 'cachorro-quente',
  'sandwich': 'sanduíche',
  'submarine sandwich': 'sanduíche',
  'wrap': 'wrap',
  'taco': 'taco',
  'burrito': 'burrito',
  'sushi': 'sushi',
  'salad': 'salada',
  'soup': 'sopa',
  'stew': 'ensopado',
  'curry': 'curry',
  'fried chicken': 'frango frito',
  'grilled chicken': 'frango grelhado',
  'barbecue': 'churrasco',
  'steak': 'bife',
  'meatball': 'almôndega',
  'lasagna': 'lasanha',
  'ravioli': 'ravióli',
  'gnocchi': 'nhoque',
  'risotto': 'risotto',
  'paella': 'paella',
  'fried rice': 'arroz frito',
  'spring roll': 'rolinho primavera',
  'dumpling': 'bolinho',
  
  // Salgados brasileiros específicos
  'cheese bread': 'pão de açúcar',
  'brigadeiro': 'brigadeiro',
  'beijinho': 'beijinho',
  'coxinha': 'coxinha',
  'pastel': 'pastel',
  'empada': 'empada',
  'esfiha': 'esfiha',
  'kibbeh': 'quibe',
  'rissole': 'risole',
  'drumstick': 'coxinha',
  
  // Doces e sobremesas (expandido)
  'cake': 'bolo',
  'birthday cake': 'bolo de aniversário',
  'chocolate cake': 'bolo de chocolate',
  'cheesecake': 'cheesecake',
  'cupcake': 'cupcake',
  'muffin': 'muffin',
  'donut': 'rosquinha',
  'doughnut': 'rosquinha',
  'cookie': 'biscoito',
  'chocolate chip cookie': 'biscoito com gotas de chocolate',
  'ice cream': 'sorvete',
  'ice cream cone': 'casquinha de sorvete',
  'popsicle': 'picolé',
  'chocolate': 'chocolate',
  'candy': 'doce',
  'lollipop': 'pirulito',
  'gummy bears': 'jujuba',
  'brownie': 'brownie',
  'pudding': 'pudim',
  'flan': 'pudim',
  'waffle': 'waffle',
  'pancake': 'panqueca',
  'crepe': 'crepe',
  'tart': 'torta doce',
  'éclair': 'éclair',
  'macaron': 'macaron',
  'tiramisu': 'tiramisu',
  
  // Laticínios (expandido)
  'cheese': 'queijo',
  'cheddar': 'queijo cheddar',
  'mozzarella': 'queijo mussarela',
  'parmesan': 'queijo parmesão',
  'cream cheese': 'cream cheese',
  'ricotta': 'ricota',
  'milk': 'leite',
  'yogurt': 'iogurte',
  'butter': 'manteiga',
  'sour cream': 'creme azedo',
  'whipped cream': 'chantilly',
  'ice cream': 'sorvete',
  
  // Bebidas (expandido)
  'coffee': 'café',
  'espresso': 'café expresso',
  'cappuccino': 'cappuccino',
  'latte': 'café com leite',
  'tea': 'chá',
  'green tea': 'chá verde',
  'juice': 'suco',
  'orange juice': 'suco de laranja',
  'apple juice': 'suco de maçã',
  'smoothie': 'vitamina',
  'milkshake': 'milkshake',
  'soda': 'refrigerante',
  'cola': 'coca-cola',
  'beer': 'cerveja',
  'wine': 'vinho',
  'cocktail': 'coquetel',
  'water': 'água',
  'sparkling water': 'água com gás',
  'energy drink': 'energético',
  
  // Condimentos e temperos (expandido)
  'salt': 'sal',
  'pepper': 'pimenta',
  'sugar': 'açúcar',
  'honey': 'mel',
  'maple syrup': 'xarope de bordo',
  'oil': 'óleo',
  'olive oil': 'azeite',
  'vinegar': 'vinagre',
  'sauce': 'molho',
  'tomato sauce': 'molho de tomate',
  'ketchup': 'ketchup',
  'mustard': 'mostarda',
  'mayonnaise': 'maionese',
  'barbecue sauce': 'molho barbecue',
  'soy sauce': 'molho de soja',
  'hot sauce': 'molho picante',
  'salad dressing': 'molho para salada',
  'ranch': 'molho ranch',
  'pesto': 'pesto',
  'hummus': 'homus',
  'guacamole': 'guacamole',
  
  // Nuts e grãos
  'nuts': 'nozes',
  'almonds': 'amêndoas',
  'peanuts': 'amendoim',
  'cashews': 'castanha de caju',
  'walnuts': 'nozes',
  'pine nuts': 'pinhões',
  'sunflower seeds': 'sementes de girassol',
  'pumpkin seeds': 'sementes de abóbora',
  'beans': 'feijão',
  'black beans': 'feijão preto',
  'kidney beans': 'feijão rajado',
  'chickpeas': 'grão-de-bico',
  'lentils': 'lentilha',
  'quinoa': 'quinoa',
  'oats': 'aveia',
  'granola': 'granola',
  'cereal': 'cereal'
};

async function tryYoloDetect(imageUrl: string): Promise<{ 
  foods: string[]; 
  liquids: string[]; 
  objects: Array<{class_name: string; score: number; name: string}>;
  maxConfidence: number;
  totalObjects: number;
  detectionQuality: string;
  confidenceUsed: number;
} | null> {
  if (!yoloEnabled) return null;
  
  try {
    console.log('🦾 YOLO: Iniciando detecção otimizada de objetos...');
    
    // 🚀 ESTRATÉGIA DE MÚLTIPLAS PASSADAS PARA MÁXIMA PRECISÃO
    let bestDetection = null;
    let bestConfidence = 0;
    let detectionQuality = 'low';
    
    // Tentar diferentes níveis de confiança (do mais alto ao mais baixo)
    for (const confidence of yoloConfidenceLevels) {
      console.log(`🔄 YOLO: Tentativa com confiança ${confidence.toFixed(2)}...`);
      
        try {
          const resp = await fetch(`${yoloServiceUrl}/detect`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              image_url: imageUrl, 
              task: 'segment', 
              confidence: confidence,
              // Configurações específicas para alimentos brasileiros
              model: 'yolo11s.pt', // Modelo mais leve e rápido
              iou: 0.45, // IoU threshold para melhor separação de objetos
              max_det: 300, // Detectar mais objetos por imagem
              classes: [39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67], // Classes relacionadas a comida no COCO
              verbose: false
            })
          });
        
        if (!resp.ok) {
          console.log(`⚠️ YOLO: Falha na confiança ${confidence.toFixed(2)}`);
          continue;
        }
        
        const data = await resp.json();
        const objects: Array<{ class_name: string; score: number }> = Array.isArray(data?.objects) ? data.objects : [];
        
        console.log(`📊 YOLO: Confiança ${confidence.toFixed(2)} detectou ${objects.length} objetos`);
        
        // Filtrar objetos com confiança adequada
        const mapped = objects
          .map(o => ({ 
            class_name: o.class_name,
            score: Number(o.score) || 0,
            name: YOLO_CLASS_MAP[o.class_name] || ''
          }))
          .filter(o => !!o.name && o.score >= confidence * 0.8); // Filtro mais rigoroso
        
        if (mapped.length > 0) {
          const foods: string[] = [];
          const liquids: string[] = [];
          let maxConfidence = 0;
          
          for (const m of mapped) {
            maxConfidence = Math.max(maxConfidence, m.score);
            
            // Classificar como líquido ou alimento sólido (expandido para mais precisão)
            const liquidKeywords = ['copo', 'garrafa', 'taça', 'vinho', 'café', 'chá', 'suco', 'refrigerante', 'cerveja', 'leite', 'iogurte', 'água', 'energético', 'isotônico'];
            const solidFoodKeywords = ['pizza', 'torta', 'coxinha', 'pastel', 'hambúrguer', 'sanduíche', 'bolo', 'pão', 'queijo', 'carne', 'frango', 'peixe'];
            const isLiquid = liquidKeywords.some(keyword => m.name.includes(keyword));
            const isSolidFood = solidFoodKeywords.some(keyword => m.name.includes(keyword));
            
            if (isLiquid) {
              liquids.push(m.name);
            } else if (isSolidFood || !isLiquid) {
              // Priorizar alimentos sólidos, especialmente pizzas, tortas e salgados
              foods.push(m.name);
            }
          }
          
          const result = {
            foods,
            liquids,
            objects: mapped,
            maxConfidence,
            totalObjects: mapped.length,
            detectionQuality: getDetectionQuality(confidence, mapped.length, maxConfidence),
            confidenceUsed: confidence
          };
          
          // Avaliar qualidade da detecção
          const qualityScore = calculateQualityScore(mapped.length, maxConfidence, confidence);
          
          if (qualityScore > bestConfidence) {
            bestDetection = result;
            bestConfidence = qualityScore;
            detectionQuality = result.detectionQuality;
            console.log(`🏆 YOLO: Nova melhor detecção encontrada (qualidade: ${qualityScore.toFixed(2)})`);
          }
          
          // Se encontrou detecção de alta qualidade, parar aqui
          if (qualityScore > 0.8) {
            console.log(`🎯 YOLO: Detecção de alta qualidade alcançada, parando otimização`);
            break;
          }
        }
        
      } catch (error) {
        console.log(`⚠️ YOLO: Erro na confiança ${confidence.toFixed(2)}:`, error);
        continue;
      }
    }
    
    if (bestDetection) {
      console.log('✅ YOLO: Detecção otimizada concluída:', {
        foods: bestDetection.foods.length,
        liquids: bestDetection.liquids.length,
        maxConfidence: bestDetection.maxConfidence.toFixed(2),
        totalObjects: bestDetection.totalObjects,
        quality: detectionQuality,
        confidenceUsed: bestDetection.confidenceUsed.toFixed(2)
      });
      
      return bestDetection;
    } else {
      console.log('⚠️ YOLO: Nenhuma detecção válida encontrada em nenhum nível de confiança');
      return null;
    }
    
  } catch (error) {
    console.error('❌ YOLO: Erro crítico na detecção:', error);
    return null;
  }
}

// 🎯 Função para calcular qualidade da detecção
function calculateQualityScore(objectCount: number, maxConfidence: number, confidenceThreshold: number): number {
  const countScore = Math.min(objectCount / 5, 1.0); // Máximo 5 objetos = score 1.0
  const confidenceScore = maxConfidence;
  const thresholdScore = 1.0 - confidenceThreshold; // Thresholds mais baixos = score mais alto
  
  return (countScore * 0.3 + confidenceScore * 0.5 + thresholdScore * 0.2);
}

// 🏷️ Função para classificar qualidade da detecção
function getDetectionQuality(confidence: number, objectCount: number, maxConfidence: number): string {
  if (confidence >= 0.6 && objectCount >= 3 && maxConfidence >= 0.8) return 'excellent';
  if (confidence >= 0.5 && objectCount >= 2 && maxConfidence >= 0.7) return 'good';
  if (confidence >= 0.35 && objectCount >= 1 && maxConfidence >= 0.6) return 'fair';
  return 'low';
}

// 🎨 Função para analisar qualidade da imagem
async function analyzeImageQuality(imageUrl: string): Promise<{
  brightness: number;
  contrast: number;
  blur: number;
  noise: number;
  overallQuality: number;
  recommendations: string[];
}> {
  try {
    // Análise básica de qualidade (pode ser expandida com OpenCV)
    const response = await fetch(imageUrl);
    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Simular análise de qualidade (em produção, usar OpenCV)
    const brightness = Math.random() * 0.3 + 0.7; // 0.7-1.0
    const contrast = Math.random() * 0.2 + 0.8;   // 0.8-1.0
    const blur = Math.random() * 0.4 + 0.6;       // 0.6-1.0
    const noise = Math.random() * 0.3 + 0.7;      // 0.7-1.0
    
    const overallQuality = (brightness + contrast + blur + noise) / 4;
    
    const recommendations: string[] = [];
    if (brightness < 0.8) recommendations.push('Melhorar iluminação');
    if (contrast < 0.85) recommendations.push('Aumentar contraste');
    if (blur < 0.8) recommendations.push('Manter câmera estável');
    if (noise < 0.8) recommendations.push('Reduzir ruído da imagem');
    
    return {
      brightness,
      contrast,
      blur,
      noise,
      overallQuality,
      recommendations
    };
  } catch (error) {
    console.log('⚠️ Erro na análise de qualidade:', error);
    return {
      brightness: 0.8,
      contrast: 0.8,
      blur: 0.8,
      noise: 0.8,
      overallQuality: 0.8,
      recommendations: []
    };
  }
}

// 🔄 Função para detecção ensemble (múltiplos modelos)
async function runEnsembleDetection(imageUrl: string): Promise<{
  objects: Array<{class_name: string; score: number; name: string}>;
  confidence: number;
  model: string;
} | null> {
  if (!enableEnsembleDetection) return null;
  
  try {
    console.log('🔄 YOLO: Executando detecção ensemble...');
    
    // Simular ensemble com diferentes configurações
    const ensembleResults = [];
    
    // Configuração 1: YOLO11s com confiança alta
    const result1 = await fetch(`${yoloServiceUrl}/detect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        image_url: imageUrl, 
        task: 'segment', 
        confidence: 0.7 
      })
    });
    
    if (result1.ok) {
      const data1 = await result1.json();
      if (data1.objects && data1.objects.length > 0) {
        ensembleResults.push({
          objects: data1.objects,
          confidence: 0.7,
          model: 'yolo11s-high'
        });
      }
    }
    
    // Configuração 2: YOLO11s com confiança média
    const result2 = await fetch(`${yoloServiceUrl}/detect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        image_url: imageUrl, 
        task: 'segment', 
        confidence: 0.5 
      })
    });
    
    if (result2.ok) {
      const data2 = await result2.json();
      if (data2.objects && data2.objects.length > 0) {
        ensembleResults.push({
          objects: data2.objects,
          confidence: 0.5,
          model: 'yolo11s-medium'
        });
      }
    }
    
    // Combinar resultados do ensemble
    if (ensembleResults.length > 0) {
      const allObjects = ensembleResults.flatMap(r => r.objects);
      const uniqueObjects = new Map();
      
      // Agrupar objetos similares e calcular confiança média
      for (const obj of allObjects) {
        const key = obj.class_name;
        if (uniqueObjects.has(key)) {
          const existing = uniqueObjects.get(key);
          existing.scores.push(obj.score);
          existing.count++;
        } else {
          uniqueObjects.set(key, {
            class_name: obj.class_name,
            scores: [obj.score],
            count: 1
          });
        }
      }
      
      // Calcular confiança média e filtrar por frequência
      const finalObjects = Array.from(uniqueObjects.values())
        .filter(obj => obj.count >= 1) // Pelo menos 1 modelo detectou
        .map(obj => ({
          class_name: obj.class_name,
          score: obj.scores.reduce((a, b) => a + b, 0) / obj.scores.length,
          name: YOLO_CLASS_MAP[obj.class_name] || ''
        }))
        .filter(obj => !!obj.name && obj.score >= 0.6);
      
      console.log(`🔄 Ensemble: ${finalObjects.length} objetos únicos detectados`);
      
      return {
        objects: finalObjects,
        confidence: finalObjects.reduce((sum, obj) => sum + obj.score, 0) / finalObjects.length,
        model: 'ensemble-yolo11s'
      };
    }
    
    return null;
  } catch (error) {
    console.error('❌ Erro na detecção ensemble:', error);
    return null;
  }
}

// 📊 Função para calcular confiança adaptativa baseada na qualidade
function calculateAdaptiveConfidence(imageQuality: number, baseConfidence: number): number {
  // Ajustar confiança baseado na qualidade da imagem
  if (imageQuality >= 0.9) return Math.min(0.8, baseConfidence + 0.1); // Imagem excelente
  if (imageQuality >= 0.8) return baseConfidence; // Imagem boa
  if (imageQuality >= 0.7) return Math.max(0.3, baseConfidence - 0.1); // Imagem média
  return Math.max(0.25, baseConfidence - 0.15); // Imagem ruim
}

// Função simplificada de normalização sem dependência externa
function normalizeItems(rawItems: Array<{name: string; grams?: number; ml?: number; method?: string}>): Array<{name: string; grams?: number; ml?: number; method?: string}> {
  const normalized = new Map<string, {name: string; grams: number; ml: number; method?: string}>();
  
  for (const item of rawItems) {
    if (!item.name) continue;
    
    const key = item.name.toLowerCase().trim();
    const existing = normalized.get(key);
    
    if (existing) {
      // Combinar quantidades
      existing.grams += Number(item.grams || 0);
      existing.ml += Number(item.ml || 0);
    } else {
      normalized.set(key, {
        name: item.name,
        grams: Number(item.grams || 0),
        ml: Number(item.ml || 0),
        method: item.method
      });
    }
  }
  
  return Array.from(normalized.values()).map(item => ({
    name: item.name,
    grams: item.grams > 0 ? item.grams : undefined,
    ml: item.ml > 0 ? item.ml : undefined,
    method: item.method
  }));
}

async function callOllamaNormalizer(rawItems: Array<{name: string; grams?: number; ml?: number; method?: string}>): Promise<Array<{name: string; grams?: number; ml?: number; method?: string}>> {
  // Usar normalização local simples em vez de serviço externo
  return normalizeItems(rawItems);
}

// 📸 Função auxiliar para converter imagem (URL http(s) ou data URL) em base64 (retornando também o MIME)
async function fetchImageAsBase64(urlOrData: string): Promise<{ base64: string; mime: string }> {
  try {
    // Suporte a data URL: data:image/png;base64,XXXX
    if ((urlOrData || '').startsWith('data:')) {
      const commaIdx = urlOrData.indexOf(',');
      if (commaIdx === -1) throw new Error('Data URL inválida');
      const header = urlOrData.substring(0, commaIdx);
      const data = urlOrData.substring(commaIdx + 1);
      let mime = 'image/jpeg';
      const m = header.match(/^data:([^;]+)(;base64)?/i);
      if (m && m[1]) mime = m[1];
      return { base64: data, mime };
    }

    // Caso padrão: buscar por HTTP(S)
    const response = await fetch(urlOrData, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SofiaAI/1.0; +https://supabase.com)'
      }
    });
    const buffer = await response.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
    let mime = response.headers.get('content-type') || '';
    if (!mime) {
      const lower = urlOrData.toLowerCase();
      if (lower.endsWith('.png')) mime = 'image/png';
      else if (lower.endsWith('.webp')) mime = 'image/webp';
      else if (lower.endsWith('.gif')) mime = 'image/gif';
      else mime = 'image/jpeg';
    }
    return { base64, mime };
  } catch (error) {
    console.log('❌ Erro ao converter imagem:', error);
    throw error;
  }
}

// 🍽️ COMBOS DE REFEIÇÕES BRASILEIRAS
const COMBOS_REFEICOES: Record<string, {alimentos: string[], calorias: number, descricao: string}> = {
  // Café da manhã
  'cafe_completo': {
    alimentos: ['pão francês', 'manteiga', 'café', 'leite'],
    calorias: 350,
    descricao: 'Café da manhã tradicional brasileiro'
  },
  'cafe_saudavel': {
    alimentos: ['pão integral', 'queijo branco', 'suco de laranja', 'fruta'],
    calorias: 280,
    descricao: 'Café da manhã nutritivo'
  },
  'cafe_proteico': {
    alimentos: ['ovos', 'pão integral', 'queijo', 'café'],
    calorias: 420,
    descricao: 'Café da manhã rico em proteínas'
  },

  // Almoço
  'almoco_tradicional': {
    alimentos: ['arroz', 'feijão', 'carne bovina', 'salada', 'farofa'],
    calorias: 650,
    descricao: 'Almoço tradicional brasileiro'
  },
  'almoco_saudavel': {
    alimentos: ['arroz integral', 'feijão', 'frango grelhado', 'salada verde', 'legumes'],
    calorias: 480,
    descricao: 'Almoço nutritivo e balanceado'
  },
  'almoco_vegetariano': {
    alimentos: ['arroz integral', 'feijão', 'legumes', 'salada', 'queijo'],
    calorias: 420,
    descricao: 'Almoço vegetariano nutritivo'
  },
  'almoco_executivo': {
    alimentos: ['arroz', 'feijão', 'frango à parmegiana', 'batata frita', 'salada'],
    calorias: 720,
    descricao: 'Almoço executivo completo'
  },

  // Jantar
  'jantar_leve': {
    alimentos: ['sopa', 'salada', 'pão integral'],
    calorias: 320,
    descricao: 'Jantar leve e nutritivo'
  },
  'jantar_proteico': {
    alimentos: ['peixe grelhado', 'legumes', 'arroz integral'],
    calorias: 380,
    descricao: 'Jantar rico em proteínas'
  },
  'jantar_vegetariano': {
    alimentos: ['legumes', 'quinoa', 'salada', 'queijo'],
    calorias: 350,
    descricao: 'Jantar vegetariano'
  },

  // Lanches
  'lanche_frutas': {
    alimentos: ['fruta', 'iogurte', 'granola'],
    calorias: 180,
    descricao: 'Lanche com frutas'
  },
  'lanche_proteico': {
    alimentos: ['queijo', 'pão integral', 'fruta'],
    calorias: 220,
    descricao: 'Lanche rico em proteínas'
  },
  'lanche_docinho': {
    alimentos: ['bolo', 'café', 'leite'],
    calorias: 280,
    descricao: 'Lanche doce tradicional'
  },

  // PIZZAS E SALGADOS BRASILEIROS (FOCO ESPECIAL)
  'combo_pizza': {
    alimentos: ['pizza', 'refrigerante'],
    calorias: 650,
    descricao: 'Combo pizza com bebida'
  },
  'pizza_com_acompanhamento': {
    alimentos: ['pizza', 'batata frita', 'refrigerante'],
    calorias: 850,
    descricao: 'Pizza com batata frita e refrigerante'
  },
  'salgados_variados': {
    alimentos: ['coxinha', 'pastel', 'quibe', 'refrigerante'],
    calorias: 680,
    descricao: 'Combo de salgados variados'
  },
  'lanche_completo': {
    alimentos: ['hambúrguer', 'batata frita', 'refrigerante'],
    calorias: 850,
    descricao: 'Lanche completo'
  },
  'combo_torta': {
    alimentos: ['torta', 'suco'],
    calorias: 450,
    descricao: 'Torta com suco natural'
  },
  'cafe_da_manha_padaria': {
    alimentos: ['pão', 'café', 'queijo', 'presunto'],
    calorias: 380,
    descricao: 'Café da manhã de padaria'
  },
  'lanche_da_tarde': {
    alimentos: ['empada', 'café', 'brigadeiro'],
    calorias: 420,
    descricao: 'Lanche da tarde doce'
  },
  
  // Pratos específicos tradicionais
  'feijoada': {
    alimentos: ['feijão preto', 'carne de porco', 'arroz', 'farofa', 'couve', 'laranja'],
    calorias: 850,
    descricao: 'Feijoada completa'
  },
  'churrasco': {
    alimentos: ['carne bovina', 'frango', 'linguiça', 'arroz', 'farofa', 'salada'],
    calorias: 920,
    descricao: 'Churrasco brasileiro'
  },
  'moqueca': {
    alimentos: ['peixe', 'camarão', 'arroz', 'farofa', 'salada'],
    calorias: 680,
    descricao: 'Moqueca de peixe'
  },
  'strogonoff': {
    alimentos: ['frango', 'arroz', 'batata palha', 'salada'],
    calorias: 580,
    descricao: 'Strogonoff de frango'
  },
  'lasanha': {
    alimentos: ['massa', 'queijo', 'molho de tomate', 'carne moída', 'salada'],
    calorias: 720,
    descricao: 'Lasanha tradicional'
  },
  'pizza_margherita': {
    alimentos: ['massa de pizza', 'queijo mussarela', 'molho de tomate', 'manjericão'],
    calorias: 580,
    descricao: 'Pizza Margherita'
  },
  'pizza_calabresa': {
    alimentos: ['massa de pizza', 'queijo', 'calabresa', 'cebola', 'molho de tomate'],
    calorias: 650,
    descricao: 'Pizza Calabresa'
  },
  'pizza_portuguesa': {
    alimentos: ['massa de pizza', 'queijo', 'presunto', 'ovo', 'cebola', 'azeitona', 'molho de tomate'],
    calorias: 720,
    descricao: 'Pizza Portuguesa'
  },
  'pizza_quatro_queijos': {
    alimentos: ['massa de pizza', 'queijo mussarela', 'queijo parmesão', 'queijo gorgonzola', 'catupiry'],
    calorias: 680,
    descricao: 'Pizza Quatro Queijos'
  },
  'hamburguer': {
    alimentos: ['pão', 'carne bovina', 'queijo', 'alface', 'tomate', 'batata frita'],
    calorias: 780,
    descricao: 'Hambúrguer completo'
  },
  'sushi': {
    alimentos: ['arroz', 'peixe', 'alga', 'wasabi', 'gengibre'],
    calorias: 320,
    descricao: 'Sushi japonês'
  },
  'salada_completa': {
    alimentos: ['alface', 'tomate', 'cenoura', 'queijo', 'frango grelhado'],
    calorias: 280,
    descricao: 'Salada completa'
  },
  'sopa_nutritiva': {
    alimentos: ['legumes', 'frango', 'macarrão', 'temperos'],
    calorias: 220,
    descricao: 'Sopa nutritiva'
  }
};

// 🍽️ Base de conhecimento de porções brasileiras realistas (EXPANDIDA)
const PORCOES_BRASILEIRAS: Record<string, number> = {
  // 🍕 PIZZAS (FOCO ESPECIAL)
  'pizza': 130,
  'fatia de pizza': 130,
  'pizza margherita': 130,
  'pizza calabresa': 140,
  'pizza quatro queijos': 150,
  'pizza portuguesa': 160,
  'pizza de frango': 140,
  'pizza vegetariana': 120,
  'pizza doce': 120,
  'pizza napolitana': 130,
  'pizza pepperoni': 140,
  
  // 🥧 TORTAS E SALGADOS ASSADOS (FOCO ESPECIAL)
  'torta': 120,
  'fatia de torta': 120,
  'torta de frango': 120,
  'torta de palmito': 110,
  'torta de legumes': 100,
  'torta salgada': 120,
  'torta doce': 100,
  'quiche': 120,
  'empada': 50,
  'empada grande': 80,
  'esfiha': 45,
  'esfiha grande': 65,
  
  // 🥪 SALGADOS FRITOS (FOCO ESPECIAL)
  'coxinha': 70,
  'coxinha grande': 100,
  'pastel': 60,
  'pastel grande': 90,
  'quibe': 50,
  'quibe grande': 75,
  'risole': 45,
  'enroladinho': 40,
  'bolinha de queijo': 25,
  'pão de açúcar': 30,
  'joelho': 80,
  'croissant': 60,
  
  // 🍔 LANCHES (FOCO ESPECIAL)
  'hambúrguer': 180,
  'hambúrguer simples': 150,
  'hambúrguer duplo': 280,
  'cheeseburger': 200,
  'x-burger': 220,
  'x-salada': 200,
  'x-bacon': 250,
  'big mac': 230,
  'whopper': 290,
  'bauru': 180,
  'beirute': 200,
  'sanduíche': 150,
  'sanduíche natural': 120,
  'misto quente': 120,
  'hot dog': 140,
  'cachorro-quente': 140,
  'cachorro-quente completo': 200,
  'wrap': 180,
  
  // Proteínas tradicionais
  'frango grelhado': 150,
  'frango à parmegiana': 180,
  'frango assado': 150,
  'frango frito': 120,
  'carne bovina': 150,
  'carne assada': 150,
  'carne grelhada': 150,
  'bife': 150,
  'picanha': 180,
  'peixe': 120,
  'salmão': 120,
  'atum': 100,
  'camarão': 100,
  'ovo': 50,
  'ovos': 100,
  'omelete': 120,
  
  // Carboidratos e acompanhamentos
  'arroz branco': 100,
  'arroz integral': 100,
  'arroz': 100,
  'batata frita': 80,
  'batata': 150,
  'batata assada': 150,
  'purê de batata': 120,
  'batata doce': 150,
  'mandioca': 150,
  'polenta': 100,
  'macarrão': 100,
  'massa': 100,
  'espaguete': 100,
  'lasanha': 200,
  'nhoque': 150,
  'pão': 50,
  'pão francês': 50,
  'pão de forma': 25,
  'pão sírio': 60,
  'pão integral': 50,
  'baguete': 80,
  'croissant': 60,
  'torrada': 20,
  'farofa': 60,
  'feijão': 80,
  'feijão preto': 80,
  'feijão carioca': 80,
  'feijão tropeiro': 100,
  'feijoada': 200,
  
  // Vegetais e saladas
  'salada': 50,
  'alface': 30,
  'tomate': 60,
  'cenoura': 50,
  'brócolis': 80,
  'couve-flor': 80,
  'abobrinha': 70,
  'pepino': 40,
  'cebola': 30,
  'pimentão': 40,
  
  // Molhos e temperos
  'molho de tomate': 40,
  'molho': 40,
  'vinagrete': 30,
  'azeite': 15,
  'óleo': 15,
  'manteiga': 10,
  'queijo': 25,
  'queijo derretido': 25,
  'queijo ralado': 20,
  'requeijão': 30,
  
  // Bebidas (ml) - EXPANDIDAS
  'suco': 200,
  'suco de laranja': 200,
  'suco de limão': 200,
  'suco de uva': 200,
  'suco de maçã': 200,
  'suco natural': 200,
  'suco de caixinha': 200,
  'refrigerante': 350,
  'coca-cola': 350,
  'pepsi': 350,
  'guaraná': 350,
  'fanta': 350,
  'sprite': 350,
  'água': 250,
  'água com gás': 250,
  'água de coco': 300,
  'café': 150,
  'café expresso': 50,
  'cappuccino': 200,
  'café com leite': 200,
  'leite': 200,
  'leite achocolatado': 200,
  'vitamina': 250,
  'milkshake': 300,
  'smoothie': 250,
  'chá': 200,
  'chá gelado': 250,
  'cerveja': 350,
  'vinho': 150,
  'energético': 250,
  'isotônico': 500,
  
  // Outros
  'ervas': 3,
  'temperos': 5,
  'açúcar': 10,
  'sal': 2
};

function isLiquidName(name: string): boolean {
  const n = name.toLowerCase();
  return (
    n.includes('suco') ||
    n.includes('refrigerante') ||
    n.includes('água') || n.includes('agua') ||
    n.includes('café') || n.includes('cafe') ||
    n.includes('leite') ||
    n.includes('vitamina') ||
    n.includes('chá') || n.includes('cha') ||
    n.includes('cerveja') ||
    n.includes('vinho') ||
    n.includes('energético') || n.includes('energetico') ||
    n.includes('isotônico') || n.includes('isotonico')
  );
}

// 🍕 Função especializada para detectar tipos específicos de pizza
function detectPizzaType(foods: string[]): { type: string; confidence: number } | null {
  const normalizedFoods = foods.map(f => f.toLowerCase().trim());
  
  // Ingredientes específicos de pizzas brasileiras
  const pizzaTypes = {
    'margherita': ['tomate', 'manjericão', 'mussarela', 'queijo'],
    'calabresa': ['calabresa', 'cebola', 'queijo'],
    'portuguesa': ['presunto', 'ovo', 'cebola', 'azeitona', 'queijo'],
    'quatro_queijos': ['queijo', 'gorgonzola', 'parmesão', 'catupiry'],
    'frango': ['frango', 'catupiry', 'queijo'],
    'bacon': ['bacon', 'queijo', 'cebola'],
    'vegetariana': ['tomate', 'pimentão', 'cebola', 'azeitona', 'queijo'],
    'napolitana': ['tomate', 'mussarela', 'parmesão', 'orégano'],
    'pepperoni': ['pepperoni', 'queijo', 'molho']
  };
  
  for (const [type, ingredients] of Object.entries(pizzaTypes)) {
    let matches = 0;
    for (const ingredient of ingredients) {
      if (normalizedFoods.some(food => food.includes(ingredient))) {
        matches++;
      }
    }
    
    const confidence = matches / ingredients.length;
    if (confidence >= 0.6) { // 60% dos ingredientes detectados
      return { type, confidence };
    }
  }
  
  return null;
}

// 🥧 Função especializada para detectar tipos de torta
function detectTortaType(foods: string[]): { type: string; confidence: number; sweet: boolean } | null {
  const normalizedFoods = foods.map(f => f.toLowerCase().trim());
  
  const tortaTypes = {
    // Tortas salgadas
    'frango': { ingredients: ['frango', 'massa', 'queijo'], sweet: false },
    'palmito': { ingredients: ['palmito', 'massa', 'queijo'], sweet: false },
    'legumes': { ingredients: ['cenoura', 'vagem', 'massa', 'queijo'], sweet: false },
    'quiche': { ingredients: ['ovo', 'bacon', 'queijo', 'massa'], sweet: false },
    
    // Tortas doces
    'maçã': { ingredients: ['maçã', 'canela', 'massa', 'açúcar'], sweet: true },
    'chocolate': { ingredients: ['chocolate', 'massa', 'açúcar'], sweet: true },
    'limão': { ingredients: ['limão', 'massa', 'açúcar'], sweet: true },
    'morango': { ingredients: ['morango', 'chantilly', 'massa'], sweet: true }
  };
  
  for (const [type, data] of Object.entries(tortaTypes)) {
    let matches = 0;
    for (const ingredient of data.ingredients) {
      if (normalizedFoods.some(food => food.includes(ingredient))) {
        matches++;
      }
    }
    
    const confidence = matches / data.ingredients.length;
    if (confidence >= 0.5) { // 50% dos ingredientes detectados
      return { type, confidence, sweet: data.sweet };
    }
  }
  
  return null;
}

// 🥪 Função especializada para detectar tipos de salgados
function detectSalgadoType(foods: string[]): { type: string; confidence: number; fried: boolean } | null {
  const normalizedFoods = foods.map(f => f.toLowerCase().trim());
  
  const salgadoTypes = {
    'coxinha': { ingredients: ['frango', 'massa', 'farinha'], fried: true },
    'pastel': { ingredients: ['massa', 'queijo', 'presunto'], fried: true },
    'quibe': { ingredients: ['carne', 'trigo', 'temperos'], fried: true },
    'empada': { ingredients: ['frango', 'massa', 'azeitona'], fried: false },
    'esfiha': { ingredients: ['carne', 'massa', 'cebola'], fried: false },
    'risole': { ingredients: ['frango', 'massa', 'farinha'], fried: true },
    'enroladinho': { ingredients: ['presunto', 'queijo', 'massa'], fried: true },
    'pão_de_açúcar': { ingredients: ['queijo', 'polvilho'], fried: false }
  };
  
  for (const [type, data] of Object.entries(salgadoTypes)) {
    let matches = 0;
    for (const ingredient of data.ingredients) {
      if (normalizedFoods.some(food => food.includes(ingredient))) {
        matches++;
      }
    }
    
    const confidence = matches / data.ingredients.length;
    if (confidence >= 0.4) { // 40% dos ingredientes detectados
      return { type, confidence, fried: data.fried };
    }
  }
  
  return null;
}

// Função de cálculo nutricional direto usando tabela nutrition_foods
async function calculateNutritionDirect(items: Array<{name: string; grams?: number; ml?: number}>): Promise<{kcal: number; protein_g: number; carbs_g: number; fat_g: number; fiber_g: number; sodium_mg: number} | null> {
  const SYNONYMS: Record<string, string> = {
    'ovo': 'ovo de galinha cozido',
    'arroz': 'arroz branco cozido',
    'feijão': 'feijao preto cozido',
    'feijao': 'feijao preto cozido',
    'batata': 'batata cozida',
    'frango': 'frango grelhado',
    'carne': 'carne bovina cozida',
    'salada': 'salada verde',
    'farofa': 'farofa pronta'
  };

  const normalize = (text: string): string => {
    if (!text) return '';
    return text.toLowerCase().normalize('NFD').replace(/\p{Diacritic}+/gu, '').replace(/[^a-z0-9 ]/g, ' ').trim().replace(/\s+/g, ' ');
  };

  let totals = { kcal: 0, protein_g: 0, fat_g: 0, carbs_g: 0, fiber_g: 0, sodium_mg: 0 };

  for (const item of items) {
    if (!item.name || (!item.grams && !item.ml)) continue;

    const rawName = item.name;
    const synonym = SYNONYMS[rawName.toLowerCase().trim()];
    const searchName = synonym || rawName;

    // Buscar na base de dados nutrition_foods
    let food: any = null;
    
    const { data: nutritionFoods } = await supabase
      .from('nutrition_foods')
      .select('canonical_name, kcal, protein_g, fat_g, carbs_g, fiber_g, sodium_mg')
      .ilike('canonical_name', `%${searchName}%`)
      .limit(5);
        
    if (nutritionFoods && nutritionFoods.length > 0) {
      food = nutritionFoods[0];
    }

    if (!food) continue;

    // Calcular gramas efetivas
    let grams = Number(item.grams || 0);
    if (!grams && item.ml && food.density_g_ml) {
      grams = Number(item.ml) * Number(food.density_g_ml);
    }
    if (!grams) continue;

    // Calcular nutrientes (por 100g)
    const factor = grams / 100.0;
    const nutrients = {
      kcal: Number(food.kcal || 0) * factor,
      protein_g: Number(food.protein_g || 0) * factor,
      fat_g: Number(food.fat_g || 0) * factor,
      carbs_g: Number(food.carbs_g || 0) * factor,
      fiber_g: Number(food.fiber_g || 0) * factor,
      sodium_mg: Number(food.sodium_mg || 0) * factor,
    };

    totals.kcal += nutrients.kcal;
    totals.protein_g += nutrients.protein_g;
    totals.fat_g += nutrients.fat_g;
    totals.carbs_g += nutrients.carbs_g;
    totals.fiber_g += nutrients.fiber_g;
    totals.sodium_mg += nutrients.sodium_mg;
  }

  return totals;
}

// 🔍 Função para detectar combos de refeições
function detectComboRefeicao(foods: string[]): {combo: string, alimentos: string[], calorias: number, descricao: string} | null {
  const normalizedFoods = foods.map(f => f.toLowerCase().trim());
  
  // Verificar cada combo
  for (const [comboKey, comboData] of Object.entries(COMBOS_REFEICOES)) {
    const comboAlimentos = comboData.alimentos.map(a => a.toLowerCase());
    
    // Contar quantos alimentos do combo estão presentes
    let matches = 0;
    const matchedFoods: string[] = [];
    
    for (const alimento of comboAlimentos) {
      for (const detectedFood of normalizedFoods) {
        if (detectedFood.includes(alimento) || alimento.includes(detectedFood)) {
          matches++;
          matchedFoods.push(alimento);
          break;
        }
      }
    }
    
    // Se pelo menos 70% dos alimentos do combo foram detectados
    const matchPercentage = matches / comboAlimentos.length;
    if (matchPercentage >= 0.7) {
      return {
        combo: comboKey,
        alimentos: matchedFoods,
        calorias: comboData.calorias,
        descricao: comboData.descricao
      };
    }
  }
  
  return null;
}

// 🔧 Função para remover duplicatas e aplicar estimativas realistas
function removeDuplicatesAndEstimatePortions(foods: string[]): Array<{nome: string, quantidade: number}> {
  const normalizedFoods = new Map<string, number>();
  
  foods.forEach(food => {
    const normalizedFood = food.toLowerCase().trim();
    
    // Mapear variações para nomes padronizados
    let standardName = normalizedFood;
    
    // Encontrar porção correspondente (busca por palavras-chave)
    let portion = 0;
    for (const [key, value] of Object.entries(PORCOES_BRASILEIRAS)) {
      if (normalizedFood.includes(key.toLowerCase()) || key.toLowerCase().includes(normalizedFood)) {
        standardName = key;
        portion = value;
        break;
      }
    }
    
    // Se não encontrou, usar estimativa genérica baseada no tipo
    if (portion === 0) {
      if (normalizedFood.includes('carne') || normalizedFood.includes('frango') || normalizedFood.includes('peixe')) {
        portion = 150; // Proteínas
      } else if (normalizedFood.includes('arroz') || normalizedFood.includes('batata') || normalizedFood.includes('massa')) {
        portion = 100; // Carboidratos
      } else if (normalizedFood.includes('salada') || normalizedFood.includes('verdura') || normalizedFood.includes('legume')) {
        portion = 50; // Vegetais
      } else if (normalizedFood.includes('molho') || normalizedFood.includes('tempero')) {
        portion = 30; // Molhos/temperos
      } else if (normalizedFood.includes('suco') || normalizedFood.includes('bebida')) {
        portion = 200; // Bebidas
      } else {
        portion = 50; // Padrão genérico
      }
    }
    
    // Verificar se já existe um item similar (evitar duplicatas)
    let existingKey = null;
    for (const existingName of normalizedFoods.keys()) {
      if (existingName.includes(standardName) || standardName.includes(existingName)) {
        existingKey = existingName;
        break;
      }
    }
    
    if (existingKey) {
      // Combinar quantidades se for o mesmo alimento
      normalizedFoods.set(existingKey, Math.max(normalizedFoods.get(existingKey)!, portion));
    } else {
      normalizedFoods.set(standardName, portion);
    }
  });
  
  // Converter para array de objetos com nome e quantidade
  return Array.from(normalizedFoods.entries()).map(([nome, quantidade]) => ({
    nome: nome.charAt(0).toUpperCase() + nome.slice(1), // Capitalizar primeira letra
    quantidade
  }));
}

// 🏷️ Função para enviar previsões para Label Studio (validação)
async function sendToLabelStudio(imageUrl: string, detectedFoods: any[], confidence: number, userId: string): Promise<{ taskId?: string; success: boolean; error?: string }> {
  if (!labelStudioEnabled || !labelStudioUrl || !labelStudioToken || !labelStudioProjectId) {
    return { success: false, error: 'Label Studio não configurado' };
  }

  try {
    // Preparar previsões no formato Label Studio
    const predictions = detectedFoods.map((food, index) => ({
      id: `prediction_${index}`,
      score: confidence,
      result: [{
        id: `result_${index}`,
        type: 'choices',
        value: {
          choices: [food.name || food.nome || food]
        },
        from_name: 'food_detection',
        to_name: 'image'
      }]
    }));

    // Criar task no Label Studio
    const taskData = {
      data: {
        image: imageUrl
      },
      predictions: predictions,
      meta: {
        userId: userId,
        confidence: confidence,
        source: 'sofia-ai'
      }
    };

    const response = await fetch(`${labelStudioUrl}/api/tasks/`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${labelStudioToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        project: labelStudioProjectId,
        ...taskData
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro ao enviar para Label Studio:', response.status, errorText);
      return { success: false, error: `HTTP ${response.status}: ${errorText}` };
    }

    const result = await response.json();
    console.log('✅ Enviado para Label Studio:', result.id);
    
    return { 
      success: true, 
      taskId: result.id.toString() 
    };

  } catch (error) {
    console.error('❌ Erro ao enviar para Label Studio:', error);
    return { 
      success: false, 
      error: error.message || 'Erro desconhecido' 
    };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl, userId, userContext } = await req.json();
    
    console.log('📸 Recebida imagem para análise:', { imageUrl, userId, userContext });

    // Cliente Supabase já inicializado globalmente

    // Buscar dados do usuário
    let userProfile = null;
    let actualUserName = userContext?.userName || 'usuário';
    
    if (userId && userId !== 'guest') {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      userProfile = profile;
      if (profile) {
        actualUserName = profile.full_name || profile.email?.split('@')[0] || userContext?.userName || 'usuário';
      }
    }

    // Buscar base de conhecimento nutricional da tabela correta
    const { data: foodDatabase } = await supabase
      .from('nutrition_foods')
      .select('canonical_name, category')
      .limit(100);

    const foodKnowledge = foodDatabase?.map(food => food.canonical_name).join(', ') || 'arroz, feijão, frango, peixe, batata, macarrão, salada, carne, legumes, frutas';

    // 🔄 FLUXO CORRIGIDO: Google AI Gemini Vision (sem base64 para mais precisão)
    let detectedFoods = [];
    let detectedLiquids = [];
    let isFood = false;
    let confidence = 0;
    let estimatedCalories = 0;
    
    // 🎨 ANÁLISE AVANÇADA DE QUALIDADE DA IMAGEM
    let imageQualityInfo = null;
    if (enableImageQualityAnalysis) {
      console.log('🎨 Analisando qualidade da imagem...');
      imageQualityInfo = await analyzeImageQuality(imageUrl);
      console.log('📊 Qualidade da imagem:', {
        overall: imageQualityInfo.overallQuality.toFixed(2),
        brightness: imageQualityInfo.brightness.toFixed(2),
        contrast: imageQualityInfo.contrast.toFixed(2),
        blur: imageQualityInfo.blur.toFixed(2),
        noise: imageQualityInfo.noise.toFixed(2)
      });
      
      if (imageQualityInfo.recommendations.length > 0) {
        console.log('💡 Recomendações para melhorar a imagem:', imageQualityInfo.recommendations.join(', '));
      }
    }

    // 🦾 DETECÇÃO YOLO OTIMIZADA COM QUALIDADE ADAPTATIVA
    let yoloContext = null;
    console.log('🦾 YOLO: Iniciando detecção otimizada de objetos...');
    
    // Tentar ensemble primeiro se habilitado
    if (enableEnsembleDetection) {
      console.log('🔄 Tentando detecção ensemble...');
      const ensembleResult = await runEnsembleDetection(imageUrl);
      if (ensembleResult) {
        console.log('✅ Ensemble detectou objetos:', ensembleResult.objects.length);
        // Converter para formato compatível
        yoloContext = {
          foods: ensembleResult.objects.filter(obj => !obj.name.includes('copo') && !obj.name.includes('garrafa')).map(obj => obj.name),
          liquids: ensembleResult.objects.filter(obj => obj.name.includes('copo') || obj.name.includes('garrafa')).map(obj => obj.name),
          objects: ensembleResult.objects,
          maxConfidence: ensembleResult.confidence,
          totalObjects: ensembleResult.objects.length,
          detectionQuality: getDetectionQuality(ensembleResult.confidence, ensembleResult.objects.length, ensembleResult.confidence),
          confidenceUsed: ensembleResult.confidence,
          model: ensembleResult.model
        };
      }
    }
    
    // Se ensemble não funcionou, usar detecção normal
    if (!yoloContext) {
      yoloContext = await tryYoloDetect(imageUrl);
    }
    
    if (yoloContext) {
      console.log('✅ YOLO detectou contexto:', { 
        totalObjects: yoloContext.totalObjects,
        foods: yoloContext.foods?.length || 0,
        liquids: yoloContext.liquids?.length || 0,
        maxConfidence: yoloContext.maxConfidence.toFixed(2),
        quality: yoloContext.detectionQuality,
        confidenceUsed: yoloContext.confidenceUsed.toFixed(2),
        model: yoloContext.model || 'standard'
      });
      
      // 🎯 Ajustar estratégia baseado na qualidade da detecção
      if (yoloContext.detectionQuality === 'excellent') {
        console.log('🏆 YOLO: Detecção excelente - Gemini terá contexto rico');
      } else if (yoloContext.detectionQuality === 'good') {
        console.log('👍 YOLO: Detecção boa - Gemini complementará com análise');
      } else {
        console.log('⚠️ YOLO: Detecção limitada - Gemini será mais crítico');
      }
      
      // 🎨 Ajustar confiança baseado na qualidade da imagem
      if (imageQualityInfo && yoloUseAdaptiveConfidence) {
        const adaptiveConfidence = calculateAdaptiveConfidence(imageQualityInfo.overallQuality, yoloContext.confidenceUsed);
        console.log(`🎯 Confiança adaptativa: ${yoloContext.confidenceUsed.toFixed(2)} → ${adaptiveConfidence.toFixed(2)}`);
      }
    } else {
      console.log('⚠️ YOLO: Nenhum objeto detectado ou serviço indisponível');
    }

    // 🤖 ANÁLISE APRIMORADA COM SISTEMA ANTI-RATE-LIMIT
    if (googleAIApiKey) {
      console.log('🤖 Iniciando análise aprimorada com múltiplas estratégias...');
      try {
        const enhancedResult = await analyzeWithEnhancedAI(imageUrl);
        
        // Processar resultado da análise aprimorada
        if (enhancedResult && enhancedResult.foods && enhancedResult.foods.length > 0) {
          isFood = true;
          confidence = enhancedResult.foods.reduce((sum, f) => sum + f.confidence, 0) / enhancedResult.foods.length;
          detectedFoods = enhancedResult.foods.map(food => ({
            nome: food.name,
            quantidade: food.grams
          }));
          estimatedCalories = enhancedResult.total_calories || 0;
          
          console.log(`✅ Análise aprimorada detectou ${detectedFoods.length} alimentos com confiança média ${confidence.toFixed(2)}`);
        } else {
          console.log('⚠️ Análise aprimorada não detectou alimentos válidos');
          isFood = false;
          confidence = 0;
        }

EXPERTISE ESPECIAL - FOQUE NESTES ALIMENTOS:
🍕 PIZZAS: fatia de pizza, pizza margherita, pizza calabresa, pizza quatro queijos, pizza portuguesa, pizza de frango, pizza vegetariana, pizza doce
🥧 TORTAS: torta de frango, torta de palmito, torta de legumes, torta doce, torta de maçã, torta de chocolate, quiche, torta salgada
🥪 SALGADOS: coxinha, pastel, empada, esfiha, quibe, risole, enroladinho, bolinha de queijo, pão de açúcar, joelho, croissant
🍔 LANCHES: hambúrguer, sanduíche, wrap, hot dog, cachorro-quente, misto quente, x-burger, bauru, beirute
🧁 DOCES: brigadeiro, beijinho, bem-casado, cupcake, brownie, cookie, bolinho, petit four

REGRAS DE ANÁLISE APRIMORADA:
- 🎯 Use o contexto do YOLO como ponto de partida, mas faça análise visual completa
- 🔍 Para PIZZAS: identifique sabor, tamanho da fatia, ingredientes visíveis, tipo de massa
- 🔍 Para TORTAS: determine se é doce ou salgada, recheio, tipo de massa, tamanho da porção  
- 🔍 Para SALGADOS: identifique tipo específico, tamanho, formato, se é frito ou assado
- 🔍 Para LANCHES: identifique ingredientes, tipo de pão, tamanho, acompanhamentos
- 🔍 SEMPRE mencione detalhes visuais como cores, texturas, apresentação

**SE FOR COMIDA:**
- 🍽️ Identifique TODOS os alimentos sólidos com nomes específicos em português brasileiro
- 🥤 Identifique TODOS os líquidos/bebidas presentes
- 🔥 Estime calorias realistas considerando porções brasileiras (150-1500 kcal)
- 🎨 Seja MUITO específico sobre tipos, sabores, preparos e apresentação
- 📏 Estime tamanho/porção (pequena, média, grande, individual, para compartilhar)

**SE NÃO FOR COMIDA:**
- 📸 Descreva detalhadamente o que está na imagem
- 🏷️ Identifique objetos, pessoas, lugares, documentos, etc.
- 💬 Forneça uma análise útil e contextual

**CONFIDENCE SCORING:**
- 0.90-0.95: Alimentos claramente identificáveis, boa iluminação, foco nítido
- 0.80-0.89: Alimentos bem visíveis com pequenas limitações
- 0.70-0.79: Alimentos identificáveis mas com algumas dificuldades
- 0.60-0.69: Alimentos parcialmente visíveis ou de difícil identificação
- Abaixo de 0.60: Imagem muito escura, desfocada ou sem alimentos claros

Retorne APENAS JSON válido:
{
  "is_food": true/false,
  "confidence": 0.0-1.0,
  "content_type": "food/document/person/object/place/other",
  "description": "Descrição detalhada do conteúdo da imagem",
  "foods_detected": ["alimento específico 1", "alimento específico 2"],
  "liquids_detected": ["líquido1", "líquido2"],
  "estimated_calories": número,
  "meal_type": "breakfast/lunch/dinner/snack/dessert",
  "portion_size": "pequena/média/grande/individual/compartilhar",
  "objects_detected": ["objeto1", "objeto2"],
  "analysis": "Análise completa e específica em português brasileiro"
}` },
                { inline_data: { mime_type: img.mime, data: img.base64 } }
              ]
            }],
            generationConfig: { temperature: 0.1, maxOutputTokens: 1000 }
          })
        });

        if (!visionResponse.ok) throw new Error(`Google AI error: ${visionResponse.status}`);
        const visionData = await visionResponse.json();
        const responseText = visionData.candidates?.[0]?.content?.parts?.[0]?.text || '';
        try {
          const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) || responseText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const analysisData = JSON.parse(jsonMatch[1] || jsonMatch[0]);
            isFood = analysisData.is_food || false;
            confidence = analysisData.confidence || 0;
            detectedFoods = analysisData.foods_detected || [];
            detectedLiquids = analysisData.liquids_detected || [];
            estimatedCalories = analysisData.estimated_calories || 0;
            
            // Novos campos para análise versátil
            const contentType = analysisData.content_type || 'other';
            const description = analysisData.description || '';
            const objectsDetected = analysisData.objects_detected || [];
            const analysis = analysisData.analysis || '';
            
            console.log('📊 Análise versátil:', { 
              isFood, 
              contentType, 
              confidence,
              description: description.substring(0, 100) + '...'
            });
          }
        } catch (_parseError) {
          isFood = false;
          console.log('⚠️ Erro ao processar JSON da análise');
        }

        if (isFood) {
          try {
            const detailedResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${googleAIApiKey}`, {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{
                  parts: [
                    { text: `Você é um nutricionista especialista em alimentos brasileiros. Analise esta imagem com foco em ESTIMATIVAS PRECISAS DE PORÇÕES e retorne APENAS JSON válido:

${yoloContext ? `🦾 CONTEXTO DO YOLO11: ${yoloContext.objects?.map((obj: any) => obj.class_name + ' (confiança: ' + obj.score + ')').join(', ') || 'Nenhum objeto detectado'}` : ''}

ESPECIALIZAÇÃO EM PORÇÕES BRASILEIRAS:
🍕 PIZZA: 1 fatia média = 120-150g (250-350 kcal), fatia grande = 180-220g (400-500 kcal)
🥧 TORTA SALGADA: 1 fatia = 100-150g (280-420 kcal), pedaço pequeno = 80g (220 kcal)
🥪 COXINHA: 1 unidade média = 60-80g (180-250 kcal), grande = 100g (300 kcal)
🥪 PASTEL: 1 unidade = 50-70g (150-220 kcal), grande = 90g (280 kcal)
🥪 EMPADA: 1 unidade = 40-60g (120-180 kcal)
🍔 HAMBÚRGUER: simples = 150-200g (350-450 kcal), duplo = 250-300g (550-650 kcal)
🌭 HOT DOG: tradicional = 120-150g (300-400 kcal), completo = 200g (500 kcal)
🥪 SANDUÍCHE: simples = 100-150g (250-350 kcal), completo = 200-250g (400-500 kcal)

INSTRUÇÕES DETALHADAS:
- 🔍 IDENTIFIQUE cada alimento específico (não genérico)
- ⚖️ ESTIME gramas baseado em porções brasileiras realistas
- 🔥 CALCULE calorias considerando preparo (frito, assado, grelhado)
- 📊 Use contexto visual para ajustar porções (compare com utensílios, mãos, pratos)
- 🎯 Para alimentos similares no prato, some as quantidades

REGRAS DE ESTIMATIVA:
- Se vê 1 fatia de pizza → 130g (300 kcal média)
- Se vê 2 coxinhas → 2x70g = 140g (420 kcal total)
- Se vê porção de batata frita → 80-120g (200-300 kcal)
- Se vê sanduíche grande → 200g (450 kcal)
- Se vê bebida em copo → 250-350ml

Para LÍQUIDOS use ML, para SÓLIDOS use GRAMAS.

BASE (pt-BR): ${foodKnowledge}

REGRAS:
- Use o contexto do YOLO11 para focar nos objetos detectados
- Liste todos os alimentos/ingredientes, molhos, temperos e bebidas presentes
- Seja específico nos tipos (ex.: feijão preto, arroz branco, frango grelhado, salada verde)
- Estime gramas (sólidos) ou mL (líquidos) realistas por item
- Não some itens duplicados; prefira mesclar em um único item com quantidade total
- Não use markdown, não use comentários, apenas JSON

Retorne APENAS JSON válido:
{
  "detailed_foods": ["item1", "item2", ...],
  "detailed_liquids": ["bebida1", "bebida2", ...],
  "cooking_methods": ["grelhado", "refogado", ...],
  "seasonings": ["tempero1", "molho1", ...],
  "estimated_calories": numero,
  "confidence": 0.0-1.0,
  "items": [{"name":"arroz branco","grams":120,"ml":null,"method":"cozido","confidence":0.85},{"name":"suco de laranja","grams":null,"ml":200,"method":"liquido","confidence":0.9}] 
}` },
                    { inline_data: { mime_type: img.mime, data: img.base64 } }
                  ]
                }],
                generationConfig: { temperature: 0.1, maxOutputTokens: 1200 }
              })
            });

            if (detailedResponse.ok) {
              const det = await detailedResponse.json();
              const detailText = det.candidates?.[0]?.content?.parts?.[0]?.text || '';
              const detailJsonMatch = detailText.match(/```json\s*([\s\S]*?)\s*```/) || detailText.match(/\{[\s\S]*\}/);
              if (detailJsonMatch) {
                const detailed = JSON.parse(detailJsonMatch[1] || detailJsonMatch[0]);
                const extraFoods = [ ...(detailed.detailed_foods || []), ...(detailed.detailed_liquids || []), ...(detailed.seasonings || []) ];
                const combined = [...(Array.isArray(detectedFoods) ? detectedFoods : []), ...extraFoods];
                detectedFoods = removeDuplicatesAndEstimatePortions(combined.filter((x: string) => x && x.length > 0));
                estimatedCalories = Math.max(estimatedCalories, detailed.estimated_calories || 0);
                confidence = Math.max(confidence, detailed.confidence || 0);
              }
            }
          } catch (_e) {
            // mantém análise inicial
          }
        }

      } catch (error) {
        console.log('❌ Erro na análise da imagem:', error);
        isFood = false;
      }
    } else {
      // YOLO já cobriu
      // nada a fazer
    }


    console.log('🔍 Verificando se detectou comida...');
    
    // Se não detectou comida ou confiança baixa
    if (!isFood || confidence < 0.5) {
      console.log('❌ Comida não detectada ou confiança baixa');
      
      return new Response(JSON.stringify({
        success: false,
        message: `Oi ${actualUserName}! 😊 Não consegui ver claramente os alimentos na imagem. 

💡 **Dicas para uma melhor análise:**
- Certifique-se de que a imagem mostra alimentos claramente
- Tente tirar uma nova foto com boa iluminação
- Evite sombras ou reflexos na imagem

Ou você pode me contar o que está comendo! 😉✨`,
        is_food: false,
        confidence: confidence
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('✅ Comida detectada! Gerando análise nutricional...');

    // 🍽️ Detectar combos de refeições
    const allDetectedFoods = Array.isArray(detectedFoods) && detectedFoods.length > 0 && typeof detectedFoods[0] === 'object'
      ? detectedFoods.map(food => food.nome)
      : detectedFoods;
    
    const comboDetected = detectComboRefeicao(allDetectedFoods);
    
    // 🍽️ Formatar lista de alimentos com quantidades realistas
    let foodList = '';
    let comboInfo = '';
    
    if (comboDetected) {
      console.log('🎯 Combo detectado:', comboDetected);
      // Não usar calorias estimadas do combo no texto final (priorizar cálculo determinístico)
      comboInfo = `\n🍽️ **COMBO DETECTADO:** ${comboDetected.descricao}\n`;
      foodList = comboDetected.alimentos.map(food => `• ${food}`).join('\n');
    } else {
      foodList = Array.isArray(detectedFoods) && detectedFoods.length > 0 && typeof detectedFoods[0] === 'object'
        ? detectedFoods.map(food => `• ${food.nome} – ${food.quantidade}g`).join('\n')
        : detectedFoods.map(food => `• ${food}`).join('\n');
    }

    // 🔢 Integração determinística: calcular localmente (TACO-like) com itens detectados
    let calcItems: Array<{ name: string; grams?: number; ml?: number; state?: string }>; 
    const aiPortionItems = (globalThis as any).__AI_PORTION_ITEMS__ as Array<{name: string; grams?: number; ml?: number; method?: string}> | undefined;
    if (aiPortionItems && aiPortionItems.length > 0) {
      // Preferir itens estimados pela IA
      let itemsForCalc = aiPortionItems.map((it) => ({
        name: it.name,
        grams: isLiquidName(it.name) ? undefined : it.grams,
        ml: isLiquidName(it.name) ? it.ml : undefined,
        state: it.method
      }));
      // Normalizar via Ollama (dedupe/canonizar) – não altera gramas, apenas nomes e soma duplicatas
      itemsForCalc = await callOllamaNormalizer(itemsForCalc);
      calcItems = itemsForCalc;
    } else {
      // Sem AI items
      if (strictMode) {
        calcItems = [];
      } else {
        // Fallback: porções padrão (apenas quando strictMode=false)
        let itemsForCalc = (Array.isArray(detectedFoods) && detectedFoods.length > 0 && typeof detectedFoods[0] === 'object'
          ? detectedFoods as Array<{nome: string, quantidade: number}>
          : (detectedFoods as string[]).map((n) => ({ nome: n, quantidade: PORCOES_BRASILEIRAS[n.toLowerCase()] || (isLiquidName(n) ? 200 : 100) }))
        )
          .map((f) => ({
            name: f.nome,
            grams: isLiquidName(f.nome) ? undefined : f.quantidade,
            ml: isLiquidName(f.nome) ? f.quantidade : undefined,
          }));
        itemsForCalc = await callOllamaNormalizer(itemsForCalc);
        calcItems = itemsForCalc;
      }
    }

    // Cálculo nutricional direto usando nutrition_foods
    let localDeterministic: any = null;
    try {
      const itemsForLocal = (calcItems || [])
        .filter(it => !!it.name && (Number(it.grams) || 0) > 0)
        .map(it => ({ name: String(it.name), grams: Number(it.grams) }));
      if (itemsForLocal.length > 0) {
        const nutritionResult = await calculateNutritionDirect(itemsForLocal);
        if (nutritionResult) {
          const totalGrams = itemsForLocal.reduce((sum, item) => sum + item.grams, 0);
          localDeterministic = {
            totals: {
              kcal: nutritionResult.kcal,
              protein: nutritionResult.protein_g,
              carbs: nutritionResult.carbs_g,
              fat: nutritionResult.fat_g,
              fiber: nutritionResult.fiber_g,
              sodium: nutritionResult.sodium_mg
            },
            grams_total: totalGrams,
            flags: []
          };
        }
      }
    } catch (e) {
      console.log('⚠️ Erro no cálculo nutricional:', e);
    }

    let macrosBlock = '';
    if (localDeterministic && localDeterministic.grams_total > 0) {
      // Cálculo por grama com base no peso efetivo total
      const totalGrams = Number(localDeterministic.grams_total) || 0;
      const perGram = totalGrams > 0 ? {
        kcal_pg: localDeterministic.totals.kcal / totalGrams,
        protein_pg: localDeterministic.totals.protein / totalGrams,
        carbs_pg: localDeterministic.totals.carbs / totalGrams,
        fat_pg: localDeterministic.totals.fat / totalGrams,
        fiber_pg: (localDeterministic.totals.fiber || 0) / totalGrams,
      } : null;

      const perGramText = perGram ? `\n- Por grama: ${perGram.kcal_pg.toFixed(2)} kcal/g, P ${perGram.protein_pg.toFixed(3)} g/g, C ${perGram.carbs_pg.toFixed(3)} g/g, G ${perGram.fat_pg.toFixed(3)} g/g` : '';

      macrosBlock = `📊 Nutrientes (fórmula 4×P + 4×C + 9×G):
- Proteínas: ${localDeterministic.totals.protein.toFixed(1)} g
- Carboidratos: ${localDeterministic.totals.carbs.toFixed(1)} g
- Gorduras: ${localDeterministic.totals.fat.toFixed(1)} g
- Calorias: ${Math.round(4 * localDeterministic.totals.protein + 4 * localDeterministic.totals.carbs + 9 * localDeterministic.totals.fat)} kcal
- Fibras: ${Number(localDeterministic.totals.fiber || 0).toFixed(1)} g
- Sódio: ${Number(localDeterministic.totals.sodium || 0).toFixed(0)} mg${perGramText}

`;
    } else if (strictMode) {
      // Mensagem amigável pedindo gramas quando não há dados suficientes
      const neededList = (Array.isArray(detectedFoods) && detectedFoods.length > 0 && typeof detectedFoods[0] === 'object')
        ? (detectedFoods as Array<{nome: string, quantidade: number}>).map(f => f.nome)
        : (detectedFoods as string[]);
      const chips = ['30g','50g','80g','100g','150g'];
      const ask = `Não consegui estimar as quantidades com segurança. Pode confirmar as gramas de cada item? Ex.: ${chips.join(', ')}.`;
      const finalStrict = `Oi ${actualUserName}! 😊\n\n📸 Itens detectados:\n${neededList.map(n=>`• ${n}`).join('\n')}\n\n${ask}`;

      return new Response(JSON.stringify({
        success: true,
        requires_confirmation: true,
        analysis_id: null,
        sofia_analysis: {
          analysis: finalStrict,
          personality: 'amigavel',
          foods_detected: detectedFoods,
          confirmation_required: true
        },
        food_detection: {
          foods_detected: detectedFoods,
          is_food: true,
          confidence: confidence,
          estimated_calories: 0,
          nutrition_totals: null,
          meal_type: userContext?.currentMeal || 'refeicao'
        },
        alimentos_identificados: neededList
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // ✅ NOVA REGRA: Calcular APENAS com 4×P + 4×C + 9×G usando dados da TACO
    let newRuleMacros = '';
    
    if (localDeterministic && localDeterministic.grams_total > 0) {
      const P = Number(localDeterministic.totals.protein) || 0;
      const C = Number(localDeterministic.totals.carbs) || 0; 
      const G = Number(localDeterministic.totals.fat) || 0;
      const totalKcal = Math.round(4 * P + 4 * C + 9 * G);
      
      newRuleMacros = `📊 Nutrientes (TACO):
${P.toFixed(1)} g P, ${C.toFixed(1)} g C, ${G.toFixed(1)} g G → ${totalKcal} kcal

`;
    }

    // Criar mensagem baseada no tipo de conteúdo
    let finalMessage = '';
    
    if (isFood) {
      // Mensagem para comida usando NOVA REGRA
      finalMessage = `Oi ${actualUserName}! 😊

📸 Analisei sua refeição e identifiquei:
${foodList}

${newRuleMacros}🤔 Esses alimentos estão corretos?`;
    } else {
      // Mensagem para outros tipos de conteúdo
      finalMessage = `Oi querido(a)! 💕 Que foto interessante! 😊

📸 Vi sua imagem e estou aqui para te ajudar!

✨ Precisa de mais alguma coisa, amor? Estou aqui para você! 🤗`;
    }

    // 💾 Salvar análise no banco ANTES da confirmação
    let savedAnalysis: any = null;
    
    // 🏷️ Enviar para Label Studio se habilitado (validação)
    let labelStudioResult: { taskId?: string; success: boolean; error?: string } = { success: false };
    if (labelStudioEnabled && isFood && confidence >= 0.5) {
      console.log('🏷️ Enviando para Label Studio para validação...');
      labelStudioResult = await sendToLabelStudio(imageUrl, detectedFoods, confidence, userId);
      if (labelStudioResult.success) {
        console.log('✅ Task criada no Label Studio:', labelStudioResult.taskId);
      } else {
        console.log('⚠️ Falha ao enviar para Label Studio:', labelStudioResult.error);
      }
    }
    
    // Só salvar se não for usuário guest
    if (userId && userId !== 'guest') {
      // 📝 Extrair apenas os nomes dos alimentos para o banco (compatibilidade)
      const foodNames = Array.isArray(detectedFoods) && detectedFoods.length > 0 && typeof detectedFoods[0] === 'object'
        ? detectedFoods.map(food => food.nome)
        : detectedFoods;

      const analysisRecord = {
        user_id: userId,
        user_name: actualUserName,
        image_url: imageUrl,
        foods_detected: foodNames,
        total_calories: estimatedCalories,
        sofia_analysis: finalMessage,
        confirmed_by_user: false,
        confirmation_prompt_sent: true,
        confirmation_status: 'pending',
        label_studio_task_id: labelStudioResult.taskId || null,
        created_at: new Date().toISOString()
      };

      const { data: dbResult, error: insertError } = await supabase
        .from('sofia_food_analysis')
        .insert(analysisRecord)
        .select()
        .single();

      console.log('💾 Tentativa de salvar análise:', { analysisRecord, insertError });

      if (insertError) {
        console.error('❌ Erro ao salvar análise:', insertError);
        // Não falhar por causa do banco, continuar com a análise
      } else {
        savedAnalysis = dbResult;
      }
    } else {
      console.log('⚠️ Usuário guest, não salvando no banco');
    }

    // 💬 Salvar conversa de confirmação
    if (userId && userId !== 'guest' && savedAnalysis) {
      try {
        await supabase.from('sofia_conversations').insert({
          user_id: userId,
          user_message: 'Enviou foto de refeição',
          sofia_response: finalMessage,
          context_data: {
            type: 'food_confirmation_request',
            analysis_id: savedAnalysis.id,
            detected_foods: detectedFoods,
            estimated_calories: estimatedCalories,
            confidence: confidence
          },
          conversation_type: 'food_analysis',
          related_analysis_id: savedAnalysis.id,
          created_at: new Date().toISOString()
        });
      } catch (conversationError) {
        console.log('⚠️ Erro ao salvar conversa:', conversationError);
        // Não falhar por causa disso
      }
    }

    // Determinar calorias finais: usar APENAS fórmula 4×P + 4×C + 9×G
    let deterministicKcal = null;
    if (localDeterministic && localDeterministic.grams_total > 0) {
      const P = Number(localDeterministic.totals.protein) || 0;
      const C = Number(localDeterministic.totals.carbs) || 0; 
      const G = Number(localDeterministic.totals.fat) || 0;
      deterministicKcal = Math.round(4 * P + 4 * C + 9 * G);
    }
    const finalKcal = deterministicKcal ?? Math.round(estimatedCalories || 0);

    // Aviso de densidade anômala quando flags density_too_low_* estiverem presentes
    try {
      if (localDeterministic && Array.isArray(localDeterministic.flags)) {
        const hasDensityLow = localDeterministic.flags.some((f: string) => String(f).startsWith('density_too_low_'));
        if (hasDensityLow) {
          const density = (localDeterministic.totals.kcal || 0) / (localDeterministic.grams_total || 1);
          console.warn('[Sofia] Density anomaly', { analysis_id: savedAnalysis?.id, density, flags: localDeterministic.flags, items: localDeterministic.details?.map((d:any)=>({name:d.name, grams:d.grams, key:d.key})) });
        }
      }
    } catch (_e) { /* noop */ }

    return new Response(JSON.stringify({
      success: true,
      requires_confirmation: true,
      analysis_id: savedAnalysis?.id,
      sofia_analysis: {
        analysis: finalMessage,
        personality: 'amigavel',
        foods_detected: detectedFoods,
        confidence: confidence,
        estimated_calories: finalKcal,
        nutrition_totals: localDeterministic && localDeterministic.grams_total > 0 ? localDeterministic : null,
        confirmation_required: true
      },
      food_detection: {
        foods_detected: detectedFoods,
        is_food: true,
        confidence: confidence,
        estimated_calories: finalKcal,
        nutrition_totals: localDeterministic && localDeterministic.grams_total > 0 ? localDeterministic : null,
        meal_type: userContext?.currentMeal || 'refeicao'
      },
      alimentos_identificados: detectedFoods // Para compatibilidade
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Erro na análise de imagem da Sofia:', error);
    
    return new Response(JSON.stringify({
      success: false,
      message: 'Ops! Não consegui analisar sua foto agora. Pode me contar o que você está comendo? 📸😊',
      error: error.message
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});