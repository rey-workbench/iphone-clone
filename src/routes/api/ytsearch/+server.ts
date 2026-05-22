import { json } from '@sveltejs/kit';
import yts from 'yt-search';

export async function GET({ url }) {
    const query = url.searchParams.get('q');
    if (!query) {
        return json({ error: 'Query is required' }, { status: 400 });
    }
    try {
        // @ts-ignore
        const r = await yts(query);
        const results = r.videos.map((v: any) => ({
            title: v.title,
            authorName: v.author.name,
            thumbnail: v.thumbnail,
            url: v.url,
            videoId: v.videoId
        }));
        return json({ results });
    } catch (e) {
        return json({ error: String(e) }, { status: 500 });
    }
}
