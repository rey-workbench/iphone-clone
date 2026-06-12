import { ApiConfig } from '$lib/config/api';
import { systemState } from '$lib/states/systemState.svelte';

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
            const res = await fetch(
                ApiConfig.AUTH_LOGIN, 
                ApiConfig.getLoginRequest(
                    this.username, 
                    this.password, 
                    systemState.deviceId, 
                    systemState.deviceName
                )
            );
            
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

    async logout() {
        if (!systemState.currentUser) return;
        
        try {
            // Remove device from backend
            await fetch(
                ApiConfig.AUTH_DEVICES, 
                ApiConfig.getRevokeDeviceRequest(
                    systemState.currentUser.id, 
                    systemState.deviceId
                )
            );
        } catch (e) {
            // console.error('Failed to revoke device session on logout', e);
        }
        
        systemState.currentUser = null;
        systemState.saveUser();
        window.location.reload();
    }
}

export const authState = new AuthState();

