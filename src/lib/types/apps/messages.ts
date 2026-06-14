import type { IUser } from '../os/users';

export interface IMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
}

export interface IConversation {
  id: string;
  name: string;
  icon?: any;
  color: string;
  lastMsg: string;
  time: string;
  timestamp: number;
  unread: number;
  initials: string;
}

export interface IChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  time: string;
}
