import type { INotificationGlobalState, INotificationOptions, INotificationItem } from '$lib/types';
import { BaseGlobalState } from './baseGlobalState.svelte';

class NotificationGlobalState extends BaseGlobalState implements INotificationGlobalState {
    appName = 'Notification';
    // --- State ---
    notifications = $state<INotificationItem[]>([]);

    // --- Methods ---
    show(options: INotificationOptions) {
        if (typeof window === 'undefined') return;
        const id = Date.now().toString() + Math.random().toString();
        this.notifications.push({ id, ...options });
        
        // Auto hide
        setTimeout(() => {
            this.close(id);
        }, 5000);
    }
    
    close(id: string) {
        this.notifications = this.notifications.filter((n: any) => n.id !== id);
    }
}

export const notificationGlobalState = new NotificationGlobalState();
