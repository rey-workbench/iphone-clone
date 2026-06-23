import type { IChatMessage, IMessage } from '$lib/framework/types';
import { ApiConfig, apiFetch } from '$lib/framework/api/api';

export class MessagesApiClient {
	static async getInbox(userId: string): Promise<{ success: boolean; data?: IMessage[] }> {
		const res = await apiFetch(`${ApiConfig.MESSAGES}?userId=${userId}`);
		return await res.json();
	}

	static async getMessages(
		userId: string,
		chatId: string
	): Promise<{ success: boolean; data?: IChatMessage[] }> {
		const res = await apiFetch(`${ApiConfig.MESSAGES}?userId=${userId}&chatId=${chatId}`);
		return await res.json();
	}

	static async sendMessage(senderId: string, receiverId: string, content: string) {
		const res = await apiFetch(ApiConfig.MESSAGES, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ senderId, receiverId, content })
		});
		const result = await res.json();
		return { res, result };
	}

	static async deleteMessage(msgId: string, senderId: string) {
		const res = await apiFetch(`${ApiConfig.MESSAGES}?msgId=${msgId}&senderId=${senderId}`, {
			method: 'DELETE'
		});
		const result = await res.json();
		return { res, result };
	}

	static async sendAiMessage(
		messages: { role: string; content: string }[]
	): Promise<{ choices?: { message: { content: string } }[]; error?: string }> {
		const res = await apiFetch(ApiConfig.CHAT, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				messages,
				model: 'gpt-5.4-nano',
				frequency_penalty: 0,
				presence_penalty: 0,
				stream: false,
				temperature: 0.5,
				top_p: 1
			}),
			requireAuth: false
		});
		return await res.json();
	}
}
