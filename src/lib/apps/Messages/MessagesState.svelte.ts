import { Bot } from '@lucide/svelte';

export class MessagesState {
    messages = $state([
        { id: '1', content: "Hey! I'm your AI assistant. Ask me anything.", isUser: false, time: '12:00 PM' }
    ]);
    inputText = $state('');
    isTyping = $state(false);
    chatView = $state(false);

    inbox = [
        { name: 'Buddy Bard', icon: Bot, color: '#007AFF', lastMsg: "Hey! I'm your AI assistant.", time: '12:00 PM', unread: true },
        { name: 'Tim Cook', initials: 'TC', color: '#8E8E93', lastMsg: 'Big announcements coming.', time: 'Yesterday', unread: false },
    ];

    constructor() {}

    send() {
        if (!this.inputText.trim()) return;
        const t = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        this.messages = [...this.messages, { id: String(Date.now()), content: this.inputText, isUser: true, time: t }];
        const prompt = this.inputText; 
        this.inputText = ''; 
        this.isTyping = true;
        
        fetch(`https://text.pollinations.ai/${encodeURIComponent(prompt)}?model=openai-fast`)
            .then(r => r.text())
            .then(text => { 
                this.isTyping = false; 
                this.messages = [...this.messages, { id: String(Date.now()), content: text.substring(0, 300), isUser: false, time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) }]; 
            })
            .catch(() => { 
                this.isTyping = false; 
                this.messages = [...this.messages, { id: String(Date.now()), content: "Sorry, couldn't connect.", isUser: false, time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) }]; 
            });
    }

    openChat(name: string) {
        if (name === 'Buddy Bard') {
            this.chatView = true;
        }
    }

    closeChat() {
        this.chatView = false;
    }
}
