// Configuração centralizada das imagens dos personagens
// Sistema híbrido: imagens locais + URLs do Supabase quando disponíveis

// URLs do Supabase (quando disponíveis)
const SUPABASE_URLS = {
  DR_VITAL: 'https://hlrkoyywjpckdotimtik.supabase.co/storage/v1/object/public/course-thumbnails/Dr.Vital%20sem%20fundo.png',
  SOFIA: 'https://hlrkoyywjpckdotimtik.supabase.co/storage/v1/object/public/course-thumbnails/Sofia%20sem%20fundo.png'
};

// URLs locais (fallback)
const LOCAL_URLS = {
  DR_VITAL: '/images/dr-vital.png',
  SOFIA: '/images/sofia.png'
};

// Função para verificar se uma URL está acessível
async function checkImageUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

// Função para obter a melhor URL disponível
async function getBestImageUrl(characterType: 'dr-vital' | 'sofia'): Promise<string> {
  const supabaseUrl = SUPABASE_URLS[characterType.toUpperCase() as keyof typeof SUPABASE_URLS];
  const localUrl = LOCAL_URLS[characterType.toUpperCase() as keyof typeof LOCAL_URLS];
  
  // Tentar URL do Supabase primeiro
  if (await checkImageUrl(supabaseUrl)) {
    return supabaseUrl;
  }
  
  // Fallback para URL local
  return localUrl;
}

export const CHARACTER_IMAGES = {
  DR_VITAL: {
    name: 'Dr. Vital',
    // URL híbrida - tenta Supabase primeiro, depois local
    imageUrl: SUPABASE_URLS.DR_VITAL,
    fallbackUrl: LOCAL_URLS.DR_VITAL,
    description: 'Médico especialista em saúde e bem-estar',
    role: 'doctor',
    colors: {
      primary: 'from-blue-500 to-blue-600',
      secondary: 'from-blue-400 to-blue-500'
    }
  },
  SOFIA: {
    name: 'Sofia',
    // URL híbrida - tenta Supabase primeiro, depois local
    imageUrl: SUPABASE_URLS.SOFIA,
    fallbackUrl: LOCAL_URLS.SOFIA,
    description: 'Assistente virtual e coach de saúde',
    role: 'assistant',
    colors: {
      primary: 'from-purple-500 to-purple-600',
      secondary: 'from-purple-400 to-purple-500'
    }
  }
};

// Função para obter imagem por tipo de personagem
export const getCharacterImage = (characterType: 'dr-vital' | 'sofia') => {
  switch (characterType) {
    case 'dr-vital':
      return CHARACTER_IMAGES.DR_VITAL;
    case 'sofia':
      return CHARACTER_IMAGES.SOFIA;
    default:
      return CHARACTER_IMAGES.SOFIA;
  }
};

// Função para obter URL da imagem (com fallback)
export const getCharacterImageUrl = (characterType: 'dr-vital' | 'sofia') => {
  const image = getCharacterImage(characterType);
  
  // Agora usar as URLs do Supabase que foram uploadadas
  return image.imageUrl;
};

// Função para obter dados completos do personagem
export const getCharacterData = (characterType: 'dr-vital' | 'sofia') => {
  return getCharacterImage(characterType);
};

// Função para obter URL com verificação assíncrona
export const getCharacterImageUrlAsync = async (characterType: 'dr-vital' | 'sofia') => {
  return await getBestImageUrl(characterType);
};
