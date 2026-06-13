import { systemState } from '$lib/states/systemState.svelte';
import { AuthApiClient } from '$lib/client/services/AuthApiClient';

class AuthState {
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
            const data = await AuthApiClient.login(
                this.username, 
                this.password, 
                systemState.deviceId, 
                systemState.deviceName
            );

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

    async logout() {
        if (!systemState.currentUser) return;
        
        try {
            await AuthApiClient.logout(systemState.currentUser.id, systemState.deviceId);
        } catch (e) {
            // console.error('Failed to revoke device session on logout', e);
        }
        
        systemState.currentUser = null;
        systemState.saveUser();
        window.location.reload();
    }
}

export const authState = new AuthState();

