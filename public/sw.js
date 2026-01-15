
// Minimal Service Worker to satisfy PWA requirements (start_url must be cached or available offline)
self.addEventListener('install', (event) => {
    console.log('Service Worker installing.');
});

self.addEventListener('fetch', (event) => {
    // Simple pass-through for now. 
    // For a robust offline app, we would cache assets here.
});
