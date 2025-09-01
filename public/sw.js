const CACHE_NAME = 'instituto-sonhos-v2.0';
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/favicon.png',
  '/images/instituto-logo.png'
];

// URLs que devem ser sempre buscadas da rede (não cached)
const NETWORK_ONLY = [
  'https://hlrkoyywjpckdotimtik.supabase.co/functions',
  '/auth',
  '/api'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => (key !== CACHE_NAME ? caches.delete(key) : undefined)))
    )
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Não cachear requisições que não são GET
  if (request.method !== 'GET') return;
  
  // Sempre buscar da rede para APIs e funções Supabase
  if (NETWORK_ONLY.some(pattern => url.href.includes(pattern))) {
    event.respondWith(fetch(request));
    return;
  }
  
  // Para outros recursos, usar estratégia network-first para melhor atualização
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Se a resposta é válida, cache e retorna
        if (response.status === 200) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(() => {
        // Se falhar na rede, tenta buscar do cache
        return caches.match(request);
      })
  );
});


