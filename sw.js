// 1. Identificador de la versión (V2.1 - Motor Híbrido)
const CACHE_NAME = 'GTA-Trucos-Oficial-v2.1';

// 2. Archivos Vitales (Asegúrate de que el icono se llame logo-icono.png o cámbialo aquí)
const INITIAL_ASSETS = [
  './',
  './index.html',
  './logo-icono.png' 
];

// --- FASE DE INSTALACIÓN ---
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('🎮 [GTA-TRUCOS]: Núcleo del sistema instalado.');
      return cache.addAll(INITIAL_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// --- FASE DE ACTIVACIÓN (LIMPIEZA) ---
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => {
              console.log('🎮 [GTA-TRUCOS]: Borrando caché antiguo:', key);
              return caches.delete(key);
            })
      );
    }).then(() => {
      console.log('🎮 [GTA-TRUCOS]: Sistema en línea y listo para el vicio.');
      return self.clients.claim();
    })
  );
});

// --- ESTRATEGIA: NETWORK FIRST CON AUTO-RECUPERACIÓN (POTENCIA CALCUALTION) ---
self.addEventListener('fetch', event => {
  // Solo peticiones GET
  if (event.request.method !== 'GET') return;
  
  // Filtro de seguridad para URLs externas
  if (!(event.request.url.indexOf('http') === 0)) return;

  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        // Si hay internet, guardamos la copia más fresca en el bolsillo
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // MODO OFFLINE: Si falla la red, tiramos del caché del TECNO
        return caches.match(event.request).then(cachedResponse => {
          if (cachedResponse) return cachedResponse;
          
          // Si el usuario se pierde sin internet, lo mandamos al index
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
      })
  );
});
