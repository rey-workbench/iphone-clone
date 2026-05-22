import { Bot } from '@lucide/svelte';
import { supabase } from '$lib/supabase';
import { currentUser } from '$lib/stores/systemStore';
import { get } from 'svelte/store';

export class MessagesState {
    messages = $state<any[]>([]);
    inputText = $state('');
    isTyping = $state(false);
    chatView = $state(false);
    hasLoaded = false;

    inbox = $state([
        { name: 'Buddy Bard', icon: Bot, color: '#007AFF', lastMsg: "Hey! I'm your AI assistant.", time: '12:00 PM', unread: false },
        { name: 'Tim Cook', initials: 'TC', color: '#8E8E93', lastMsg: 'Big announcements coming.', time: 'Yesterday', unread: false },
    ]);

    constructor() {}

    async loadMessages() {
        if (this.hasLoaded) return;
        const user = get(currentUser);
        if (!user) return;

        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
            .order('created_at', { ascending: true });
        
        if (!error && data) {
            this.messages = data.map(d => ({
                id: d.id,
                content: d.content,
                isUser: d.sender_id === user.id,
                time: new Date(d.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
            }));
            
            // If empty, add a default greeting
            if (this.messages.length === 0) {
                this.messages = [
                    { id: '1', content: "Hey! I'm your AI assistant. Ask me anything.", isUser: false, time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) }
                ];
            } else {
                // Update inbox last message
                const lastMsg = this.messages[this.messages.length - 1];
                this.inbox[0].lastMsg = lastMsg.content;
                this.inbox[0].time = lastMsg.time;
            }
        }
        this.hasLoaded = true;
    }

    async send() {
        if (!this.inputText.trim()) return;
        const user = get(currentUser);
        if (!user) return;

        const prompt = this.inputText; 
        const t = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        
        // Optimistic UI for User
        const userMsg = { id: String(Date.now()), content: prompt, isUser: true, time: t };
        this.messages = [...this.messages, userMsg];
        this.inputText = ''; 
        this.isTyping = true;
        
        // Save user message to Supabase
        await supabase.from('messages').insert([{ content: prompt, sender_id: user.id, receiver_id: 'ai-bot' }]);

        // Format messages for OpenAI API
        const apiMessages = this.messages.map(m => ({
            role: m.isUser ? 'user' : 'assistant',
            content: m.content
        }));

        // Fetch AI Response
        fetch('https://free.oaibest.com/api/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
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
                
                // Optimistic UI for AI
                this.messages = [...this.messages, aiMsg]; 
                
                // Save AI message to Supabase
                await supabase.from('messages').insert([{ content: aiText, sender_id: 'ai-bot', receiver_id: user.id }]);
                
                // Update Inbox preview
                this.inbox[0].lastMsg = aiText;
                this.inbox[0].time = aiMsg.time;
            })
            .catch(() => { 
                this.isTyping = false; 
                this.messages = [...this.messages, { id: String(Date.now()), content: "Sorry, couldn't connect.", isUser: false, time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) }]; 
            });
    }

    openChat(name: string) {
        if (name === 'Buddy Bard') {
            this.chatView = true;
            this.loadMessages(); // Load when opened
        }
    }

    closeChat() {
        this.chatView = false;
    }
}
