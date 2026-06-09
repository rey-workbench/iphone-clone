import { Bot } from '@lucide/svelte';
import { authState } from "$lib/states/authState.svelte";
import { dialogState } from "$lib/states/dialogState.svelte";
import { supabase } from '$lib/config/supabase';
import { systemState, usersState } from '$lib/states';
import { notesDb, NotesDBKey } from '$lib/config/localdb';
import { ApiConfig } from '$lib/config/api';

export class MessagesState {
    messages = $state<any[]>([]);
    inputText = $state('');
    isTyping = $state(false);
    chatView = $state(false);
    hasLoaded = false;

    currentChatId = $state('');
    currentChatName = $state('');

    inbox: any[] = $state([
        { id: 'ai-bot', name: 'Buddy Bard', icon: Bot, color: '#007AFF', lastMsg: "Hey! I'm your AI assistant.", time: '12:00 PM', unread: false, initials: 'BB' }
    ]);

    constructor() {
        usersState.fetchUsers((users) => this.updateInboxWithUsers(users));
    }

    updateInboxWithUsers(users: any[]) {
        const currentUser = systemState.currentUser;
        
        const newInbox: any[] = [
            { id: 'ai-bot', name: 'Buddy Bard', icon: Bot, color: '#007AFF', lastMsg: "Hey! I'm your AI assistant.", time: '12:00 PM', unread: false, initials: 'BB' }
        ];

        users.forEach((u: any) => {
            if (currentUser && u.id === currentUser.id) return;
            const existing = this.inbox.find(c => c.id === u.id);
            
            newInbox.push({
                id: u.id,
                name: u.name,
                initials: u.name.substring(0, 2).toUpperCase(),
                color: existing ? existing.color : '#8E8E93',
                lastMsg: existing ? existing.lastMsg : 'Tap to chat',
                time: existing ? existing.time : '',
                unread: existing ? existing.unread : false
            });
        });

        this.inbox = newInbox;
    }

    addContact(id: string) {
        if (!id || this.inbox.find(c => c.id === id)) return;
        this.inbox = [...this.inbox, {
            id, name: id, initials: id.substring(0, 2).toUpperCase(), color: '#8E8E93', lastMsg: 'Tap to chat', time: '', unread: false
        }];
    }

    async loadMessages() {
        const user = systemState.currentUser;
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
            }
            return;
        }

        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
            .order('created_at', { ascending: true });
        
        if (!error && data) {
            const chatData = data.filter(d => 
                (d.sender_id === user.id && d.receiver_id === this.currentChatId) || 
                (d.sender_id === this.currentChatId && d.receiver_id === user.id)
            );

            this.messages = chatData.map(d => ({
                id: d.id,
                content: d.content,
                isUser: d.sender_id === user.id,
                time: new Date(d.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
            }));
            
            const contactIndex = this.inbox.findIndex(c => c.id === this.currentChatId);
            if (contactIndex !== -1 && this.messages.length > 0) {
                const lastMsg = this.messages[this.messages.length - 1];
                this.inbox[contactIndex].lastMsg = lastMsg.content;
                this.inbox[contactIndex].time = lastMsg.time;
            }
        }
    }

    async send() {
        if (!this.inputText.trim() || !this.currentChatId) return;
        const user = systemState.currentUser;
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

            fetch(ApiConfig.CHAT, ApiConfig.getChatRequest({
                messages: apiMessages,
                model: 'gpt-5.4-nano',
                frequency_penalty: 0,
                presence_penalty: 0,
                stream: false,
                temperature: 0.5,
                top_p: 1
            }))
            .then(res => res.json())
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
                }
            })
            .catch(() => { 
                this.isTyping = false; 
                this.messages = [...this.messages, { id: String(Date.now()), content: "Sorry, couldn't connect.", isUser: false, time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) }]; 
            });
            return;
        }

        const { error } = await supabase.from('messages').insert([{ 
            content: prompt, 
            sender_id: user.id, 
            receiver_id: receiverId 
        }]);
        if (error) {
            dialogState.show({ title: 'Message Error', message: error.message || 'Failed to send message', confirmText: 'OK' });
        }
    }

    openChat(id: string, name: string) {
        this.currentChatId = id;
        this.currentChatName = name;
        this.chatView = true;
        this.messages = []; // Clear previous messages
        this.loadMessages(); 
    }

    closeChat() {
        this.chatView = false;
        this.currentChatId = '';
    }
}
