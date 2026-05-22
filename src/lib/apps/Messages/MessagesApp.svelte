<script lang="ts">
  import { Bot, ArrowUp, ChevronLeft } from '@lucide/svelte';

  let messages = $state([
    { id: '1', content: "Hey! I'm your AI assistant. Ask me anything.", isUser: false, time: '12:00 PM' }
  ]);
  let inputText = $state('');
  let isTyping = $state(false);
  let chatView = $state(false);

  const inbox = [
    { name: 'Buddy Bard', icon: Bot, color: '#007AFF', lastMsg: "Hey! I'm your AI assistant.", time: '12:00 PM', unread: true },
    { name: 'Tim Cook', initials: 'TC', color: '#8E8E93', lastMsg: 'Big announcements coming.', time: 'Yesterday', unread: false },
  ];

  function send() {
    if (!inputText.trim()) return;
    const t = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    messages = [...messages, { id: String(Date.now()), content: inputText, isUser: true, time: t }];
    const prompt = inputText; inputText = ''; isTyping = true;
    fetch(`https://text.pollinations.ai/${encodeURIComponent(prompt)}?model=openai-fast`)
      .then(r => r.text())
      .then(text => { isTyping = false; messages = [...messages, { id: String(Date.now()), content: text.substring(0, 300), isUser: false, time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) }]; })
      .catch(() => { isTyping = false; messages = [...messages, { id: String(Date.now()), content: "Sorry, couldn't connect.", isUser: false, time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) }]; });
  }
</script>

<div class="h-full pt-[54px] pb-5 bg-black flex flex-col ">
  {#if chatView}
    <div class="flex-1 flex flex-col">
      <div class="flex items-center justify-between px-4 py-2 border-b border-ios-sep">
        <button class="bg-transparent border-none text-ios-blue text-[17px] cursor-pointer flex items-center" onclick={() => chatView = false}>
          <ChevronLeft size={20} class="mr-1" /> Messages
        </button>
        <span class="text-[17px] font-semibold text-white">Buddy Bard</span>
        <span class="w-24"></span>
      </div>
      <div class="flex-1 overflow-y-auto p-3 pb-2 flex flex-col gap-1">
        {#each messages as msg}
          <div class="flex {msg.isUser ? 'justify-end' : ''}">
            <div class="max-w-[75%] px-4 py-2.5 rounded-2xl text-[17px] leading-snug {msg.isUser ? 'bg-linear-to-b from-ios-blue to-[#0051D5] text-white rounded-br-[4px]' : 'bg-ios-bg3 text-white rounded-bl-[4px]'}">{msg.content}</div>
          </div>
        {/each}
        {#if isTyping}
          <div class="flex"><div class="bg-ios-bg3 text-white rounded-2xl rounded-bl-[4px] px-4 py-3 flex gap-1 items-center">
            <span class="w-1.5 h-1.5 rounded-full bg-white/50 animate-[dotPulse_1.2s_infinite]"></span>
            <span class="w-1.5 h-1.5 rounded-full bg-white/50 animate-[dotPulse_1.2s_infinite_0.2s]"></span>
            <span class="w-1.5 h-1.5 rounded-full bg-white/50 animate-[dotPulse_1.2s_infinite_0.4s]"></span>
          </div></div>
        {/if}
      </div>
      <div class="flex items-center gap-2 px-3 py-2 border-t border-ios-sep bg-[rgba(30,30,30,0.95)]">
        <input bind:value={inputText} placeholder="iMessage" onkeydown={(e: KeyboardEvent) => e.key === 'Enter' && send()}
          class="flex-1 h-9 rounded-[18px] border border-ios-sep bg-transparent text-white px-4 text-[17px] outline-none" />
        {#if inputText}
          <button class="w-[30px] h-[30px] rounded-full bg-ios-blue border-none text-white text-[16px] font-bold cursor-pointer flex items-center justify-center" onclick={send}>
            <ArrowUp size={18} color="white" />
          </button>
        {/if}
      </div>
    </div>
  {:else}
    <div class="flex-1 overflow-y-auto px-4">
      <h1 class="text-[34px] font-bold text-white px-1 py-2 pb-4">Messages</h1>
      <div class="bg-ios-bg2 rounded-xl overflow-hidden">
        {#each inbox as convo}
          <button class="flex gap-3 p-3 px-4 w-full border-none bg-transparent cursor-pointer text-white text-left border-b border-ios-sep last:border-b-0" onclick={() => { if (convo.name === 'Buddy Bard') chatView = true; }}>
            <div class="w-[45px] h-[45px] rounded-full flex items-center justify-center text-[16px] font-semibold text-white shrink-0" style="background:{convo.color}">
              {#if convo.icon}
                <convo.icon size={24} color="white" />
              {:else}
                {convo.initials}
              {/if}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex justify-between mb-1"><span class="text-[17px] {convo.unread ? 'font-semibold' : ''}">{convo.name}</span><span class="text-[15px] text-ios-label2">{convo.time}</span></div>
              <span class="text-[15px] text-ios-label2 truncate block">{convo.lastMsg}</span>
            </div>
          </button>
        {/each}
      </div>
    </div>
  {/if}
</div>
