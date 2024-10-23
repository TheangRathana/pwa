self.addEventListener("push", async (e) => {
	let data;
	try {
	  // Try to parse the data as JSON
	  data = e.data.json();
	} catch {
	  // If parsing fails, use the raw text
	  data = {
		message: "New Notification",
		body: e.data.text(),
		icon: "/default-icon.png"
	  };
	}
  
	const { message, body, icon } = data;
  
	// Use the waitUntil method to keep the service worker alive until the notification is shown
	e.waitUntil(
	  self.registration.showNotification(message, {
		body,
		icon: icon || "/default-icon.png",
		badge: "/badge.png", // Add a badge for Android notifications
		vibrate: [100, 50, 100], // Add vibration pattern for supported devices
		data: { // Add custom data that can be used when the notification is clicked
		  dateOfArrival: Date.now(),
		  primaryKey: 1
		}
	  })
	);
  });
  
  self.addEventListener("notificationclick", (event) => {
	event.notification.close();
  
	// This looks to see if the current window is already open and
	// focuses if it is
	event.waitUntil(
	  clients
		.matchAll({
		  type: "window",
		  includeUncontrolled: true // Include pages that are not controlled by this service worker
		})
		.then((clientList) => {
		  for (const client of clientList) {
			if (client.url === "/" && "focus" in client)
			  return client.focus();
		  }
		  if (clients.openWindow) return clients.openWindow("/");
		})
	);
  });
  
  // Add an install event listener to cache essential files
  self.addEventListener('install', (event) => {
	event.waitUntil(
	  caches.open('v1').then((cache) => {
		return cache.addAll([
		  '/',
		  '/index.html',
		  '/styles.css',
		  '/app.js',
		  '/default-icon.png',
		  '/badge.png'
		]);
	  })
	);
  });
  
  // Add a fetch event listener to serve cached files when offline
  self.addEventListener('fetch', (event) => {
	event.respondWith(
	  caches.match(event.request).then((response) => {
		return response || fetch(event.request);
	  })
	);
  });