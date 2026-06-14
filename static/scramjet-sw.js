importScripts('/scram/controller.sw.js');

self.addEventListener('install', () => {
	self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
	if ($scramjetController.shouldRoute(event)) {
		event.respondWith($scramjetController.route(event));
	}
});
