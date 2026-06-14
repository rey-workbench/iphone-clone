import { json } from '@sveltejs/kit';
import { MessagesService } from '$lib/server/services/MessagesService';

const messagesService = new MessagesService();

export async function GET({ url }) {
    try {
        const userId = url.searchParams.get('userId');
        const chatId = url.searchParams.get('chatId');

        if (!userId) {
            return json({ error: 'User ID is required' }, { status: 400 });
        }

        if (chatId) {
            const chat = await messagesService.getChat(userId, chatId);
            return json({ success: true, data: chat });
        } else {
            const inbox = await messagesService.getInbox(userId);
            return json({ success: true, data: inbox });
        }
    } catch (e: any) {
        return json({ error: e.message }, { status: 500 });
    }
}

export async function POST({ request }) {
    try {
        const body = await request.json();
        const { senderId, receiverId, content } = body;

        const result = await messagesService.sendMessage(senderId, receiverId, content);
        return json({ success: true, data: result });
    } catch (e: any) {
        return json({ error: e.message }, { status: 500 });
    }
}

export async function DELETE({ url }) {
    try {
        const msgId = url.searchParams.get('msgId');
        const senderId = url.searchParams.get('senderId');

        if (!msgId || !senderId) {
            return json({ error: 'Missing parameters' }, { status: 400 });
        }

        await messagesService.deleteMessage(msgId, senderId);
        return json({ success: true });
    } catch (e: any) {
        return json({ error: e.message }, { status: 500 });
    }
}
