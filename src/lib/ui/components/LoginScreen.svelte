<script lang="ts">
  import { currentUser } from '$lib/stores/systemStore';
  import { LoaderCircle, ChevronRight, Apple } from '@lucide/svelte';

  let username = $state('');
  let password = $state('');
  let isLoading = $state(false);
  let errorMsg = $state('');

  async function handleLogin() {
    if (!username || !password) {
      errorMsg = 'Please enter both username and password.';
      return;
    }

    isLoading = true;
    errorMsg = '';

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();

      if (data.success && data.user) {
        $currentUser = data.user;
      } else {
        errorMsg = data.error || 'Incorrect Apple ID or password.';
      }
    } catch (e: any) {
      errorMsg = 'Failed to connect to iCloud server.';
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="absolute inset-0 z-1000 bg-[#f2f2f7] flex flex-col items-center justify-center font-sans">
  <!-- Status bar placeholder -->
  <div class="absolute top-0 w-full h-[44px]"></div>

  <div class="w-full max-w-[320px] flex flex-col items-center animate-[fadeIn_0.5s_ease-out]">
    <div class="mb-8 opacity-80">
      <Apple size={60} color="#000" />
    </div>
    
    <h1 class="text-[28px] font-semibold text-black mb-2 text-center tracking-tight">Sign in to<br>your iPhone</h1>
    <p class="text-[15px] text-[#8e8e93] text-center mb-8 px-4 leading-snug">
      Sign in with your Apple ID to use iCloud and other Apple services.
    </p>

    <div class="w-full bg-white rounded-[14px] shadow-[0_1px_3px_rgba(0,0,0,0.1)] overflow-hidden mb-4 border border-[#e5e5ea]">
      <input 
        type="text" 
        placeholder="Apple ID" 
        bind:value={username} 
        disabled={isLoading}
        class="w-full h-[50px] px-4 text-[17px] text-black bg-transparent border-none border-b border-[#e5e5ea] outline-none placeholder:text-[#8e8e93] disabled:bg-[#f2f2f7]" 
      />
      <div class="flex items-center">
        <input 
          type="password" 
          placeholder="Password" 
          bind:value={password} 
          disabled={isLoading}
          onkeydown={(e) => e.key === 'Enter' && handleLogin()}
          class="flex-1 h-[50px] px-4 text-[17px] text-black bg-transparent border-none outline-none placeholder:text-[#8e8e93] disabled:bg-[#f2f2f7]" 
        />
      </div>
    </div>

    {#if errorMsg}
      <p class="text-red-500 text-[14px] mb-4 text-center animate-[fadeIn_0.3s_ease]">{errorMsg}</p>
    {/if}

    <button 
      class="w-full h-[50px] bg-[#007aff] text-white rounded-[14px] text-[17px] font-semibold flex items-center justify-center cursor-pointer transition-transform active:scale-95 disabled:opacity-50 disabled:active:scale-100 border-none"
      onclick={handleLogin}
      disabled={isLoading}
    >
      {#if isLoading}
        <LoaderCircle size={24} class="animate-spin" />
      {:else}
        Sign In
      {/if}
    </button>

    <div class="mt-8 flex flex-col items-center gap-4">
      <button class="bg-transparent border-none text-[#007aff] text-[15px] cursor-pointer">
        Forgot password or don't have an Apple ID?
      </button>
    </div>
  </div>
</div>
