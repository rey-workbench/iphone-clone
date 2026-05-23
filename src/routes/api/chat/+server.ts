import { LLM7_API_KEY } from '$env/static/private';
import { ApiConfig } from '$lib/config/api';
import { apiHandler, ApiError } from '$lib/server/api';

export function POST({ request }) {
    return apiHandler(async () => {
        const body = await request.json();

        const response = await fetch(ApiConfig.LLM_CHAT_COMPLETION, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${LLM7_API_KEY}`
            },
            body: JSON.stringify({
                model: 'default',
                messages: body.messages
            })
        });

        if (!response.ok) {
            throw new ApiError(response.status, 'Failed to fetch from AI');
        }

        const data = await response.json();
        return data;
    });
}
