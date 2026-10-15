// Aumente este número (v3, v4...) se precisar forçar uma atualização agressiva no futuro
const CACHE_NAME = 'apexsys-entregas-v3';

// ATENÇÃO: Retiramos o '/' e o '/index.html' do Cache!
// Agora ele guarda apenas a imagem e o manifesto para o celular permitir instalar.
const urlsToCache = [
  '/icone-app.png',
  '/manifest.json'
];

self.addEventListener('install', event => {
  self.skipWaiting(); // Atualiza instantaneamente quando houver nova versão
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) return caches.delete(cacheName);
        })
      );
    })
  );
  return self.clients.claim(); // Toma o controle de todas as abas abertas na hora
});

self.addEventListener('fetch', event => {
  // ESTRATÉGIA BYPASS TOTAL PARA HTML E NAVEGAÇÃO
  // Se for a página do aplicativo, ignora o cache completamente e vai direto pra internet (Netlify)
  if (event.request.mode === 'navigate' || event.request.destination === 'document') {
    event.respondWith(
      fetch(event.request).catch(() => {
        // Só usa o cache se o celular estiver em "Modo Avião"
        return caches.match('/index.html');
      })
    );
  } else {
    // Para imagens e ícones: Tenta internet primeiro. Se falhar, usa memória.
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
  }
});