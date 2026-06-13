
interface NotificationOptions {
    title: string;
    message: string;
    icon?: string;
    onClick?: () => void;
}

class NotificationGlobalState {
    notifications = $state<(NotificationOptions & { id: string })[]>([]);

    show(options: NotificationOptions) {
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
