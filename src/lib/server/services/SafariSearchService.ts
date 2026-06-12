import { env } from '$env/dynamic/private';
import { ApiConfig } from '$lib/config/api';

export class SafariSearchService {
  async search(query: string) {
    if (!query) {
      throw new Error('Query parameter "q" is required');
    }

    const apiKey = env.SERPER_API_KEY;
    if (!apiKey) {
      throw new Error('SERPER_API_KEY is not configured');
    }

    const response = await fetch(ApiConfig.SERPER_SEARCH, {
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

    return { data: results };
  }
}
