export abstract class BaseGlobalState {
    // --- Global Reactive Properties ---
    isLoading = $state(false);
    isInitializing = $state(true);
    errorMsg = $state('');

    // --- Global Methods ---
    setLoading(status: boolean) {
        this.isLoading = status;
    }

    setError(msg: string) {
        this.errorMsg = msg;
    }

    clearError() {
        this.errorMsg = '';
    }

    // A hook for subclasses to override
    async init(): Promise<void> {
        // default does nothing
    }
}
