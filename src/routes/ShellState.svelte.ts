import { systemState } from '$lib/states';

export class ShellState {
  showPlayer = $state(false);
  showLockScreen = $state(true);
  showAppSwitcher = $state(false);
  lockScreenY = $state(0);
  isDragging = $state(false);
  startY = $state(0);
  appTransition = $state(false);
  currentPage = $state(0);

  // App swipe-to-close state
  appSwipeY = $state(0);
  isAppSwiping = $state(false);
  appStartY = $state(0);

  // Control Center state
  isControlCenterOpen = $state(false);
  controlCenterDragY = $state(0);
  isControlCenterDragging = $state(false);
  ccStartY = $state(0);

  handleAppSwipeStart(e: TouchEvent | PointerEvent) {
    this.isAppSwiping = true;
    this.appStartY = 'touches' in e ? e.touches[0].clientY : (e as PointerEvent).clientY;
    this.appSwipeY = 0;
  }

  handleAppSwipeMove(e: TouchEvent | PointerEvent) {
    if (!this.isAppSwiping) return;
    const currentY = 'touches' in e ? e.touches[0].clientY : (e as PointerEvent).clientY;
    this.appSwipeY = Math.max(0, this.appStartY - currentY);
  }

  handleAppSwipeEnd() {
    this.isAppSwiping = false;
    if (this.appSwipeY > 200) {
      if (this.showAppSwitcher) {
        this.closeAppSwitcher();
      } else if (systemState.activeApp) {
        this.closeApp();
      }
    } else if (this.appSwipeY > 50) {
      if (!this.showAppSwitcher) {
        this.showAppSwitcher = true;
      }
    }
    this.appSwipeY = 0;
  }

  closeAppSwitcher() {
    this.showAppSwitcher = false;
  }

  closeApp() {
    this.appTransition = true;
    setTimeout(() => {
      systemState.activeApp = null;
      this.appTransition = false;
    }, 300);
  }

  handleLockTouchStart(e: TouchEvent) {
    this.isDragging = true;
    this.startY = e.touches[0].clientY;
  }

  handleLockTouchMove(e: TouchEvent) {
    if (!this.isDragging) return;
    this.lockScreenY = Math.max(0, this.startY - e.touches[0].clientY);
  }

  handleLockTouchEnd() {
    this.isDragging = false;
    if (this.lockScreenY > 120) {
      this.showLockScreen = false;
      this.enterFullscreen();
    }
    this.lockScreenY = 0;
  }

  handleLockClick() {
    this.showLockScreen = false;
    this.enterFullscreen();
  }

  enterFullscreen() {
    try {
      if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch((err) => {
          console.warn(`Error attempting to enable fullscreen: ${err.message}`);
        });
      }
    } catch (e) {
      // Ignore
    }
  }

  handleControlCenterSwipeStart(e: TouchEvent | PointerEvent) {
    this.isControlCenterDragging = true;
    this.ccStartY = 'touches' in e ? e.touches[0].clientY : (e as PointerEvent).clientY;
    this.controlCenterDragY = 0;
  }

  handleControlCenterSwipeMove(e: TouchEvent | PointerEvent) {
    if (!this.isControlCenterDragging) return;
    const currentY = 'touches' in e ? e.touches[0].clientY : (e as PointerEvent).clientY;
    const drag = currentY - this.ccStartY;
    
    if (this.isControlCenterOpen) {
      // If open, allow dragging UP to close
      this.controlCenterDragY = Math.min(0, drag);
    } else {
      // If closed, allow dragging DOWN to open
      this.controlCenterDragY = Math.max(0, drag);
    }
  }

  handleControlCenterSwipeEnd() {
    if (!this.isControlCenterDragging) return;
    this.isControlCenterDragging = false;
    
    if (this.isControlCenterOpen) {
      if (this.controlCenterDragY < -100) {
        this.isControlCenterOpen = false;
      }
    } else {
      if (this.controlCenterDragY > 100) {
        this.isControlCenterOpen = true;
      }
    }
    this.controlCenterDragY = 0;
  }

  closeControlCenter() {
    this.isControlCenterOpen = false;
  }

  formatDate(d: Date) {
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  }

  formatLockTime(d: Date) {
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).replace(/\s?(AM|PM)/, '');
  }
}
