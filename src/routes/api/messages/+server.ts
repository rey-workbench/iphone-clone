import { json } from '@sveltejs/kit';
import { MessagesService } from '$lib/backend/services/MessagesService';

const messagesService = new MessagesService();

export async function GET({ url }) {
	try {
		const userId = url.searchParams.get('userId');
		const chatId = url.searchParams.get('chatId');

		if (!userId) {
			return json({ error: 'User ID is required' }, { status: 400 });
		}

		// Security: IDOR Protection Placeholder
		// TODO: Replace with actual session check `const authUserId = locals.user?.id;`
		const authUserId = userId; // Mock auth for now
		if (userId !== authUserId) {
			return json({ error: 'Unauthorized access to user inbox' }, { status: 403 });
		}

		if (chatId) {
			const chat = await messagesService.getChat(userId, chatId);
			return json({ success: true, data: chat });
		} else {
			const inbox = await messagesService.getInbox(userId);
			return json({ success: true, data: inbox });
		}
	} catch (e: any) {
		console.error('[Messages API GET Error]', e);
		return json({ error: 'Internal Server Error' }, { status: 500 });
	}
}

export async function POST({ request }) {
	try {
		const body = await request.json();
		const { senderId, receiverId, content } = body;

		// Security: IDOR Protection Placeholder
		// TODO: Replace with `const authUserId = locals.user?.id;`
		const authUserId = senderId; // Mock auth for now
		if (senderId !== authUserId) {
			return json({ error: 'Unauthorized to send as this user' }, { status: 403 });
		}

		const result = await messagesService.sendMessage(senderId, receiverId, content);
		return json({ success: true, data: result });
	} catch (e: any) {
		console.error('[Messages API POST Error]', e);
		return json({ error: 'Internal Server Error' }, { status: 500 });
	}
}

export async function DELETE({ url }) {
	try {
		const msgId = url.searchParams.get('msgId');
		const senderId = url.searchParams.get('senderId');

		if (!msgId || !senderId) {
			return json({ error: 'Missing parameters' }, { status: 400 });
		}

		// Security: IDOR Protection Placeholder
		// TODO: Replace with `const authUserId = locals.user?.id;`
		const authUserId = senderId; // Mock auth for now
		if (senderId !== authUserId) {
			return json({ error: 'Unauthorized to delete this message' }, { status: 403 });
		}

		await messagesService.deleteMessage(msgId, senderId);
		return json({ success: true });
	} catch (e: any) {
		console.error('[Messages API DELETE Error]', e);
		return json({ error: 'Internal Server Error' }, { status: 500 });
	}
}
