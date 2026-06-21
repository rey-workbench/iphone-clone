import { apiWrapper } from '$lib/backend/api';
import { ChatService } from '$lib/backend/services/ChatService';
import { ChatRequestSchema } from '$lib/backend/validation/Validation';
import { RateLimiter } from '$lib/backend/security/RateLimiter';

const chatService = new ChatService();
const chatRateLimiter = new RateLimiter(60 * 1000, 10, 5 * 60 * 1000); // 10 requests per minute

export const POST = apiWrapper(
	async ({ request }) => {
		const body = await request.json();
		const data = ChatRequestSchema.parse(body);

		return await chatService.sendMessage(data.messages);
	},
	{ customRateLimiter: chatRateLimiter }
);
