import 'dotenv/config';

async function test() {
  const apiKey = process.env.LANG_SEARCH_KEY;
  const res = await fetch('https://api.langsearch.com/v1/web-search', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query: 'SvelteKit', count: 1 })
  });
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}

test();
