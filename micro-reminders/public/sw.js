'use strict';

self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Basic fetch handler, can be extended for caching strategies
  // For now, just network first
  // event.respondWith(fetch(event.request));
});

self.addEventListener('push', function(event) {
  console.log('[Service Worker] Push Received.');
  
  let data = {};
  try {
    data = event.data.json();
  } catch (e) {
    data = {
      title: 'ChronoFocus Reminder',
      body: event.data.text() || 'You have a new reminder.',
    };
  }

  const title = data.title || 'ChronoFocus Reminder';
  const options = {
    body: data.body || 'You have a new reminder.',
    icon: '/icon-192x192.png', // User should provide this icon
    badge: '/icon-192x192.png', // User should provide this icon
    data: data.url || '/' // Add a URL to navigate to on click
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
  console.log('[Service Worker] Notification click Received.');
  event.notification.close();
  const urlToOpen = event.notification.data || '/';
  event.waitUntil(
    clients.matchAll({
      type: "window",
    })
    .then(function(clientList) {
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
