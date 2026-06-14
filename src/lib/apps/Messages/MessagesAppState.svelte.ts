
import { Bot } from '@lucide/svelte';

import { notificationGlobalState } from "$lib/core/states/notificationGlobalState.svelte";
import { dialogGlobalState } from "$lib/core/states/dialogGlobalState.svelte";
import { supabase } from '$lib/config/supabase';
import { systemGlobalState, usersGlobalState } from '$lib/core/states';
import { notesDb, NotesDBKey } from '$lib/config/localdb';
import { MessagesApiClient } from '$lib/client/services/MessagesApiClient';
import { goto } from '$app/navigation';
import type { IConversation, IChatMessage, IUser, IMessage } from '$lib/types';
import type { RealtimeChannel } from '@supabase/supabase-js';

class MessagesAppState {
    messages = $state<IChatMessage[]>([]);
    inputText = $state('');
    isTyping = $state(false);
    chatView = $state(false);
    hasLoaded = false;

    currentChatId = $state('');
    currentChatName = $state('');

    inbox: IConversation[] = $state([
        { id: 'ai-bot', name: 'Buddy Bard', icon: Bot, color: '#007AFF', lastMsg: "Hey! I'm your AI assistant.", time: '12:00 PM', timestamp: Date.now(), unread: 0, initials: 'BB' }
    ]);

    get sortedInbox() {
        return [...this.inbox].sort((a, b) => b.timestamp - a.timestamp);
    }

    get totalUnread() {
        return this.inbox.reduce((sum, convo) => sum + (convo.unread || 0), 0);
    }

    private initializedForUser = '';

    constructor() {
        if (typeof window !== 'undefined') {
            $effect.root(() => {
                $effect(() => {
                    const user = systemGlobalState.currentUser;
                    if (user && this.initializedForUser !== user.id) {
                        this.initializedForUser = user.id;
                        usersGlobalState.fetchUsers((users) => this.updateInboxWithUsers(users));
                        this.initRealtime();
                    } else if (!user && this.initializedForUser) {
                        this.destroy();
                        this.initializedForUser = '';
                        this.messages = [];
                        // Keep only AI bot in inbox
                        this.inbox = this.inbox.filter(c => c.id === 'ai-bot');
                    }
                });
            });
        }
    }

    updateInboxWithUsers(users: IUser[]) {
        const currentUser = systemGlobalState.currentUser;
        
        const newInbox: IConversation[] = [
            { id: 'ai-bot', name: 'Buddy Bard', icon: Bot, color: '#007AFF', lastMsg: "Hey! I'm your AI assistant.", time: '12:00 PM', timestamp: Date.now(), unread: 0, initials: 'BB' }
        ];

        users.forEach((u: IUser) => {
            if (currentUser && u.id === currentUser.id) return;
            const existing = this.inbox.find(c => c.id === u.id);
            
            newInbox.push({
                id: u.id,
                name: u.name,
                initials: u.name.substring(0, 2).toUpperCase(),
                color: existing ? existing.color : '#8E8E93',
                lastMsg: existing ? existing.lastMsg : 'Tap to chat',
                time: existing ? existing.time : '',
                timestamp: existing ? existing.timestamp : 0,
                unread: existing ? existing.unread : 0
            });
        });

        this.inbox = newInbox;
        this.loadInboxStates();
    }

