import { ApiConfig } from '$lib/config/api';

export class AuthApiClient {
    static async login(username: string, password: string, deviceId: string, deviceName: string) {
        const res = await fetch(
            ApiConfig.AUTH_LOGIN, 
            ApiConfig.getLoginRequest(
                username, 
                password, 
                deviceId, 
                deviceName
            )
        );
        return await res.json();
    }

    static async logout(userId: string, deviceId: string) {
        return await fetch(
            ApiConfig.AUTH_DEVICES, 
            ApiConfig.getRevokeDeviceRequest(
                userId, 
                deviceId
            )
        );
    }
}
