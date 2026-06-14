
import type { IDialogGlobalState, IDialogOptions } from '$lib/types/os';

class DialogGlobalState implements IDialogGlobalState {
    // --- State ---
    isOpen = $state(false);
    options = $state<IDialogOptions | null>(null);
    
    // Internal
    private resolvePromise: ((value: boolean) => void) | null = null;

    // --- Methods ---
    show(options: IDialogOptions): Promise<boolean> {
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

export const dialogGlobalState = new DialogGlobalState();
