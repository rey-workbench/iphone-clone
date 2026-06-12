export class ProxyService {
    async fetchProxy(targetUrl: string, originalReq?: Request) {
        if (!targetUrl) throw new Error('Missing url parameter');

        const fetchOptions: RequestInit = {
            method: originalReq?.method || 'GET',
            headers: {
                'User-Agent': originalReq?.headers.get('User-Agent') || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
                'Accept': originalReq?.headers.get('Accept') || '*/*',
                'Accept-Language': originalReq?.headers.get('Accept-Language') || 'en-US,en;q=0.9',
            },
            redirect: 'manual'
        };

        if (originalReq && originalReq.method !== 'GET' && originalReq.method !== 'HEAD') {
            fetchOptions.body = await originalReq.arrayBuffer();
            const ct = originalReq.headers.get('content-type');
            if (ct) {
                (fetchOptions.headers as any)['Content-Type'] = ct;
            }
        }

        const res = await fetch(targetUrl, fetchOptions);
        
        let body: BodyInit | null = res.body;
        const headers = new Headers(res.headers);
        
        // Strip headers that prevent iframing
        headers.delete('x-frame-options');
        headers.delete('content-security-policy');
        headers.delete('content-security-policy-report-only');
        headers.delete('clear-site-data');
        
        // Allow all origins
        headers.set('access-control-allow-origin', '*');

        if ([301, 302, 303, 307, 308].includes(res.status)) {
            const location = headers.get('location');
            if (location) {
                // Return a 200 with a custom header so the SW can catch it and redirect properly
                headers.set('x-proxy-redirect', location);
                return { body: '', status: 200, headers };
            }
        }

        const contentType = headers.get('content-type') || '';
        if (contentType.includes('text/html')) {
            let html = await res.text();
            
            // Re-write base tag to be absolute target so relative assets fetch properly
            const origin = new URL(targetUrl).origin;
            if (html.includes('<head>')) {
                 html = html.replace('<head>', `<head><base href="${origin}/">`);
            }
            body = html;
            headers.set('content-type', 'text/html; charset=utf-8');
            headers.delete('content-length');
            headers.delete('content-encoding');
        }

        return { body, status: res.status, headers };
    }
}
