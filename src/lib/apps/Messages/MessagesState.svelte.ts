import { Bot } from '@lucide/svelte';
import { supabase } from '$lib/supabase';
import { currentUser } from '$lib/stores/systemStore';
import { get } from 'svelte/store';
import { getSetting, setSetting } from '$lib/localdb';

export class MessagesState {
    messages = $state<any[]>([]);
    inputText = $state('');
    isTyping = $state(false);
    chatView = $state(false);
    hasLoaded = false;

    currentChatId = $state('');
    currentChatName = $state('');

    inbox = $state([
        { id: 'ai-bot', name: 'Buddy Bard', icon: Bot, color: '#007AFF', lastMsg: "Hey! I'm your AI assistant.", time: '12:00 PM', unread: false },
        { id: 'user2', name: 'user2', initials: 'U2', color: '#8E8E93', lastMsg: 'Tap to chat', time: '', unread: false },
    ]);

    constructor() {}

    addContact(id: string) {
        if (!id || this.inbox.find(c => c.id === id)) return;
        this.inbox = [...this.inbox, {
            id, name: id, initials: id.substring(0, 2).toUpperCase(), color: '#8E8E93', lastMsg: 'Tap to chat', time: '', unread: false
        }];
    }

    async loadMessages() {
        const user = get(currentUser);
        if (!user || !this.currentChatId) return;

        if (this.currentChatId === 'ai-bot') {
            this.messages = await getSetting('ai_messages_' + user.id, []);
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
        const user = get(currentUser);
        if (!user) return;

        const prompt = this.inputText; 
        const t = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        const receiverId = this.currentChatId;
        
        // Optimistic UI for User
        const userMsg = { id: String(Date.now()), content: prompt, isUser: true, time: t };
        this.messages = [...this.messages, userMsg];
        this.inputText = ''; 
        
        if (receiverId === 'ai-bot') {
            await setSetting('ai_messages_' + user.id, this.messages);
            this.isTyping = true;
            const apiMessages = this.messages.map(m => ({
                role: m.isUser ? 'user' : 'assistant',
                content: m.content
            }));

            fetch('https://free.oaibest.com/api/openai/v1/chat/completions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: apiMessages,
                    model: 'gpt-5.4-nano',
                    frequency_penalty: 0,
                    presence_penalty: 0,
                    stream: false,
                    temperature: 0.5,
                    top_p: 1
                })
            })
            .then(r => r.json())
            .then(async data => { 
                this.isTyping = false; 
                let aiText = "Sorry, couldn't get a response.";
                if (data.choices && data.choices.length > 0) {
                    aiText = data.choices[0].message.content.substring(0, 300);
                }
                const aiMsg = { id: String(Date.now()), content: aiText, isUser: false, time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) };
                
                this.messages = [...this.messages, aiMsg]; 
                await setSetting('ai_messages_' + user.id, this.messages);
                
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

        // Save user message to Supabase
        const { error } = await supabase.from('messages').insert([{ content: prompt, sender_id: user.id, receiver_id: receiverId }]);
        if (error) console.error("Supabase insert error:", error);
    }

    openChat(id: string, name: string) {
        this.currentChatId = id;
        this.currentChatName = name;
        this.chatView = true;
        this.loadMessages(); 
    }

    closeChat() {
        this.chatView = false;
        this.currentChatId = '';
    }
}
