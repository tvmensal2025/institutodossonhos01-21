/** @type {import('@lovable/config').Config} */
module.exports = {
  // Configurações básicas
  framework: 'react',
  typescript: true,
  
  // Build settings
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: true
  },
  
  // Server settings
  server: {
    host: '0.0.0.0',
    port: 8080
  },
  
  // Features suportadas
  features: {
    pwa: true,
    webVitals: true,
    analytics: false,
    errorReporting: true
  },
  
  // Assets otimizados
  assets: {
    images: {
      formats: ['webp', 'avif'],
      quality: 80
    }
  },
  
  // Headers de segurança
  headers: {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  },
  
  // Redirects
  redirects: [
    {
      source: '/home',
      destination: '/',
      permanent: false
    }
  ]
};