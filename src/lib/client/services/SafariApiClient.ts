export class SafariApiClient {
    static async search(query: string) {
        const res = await fetch(`/api/safari-search?q=${encodeURIComponent(query)}`);
        return { res, result: await res.json() };
    }
}
