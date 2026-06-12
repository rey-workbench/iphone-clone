import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  const response = await resolve(event);

  // Catch requests that escaped the proxy (e.g. relative form submissions like /search)
  // If SvelteKit returns a 404 and the Referer shows they were inside the proxy, redirect them back!
  if (response.status === 404) {
      const referer = event.request.headers.get('referer');
      if (referer && referer.includes('/__proxy/')) {
          try {
              const proxyRef = referer.substring(referer.indexOf('/__proxy/') + '/__proxy/'.length);
              let refUrl = proxyRef;
              if (!refUrl.startsWith('http')) {
                  refUrl = decodeURIComponent(refUrl);
              }
              const targetOrigin = new URL(refUrl).origin;
              
              // Reconstruct the URL with the correct origin
              const newUrl = `/__proxy/${targetOrigin}${event.url.pathname}${event.url.search}`;
              
              return new Response(null, {
                  status: 302,
                  headers: {
                      location: newUrl
                  }
              });
          } catch (e) {
              // Ignore parse errors
          }
      }
  }

  return response;
};

