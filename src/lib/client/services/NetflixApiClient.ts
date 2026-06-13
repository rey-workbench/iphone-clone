import { ApiConfig } from '$lib/config/api';

export class NetflixApiClient {
    static async getTrending() {
        const res = await fetch(ApiConfig.NETFLIX_LATEST);
        return { res, result: res.ok ? await res.json() : null };
    }

    static async search(query: string) {
        const res = await fetch(`${ApiConfig.NETFLIX_SEARCH}?q=${encodeURIComponent(query)}`);
        return { res, result: res.ok ? await res.json() : null };
    }

    static async getDetails(id: number, type: string) {
        const res = await fetch(`${ApiConfig.NETFLIX_DETAILS}?id=${id}&type=${type}`);
        return { res, result: await res.json() };
    }
}
