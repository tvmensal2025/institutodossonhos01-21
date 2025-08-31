// Configurações de branding do Instituto dos Sonhos

export const INSTITUTO_BRANDING = {
  name: 'Instituto dos Sonhos',
  tagline: 'Transformação Real',
  logo: '/images/instituto-logo.png',
  
  // Cores principais (seguindo o design system)
  colors: {
    primary: 'hsl(var(--primary))',
    secondary: 'hsl(var(--secondary))',
    accent: 'hsl(var(--accent))',
  },
  
  // URLs e contatos
  contact: {
    email: 'contato@institutodossonhos.com.br',
    phone: '(11) 99999-9999',
    whatsapp: '5511999999999',
    address: 'São Paulo, SP - Brasil',
  },
  
  // Redes sociais
  social: {
    instagram: '@institutodossonhos',
    facebook: 'Instituto dos Sonhos',
    youtube: 'Instituto dos Sonhos',
    linkedin: 'Instituto dos Sonhos',
  },
  
  // SEO e metadados
  seo: {
    title: 'Instituto dos Sonhos - Transformação Integral',
    description: 'Transforme seu corpo e sua vida com nosso método exclusivo de emagrecimento integral. Aqui seus sonhos se tornam realidade.',
    keywords: [
      'emagrecimento',
      'transformação',
      'saúde',
      'bem-estar',
      'instituto',
      'sonhos',
      'academia',
      'nutrição',
      'fitness'
    ],
    ogImage: '/images/instituto-logo.png',
  },
  
  // Locais estratégicos para mostrar a logo
  locations: {
    header: true,
    footer: true,
    auth: true,
    dashboard: true,
    chat: true,
    emails: true,
    loading: true,
    error: true,
  }
};

// Função para obter URL da logo com fallback
export const getInstitutoLogo = (fallback = '/favicon.png') => {
  return INSTITUTO_BRANDING.logo || fallback;
};

// Função para obter informações de contato formatadas
export const getContactInfo = () => {
  return {
    emailFormatted: INSTITUTO_BRANDING.contact.email,
    phoneFormatted: INSTITUTO_BRANDING.contact.phone,
    whatsappUrl: `https://wa.me/${INSTITUTO_BRANDING.contact.whatsapp}`,
    addressFormatted: INSTITUTO_BRANDING.contact.address,
  };
};

// Função para obter metadados SEO
export const getSEOMetadata = (customTitle?: string, customDescription?: string) => {
  return {
    title: customTitle || INSTITUTO_BRANDING.seo.title,
    description: customDescription || INSTITUTO_BRANDING.seo.description,
    keywords: INSTITUTO_BRANDING.seo.keywords.join(', '),
    ogImage: INSTITUTO_BRANDING.seo.ogImage,
    ogTitle: customTitle || INSTITUTO_BRANDING.seo.title,
    ogDescription: customDescription || INSTITUTO_BRANDING.seo.description,
  };
};