import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

export async function GET({ url }) {
  const query = url.searchParams.get('q');
  if (!query) {
    return json({ error: 'Query parameter "q" is required' }, { status: 400 });
  }

  const apiKey = env.SERPER_API_KEY;
  if (!apiKey) {
    return json({ error: 'SERPER_API_KEY is not configured' }, { status: 500 });
  }

  try {
    const response = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        q: query
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Serper API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    
    // Map serper organic results to what the app expects
    const results = (data.organic || []).map((item: any) => ({
      title: item.title,
      url: item.link,
      snippet: item.snippet
    }));

    return json({ data: results });
  } catch (error: any) {
    console.error('[SafariSearch API Error]', error);
    return json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
