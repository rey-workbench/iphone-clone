import { apiHandler, ApiError } from '$lib/backend/api';
import { ChatService } from '$lib/backend/services/ChatService';
import { isAuthorized } from '$lib/backend/security/AuthValidator';
import { ChatRequestSchema } from '$lib/backend/validation/Validation';

const chatService = new ChatService();

export function POST({ request }) {
	return apiHandler(async () => {
        if (!(await isAuthorized(request, null))) {
            throw new ApiError(403, 'Unauthorized access to AI chat service');
        }

		const body = await request.json();
        const data = ChatRequestSchema.parse(body);

		return await chatService.sendMessage(data.messages);
	});
}
