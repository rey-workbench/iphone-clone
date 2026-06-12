import { error } from '@sveltejs/kit';
import { ProxyService } from '$lib/server/services/ProxyService';

const proxyService = new ProxyService();

export const fallback = async ({ request, url }) => {
  const targetUrl = url.searchParams.get('url');
  
  try {
    const { body, status, headers } = await proxyService.fetchProxy(targetUrl || '', request);
    return new Response(body, { status, headers });
  } catch (err: any) {
    if (err.message.includes('Missing')) {
        throw error(400, err.message);
    }
    throw error(500, `Proxy failed: ${err.message}`);
  }
};
