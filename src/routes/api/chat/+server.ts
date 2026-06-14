import { apiHandler } from '$lib/backend/api';
import { ChatService } from '$lib/backend/services/ChatService';

const chatService = new ChatService();

export function POST({ request }) {
	return apiHandler(async () => {
		const body = await request.json();
		return await chatService.sendMessage(body.messages);
	});
}
