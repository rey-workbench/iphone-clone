import type { RequestEvent } from '@sveltejs/kit';

export async function handleNetflixProxy(event: RequestEvent): Promise<Response | null> {
  const { pathname, search } = event.url;
  const referer = event.request.headers.get('referer') || '';
  const isFromEmbed = referer.includes('/embed');

  // Specific routes that belong to the screenscape.me proxy
  const isScreenscapeRoute = 
    pathname.startsWith('/embed') ||
    pathname.startsWith('/_next/') || 
    pathname.startsWith('/cdn-cgi/') || 
    pathname.startsWith('/api/subs') || // Explicitly catch subtitles API
    pathname.startsWith('/api/osubs') || // Catch alternate subtitle API
    isFromEmbed; // Catch everything else requested from inside the iframe

  if (!isScreenscapeRoute) {
    return null; // Not a Netflix proxy request, continue to normal SvelteKit routing
  }

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
              return { closed: false, close: function(){} };
            };
            // Kill redirects
            window.addEventListener('beforeunload', function(e) { 
              e.preventDefault(); 
              e.returnValue = ''; 
            });

            // Try to force HD quality for common players by injecting local storage preferences
            try {
              localStorage.setItem('plyr-quality', '1080'); // Plyr
              localStorage.setItem('jwplayer.qualityLabel', '1080p'); // JWPlayer
              localStorage.setItem('quality', '1080p'); // Generic
              localStorage.setItem('preferredQuality', '1080');
            } catch(e) {}
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

    // 2. For other assets (JS chunks, APIs, Subtitles), forward directly
    const responseHeaders = new Headers(response.headers);
    
    // Remove headers that could cause issues when forwarding
    responseHeaders.delete('content-encoding');
    responseHeaders.delete('content-length');
    responseHeaders.delete('access-control-allow-origin');
    
    // Add permissive CORS
    responseHeaders.set('access-control-allow-origin', '*');

    return new Response(response.body, {
      status: response.status,
      headers: responseHeaders
    });

  } catch (err) {
    console.error('[Netflix Proxy Error]', pathname, err);
    return new Response('Proxy Error', { status: 502 });
  }
}
