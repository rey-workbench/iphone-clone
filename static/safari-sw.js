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

    // 1. If the request is explicitly prefixed (e.g. initial iframe load or already rewritten link)
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
    // 2. If it's a request to our domain but not prefixed (e.g. a relative link like /search)
    else if (reqUrl.origin === location.origin && !reqUrl.pathname.startsWith(PREFIX)) {
        const referrer = event.request.referrer;
        if (referrer && referrer.includes(PREFIX)) {
            const proxyRef = referrer.substring(referrer.indexOf(PREFIX) + PREFIX.length);
            try {
                let refUrl = proxyRef;
                if (!refUrl.startsWith('http')) {
                    refUrl = decodeURIComponent(refUrl);
                }
                const refOrigin = new URL(refUrl).origin;
                // Append the requested path to the original origin
                targetUrl = refOrigin + reqUrl.pathname + reqUrl.search + reqUrl.hash;
                
                // For navigation requests, we MUST redirect the browser to the proper prefixed URL
                // so that the address bar and future referrers are correct!
                if (event.request.mode === 'navigate') {
                    event.respondWith(Response.redirect(location.origin + PREFIX + targetUrl, 302));
                    return;
                }
            } catch(e) {
                targetUrl = reqUrl.href;
            }
        } else {
            targetUrl = reqUrl.href;
        }
    }
    // 3. Cross-origin requests (e.g. absolute links or CDN assets)
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
                    return Response.redirect(location.origin + PREFIX + newLocation, 302);
                }
            }
            return res;
        }).catch(err => {
            return new Response(`Proxy Error: ${err.message}`, { status: 502 });
        })
    );
});
