import { error } from '@sveltejs/kit';

export async function GET({ url }) {
  const targetUrl = url.searchParams.get('url');
  if (!targetUrl) throw error(400, 'Missing url parameter');

  try {
    const res = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
      }
    });
    
    let body: BodyInit | null = res.body;
    const headers = new Headers(res.headers);
    
    // Strip headers that prevent iframing
    headers.delete('x-frame-options');
    headers.delete('content-security-policy');
    headers.delete('content-security-policy-report-only');
    headers.delete('clear-site-data');
    
    // Allow all origins
    headers.set('access-control-allow-origin', '*');

    // If it's HTML, we should inject a base tag so relative links (like /images/logo.png) still work
    const contentType = headers.get('content-type') || '';
    if (contentType.includes('text/html')) {
      let html = await res.text();
      const origin = new URL(targetUrl).origin;
      // Inject <base href="..."> into <head>
      html = html.replace('<head>', `<head><base href="${origin}/">`);
      body = html;
      headers.set('content-type', 'text/html; charset=utf-8');
      headers.delete('content-length');
      headers.delete('content-encoding');
    }

    return new Response(body, {
      status: res.status,
      headers
    });
  } catch (err: any) {
    throw error(500, `Proxy failed: ${err.message}`);
  }
}
