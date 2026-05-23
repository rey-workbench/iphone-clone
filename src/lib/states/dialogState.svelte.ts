export type DialogOptions = {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
};

class DialogState {
    isOpen = $state(false);
    options = $state<DialogOptions | null>(null);
    
    private resolvePromise: ((value: boolean) => void) | null = null;

    show(options: DialogOptions): Promise<boolean> {
        this.options = {
            confirmText: 'Allow',
            cancelText: 'Don\'t Allow',
            ...options
        };
        this.isOpen = true;
        
        return new Promise((resolve) => {
            this.resolvePromise = resolve;
        });
    }

    confirm() {
        this.isOpen = false;
        if (this.resolvePromise) {
            this.resolvePromise(true);
            this.resolvePromise = null;
        }
    }

    cancel() {
        this.isOpen = false;
        if (this.resolvePromise) {
            this.resolvePromise(false);
            this.resolvePromise = null;
        }
    }
}

export const dialogState = new DialogState();