    async loadInboxStates() {
        const user = systemGlobalState.currentUser;
        if (!user) return;

        // Load AI Bot messages
        const aiMessages = await notesDb.get(NotesDBKey.AI_MESSAGES(user.id), []);
        if (aiMessages.length > 0) {
            const lastMsg = aiMessages[aiMessages.length - 1];
            const aiContact = this.inbox.find(c => c.id === 'ai-bot');
            if (aiContact) {
                aiContact.lastMsg = lastMsg.content;
                aiContact.time = lastMsg.time;
                aiContact.timestamp = parseInt(lastMsg.id) || Date.now();
            }
        }

        // Load messages from API
        try {
            const result = await MessagesApiClient.getInbox(user.id);
            
            if (result.success && result.data) {
                const processedUsers = new Set();
                result.data.forEach((msg: IMessage) => {
                    const otherPersonId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
                    if (!processedUsers.has(otherPersonId)) {
                        processedUsers.add(otherPersonId);
                        const contact = this.inbox.find(c => c.id === otherPersonId);
                        if (contact) {
                            contact.lastMsg = msg.content;
                            contact.time = new Date(msg.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
                            contact.timestamp = new Date(msg.created_at).getTime();
                        }
                    }
                });
            }
        } catch {
            // console.error("Failed to load inbox", e);
        }
    }

    addContact(id: string) {
        if (!id || this.inbox.find(c => c.id === id)) return;
        this.inbox = [...this.inbox, {
            id, name: id, initials: id.substring(0, 2).toUpperCase(), color: '#8E8E93', lastMsg: 'Tap to chat', time: '', timestamp: Date.now(), unread: 0
        }];
    }

    async loadMessages() {
        const user = systemGlobalState.currentUser;
        if (!user || !this.currentChatId) return;

        if (this.currentChatId === 'ai-bot') {
            this.messages = await notesDb.get(NotesDBKey.AI_MESSAGES(user.id), []);
            if (this.messages.length === 0) {
                this.messages = [
                    { id: '1', content: "Hey! I'm your AI assistant. Ask me anything.", isUser: false, time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) }
                ];
            }
            const contactIndex = this.inbox.findIndex(c => c.id === this.currentChatId);
            if (contactIndex !== -1 && this.messages.length > 0) {
                const lastMsg = this.messages[this.messages.length - 1];
                this.inbox[contactIndex].lastMsg = lastMsg.content;
                this.inbox[contactIndex].time = lastMsg.time;
                this.inbox[contactIndex].timestamp = Date.now();
            }
            return;
        }

        try {
            const result = await MessagesApiClient.getMessages(user.id, this.currentChatId);
            
            if (result.success && result.data) {
                this.messages = result.data;
                
                const contactIndex = this.inbox.findIndex(c => c.id === this.currentChatId);
                if (contactIndex !== -1 && this.messages.length > 0) {
                    const lastMsg = this.messages[this.messages.length - 1];
                    this.inbox[contactIndex].lastMsg = lastMsg.content;
                    this.inbox[contactIndex].time = lastMsg.time;
                    // timestamp is not returned by the simplified chat data currently, but we can just use now
                    this.inbox[contactIndex].timestamp = Date.now();
                }
            }
        } catch {
            // console.error("Failed to load chat", e);
        }
    }

    private realtimeChannel: RealtimeChannel | null = null;

    initRealtime() {
        const user = systemGlobalState.currentUser;
        if (!user || this.realtimeChannel) return;

        this.realtimeChannel = supabase
            .channel(`messages_realtime_${Date.now()}`)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'messages' },
                (payload) => {
                    const msg = payload.new;
                    // Check if it's relevant to the current user
                    if (msg.sender_id === user.id || msg.receiver_id === user.id) {
                        const otherPersonId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
                        
                        // If we are currently chatting with this person
                        if (this.currentChatId === otherPersonId) {
                           
                            const isOptimisticDuplicate = msg.sender_id === user.id && this.messages.some(m => m.content === msg.content && m.isUser);
                            
                            if (!isOptimisticDuplicate && !this.messages.find(m => m.id === msg.id)) {
                                this.messages = [...this.messages, {
                                    id: msg.id,
                                    content: msg.content,
                                    isUser: msg.sender_id === user.id,
                                    time: new Date(msg.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
                                }];
                            }
                        }

                        // Update inbox last message
                        const contactIndex = this.inbox.findIndex(c => c.id === otherPersonId);
                        if (contactIndex !== -1) {
                            this.inbox[contactIndex].lastMsg = msg.content;
                            this.inbox[contactIndex].time = new Date(msg.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
                            this.inbox[contactIndex].timestamp = new Date(msg.created_at).getTime();
                            if (msg.sender_id !== user.id && this.currentChatId !== otherPersonId) {
                                this.inbox[contactIndex].unread = (this.inbox[contactIndex].unread || 0) + 1;
                                
                                notificationGlobalState.show({
                                    title: this.inbox[contactIndex].name,
                                    message: msg.content,
                                    icon: '/assets/icons/com.apple.MobileSMS-large.png',
                                    onClick: () => {
                                        goto('/messages');
                                        this.openChat(otherPersonId, this.inbox[contactIndex].name);
                                    }
                                });
                            }
                        }
                    }
                }
            )
            .subscribe();
    }

