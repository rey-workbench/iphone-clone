import { systemGlobalState } from '$lib/os/states/systemGlobalState.svelte';
import { AuthApiClient } from '$lib/client/services/AuthApiClient';

class AuthGlobalState {
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
                systemGlobalState.deviceId, 
                systemGlobalState.deviceName
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
        if (!systemGlobalState.currentUser) return;
        
        try {
            await AuthApiClient.logout(systemGlobalState.currentUser.id, systemGlobalState.deviceId);
        } catch (e) {
            // console.error('Failed to revoke device session on logout', e);
        }
        
        systemGlobalState.currentUser = null;
        systemGlobalState.saveUser();
        window.location.reload();
    }
}

export const authGlobalState = new AuthGlobalState();

