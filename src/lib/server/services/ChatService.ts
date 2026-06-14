import { LLM7_API_KEY } from '$env/static/private';
import { ApiConfig } from '$lib/config/api';
import { ApiError } from '$lib/server/api';

export class ChatService {
	async sendMessage(messages: any[]) {
		const response = await fetch(ApiConfig.LLM_CHAT_COMPLETION, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${LLM7_API_KEY}`
			},
			body: JSON.stringify({
				model: 'default',
				messages: messages
			})
		});

		if (!response.ok) {
			throw new ApiError(response.status, 'Failed to fetch from AI');
		}

		return await response.json();
	}
}
