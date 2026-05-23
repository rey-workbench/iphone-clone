import { ApiConfig } from '$lib/config/api';
import { systemState } from '$lib/states/systemState.svelte';

export class AuthState {
    username = $state('');
    password = $state('');
    isLoading = $state(false);
    errorMsg = $state('');
    
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
                body: JSON.stringify({ 
                    username: this.username, 
                    password: this.password,
                    deviceId: systemState.deviceId,
                    deviceName: systemState.deviceName
                })
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