    async send() {
        if (!this.inputText.trim() || !this.currentChatId) return;
        const user = systemGlobalState.currentUser;
        if (!user) return;

        const prompt = this.inputText; 
        const t = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        const receiverId = this.currentChatId;
        
        // Optimistic UI for User
        const userMsg = { id: String(Date.now()), content: prompt, isUser: true, time: t };
        this.messages = [...this.messages, userMsg];
        this.inputText = ''; 
        
        if (receiverId === 'ai-bot') {
            await notesDb.set(NotesDBKey.AI_MESSAGES(user.id), this.messages);
            this.isTyping = true;
            const apiMessages = this.messages.map(m => ({
                role: m.isUser ? 'user' : 'assistant',
                content: m.content
            }));

            MessagesApiClient.sendAiMessage(apiMessages)
            .then(async data => { 
                this.isTyping = false; 
                let aiText = "Sorry, couldn't get a response.";
                if (data.choices && data.choices.length > 0) {
                    aiText = data.choices[0].message.content.substring(0, 300);
                }
                const aiMsg = { id: String(Date.now()), content: aiText, isUser: false, time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) };
                
                this.messages = [...this.messages, aiMsg]; 
                await notesDb.set(NotesDBKey.AI_MESSAGES(user.id), this.messages);
                
                const contactIndex = this.inbox.findIndex(c => c.id === this.currentChatId);
                if (contactIndex !== -1) {
                    this.inbox[contactIndex].lastMsg = aiText;
                    this.inbox[contactIndex].time = aiMsg.time;
                    this.inbox[contactIndex].timestamp = Date.now();
                }
            })
            .catch(() => { 
                this.isTyping = false; 
                this.messages = [...this.messages, { id: String(Date.now()), content: "Sorry, couldn't connect.", isUser: false, time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) }]; 
            });
            return;
        }

        try {
            const { res, result } = await MessagesApiClient.sendMessage(user.id, receiverId, prompt);
            
            if (!res.ok || !result.success) {
                dialogGlobalState.show({ title: 'Message Error', message: result.error || 'Failed to send message', confirmText: 'OK' });
            }
        } catch (e: unknown) {
            dialogGlobalState.show({ title: 'Message Error', message: (e as Error).message || 'Failed to send message', confirmText: 'OK' });
        }
    }

    openChat(id: string, name: string) {
        this.currentChatId = id;
        this.currentChatName = name;
        this.chatView = true;
        this.messages = []; // Clear previous messages
        
        // Mark as read
        const contactIndex = this.inbox.findIndex(c => c.id === id);
        if (contactIndex !== -1) {
            this.inbox[contactIndex].unread = 0;
        }

        this.loadMessages(); 
    }

    closeChat() {
        this.chatView = false;
        this.currentChatId = '';
    }

    async deleteMessage(msgId: string) {
        if (!msgId || this.currentChatId === 'ai-bot') return; // Currently not supporting delete AI msg
        const user = systemGlobalState.currentUser;
        if (!user) return;
        
        this.messages = this.messages.filter(m => m.id !== msgId);
        
        try {
            const { res, result } = await MessagesApiClient.deleteMessage(msgId, user.id);
            
            if (!res.ok || !result.success) {
                dialogGlobalState.show({ title: 'Delete Error', message: 'Failed to delete message: ' + result.error, confirmText: 'OK' });
            }
        } catch (e: unknown) {
            dialogGlobalState.show({ title: 'Delete Error', message: 'Failed to delete message: ' + (e as Error).message, confirmText: 'OK' });
        }
    }

    destroy() {
        if (this.realtimeChannel) {
            supabase.removeChannel(this.realtimeChannel);
            this.realtimeChannel = null;
        }
    }
}

export const messagesState = new MessagesAppState();
