import { systemState } from '$lib/states';

export class ShellState {
  showPlayer = $state(false);
  showLockScreen = $state(true);
  lockScreenY = $state(0);
  isDragging = $state(false);
  startY = $state(0);
  appTransition = $state(false);
  currentPage = $state(0);

  // App swipe-to-close state
  appSwipeY = $state(0);
  isAppSwiping = $state(false);
  appStartY = $state(0);

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
    if (this.appSwipeY > 50) {
      if (systemState.activeApp) {
        this.closeApp();
      }
    }
    this.appSwipeY = 0;
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
    }
    this.lockScreenY = 0;
  }

  handleLockClick() {
    this.showLockScreen = false;
  }

  formatDate(d: Date) {
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  }

  formatLockTime(d: Date) {
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).replace(/\s?(AM|PM)/, '');
  }
}
