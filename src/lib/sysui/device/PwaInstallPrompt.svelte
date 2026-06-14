<script lang="ts">
  ;
  import { dialogGlobalState } from '$lib/core/states/dialogGlobalState.svelte';
  
  let deferredPrompt: any = $state(null);

  $effect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    
    const ua = window.navigator.userAgent;
    const isSafari = /Safari/.test(ua) && !/Chrome/.test(ua);
    const isIos = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    
    // For iOS Safari, show instructions since it doesn't support beforeinstallprompt
    if (isIos && isSafari && !isStandalone) {
      setTimeout(async () => {
        await dialogGlobalState.show({
          title: 'Install MyPhone',
          message: 'Tap the Share button below, then select "Add to Home Screen".',
          confirmText: 'OK',
        });
      }, 1500);
    }

    const handleBeforeInstallPrompt = async (e: Event) => {
      e.preventDefault();
      deferredPrompt = e;
      
      // Delay slightly so it doesn't clash with immediate page load
      setTimeout(async () => {
        const accepted = await dialogGlobalState.show({
          title: 'Install MyPhone',
          message: 'Add MyPhone to your Home Screen for the best experience.',
          confirmText: 'Install',
          cancelText: 'Not Now'
        });

        if (accepted && deferredPrompt) {
          deferredPrompt.prompt();
          await deferredPrompt.userChoice;
          deferredPrompt = null;
        }
      }, 1000);
    };

    const handleAppInstalled = () => {
      deferredPrompt = null;
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  });
</script>
