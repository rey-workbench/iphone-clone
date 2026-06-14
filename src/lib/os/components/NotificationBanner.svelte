<script lang="ts">
    import { notificationGlobalState } from '$lib/os/states/notificationGlobalState.svelte';

    const handleNotificationClick = (e: MouseEvent) => {
        const id = (e.currentTarget as HTMLElement).dataset.id;
        if (id) {
            const notif = notificationGlobalState.notifications.find(n => n.id === id);
            if (notif?.onClick) notif.onClick();
            notificationGlobalState.close(id);
        }
    };
</script>

<div class="absolute top-10 left-0 right-0 z-100000 flex flex-col items-center gap-2 pointer-events-none px-4">
    {#each notificationGlobalState.notifications as notif (notif.id)}
        <button 
            data-id={notif.id}
            class="pointer-events-auto w-full max-w-[350px] bg-[rgba(40,40,40,0.85)] backdrop-blur-2xl border border-white/10 p-3 rounded-[24px] shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex items-center gap-3 animate-[slideDown_0.4s_cubic-bezier(0.175,0.885,0.32,1.275)] cursor-pointer text-left active:scale-[0.98] transition-transform"
            onclick={handleNotificationClick}
        >
            {#if notif.icon}
                <div class="w-10 h-10 shrink-0 rounded-[10px] overflow-hidden flex items-center justify-center bg-black/30 shadow-sm">
                    <img src={notif.icon} class="w-full h-full object-cover" alt="" />
                </div>
            {/if}
            <div class="flex-1 min-w-0 pr-2">
                <div class="text-[15px] font-semibold text-white tracking-tight">{notif.title}</div>
                <div class="text-[14px] text-white/80 truncate leading-snug">{notif.message}</div>
            </div>
        </button>
    {/each}
</div>
