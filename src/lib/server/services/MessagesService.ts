import { MessagesRepository } from '../repositories/MessagesRepository';

export class MessagesService {
    private repository: MessagesRepository;

    constructor() {
        this.repository = new MessagesRepository();
    }

    async getInbox(userId: string) {
        if (!userId) throw new Error('User ID is required');
        const { data, error } = await this.repository.getMessagesForUser(userId);
        if (error) throw new Error((error as Error).message);
        return data;
    }

    async getChat(userId: string, chatId: string) {
        if (!userId || !chatId) throw new Error('User ID and Chat ID are required');
        
        const { data, error } = await this.repository.getChatMessages(userId, chatId);
        if (error || !data) return [];

        const chatData = data.filter(d => 
            (d.sender_id === userId && d.receiver_id === chatId) || 
            (d.sender_id === chatId && d.receiver_id === userId)
        );

        return chatData.map(d => ({
            id: d.id,
            content: d.content,
            isUser: d.sender_id === userId,
            time: new Date(d.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
        }));
    }

    async sendMessage(senderId: string, receiverId: string, content: string) {
        if (!senderId || !receiverId || !content) throw new Error('Missing parameters');
        const { data, error } = await this.repository.insertMessage(senderId, receiverId, content);
        if (error) throw new Error((error as Error).message);
        return data;
    }

    async deleteMessage(msgId: string, senderId: string) {
        if (!msgId || !senderId) throw new Error('Missing parameters');
        const { error } = await this.repository.deleteMessage(msgId, senderId);
        if (error) throw new Error(error.message);
        return true;
    }
}
