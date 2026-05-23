import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  const { pathname, search } = event.url;

  const referer = event.request.headers.get('referer') || '';
  const isFromEmbed = referer.includes('/embed?');

  // Intercept requests that are meant for screenscape.me
  const isScreenscapeRoute = 
    pathname.startsWith('/embed') ||
    pathname.startsWith('/_next/') || 
    pathname.startsWith('/cdn-cgi/') || 
    pathname === '/skip.png' ||
    (pathname.startsWith('/api/') && isFromEmbed);

  if (isScreenscapeRoute) {
    const targetUrl = `https://screenscape.me${pathname}${search}`;
    
    try {
      const headers = new Headers();
      // Forward safe headers
      const safeHeaders = ['user-agent', 'accept', 'accept-language', 'content-type'];
      for (const h of safeHeaders) {
        if (event.request.headers.has(h)) {
          headers.set(h, event.request.headers.get(h)!);
        }
      }
      
      // Spoof origin and referer to bypass their security checks
      headers.set('origin', 'https://screenscape.me');
      headers.set('referer', 'https://screenscape.me/');

      const init: RequestInit = {
        method: event.request.method,
        headers,
      };

      // Forward request body if it's not a GET
      if (event.request.method !== 'GET' && event.request.method !== 'HEAD') {
        init.body = await event.request.arrayBuffer();
      }

      const response = await fetch(targetUrl, init);
      
      // 1. If it's the embed HTML, inject our super Ad/Popup blocker!
      if (pathname.startsWith('/embed') && response.headers.get('content-type')?.includes('text/html')) {
        let html = await response.text();
        const AD_BLOCK_SCRIPT = `
          <script>
            (function() {
              // Kill all popups
              window.open = function() {
                console.log('[AdBlock] Killed popup attempt.');
                return { closed: false, close: function(){} }; // Mock window object so ad scripts don't crash
              };
              // Kill redirects
              window.addEventListener('beforeunload', function(e) { 
                e.preventDefault(); 
                e.returnValue = ''; 
              });
            })();
          </script>
        `;
        
        if (html.includes('<head>')) {
          html = html.replace('<head>', '<head>' + AD_BLOCK_SCRIPT);
        } else {
          html = AD_BLOCK_SCRIPT + html;
        }

        return new Response(html, {
          status: response.status,
          headers: {
            'content-type': 'text/html; charset=utf-8',
          }
        });
      }

      // 2. For other assets (JS chunks, APIs, etc), just forward them directly
      const responseHeaders = new Headers(response.headers);
      
      // Remove headers that could cause issues when forwarding
      responseHeaders.delete('content-encoding'); // Node's fetch already decodes this
      responseHeaders.delete('content-length');
      responseHeaders.delete('access-control-allow-origin');
      
      // Add permissive CORS
      responseHeaders.set('access-control-allow-origin', '*');

      return new Response(response.body, {
        status: response.status,
        headers: responseHeaders
      });

    } catch (err) {
      console.error('[Proxy Error]', pathname, err);
      return new Response('Proxy Error', { status: 502 });
    }
  }

  return resolve(event);
};
