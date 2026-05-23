import type { Handle } from '@sveltejs/kit';
import { handleNetflixProxy } from '$lib/utils/netflixProxy';

export const handle: Handle = async ({ event, resolve }) => {
  // 1. Netflix App Proxy (Intercepts screenscape.me requests)
  const netflixProxyResponse = await handleNetflixProxy(event);
  if (netflixProxyResponse) {
    return netflixProxyResponse;
  }

  // 2. Normal SvelteKit Routing
  return resolve(event);
};

