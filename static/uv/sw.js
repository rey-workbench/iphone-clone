/*global UVServiceWorker,__uv$config*/
importScripts('/uv/uv.bundle.js');
importScripts('/uv/uv.config.js');
importScripts(__uv$config.sw || '/uv/uv.sw.js');

const uv = new UVServiceWorker();

/**
 * For requests that don't have the UV prefix, check if they came from a proxied
 * page (via Referer). If so, reconstruct the proxied URL so sub-resources like
 * /w/load.php, /static/images/... are fetched through UV instead of hitting the
 * SvelteKit server directly.
 */
function buildProxiedUrl(requestUrl, referer) {
    try {
        const uvPrefix = location.origin + __uv$config.prefix;

        // Only reroute if the referer is a UV-proxied page
        if (!referer || !referer.startsWith(uvPrefix)) return null;

        // Decode the proxied origin from the referer to get the real base URL
        const encodedPath = referer.slice(uvPrefix.length);
        const realRefererUrl = new URL(__uv$config.decodeUrl(encodedPath));
        const realBase = realRefererUrl.origin;

        // Build the real target URL (handle absolute and root-relative paths)
        const reqUrl = new URL(requestUrl);
        let realTarget;
        if (reqUrl.origin === location.origin) {
            // Root-relative request like /w/load.php → realBase + /w/load.php
            realTarget = realBase + reqUrl.pathname + reqUrl.search + reqUrl.hash;
        } else {
            return null; // Cross-origin absolute request — UV rewriter should handle
        }

        return uvPrefix + __uv$config.encodeUrl(realTarget);
    } catch {
        return null;
    }
}

async function handleRequest(event) {
    if (uv.route(event)) {
        return await uv.fetch(event);
    }

    // Attempt to reroute sub-resource requests from proxied pages
    const referer = event.request.referrer || event.request.headers?.get?.('referer');
    const proxied = buildProxiedUrl(event.request.url, referer);
    if (proxied) {
        const proxyRequest = new Request(proxied, {
            method: event.request.method,
            headers: event.request.headers,
            body: ['GET', 'HEAD'].includes(event.request.method) ? undefined : event.request.body,
            mode: 'same-origin',
            credentials: event.request.credentials,
            cache: event.request.cache,
            redirect: event.request.redirect,
        });
        const proxiedEvent = { request: proxyRequest };
        if (uv.route(proxiedEvent)) {
            return await uv.fetch(proxiedEvent);
        }
    }

    return await fetch(event.request);
}

self.addEventListener('fetch', (event) => {
    event.respondWith(handleRequest(event));
});