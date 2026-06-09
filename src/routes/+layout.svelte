<script lang="ts">
  import "../app.css";
  import { pwaInfo } from 'virtual:pwa-info';
  import { onMount } from 'svelte';

  let { children } = $props();

  onMount(async () => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      try {
        const { registerSW } = await import('virtual:pwa-register');
        registerSW({
          immediate: true,
          onRegistered(r: any) {
            console.log('SW Registered:', r);
          },
          onRegisterError(error: any) {
            console.error('SW Registration Error:', error);
          }
        });
      } catch (e) {
        console.error('PWA registration failed', e);
      }
    }
  });
</script>

<svelte:head>
  {@html pwaInfo ? pwaInfo.webManifest.linkTag : ''}
</svelte:head>

{@render children()}
