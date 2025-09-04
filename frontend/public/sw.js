// Service Worker for Journal Entry Management
// Provides offline functionality and caching for journal entries

const CACHE_NAME = 'journal-entries-v1';
const API_CACHE_NAME = 'journal-entries-api-v1';

// Files to cache for offline functionality
const STATIC_CACHE_URLS = [
  '/',
  '/admin/accounting/journal-entries',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /\/api\/journalentry\/journal-entries/,
  /\/api\/journalentry\/categories/,
  /\/api\/journalentry\/statuses/,
  /\/api\/journalentry\/types/
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        console.log('Service Worker: Installation complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Installation failed', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activation complete');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle static asset requests
  if (request.method === 'GET') {
    event.respondWith(handleStaticRequest(request));
    return;
  }
});

// Handle API requests with network-first strategy
async function handleApiRequest(request) {
  const url = new URL(request.url);
  
  // Check if this is a cacheable API endpoint
  const isCacheable = API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname));
  
  if (!isCacheable) {
    // For non-cacheable endpoints, always try network first
    return fetch(request).catch(() => {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Offline - unable to fetch data' 
        }),
        { 
          status: 503, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    });
  }

  try {
    // Network-first strategy for cacheable API endpoints
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(API_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Network failed, trying cache', url.pathname);
    
    // Network failed, try cache
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      console.log('Service Worker: Serving from cache', url.pathname);
      return cachedResponse;
    }
    
    // No cache available, return offline response
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Offline - no cached data available',
        offline: true
      }),
      { 
        status: 503, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}

// Handle static asset requests with cache-first strategy
async function handleStaticRequest(request) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Cache miss, try network
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Both cache and network failed', request.url);
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline.html') || new Response(
        '<html><body><h1>Offline</h1><p>Please check your internet connection.</p></body></html>',
        { headers: { 'Content-Type': 'text/html' } }
      );
    }
    
    throw error;
  }
}

// Background sync for journal entries (when supported)
self.addEventListener('sync', (event) => {
  if (event.tag === 'journal-entry-sync') {
    console.log('Service Worker: Background sync triggered');
    event.waitUntil(syncJournalEntries());
  }
});

// Sync pending journal entries
async function syncJournalEntries() {
  try {
    // Get pending entries from IndexedDB
    const pendingEntries = await getPendingEntries();
    
    for (const entry of pendingEntries) {
      try {
        const response = await fetch('/api/journalentry', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(entry)
        });
        
        if (response.ok) {
          // Remove from pending entries
          await removePendingEntry(entry.id);
          console.log('Service Worker: Synced journal entry', entry.id);
        }
      } catch (error) {
        console.error('Service Worker: Failed to sync entry', entry.id, error);
      }
    }
  } catch (error) {
    console.error('Service Worker: Background sync failed', error);
  }
}

// Helper functions for IndexedDB operations
async function getPendingEntries() {
  // This would interact with IndexedDB to get pending entries
  // For now, return empty array
  return [];
}

async function removePendingEntry(id) {
  // This would remove the entry from IndexedDB
  console.log('Service Worker: Removing pending entry', id);
}

// Message handling for cache management
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
});

