import { supabase } from '$lib/config/supabase';
import type { IMessage } from '$lib/types';

export class MessagesRepository {
	async getMessagesForUser(userId: string): Promise<{ data: IMessage[] | null; error: unknown }> {
		const { data, error } = await supabase
			.from('messages')
			.select('*')
			.or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
			.order('created_at', { ascending: false });
		return { data, error };
	}

	async getChatMessages(
		userId: string,
		_currentChatId: string
	): Promise<{ data: IMessage[] | null; error: unknown }> {
		const { data, error } = await supabase
			.from('messages')
			.select('*')
			.or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
			.order('created_at', { ascending: true });
		return { data, error };
	}

	async insertMessage(
		senderId: string,
		receiverId: string,
		content: string
	): Promise<{ data: IMessage[] | null; error: unknown }> {
		const { data, error } = await supabase
			.from('messages')
			.insert([
				{
					content,
					sender_id: senderId,
					receiver_id: receiverId
				}
			])
			.select();
		return { data, error };
	}

	async deleteMessage(msgId: string, senderId: string) {
		const { error } = await supabase
			.from('messages')
			.delete()
			.eq('id', msgId)
			.eq('sender_id', senderId);
		return { error };
	}
}
