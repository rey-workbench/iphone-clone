import type { IChatMessage, IMessage } from '$lib/framework/types';
import { ApiConfig } from '$lib/framework/api/api';
import { systemGlobalState } from '$lib/os/state';

function getAuthHeaders() {
	return {
		'X-User-Id': systemGlobalState.currentUser?.id || '',
		'X-Device-Id': systemGlobalState.deviceId || ''
	};
}

export class MessagesApiClient {
	static async getInbox(userId: string): Promise<{ success: boolean; data?: IMessage[] }> {
		const res = await fetch(`${ApiConfig.MESSAGES}?userId=${userId}`, {
			headers: getAuthHeaders()
		});
		return await res.json();
	}

	static async getMessages(
		userId: string,
		chatId: string
	): Promise<{ success: boolean; data?: IChatMessage[] }> {
		const res = await fetch(`${ApiConfig.MESSAGES}?userId=${userId}&chatId=${chatId}`, {
			headers: getAuthHeaders()
		});
		return await res.json();
	}

	static async sendMessage(senderId: string, receiverId: string, content: string) {
		const res = await fetch(ApiConfig.MESSAGES, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
			body: JSON.stringify({ senderId, receiverId, content })
		});
		const result = await res.json();
		return { res, result };
	}

	static async deleteMessage(msgId: string, senderId: string) {
		const res = await fetch(`${ApiConfig.MESSAGES}?msgId=${msgId}&senderId=${senderId}`, {
			method: 'DELETE',
			headers: getAuthHeaders()
		});
		const result = await res.json();
		return { res, result };
	}

	static async sendAiMessage(
		messages: { role: string; content: string }[]
	): Promise<{ choices?: { message: { content: string } }[]; error?: string }> {
		const res = await fetch(ApiConfig.CHAT, {
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
			})
		});
		return await res.json();
	}
}
