<script lang="ts">
  import { systemState } from "$lib/states";
  import { AuthState } from "$lib/states/authState.svelte";
  import { LoaderCircle, ChevronRight, Apple } from "@lucide/svelte";

  const authState = new AuthState();

  async function handleLogin() {
    const user = await authState.login();
    if (user) {
      systemState.currentUser = user;
      systemState.saveUser();
    }
  }
</script>

<div
  class="absolute inset-0 z-1000 bg-[#f2f2f7] flex flex-col items-center justify-center font-sans"
>
  <!-- Status bar placeholder -->
  <div class="absolute top-0 w-full h-[44px]"></div>

  <div
    class="w-full max-w-[320px] flex flex-col items-center animate-[fadeIn_0.5s_ease-out]"
  >
    <div class="mb-8 opacity-80">
      <Apple size={60} color="#000" />
    </div>

    <h1
      class="text-[28px] font-semibold text-black mb-2 text-center tracking-tight"
    >
      Sign in to<br />your iPhone
    </h1>
    <p class="text-[15px] text-[#8e8e93] text-center mb-8 px-4 leading-snug">
      Sign in with your Apple ID to use iCloud and other Apple services.
    </p>

    <div
      class="w-full bg-white rounded-[14px] shadow-[0_1px_3px_rgba(0,0,0,0.1)] overflow-hidden mb-4 border border-[#e5e5ea]"
    >
      <input
        type="text"
        placeholder="Apple ID"
        bind:value={authState.username}
        class="w-full h-[50px] bg-white border-b border-[#c8c7cc] px-4 outline-none text-[17px] rounded-t-xl"
        onkeydown={(e) => {
          if (e.key === "Enter") document.getElementById("pwd-input")?.focus();
        }}
      />
      <input
        id="pwd-input"
        type="password"
        placeholder="Password"
        bind:value={authState.password}
        disabled={authState.isLoading}
        onkeydown={(e) => e.key === "Enter" && handleLogin()}
        class="flex-1 h-[50px] px-4 text-[17px] text-black bg-transparent border-none outline-none placeholder:text-[#8e8e93] disabled:bg-[#f2f2f7]"
      />
    </div>

    {#if authState.errorMsg}
      <div
        class="text-[#ff3b30] text-[13px] text-center mt-4 px-4 animate-[fadeIn_0.3s_ease-out]"
      >
        {authState.errorMsg}
      </div>
    {/if}

    <button
      class="mt-8 flex items-center justify-center bg-transparent border-none opacity-50 transition-opacity {authState.username &&
      authState.password
        ? 'opacity-100 cursor-pointer'
        : 'cursor-not-allowed'}"
      disabled={!authState.username ||
        !authState.password ||
        authState.isLoading}
      onclick={handleLogin}
    >
      <div
        class="w-10 h-10 rounded-full border border-[#c8c7cc] flex items-center justify-center bg-white shadow-sm active:bg-gray-100"
      >
        {#if authState.isLoading}
          <LoaderCircle size={24} class="animate-spin" />
        {:else}
          <ChevronRight size={24} />
        {/if}
      </div>
    </button>

    <div class="mt-8 flex flex-col items-center gap-4">
      <button
        class="bg-transparent border-none text-[#007aff] text-[15px] cursor-pointer"
      >
        Forgot password or don't have an Apple ID?
      </button>
    </div>
  </div>
</div>
