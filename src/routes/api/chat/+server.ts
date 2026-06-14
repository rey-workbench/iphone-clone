import { apiHandler } from '$lib/server/api';
import { ChatService } from '$lib/server/services/ChatService';

const chatService = new ChatService();

export function POST({ request }) {
	return apiHandler(async () => {
		const body = await request.json();
		return await chatService.sendMessage(body.messages);
	});
}
