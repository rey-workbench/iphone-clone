const PREFIX = '/__proxy/';

self.addEventListener('install', (event) => {
    event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
    const reqUrl = new URL(event.request.url);

    // Skip if it's already going to our proxy API
    if (reqUrl.pathname.startsWith('/api/proxy')) {
        return;
    }

    let targetUrl = '';

    // 1. If the request is explicitly prefixed (e.g. initial iframe load)
    if (reqUrl.origin === location.origin && reqUrl.pathname.startsWith(PREFIX)) {
        targetUrl = reqUrl.pathname.substring(PREFIX.length) + reqUrl.search + reqUrl.hash;
        
        try {
            if (targetUrl.startsWith('//')) {
                targetUrl = 'https:' + targetUrl;
            } else if (!targetUrl.startsWith('http')) {
                targetUrl = decodeURIComponent(targetUrl);
            }
        } catch (e) {}
    } 
    // 2. If it's any other request (relative assets that escaped, or cross-origin requests)
    else {
        targetUrl = reqUrl.href;
    }

    if (!targetUrl || !targetUrl.startsWith('http')) {
        return; // Pass through
    }

    const proxyUrl = `/api/proxy?url=${encodeURIComponent(targetUrl)}`;
    
    event.respondWith(
        fetch(proxyUrl, {
            method: event.request.method,
            headers: event.request.headers,
            ...(event.request.method !== 'GET' && event.request.method !== 'HEAD' ? { body: event.request.body } : {}),
            redirect: 'manual'
        }).then(res => {
            if (res.headers.has('x-proxy-redirect')) {
                const newLocation = res.headers.get('x-proxy-redirect');
                if (newLocation) {
                    return Response.redirect(PREFIX + newLocation, 302);
                }
            }
            return res;
        }).catch(err => {
            return new Response(`Proxy Error: ${err.message}`, { status: 502 });
        })
    );
});
