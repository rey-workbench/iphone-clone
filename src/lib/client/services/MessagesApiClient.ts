import { ApiConfig } from '$lib/config/api';

export class MessagesApiClient {
    static async getInbox(userId: string) {
        const res = await fetch(`/api/messages?userId=${userId}`);
        return await res.json();
    }

    static async getMessages(userId: string, chatId: string) {
        const res = await fetch(`/api/messages?userId=${userId}&chatId=${chatId}`);
        return await res.json();
    }

    static async sendMessage(senderId: string, receiverId: string, content: string) {
        const res = await fetch('/api/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ senderId, receiverId, content })
        });
        const result = await res.json();
        return { res, result };
    }

    static async deleteMessage(msgId: string, senderId: string) {
        const res = await fetch(`/api/messages?msgId=${msgId}&senderId=${senderId}`, { method: 'DELETE' });
        const result = await res.json();
        return { res, result };
    }

    static async sendAiMessage(messages: any[]) {
        const res = await fetch(ApiConfig.CHAT, ApiConfig.getChatRequest({
            messages,
            model: 'gpt-5.4-nano',
            frequency_penalty: 0,
            presence_penalty: 0,
            stream: false,
            temperature: 0.5,
            top_p: 1
        }));
        return await res.json();
    }
}
