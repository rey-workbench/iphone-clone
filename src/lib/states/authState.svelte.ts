import { ApiConfig } from '$lib/config/api';

export class AuthState {
    username = $state('');
    password = $state('');
    isLoading = $state(false);
    errorMsg = $state('');
    
    // Instead of using the Svelte 4 store inside the class directly,
    // we can manage it here and update the external systemStore, 
    // or we can just return the user data and let the component handle it.
    
    async login(): Promise<any> {
        if (!this.username || !this.password) {
            this.errorMsg = 'Please enter both username and password.';
            return null;
        }

        this.isLoading = true;
        this.errorMsg = '';

        try {
            const res = await fetch(ApiConfig.AUTH_LOGIN, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: this.username, password: this.password })
            });
            
            const data = await res.json();

            if (data.success && data.user) {
                return data.user;
            } else {
                this.errorMsg = data.error || 'Incorrect Apple ID or password.';
                return null;
            }
        } catch (e: any) {
            this.errorMsg = 'Failed to connect to server.';
            return null;
        } finally {
            this.isLoading = false;
        }
    }
}
