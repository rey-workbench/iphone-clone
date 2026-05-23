import { systemState } from '$lib/states';

export class ShellState {
  showPlayer = $state(false);
  showLockScreen = $state(true);
  lockScreenY = $state(0);
  isDragging = $state(false);
  startY = $state(0);
  appTransition = $state(false);
  currentPage = $state(0);

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
